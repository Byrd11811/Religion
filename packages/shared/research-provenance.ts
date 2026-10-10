import { researchSectionIds, type QuestionEngineResult } from "./research";
import type { Passage, Relationship, SearchHit, TextRecord } from "./types";
import type { ComparisonResponse } from "../research/comparison";
import type { ResearchScope } from "../research/scope";
import type { ComparisonMode, ResearchEngineSource } from "./research-engines";
// The collections API stores finding content with a 60,000-character ceiling.
// Measure the same pretty JSON the UI saves so every returned answer remains
// persistable without silently dropping provenance.
export const MAX_QUESTION_PROVENANCE_CHARS = 60_000;

export interface QuestionProvenanceScope {
  textIds?: string[];
  editionIds?: string[];
  traditions?: string[];
  region?: string;
  before?: number;
  after?: number;
  contentTypes?: Passage["contentType"][];
}

export interface ComparisonProvenanceResult {
  texts: TextRecord[];
  cases: {
    id: string;
    title: string;
    tension: string;
    alternative: string;
    confidence: string;
    passages: SearchHit[];
  }[];
  passages: { textId: string; passages: SearchHit[] }[];
  relationships: Relationship[];
  engineAnalysis: ComparisonResponse;
  researchSources: ResearchEngineSource[];
  note: string;
}

export interface ComparisonProvenanceRequest {
  textIds: string[];
  theme: string;
  mode: ComparisonMode;
  scope?: ResearchScope;
}

function sorted(values: readonly string[] | undefined) {
  return values ? [...new Set(values)].sort() : [];
}

function comparisonPassageMetadata(passage: SearchHit) {
  return {
    passageId: passage.id,
    workId: passage.textId,
    editionId: passage.editionId,
    locator: passage.reference,
    contentType: passage.contentType,
    sourceUrl: passage.sourceUrl,
    translator: passage.translator,
  };
}

/**
 * Save a comparison as bounded provenance rather than copying passage bodies.
 * Authored findings remain reviewable, while exact passage IDs, editions,
 * locators, and source URLs reopen every retrieved textual selection.
 */
export function comparisonProvenanceSnapshot(
  result: ComparisonProvenanceResult,
  request: ComparisonProvenanceRequest,
  createdAt: string,
) {
  const passages = new Map<
    string,
    ReturnType<typeof comparisonPassageMetadata>
  >();
  for (const passage of [
    ...result.passages.flatMap((item) => item.passages),
    ...result.cases.flatMap((item) => item.passages),
  ])
    passages.set(passage.id, comparisonPassageMetadata(passage));

  const scope = request.scope ?? {};
  return {
    formatVersion: "atlas-comparison-provenance/v1" as const,
    createdAt,
    request: {
      textIds: [...new Set(request.textIds)],
      theme: request.theme.trim(),
      mode: request.mode,
      scope: {
        textIds: sorted(scope.textIds),
        traditionIds: sorted(scope.traditionIds),
        regions: sorted(scope.regions),
        sourceIds: sorted(scope.sourceIds),
        sourceKinds: sorted(scope.sourceKinds),
        contentTypes: sorted(scope.contentTypes),
        beforeYear: scope.beforeYear ?? null,
        afterYear: scope.afterYear ?? null,
        minConfidence: scope.minConfidence ?? null,
      },
    },
    admittedTexts: result.texts.map((text) => ({
      workId: text.id,
      title: text.title,
      traditionId: text.traditionId,
      editionId: text.editionId,
      sourceUrl: text.sourceUrl,
      copyright: text.copyright,
    })),
    passages: [...passages.values()],
    editorialCases: result.cases.map((item) => ({
      id: item.id,
      title: item.title,
      tension: item.tension,
      alternative: item.alternative,
      confidence: item.confidence,
      passageIds: item.passages.map((passage) => passage.id),
    })),
    relationships: result.relationships.map((item) => ({ ...item })),
    engineAnalysis: result.engineAnalysis,
    researchSources: result.researchSources.map((item) => ({
      ...item,
      verification: { ...item.verification },
    })),
    note: result.note,
  };
}

function sourceMetadata(
  source: QuestionEngineResult["answer"]["sources"][number],
) {
  const snapshot = {
    citationId: source.id,
    sourceId: source.sourceId,
    title: source.title,
    locator: source.locator,
    url: source.url,
    sourceRole: source.sourceRole,
    evidenceType: source.evidenceType,
    workId: source.workId,
    editionId: source.editionId,
    witnessId: source.witnessId,
    artifactId: source.artifactId,
    author: source.author,
    editor: source.editor,
    translator: source.translator,
    compositionDateLabel: source.compositionDateLabel,
    compositionDateConfidence: source.compositionDateConfidence,
    witnessDateLabel: source.witnessDateLabel,
    witnessDateConfidence: source.witnessDateConfidence,
    survivalBiasNote: source.survivalBiasNote,
    rights: source.rights,
  };
  if (JSON.stringify(snapshot).length > MAX_QUESTION_PROVENANCE_CHARS)
    throw new RangeError(
      `Question provenance exceeds ${MAX_QUESTION_PROVENANCE_CHARS} characters`,
    );
  return snapshot;
}

/**
 * Produce a portable provenance record without copying passage text. Exact
 * evidence can be reopened through the stable source ID, locator, and URL.
 */
export function questionProvenanceSnapshot(
  result: QuestionEngineResult,
  scope: QuestionProvenanceScope,
  createdAt: string,
) {
  const snapshot = {
    formatVersion: "atlas-question-provenance/v1" as const,
    createdAt,
    scope: {
      textIds: sorted(scope.textIds),
      editionIds: sorted(scope.editionIds),
      traditions: sorted(scope.traditions),
      region: scope.region ?? null,
      before: scope.before ?? null,
      after: scope.after ?? null,
      contentTypes: sorted(scope.contentTypes),
    },
    question: result.answer.question,
    mode: result.mode,
    synthesisAudited: result.synthesisAudited,
    attempts: result.attempts,
    notices: [...result.notices],
    sections: Object.fromEntries(
      researchSectionIds.map((section) => [
        section,
        result.answer[section].map((claim) => ({
          id: claim.id,
          statement: claim.statement,
          claimType: claim.claimType,
          status: claim.status,
          confidence: claim.confidence,
          reasoning: claim.reasoning,
          alternatives: [...claim.alternatives],
          citations: claim.citations.map(sourceMetadata),
          evidenceLadder: claim.evidenceLadder.map((step) => ({
            sourceId: step.sourceId,
            citationId: step.citationId,
            sourceRole: step.sourceRole,
            evidenceType: step.evidenceType,
            contribution: step.contribution,
            limitation: step.limitation,
          })),
        })),
      ]),
    ),
    deterministicAudit: {
      passed: result.deterministicAudit.passed,
      items: result.deterministicAudit.items.map((item) => ({
        ...item,
        claimIds: [...item.claimIds],
      })),
    },
    providerAudit: result.providerAudit
      ? {
          provider: result.providerAudit.provider,
          passed: result.providerAudit.passed,
          items: result.providerAudit.items.map((item) => ({
            ...item,
            claimIds: [...item.claimIds],
          })),
          claimAudits: result.providerAudit.claimAudits.map((item) => ({
            ...item,
            citationAudits: item.citationAudits.map((citation) => ({
              ...citation,
            })),
          })),
        }
      : null,
    sources: result.answer.sources.map(sourceMetadata),
  };
  if (
    JSON.stringify(snapshot, null, 2).length > MAX_QUESTION_PROVENANCE_CHARS
  )
    throw new RangeError(
      `Question provenance exceeds ${MAX_QUESTION_PROVENANCE_CHARS} characters`,
    );
  return snapshot;
}
