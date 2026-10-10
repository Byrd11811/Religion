import { z } from "zod";
import { allPassages } from "@/packages/search";
import { dateLabel, editions, texts } from "@/packages/shared/catalog";
import {
  archiveImages,
  archiveImageDisplayAllowed,
  mayTranslate,
  museumArtifacts,
  witnesses,
  workProfile,
  type ArchiveImage,
  type MuseumArtifact,
} from "@/packages/shared/archive";
import { protocolDecision } from "@/packages/shared/protocols";
import { passageAiRightsAllowed } from "@/packages/shared/rights";
import {
  researchClaimStatuses,
  researchClaimTypes,
  researchSectionIds,
  researchSourceRoles,
  type CanonicalResearchSource,
  type EvidenceLadderStep,
  type ResearchCitationDraft,
  type ResearchClaim,
  type ResearchClaimDraft,
  type ResolvedResearchCitation,
  type StructuredQuestionAnswer,
  type StructuredQuestionDraft,
} from "@/packages/shared/research";
import type { Confidence, Passage, SearchHit } from "@/packages/shared/types";

const confidenceValues = ["A", "B", "C", "D", "E", "Unreviewed"] as const;
export const MAX_PROVIDER_DRAFT_CHARS = 24_000;

const citationSchema = z
  .object({
    sourceId: z.string().trim().min(1).max(200),
    excerpt: z.string().trim().min(1).max(2_000),
    expectedRole: z.enum(researchSourceRoles).optional(),
  })
  .strict();

const ladderSchema = z
  .object({
    sourceId: z.string().trim().min(1).max(200),
    contribution: z.string().trim().min(1).max(2_000),
    limitation: z.string().trim().min(1).max(2_000),
  })
  .strict();

const claimSchema = z
  .object({
    id: z.string().trim().min(1).max(200),
    statement: z.string().trim().min(1).max(2_500),
    claimType: z.enum(researchClaimTypes),
    status: z.enum(researchClaimStatuses),
    confidence: z.enum(confidenceValues),
    reasoning: z.string().trim().min(1).max(2_500),
    alternatives: z.array(z.string().trim().min(1).max(1_000)).max(8),
    citations: z.array(citationSchema).max(12),
    evidenceLadder: z.array(ladderSchema).max(12),
  })
  .strict();

const sectionShape = Object.fromEntries(
  researchSectionIds.map((section) => [section, z.array(claimSchema).max(12)]),
) as Record<
  (typeof researchSectionIds)[number],
  z.ZodArray<typeof claimSchema>
>;

const questionDraftSchema = z
  .object({
    question: z.string().trim().min(1).max(1_000),
    ...sectionShape,
    sources: z.array(citationSchema).max(60),
  })
  .strict();

export class ResearchValidationError extends Error {
  readonly issues: string[];

  constructor(message: string, issues: string[]) {
    super(`${message}: ${issues.join("; ")}`);
    this.name = "ResearchValidationError";
    this.issues = issues;
  }
}

function normalizeExcerpt(value: string) {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

function safeJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (value.length > MAX_PROVIDER_DRAFT_CHARS)
    throw new ResearchValidationError("Provider response exceeds size limit", [
      `response must be at most ${MAX_PROVIDER_DRAFT_CHARS} characters`,
    ]);
  try {
    return JSON.parse(value);
  } catch {
    throw new ResearchValidationError("Provider returned malformed JSON", [
      "response is not valid JSON",
    ]);
  }
}

function allDraftClaims(draft: StructuredQuestionDraft) {
  return researchSectionIds.flatMap((section) => draft[section]);
}

export function parseStructuredQuestionDraft(value: unknown) {
  const result = questionDraftSchema.safeParse(safeJson(value));
  if (!result.success) {
    throw new ResearchValidationError(
      "Provider response does not match the structured-question contract",
      result.error.issues.map(
        (issue) => `${issue.path.join(".") || "response"}: ${issue.message}`,
      ),
    );
  }
  const draft = result.data as StructuredQuestionDraft;
  if (JSON.stringify(draft).length > MAX_PROVIDER_DRAFT_CHARS)
    throw new ResearchValidationError("Provider response exceeds size limit", [
      `parsed response must be at most ${MAX_PROVIDER_DRAFT_CHARS} characters`,
    ]);
  const issues: string[] = [];
  const claims = allDraftClaims(draft);
  const claimIds = new Set<string>();
  for (const section of researchSectionIds)
    for (const claim of draft[section]) {
      if (claimIds.has(claim.id)) issues.push(`duplicate claim id ${claim.id}`);
      claimIds.add(claim.id);
      const citationIds = new Set(claim.citations.map((item) => item.sourceId));
      const ladderIds = new Set(
        claim.evidenceLadder.map((item) => item.sourceId),
      );
      // A provider controls section, type, status, and prose, so none of those
      // fields can safely grant an uncited exception. Atlas-generated fallback
      // notices are built after this parser and never enter audited synthesis.
      if (claim.citations.length === 0)
        issues.push(`${claim.id} is provider-authored but has no citation`);
      if (claim.evidenceLadder.length === 0)
        issues.push(
          `${claim.id} is provider-authored but has no evidence ladder`,
        );
      for (const sourceId of citationIds)
        if (!ladderIds.has(sourceId))
          issues.push(
            `${claim.id} citation ${sourceId} is absent from its evidence ladder`,
          );
      for (const sourceId of ladderIds)
        if (!citationIds.has(sourceId))
          issues.push(
            `${claim.id} evidence-ladder source ${sourceId} is not cited`,
          );
      if (claim.confidence === "D" && claim.status !== "disputed")
        issues.push(`${claim.id} uses confidence D without disputed status`);
      if (
        claim.confidence === "E" &&
        !["claimed", "disputed", "unsupported"].includes(claim.status)
      )
        issues.push(
          `${claim.id} uses confidence E without a speculative claim status`,
        );
      if (claim.confidence === "Unreviewed" && claim.status === "disputed")
        issues.push(`${claim.id} treats unreviewed as scholarly dispute`);
    }
  if (draft.shortAnswer.length === 0)
    issues.push("shortAnswer must contain at least one claim");
  if (draft.uncertainty.length === 0)
    issues.push("uncertainty must contain at least one claim");
  const listedSources = new Set(draft.sources.map((item) => item.sourceId));
  for (const claim of claims)
    for (const citation of claim.citations)
      if (!listedSources.has(citation.sourceId))
        issues.push(
          `${claim.id} citation ${citation.sourceId} is missing from sources`,
        );
  if (issues.length)
    throw new ResearchValidationError(
      "Structured answer failed semantic validation",
      issues,
    );
  return draft;
}

function passageRole(contentType: Passage["contentType"]) {
  if (contentType === "Primary text") return "primary-source" as const;
  if (contentType === "Scholarly commentary")
    return "scholarly-source" as const;
  if (contentType === "Unknown") return "unclassified" as const;
  return "translator-editor-commentary" as const;
}

function passageEvidenceType(contentType: Passage["contentType"]) {
  if (contentType === "Primary text") return "primary-text" as const;
  if (contentType === "Scholarly commentary")
    return "scholarly-secondary" as const;
  if (contentType === "Unknown") return "unclassified" as const;
  return "translation-editorial" as const;
}

const objectEvidenceTypes = new Set<CanonicalResearchSource["evidenceType"]>([
  "manuscript",
  "archaeological",
  "museum-institutional",
  "image-artifact",
]);

function isHttps(value: string | null | undefined): value is string {
  return Boolean(value && /^https:\/\//u.test(value));
}

function verifiedWitnessesForWork(workId: string) {
  return witnesses
    .filter(
      (witness) =>
        witness.workIds.includes(workId) &&
        witness.access === "Public metadata" &&
        witness.evidence === "Securely attested" &&
        witness.description.trim() &&
        witness.dateNotes.trim() &&
        witness.sources.some(isHttps),
    )
    .sort((left, right) => {
      const leftDate = left.dateStart ?? Number.POSITIVE_INFINITY;
      const rightDate = right.dateStart ?? Number.POSITIVE_INFINITY;
      return leftDate - rightDate || left.id.localeCompare(right.id);
    });
}

function witnessDateAssessment(witness: {
  dateStart: number | null;
  dateEnd: number | null;
  dateNotes: string;
}) {
  if (witness.dateStart === null || !witness.dateNotes.trim()) return undefined;
  if (
    /\b(?:unknown|unreviewed|uncertain|debated|awaiting|provisional|disputed|indeterminate)\b|\b(?:requires?|needs?|pending|should receive)\s+(?:curator(?:ial)?\s+)?review\b/iu.test(
      witness.dateNotes,
    )
  )
    return undefined;
  const approximate =
    witness.dateEnd !== null && witness.dateEnd !== witness.dateStart
      ? true
      : /\b(?:ca\.?|circa|approximately|approximate|century)\b/iu.test(
          witness.dateNotes,
        );
  return approximate
    ? "Approximate repository catalog date or range; Atlas has not independently redated the witness."
    : "Repository catalog date as stated; Atlas has not independently redated the witness.";
}

function canonicalWitnessSource(
  workId: string,
): CanonicalResearchSource | undefined {
  const work = texts.find((item) => item.id === workId);
  const linkedWitnesses = verifiedWitnessesForWork(workId);
  const witness =
    linkedWitnesses.find((item) => witnessDateAssessment(item)) ??
    linkedWitnesses[0];
  if (!work || !witness) return undefined;
  const sourceUrl = isHttps(witness.digitizationUrl)
    ? witness.digitizationUrl
    : witness.sources.find(isHttps);
  if (!sourceUrl) return undefined;
  const dateAssessment = witnessDateAssessment(witness);
  const survivalBiasNote = dateAssessment
    ? "Survival bias limits this comparison: Atlas's current witness catalog is incomplete, and this physical object cannot establish the work's composition date or the first historical expression of its ideas."
    : undefined;
  const catalogScope = dateAssessment
    ? `Atlas catalog scope: this is the earliest dated securely attested witness currently linked to ${work.title} in Atlas.`
    : "Atlas catalog scope: this securely attested linked witness has no normalized object date.";
  const sourceId = `witness:${witness.id}:${workId}`;
  return {
    id: sourceId,
    sourceId,
    sourceRole: "primary-source",
    evidenceType: "manuscript",
    title: witness.title,
    text: `${witness.title}. ${witness.dateNotes} ${witness.description} ${catalogScope}`,
    url: sourceUrl,
    locator: [witness.inventoryNumber, witness.repository]
      .filter(Boolean)
      .join(" · "),
    workId,
    witnessId: witness.id,
    witnessDateLabel: dateAssessment ? witness.dateNotes : undefined,
    witnessDateConfidence: dateAssessment,
    survivalBiasNote,
    eligibleForAi: true,
    rights: witness.rights,
  };
}

function verifiedArtifactForWork(
  workId: string,
  preferredWitnessId?: string,
): { image: ArchiveImage; artifact: MuseumArtifact } | undefined {
  const artifactMap = new Map(museumArtifacts.map((item) => [item.id, item]));
  const witnessMap = new Map(witnesses.map((item) => [item.id, item]));
  const candidates = archiveImages
    .filter((image) => image.workIds.includes(workId))
    .filter((image) => {
      const artifact = artifactMap.get(image.artifactId);
      if (
        !artifact ||
        !artifact.verifiedAt ||
        !image.verifiedAt ||
        !archiveImageDisplayAllowed(image) ||
        !image.title.trim() ||
        !image.caption.trim() ||
        !image.rights.trim() ||
        !image.attribution.trim() ||
        !isHttps(image.sourceUrl) ||
        !isHttps(image.imageUrl) ||
        !isHttps(artifact.sourceUrl) ||
        !artifact.description.trim()
      )
        return false;
      if (artifact.witnessId !== image.witnessId) return false;
      if (!image.witnessId) return true;
      const witness = witnessMap.get(image.witnessId);
      return Boolean(
        witness &&
        witness.access === "Public metadata" &&
        witness.workIds.includes(workId),
      );
    })
    .sort((left, right) => {
      const leftPreferred = left.witnessId === preferredWitnessId ? 0 : 1;
      const rightPreferred = right.witnessId === preferredWitnessId ? 0 : 1;
      return leftPreferred - rightPreferred || left.id.localeCompare(right.id);
    });
  const image = candidates[0];
  if (!image) return undefined;
  return { image, artifact: artifactMap.get(image.artifactId)! };
}

function canonicalArtifactSource(
  workId: string,
  preferredWitnessId?: string,
): CanonicalResearchSource | undefined {
  const linked = verifiedArtifactForWork(workId, preferredWitnessId);
  if (!linked) return undefined;
  const { image, artifact } = linked;
  const sourceId = `archive-image:${image.id}:${workId}`;
  return {
    id: sourceId,
    sourceId,
    sourceRole: "primary-source",
    evidenceType: "image-artifact",
    title: image.title,
    text: `${artifact.description} Institutional image caption: ${image.caption}`,
    url: artifact.sourceUrl,
    locator: [artifact.inventoryNumber, artifact.institution]
      .filter(Boolean)
      .join(" · "),
    workId,
    witnessId: image.witnessId ?? undefined,
    artifactId: artifact.id,
    eligibleForAi: true,
    rights: image.rights,
  };
}

export function canonicalSourcesFromPassages(
  passages: readonly (Passage | SearchHit)[],
): CanonicalResearchSource[] {
  const textMap = new Map(texts.map((item) => [item.id, item]));
  const editionMap = new Map(editions.map((item) => [item.id, item]));
  const passageSources = passages.map((passage) => {
    const work = textMap.get(passage.textId);
    const edition = editionMap.get(passage.editionId);
    if (!work || !edition)
      throw new ResearchValidationError(
        "Passage has no canonical catalog chain",
        [`${passage.id} must resolve to a work and edition`],
      );
    const profile = workProfile(passage.textId);
    return {
      id: passage.id,
      sourceId: passage.id,
      sourceRole: passageRole(passage.contentType),
      evidenceType: passageEvidenceType(passage.contentType),
      title: work.title,
      text: passage.content,
      url: passage.sourceUrl,
      locator: passage.reference,
      workId: passage.textId,
      editionId: passage.editionId,
      translator: edition.translator,
      compositionDateLabel:
        work.startDate === null && work.endDate === null
          ? undefined
          : dateLabel(work.startDate, work.endDate),
      compositionDateConfidence:
        work.startDate === null && work.endDate === null
          ? undefined
          : work.dateConfidence,
      eligibleForAi:
        passage.contentType !== "Unknown" &&
        passageAiRightsAllowed(passage) &&
        protocolDecision(passage.textId, "ai").allowed &&
        Boolean(profile) &&
        mayTranslate(profile!),
      rights: edition.license,
    };
  });
  const enriched: CanonicalResearchSource[] = [];
  const eligibleWorkIds = [
    ...new Set(
      passageSources
        .filter((source) => source.eligibleForAi)
        .map((source) => source.workId)
        .filter((workId): workId is string => Boolean(workId)),
    ),
  ];
  for (const workId of eligibleWorkIds) {
    if (!protocolDecision(workId, "ai").allowed) continue;
    const witness = canonicalWitnessSource(workId);
    if (witness) enriched.push(witness);
    const artifact = canonicalArtifactSource(workId, witness?.witnessId);
    if (artifact) enriched.push(artifact);
  }
  return [...passageSources, ...enriched];
}

export const MAX_PROVIDER_EVIDENCE_SERIALIZED_CHARS = 96_000;
export const MAX_PROVIDER_SOURCE_TEXT_CHARS = 4_000;
const MIN_PROVIDER_SOURCE_TEXT_CHARS = 256;

function boundedSourceText(text: string, question: string, limit: number) {
  if (text.length <= limit) return text;
  const normalizedQuestion = question.toLocaleLowerCase();
  const tokens =
    normalizedQuestion
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((token) => token.length >= 3 || /[^\x00-\x7F]/u.test(token))
      .sort((left, right) => right.length - left.length) ?? [];
  const normalizedText = text.toLocaleLowerCase();
  const match = tokens
    .map((token) => normalizedText.indexOf(token))
    .find((index) => index >= 0);
  const center = match === undefined ? 0 : match;
  const start = Math.max(0, Math.min(text.length - limit, center - limit / 3));
  return text.slice(Math.floor(start), Math.floor(start) + limit);
}

/** Bound provider and streamed evidence while retaining canonical IDs/locators. */
export function boundedCanonicalEvidence(
  sources: readonly CanonicalResearchSource[],
  question: string,
) {
  if (!sources.length) return [];
  const withoutText = sources.map((source) => ({ ...source, text: "" }));
  const structuralSize = JSON.stringify(withoutText).length;
  const available = Math.max(
    MIN_PROVIDER_SOURCE_TEXT_CHARS * sources.length,
    MAX_PROVIDER_EVIDENCE_SERIALIZED_CHARS - structuralSize - sources.length * 2,
  );
  let perSourceLimit = Math.min(
    MAX_PROVIDER_SOURCE_TEXT_CHARS,
    Math.max(MIN_PROVIDER_SOURCE_TEXT_CHARS, Math.floor(available / sources.length)),
  );
  let bounded = sources.map((source) => ({
    ...source,
    text: boundedSourceText(source.text, question, perSourceLimit),
  }));
  while (
    JSON.stringify(bounded).length > MAX_PROVIDER_EVIDENCE_SERIALIZED_CHARS &&
    perSourceLimit > MIN_PROVIDER_SOURCE_TEXT_CHARS
  ) {
    perSourceLimit = Math.max(
      MIN_PROVIDER_SOURCE_TEXT_CHARS,
      Math.floor(perSourceLimit * 0.8),
    );
    bounded = sources.map((source) => ({
      ...source,
      text: boundedSourceText(source.text, question, perSourceLimit),
    }));
  }
  if (JSON.stringify(bounded).length > MAX_PROVIDER_EVIDENCE_SERIALIZED_CHARS)
    throw new ResearchValidationError(
      "Canonical evidence metadata exceeds the provider context boundary",
      [
        `evidence must serialize within ${MAX_PROVIDER_EVIDENCE_SERIALIZED_CHARS} characters`,
      ],
    );
  return bounded;
}

export function atlasCanonicalSource(sourceId: string) {
  const passage = allPassages().find((item) => item.id === sourceId);
  return passage ? canonicalSourcesFromPassages([passage])[0] : undefined;
}

export function assertCanonicalEvidence(
  sources: readonly CanonicalResearchSource[],
) {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const source of sources) {
    if (ids.has(source.sourceId))
      issues.push(`duplicate source ${source.sourceId}`);
    ids.add(source.sourceId);
    if (!source.eligibleForAi)
      issues.push(`${source.sourceId} is not eligible for AI processing`);
    if (
      source.sourceRole === "unclassified" ||
      source.evidenceType === "unclassified"
    )
      issues.push(
        `${source.sourceId} is unclassified and cannot enter model synthesis`,
      );
    if (!/^https:\/\//u.test(source.url))
      issues.push(`${source.sourceId} does not have a canonical HTTPS URL`);
    if (!source.text.trim())
      issues.push(`${source.sourceId} has no inspectable text`);
    const hasWitnessChronology = Boolean(
      source.witnessDateLabel ||
      source.witnessDateConfidence ||
      source.survivalBiasNote,
    );
    if (
      hasWitnessChronology &&
      (!source.witnessId ||
        !source.witnessDateLabel ||
        !source.witnessDateConfidence ||
        !source.survivalBiasNote ||
        source.sourceRole !== "primary-source" ||
        !objectEvidenceTypes.has(source.evidenceType))
    )
      issues.push(
        `${source.sourceId} has incomplete or misclassified physical-witness chronology`,
      );
    if (
      source.witnessDateConfidence &&
      [
        "Securely attested",
        "Strong scholarly consensus",
        "Majority scholarly position",
        "Disputed",
        "Speculative",
        "Fragmentary",
      ].includes(source.witnessDateConfidence)
    )
      issues.push(
        `${source.sourceId} uses a general attestation status as date confidence`,
      );
    if (
      source.artifactId &&
      (source.sourceRole !== "primary-source" ||
        !objectEvidenceTypes.has(source.evidenceType))
    )
      issues.push(
        `${source.sourceId} has an artifact ID without qualifying primary object evidence`,
      );
  }
  if (issues.length)
    throw new ResearchValidationError("Canonical evidence rejected", issues);
  return sources;
}

export interface CanonicalCitationResolver {
  resolve(
    citation: ResearchCitationDraft,
    citationId: string,
  ): ResolvedResearchCitation;
}

export function createCanonicalCitationResolver(
  sources: readonly CanonicalResearchSource[],
): CanonicalCitationResolver {
  assertCanonicalEvidence(sources);
  const sourceMap = new Map(sources.map((source) => [source.sourceId, source]));
  return {
    resolve(citation, citationId) {
      const source = sourceMap.get(citation.sourceId);
      const issues: string[] = [];
      if (!source) {
        throw new ResearchValidationError("Citation resolution failed", [
          `${citation.sourceId} is not in the verified evidence set`,
        ]);
      }
      if (citation.expectedRole && citation.expectedRole !== source.sourceRole)
        issues.push(
          `${citation.sourceId} is ${source.sourceRole}, not ${citation.expectedRole}`,
        );
      const excerpt = normalizeExcerpt(citation.excerpt);
      const sourceText = normalizeExcerpt(source.text);
      if (excerpt.length < 8)
        issues.push(`${citation.sourceId} excerpt is too short to inspect`);
      if (!sourceText.includes(excerpt))
        issues.push(
          `${citation.sourceId} excerpt does not occur in the canonical source`,
        );
      if (issues.length)
        throw new ResearchValidationError("Citation resolution failed", issues);
      return {
        id: citationId,
        sourceId: source.sourceId,
        sourceRole: source.sourceRole,
        evidenceType: source.evidenceType,
        title: source.title,
        excerpt,
        url: source.url,
        locator: source.locator,
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
    },
  };
}

function resolveClaim(
  claim: ResearchClaimDraft,
  resolver: CanonicalCitationResolver,
): ResearchClaim {
  // Resolve every citation separately. Any bad citation rejects the whole claim;
  // a valid sibling citation can never conceal it.
  const citations = claim.citations.map((citation, index) =>
    resolver.resolve(citation, `${claim.id}:citation:${index + 1}`),
  );
  if (
    claim.confidence === "A" &&
    claim.claimType !== "retrieval-status" &&
    !citations.some((citation) => citation.sourceRole === "primary-source")
  )
    throw new ResearchValidationError(
      "Claim confidence does not match its evidence",
      [`${claim.id} uses confidence A without primary-source support`],
    );
  if (
    ["B", "C", "D"].includes(claim.confidence) &&
    !citations.some((citation) => citation.sourceRole === "scholarly-source")
  )
    throw new ResearchValidationError(
      "Claim confidence does not match its evidence",
      [
        `${claim.id} uses confidence ${claim.confidence} without a scholarly source`,
      ],
    );
  if (
    citations.length > 0 &&
    citations.every((citation) => citation.sourceRole === "model-synthesis")
  )
    throw new ResearchValidationError("Claim has no independent evidence", [
      `${claim.id} cites only model synthesis`,
    ]);
  const citationBySource = new Map(
    citations.map((citation) => [citation.sourceId, citation]),
  );
  const evidenceLadder: EvidenceLadderStep[] = claim.evidenceLadder.map(
    (step) => {
      const citation = citationBySource.get(step.sourceId);
      if (!citation)
        throw new ResearchValidationError("Evidence ladder resolution failed", [
          `${claim.id} step ${step.sourceId} has no resolved citation`,
        ]);
      return {
        ...step,
        citationId: citation.id,
        sourceRole: citation.sourceRole,
        evidenceType: citation.evidenceType,
      };
    },
  );
  return { ...claim, citations, evidenceLadder };
}

export function resolveStructuredQuestion(
  draft: StructuredQuestionDraft,
  sources: readonly CanonicalResearchSource[],
): StructuredQuestionAnswer {
  const resolver = createCanonicalCitationResolver(sources);
  const answer = {
    question: draft.question,
    sources: draft.sources.map((citation, index) =>
      resolver.resolve(citation, `source:${index + 1}`),
    ),
  } as StructuredQuestionAnswer;
  for (const section of researchSectionIds)
    answer[section] = draft[section].map((claim) =>
      resolveClaim(claim, resolver),
    );
  for (const claim of answer.primaryEvidence)
    if (
      !claim.citations.some(
        (citation) => citation.sourceRole === "primary-source",
      )
    )
      throw new ResearchValidationError(
        "Primary-evidence section is misclassified",
        [`${claim.id} has no primary-source citation`],
      );
  for (const claim of answer.oldestSurvivingEvidence) {
    if (
      !claim.citations.some(
        (citation) =>
          citation.sourceRole === "primary-source" &&
          objectEvidenceTypes.has(citation.evidenceType) &&
          citation.witnessId &&
          citation.witnessDateLabel &&
          citation.witnessDateConfidence &&
          citation.survivalBiasNote,
      )
    )
      throw new ResearchValidationError(
        "Earliest-surviving-evidence claim lacks physical-witness chronology",
        [
          `${claim.id} needs a cited witness date, date confidence, and survival-bias note; a work composition range is insufficient`,
        ],
      );
    if (!/\bcurrently represented in Atlas\b/iu.test(claim.statement))
      throw new ResearchValidationError(
        "Earliest-surviving-evidence claim overstates its scope",
        [`${claim.id} must say “currently represented in Atlas”`],
      );
    if (
      !/\b(?:survival|preservation|surviving-record)\b[^.]{0,40}\b(?:bias|limit|incomplete|sample)\b|\b(?:bias|limit|incomplete|sample)\b[^.]{0,40}\b(?:survival|preservation|surviving-record)\b/iu.test(
        `${claim.statement} ${claim.reasoning}`,
      )
    )
      throw new ResearchValidationError(
        "Earliest-surviving-evidence claim omits survival bias",
        [`${claim.id} must state the survival or preservation bias limitation`],
      );
  }
  for (const claim of answer.imagesArtifacts)
    if (
      !claim.citations.some(
        (citation) =>
          citation.sourceRole === "primary-source" &&
          objectEvidenceTypes.has(citation.evidenceType) &&
          Boolean(citation.artifactId || citation.witnessId),
      )
    )
      throw new ResearchValidationError(
        "Images-and-artifacts section is misclassified",
        [
          `${claim.id} needs qualifying primary object evidence with a canonical artifact or witness ID`,
        ],
      );
  return answer;
}

function excerptFor(source: CanonicalResearchSource) {
  const text = normalizeExcerpt(source.text);
  if (text.length <= 220) return text;
  const stop = text.lastIndexOf(" ", 220);
  return text.slice(0, stop >= 80 ? stop : 220);
}

function emptySections(): Record<
  (typeof researchSectionIds)[number],
  ResearchClaim[]
> {
  const sections = {} as Record<
    (typeof researchSectionIds)[number],
    ResearchClaim[]
  >;
  for (const id of researchSectionIds) sections[id] = [];
  return sections;
}

export function evidenceOnlyAnswer(
  question: string,
  sources: readonly CanonicalResearchSource[],
  notice: string,
): StructuredQuestionAnswer {
  assertCanonicalEvidence(sources);
  const sections = emptySections();
  sections.shortAnswer.push({
    id: "evidence-only-summary",
    statement: sources.length
      ? `Atlas found ${sources.length} verified evidence item${sources.length === 1 ? "" : "s"}; no audited model synthesis is available.`
      : "Atlas found no verified evidence items and cannot provide an evidence-backed synthesis.",
    claimType: "retrieval-status",
    status: "known",
    confidence: "A",
    reasoning: "This statement reports the verified retrieval state only.",
    alternatives: [],
    citations: [],
    evidenceLadder: [],
  });
  const resolvedSources: ResolvedResearchCitation[] = [];
  for (const [index, source] of sources.entries()) {
    const excerpt = excerptFor(source);
    const citation: ResolvedResearchCitation = {
      id: `fallback:${index + 1}`,
      sourceId: source.sourceId,
      sourceRole: source.sourceRole,
      evidenceType: source.evidenceType,
      title: source.title,
      excerpt,
      url: source.url,
      locator: source.locator,
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
    resolvedSources.push(citation);
    const isObjectEvidence = objectEvidenceTypes.has(source.evidenceType);
    if (source.sourceRole === "primary-source" && !isObjectEvidence)
      sections.primaryEvidence.push({
        id: `evidence-only-primary-${index + 1}`,
        statement: `${source.title}, ${source.locator}, is available as primary-source evidence.`,
        claimType: "textual-attestation",
        status: "known",
        confidence: "A",
        reasoning:
          "Atlas exposes the primary source and excerpt without generating an interpretation.",
        alternatives: [],
        citations: [citation],
        evidenceLadder: [
          {
            sourceId: source.sourceId,
            citationId: citation.id,
            sourceRole: source.sourceRole,
            evidenceType: source.evidenceType,
            contribution:
              "Verified primary-source segment returned by retrieval.",
            limitation:
              "A retrieved segment establishes its own wording, not a cross-cultural or historical conclusion.",
          },
        ],
      });
    if (
      source.sourceRole === "primary-source" &&
      objectEvidenceTypes.has(source.evidenceType) &&
      source.witnessId &&
      source.witnessDateLabel &&
      source.witnessDateConfidence &&
      source.survivalBiasNote
    ) {
      const workTitle =
        texts.find((item) => item.id === source.workId)?.title ??
        "the linked work";
      sections.oldestSurvivingEvidence.push({
        id: `evidence-only-witness-${index + 1}`,
        statement: `${source.title} is the earliest dated surviving witness currently represented in Atlas for ${workTitle}; its source record states: ${source.witnessDateLabel}`,
        claimType: "historical-context",
        status: "known",
        confidence: "A",
        reasoning: source.survivalBiasNote,
        alternatives: [
          "Earlier evidence may not have survived or may not yet be represented in Atlas.",
        ],
        citations: [citation],
        evidenceLadder: [
          {
            sourceId: source.sourceId,
            citationId: citation.id,
            sourceRole: source.sourceRole,
            evidenceType: source.evidenceType,
            contribution:
              "Supplies a verified object-level date for the earliest dated linked witness in the current Atlas catalog.",
            limitation: source.survivalBiasNote,
          },
        ],
      });
    }
    if (
      source.sourceRole === "primary-source" &&
      isObjectEvidence &&
      (source.artifactId || source.witnessId)
    )
      sections.imagesArtifacts.push({
        id: `evidence-only-object-${index + 1}`,
        statement: `Atlas has a verified institutional object record for ${source.title}.`,
        claimType: "artifact-observation",
        status: "known",
        confidence: "A",
        reasoning:
          "This reports cataloged object or image metadata only; Atlas does not infer iconography, meaning, translation, or historical events from image pixels.",
        alternatives: [],
        citations: [citation],
        evidenceLadder: [
          {
            sourceId: source.sourceId,
            citationId: citation.id,
            sourceRole: source.sourceRole,
            evidenceType: source.evidenceType,
            contribution:
              "Supplies an institution-linked physical-object or image record.",
            limitation:
              "The record and its explicit rights metadata do not authorize an inferred interpretation of the object or image.",
          },
        ],
      });
  }
  sections.uncertainty.push({
    id: "evidence-only-limits",
    statement: notice,
    claimType: "uncertainty",
    status: "unknown",
    confidence: "Unreviewed",
    reasoning:
      "Atlas does not fill missing answer sections without an evidence-audited synthesis.",
    alternatives: [],
    citations: [],
    evidenceLadder: [],
  });
  return {
    question,
    ...sections,
    sources: resolvedSources,
  };
}

export function confidenceOf(claim: ResearchClaimDraft): Confidence {
  return claim.confidence;
}
