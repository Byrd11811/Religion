import {
  claimConfidenceDefinitions,
  neutralityChecklistIds,
  researchClaimStatuses,
  researchClaimTypes,
  researchEvidenceTypes,
  researchSectionIds,
  researchSourceRoles,
  type CanonicalResearchSource,
  type NeutralityAudit,
  type ProviderNeutralityAudit,
  type QuestionEngineResult,
  type StructuredQuestionAnswer,
} from "@/packages/shared/research";
import {
  assertCanonicalEvidence,
  evidenceOnlyAnswer,
  parseStructuredQuestionDraft,
  resolveStructuredQuestion,
} from "./claims";
import {
  deterministicNeutralityAudit,
  neutralityChecklist,
  parseProviderNeutralityAudit,
} from "./neutrality";
import { questionProvenanceSnapshot } from "@/packages/shared/research-provenance";

export interface ResearchGenerationRequest {
  question: string;
  evidence: readonly CanonicalResearchSource[];
  requiredSections: readonly string[];
  outputContract: typeof structuredQuestionOutputContract;
  vocabularies: {
    claimTypes: typeof researchClaimTypes;
    claimStatuses: typeof researchClaimStatuses;
    sourceRoles: typeof researchSourceRoles;
    evidenceTypes: typeof researchEvidenceTypes;
  };
  confidenceDefinitions: typeof claimConfidenceDefinitions;
  attempt: 1 | 2;
  previousRejection?: string;
  constraints: readonly string[];
}

export const structuredQuestionOutputContract = {
  root: {
    question: "string; repeat the question exactly",
    sections:
      "one array under every required section name; use an empty array when evidence is insufficient",
    sources:
      "ResearchCitationDraft[] containing every source used by any claim",
  },
  claim: {
    id: "unique string",
    statement: "string",
    claimType: "one of the supplied research claim types",
    status: "known | claimed | disputed | unknown | unsupported",
    confidence: "A | B | C | D | E | Unreviewed",
    reasoning: "string",
    alternatives: "string[]",
    citations: "ResearchCitationDraft[]",
    evidenceLadder: "EvidenceLadderStepDraft[]",
  },
  citation: {
    sourceId: "an exact ID from the supplied evidence",
    excerpt: "an exact excerpt of at least eight characters from that source",
    expectedRole:
      "primary-source | translator-editor-commentary | scholarly-source | modern-interpretation | model-synthesis | unclassified",
  },
  evidenceLadderStep: {
    sourceId: "the sourceId of a citation on the same claim",
    contribution: "what this source actually supports",
    limitation: "what this source does not establish",
  },
  sectionRules: {
    primaryEvidence:
      "every claim must cite at least one supplied primary-source record",
    oldestSurvivingEvidence:
      "every claim must cite primary object evidence with a witness ID, object date, date-specific precision/basis assessment, and survival-bias note",
    imagesArtifacts:
      "every claim must cite supplied primary object evidence with a canonical artifact or witness ID; never infer interpretation or rights from image pixels",
  },
} as const;

export interface ResearchAuditRequest {
  question: string;
  answer: StructuredQuestionAnswer;
  evidence: readonly CanonicalResearchSource[];
  deterministicAudit: NeutralityAudit;
  checklist: typeof neutralityChecklist;
  requiredChecklistIds: typeof neutralityChecklistIds;
  requiredClaimAudits: {
    claimId: string;
    citations: { citationId: string; sourceId: string }[];
    checks: readonly [
      "citation-entailment",
      "scope",
      "source-role",
      "confidence",
    ];
  }[];
  attempt: 1 | 2;
}

export interface ResearchProvider {
  readonly name: string;
  generate(
    request: ResearchGenerationRequest,
    signal: AbortSignal,
  ): Promise<unknown>;
  audit(request: ResearchAuditRequest, signal: AbortSignal): Promise<unknown>;
}

export type QuestionProgress =
  | { stage: "generation-started"; message: string; attempt: 1 | 2 }
  | { stage: "audit-started"; message: string; attempt: 1 | 2 }
  | { stage: "retry-started"; message: string; attempt: 2 }
  | { stage: "fallback-started"; message: string };

export interface RunStructuredQuestionInput {
  question: string;
  evidence: readonly CanonicalResearchSource[];
  provider?: ResearchProvider;
  signal?: AbortSignal;
  onProgress?: (progress: QuestionProgress) => void;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted)
    throw signal.reason ?? new DOMException("Operation aborted", "AbortError");
}

function failureMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown provider failure";
}

// Provider and audit errors can contain the full rejected payload. Keep enough
// context to explain the retry while guaranteeing that a rejected synthesis can
// always fall back to a persistable evidence-only result.
const MAX_FAILURE_NOTICE_CHARS = 2_000;

function boundedFailureNotice(attempt: 1 | 2, error: unknown) {
  const prefix = `Attempt ${attempt}: `;
  const message = failureMessage(error).replace(/\s+/gu, " ").trim();
  const available = MAX_FAILURE_NOTICE_CHARS - prefix.length;
  if (message.length <= available) return `${prefix}${message}`;
  return `${prefix}${message.slice(0, Math.max(0, available - 1)).trimEnd()}…`;
}

function isAborted(error: unknown, signal: AbortSignal) {
  return (
    signal.aborted ||
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function fallbackResult(
  question: string,
  evidence: readonly CanonicalResearchSource[],
  attempts: number,
  notices: string[],
): QuestionEngineResult {
  const answer = evidenceOnlyAnswer(
    question,
    evidence,
    attempts
      ? "The optional synthesis failed evidence or neutrality validation. Verified evidence remains available without unaudited model claims."
      : "No synthesis provider is configured. Verified evidence remains available without model interpretation.",
  );
  const result: QuestionEngineResult = {
    mode: "evidence-only",
    answer,
    attempts,
    synthesisAudited: false,
    deterministicAudit: deterministicNeutralityAudit(answer),
    providerAudit: null,
    notices,
  };
  questionProvenanceSnapshot(result, {}, "1970-01-01T00:00:00.000Z");
  return result;
}

export async function runStructuredQuestion(
  input: RunStructuredQuestionInput,
): Promise<QuestionEngineResult> {
  const question = input.question.trim();
  if (!question) throw new TypeError("Question is required");
  const signal = input.signal ?? new AbortController().signal;
  throwIfAborted(signal);
  assertCanonicalEvidence(input.evidence);
  if (!input.evidence.length)
    return fallbackResult(question, [], 0, [
      "Evidence-only mode: no eligible canonical evidence matched the request.",
    ]);
  if (!input.provider)
    return fallbackResult(question, input.evidence, 0, [
      "Evidence-only mode: no model provider was configured.",
    ]);

  const failures: string[] = [];
  let lastProviderAudit: ProviderNeutralityAudit | null = null;
  for (const attempt of [1, 2] as const) {
    throwIfAborted(signal);
    if (attempt === 2)
      input.onProgress?.({
        stage: "retry-started",
        attempt,
        message:
          "The first synthesis was rejected; beginning the single bounded retry.",
      });
    input.onProgress?.({
      stage: "generation-started",
      attempt,
      message: `Generating structured synthesis attempt ${attempt} of 2.`,
    });
    try {
      const raw = await input.provider.generate(
        {
          question,
          evidence: input.evidence,
          requiredSections: [...researchSectionIds, "sources"],
          outputContract: structuredQuestionOutputContract,
          vocabularies: {
            claimTypes: researchClaimTypes,
            claimStatuses: researchClaimStatuses,
            sourceRoles: researchSourceRoles,
            evidenceTypes: researchEvidenceTypes,
          },
          confidenceDefinitions: claimConfidenceDefinitions,
          attempt,
          previousRejection: failures.at(-1),
          constraints: [
            "Return strict JSON matching the structured-question contract.",
            "Use only supplied canonical source IDs and exact source excerpts.",
            "Every provider-authored claim, including uncertainty and retrieval-status claims, needs confidence, reasoning, alternatives, citations, and an evidence ladder.",
            "Keep primary, translator/editor, scholarly, modern, and model roles distinct.",
            "Put only claims with primary-source support in primaryEvidence; translator/editor and scholarly retrieval records remain source context unless they support another correctly classified claim.",
            "Unclassified sources are never eligible for synthesis and must not be relabeled.",
            "An earliest-surviving-evidence claim requires a cited physical witness with a witness date, a date-specific precision/basis assessment, and a survival-bias note; a work composition range or general attestation status is not date confidence.",
            "Phrase any chronology conclusion as evidence currently represented in Atlas and state preservation or survival bias.",
            "An images-and-artifacts claim requires primary object evidence with a canonical artifact or witness ID. Use only explicit catalog metadata; never infer object interpretation or rights from image pixels.",
            "Similarity alone never establishes historical influence.",
            "Do not collapse attestation, historicity, authenticity, canon, access, or decipherment into one confidence score.",
          ],
        },
        signal,
      );
      throwIfAborted(signal);
      const draft = parseStructuredQuestionDraft(raw);
      if (draft.question !== question)
        throw new Error(
          "Provider changed the question in its structured response",
        );
      const answer = resolveStructuredQuestion(draft, input.evidence);
      const deterministicAudit = deterministicNeutralityAudit(answer);
      if (!deterministicAudit.passed)
        throw new Error(
          `Deterministic neutrality audit rejected claims: ${deterministicAudit.items
            .filter((item) => !item.passed)
            .map((item) => `${item.id} (${item.claimIds.join(", ")})`)
            .join("; ")}`,
        );
      input.onProgress?.({
        stage: "audit-started",
        attempt,
        message: `Running the independent twelve-item neutrality audit for attempt ${attempt}.`,
      });
      const rawAudit = await input.provider.audit(
        {
          question,
          answer,
          evidence: input.evidence,
          deterministicAudit,
          checklist: neutralityChecklist,
          requiredChecklistIds: neutralityChecklistIds,
          requiredClaimAudits: researchSectionIds.flatMap((section) =>
            answer[section].map((claim) => ({
              claimId: claim.id,
              citations: claim.citations.map((item) => ({
                citationId: item.id,
                sourceId: item.sourceId,
              })),
              checks: [
                "citation-entailment",
                "scope",
                "source-role",
                "confidence",
              ] as const,
            })),
          ),
          attempt,
        },
        signal,
      );
      throwIfAborted(signal);
      lastProviderAudit = parseProviderNeutralityAudit(
        rawAudit,
        input.provider.name,
        answer,
      );
      if (!lastProviderAudit.passed)
        throw new Error(
          `Provider evidence or neutrality audit rejected claims: ${[
            ...lastProviderAudit.items
              .filter((item) => !item.passed)
              .map((item) => `${item.id} (${item.claimIds.join(", ")})`),
            ...lastProviderAudit.claimAudits
              .filter((item) => !item.passed)
              .map((item) => `${item.claimId} (${item.explanation})`),
          ].join("; ")}`,
        );
      const result: QuestionEngineResult = {
        mode: "audited-synthesis",
        answer,
        attempts: attempt,
        synthesisAudited: true,
        deterministicAudit,
        providerAudit: lastProviderAudit,
        notices:
          attempt === 1
            ? ["Synthesis passed citation and neutrality validation."]
            : [
                ...failures,
                "The bounded retry passed citation and neutrality validation.",
              ],
      };
      questionProvenanceSnapshot(result, {}, "1970-01-01T00:00:00.000Z");
      return result;
    } catch (error) {
      if (isAborted(error, signal)) throw signal.reason ?? error;
      failures.push(boundedFailureNotice(attempt, error));
    }
  }

  input.onProgress?.({
    stage: "fallback-started",
    message:
      "Both bounded attempts failed validation; returning verified evidence only.",
  });
  const result = fallbackResult(question, input.evidence, 2, failures);
  return result;
}
