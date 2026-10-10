import seed from "@/data/seed/research-engines.json";
import type { Passage } from "@/packages/shared/types";

export type ResearchConfidence = "high" | "medium" | "low" | "contested";
export type OppositionCategory =
  | "doctrinal-opposition"
  | "philosophical-critique"
  | "internal-heterodox-opposition"
  | "skeptical-critique"
  | "materialist-critique"
  | "alternative-religious-interpretation"
  | "mystical-reinterpretation"
  | "adversarial-reinterpretation"
  | "modern-secular-critique";
export type StanceRelation =
  "supports" | "opposes" | "qualifies" | "reinterprets";
export type SimilarityDimension =
  "motif" | "semantic" | "ritual" | "narrative" | "theological";
export type ChronologyKind = "earlier-parallel" | "later-echo";
export type ComparisonMode =
  | "synthesize"
  | "contradictions"
  | "similarities"
  | "earlier-parallels"
  | "later-echoes"
  | "alternative-interpretations";

export interface ResearchEngineSource {
  id: string;
  label: string;
  url: string;
  kind: string;
  perspective: string;
  accessed: string;
  verification: {
    status: "verified";
    httpStatus: 200;
    verifiedAt: string;
  };
}

export interface ResearchEnginePolicy {
  opposition: string;
  comparison: string;
  chronology: string;
  teachingConduct: string;
}

export interface OppositionProposition {
  id: string;
  title: string;
  proposition: string;
  topic: string;
  keywords: string[];
  sourceIds: string[];
}

export interface ScopedEvidence {
  id: string;
  summary: string;
  sourceIds: string[];
  /** Human-readable source span inspected for this individual finding. */
  locator: string;
  /** Static research-engine findings are published only after human review. */
  reviewStatus: "human-reviewed";
  /** Exact Atlas passage records used when the finding is tied to bundled text. */
  canonicalPassageIds?: string[];
  /** Exact catalog works represented by this finding, when text-scoped. */
  textIds?: string[];
  traditionIds: string[];
  regions: string[];
  startYear: number | null;
  endYear: number | null;
  confidence: ResearchConfidence;
  /** Present only when a reviewed finding is bounded to classified passages. */
  contentTypes?: Passage["contentType"][];
}

export interface OppositionStance extends ScopedEvidence {
  propositionId: string;
  title: string;
  category: OppositionCategory;
  relation: StanceRelation;
  speakerOrCommunity: string;
  historicalContext: string;
  uncertainty: string;
}

export interface ComparisonSubjectClaim extends ScopedEvidence {
  proposition: string;
  speaker: string;
  context: string;
}

export type ComparisonSynthesisFinding = ScopedEvidence;

export interface SimilarityFinding extends ScopedEvidence {
  dimension: SimilarityDimension;
  influenceRelationshipId: string | null;
}

export interface ContradictionFinding extends ScopedEvidence {
  propositionAId: string;
  propositionBId: string;
  speakerContext: string;
  harmonization: string;
  counterReading: string;
}

export interface DateEstimate {
  label: string;
  startYear: number | null;
  endYear: number | null;
  confidence: ResearchConfidence;
}

export interface ChronologyFinding extends ScopedEvidence {
  kind: ChronologyKind;
  earlierSubject: string;
  laterSubject: string;
  earlierDate: DateEstimate;
  laterDate: DateEstimate;
  survivalBiasWarning: string;
  influenceRelationshipId: string | null;
}

export interface InfluenceRelationship extends ScopedEvidence {
  relationshipType: string;
  documented: true;
}

export interface AlternativeInterpretation extends ScopedEvidence {
  interpretationSource: string;
}

export interface ComparisonCase {
  id: string;
  title: string;
  topic: string;
  scopeNote: string;
  textIds: string[];
  themes: string[];
  subjectClaims: ComparisonSubjectClaim[];
  synthesisFindings: ComparisonSynthesisFinding[];
  similarityFindings: SimilarityFinding[];
  contradictionFindings: ContradictionFinding[];
  chronologyFindings: ChronologyFinding[];
  influenceRelationships: InfluenceRelationship[];
  alternativeInterpretations: AlternativeInterpretation[];
}

export interface AttributedEvidence extends ScopedEvidence {
  /** Explicitly separates supported evidence from a cited absence in the record. */
  recordKind?: "evidence" | "documented-gap";
  evidenceType?: string;
  attributedTo?: string;
  evidenceStatus?: string;
  motiveType?: string;
}

export interface TeachingConductCase {
  id: string;
  title: string;
  traditionId: string;
  dateLabel: string;
  startYear: number;
  endYear: number;
  locations: string[];
  actorsAndInstitutions: string[];
  teachingEvidence: AttributedEvidence[];
  conductEvidence: AttributedEvidence[];
  justificationsAtTheTime: AttributedEvidence[];
  textsUsedToJustify: AttributedEvidence[];
  supportingReligiousVoices: AttributedEvidence[];
  opposingReligiousVoices: AttributedEvidence[];
  nonreligiousMotives: AttributedEvidence[];
  laterTheologicalInterpretations: AttributedEvidence[];
  modernScholarlyInterpretations: AttributedEvidence[];
  evidenceStatus: string;
  disputes: string;
  neutralityNote: string;
  sourceIds: string[];
}

export interface ResearchEngineData {
  formatVersion: number;
  reviewedAt: string;
  policy: ResearchEnginePolicy;
  sources: ResearchEngineSource[];
  propositions: OppositionProposition[];
  oppositionStances: OppositionStance[];
  comparisonCases: ComparisonCase[];
  teachingConductCases: TeachingConductCase[];
}

export const researchEngineData = seed as unknown as ResearchEngineData;
export const researchEnginePolicy = researchEngineData.policy;
export const researchSources = researchEngineData.sources;
export const oppositionPropositions = researchEngineData.propositions;
export const oppositionStances = researchEngineData.oppositionStances;
export const comparisonCases = researchEngineData.comparisonCases;
export const teachingConductCases = researchEngineData.teachingConductCases;

const oppositionCategories: OppositionCategory[] = [
  "doctrinal-opposition",
  "philosophical-critique",
  "internal-heterodox-opposition",
  "skeptical-critique",
  "materialist-critique",
  "alternative-religious-interpretation",
  "mystical-reinterpretation",
  "adversarial-reinterpretation",
  "modern-secular-critique",
];
const similarityDimensions: SimilarityDimension[] = [
  "motif",
  "semantic",
  "ritual",
  "narrative",
  "theological",
];
const evidenceSectionKeys = [
  "teachingEvidence",
  "conductEvidence",
  "justificationsAtTheTime",
  "textsUsedToJustify",
  "supportingReligiousVoices",
  "opposingReligiousVoices",
  "nonreligiousMotives",
  "laterTheologicalInterpretations",
  "modernScholarlyInterpretations",
] as const;

function unique(values: string[], label: string) {
  if (new Set(values).size !== values.length)
    throw new Error(`Duplicate ${label}`);
}

/** Runtime integrity check used by ingestion, tests, and API startup paths. */
export function validateResearchEngineData(
  data: ResearchEngineData = researchEngineData,
) {
  if (data.formatVersion !== 1)
    throw new Error("Unsupported research seed version");
  unique(
    data.sources.map(({ id }) => id),
    "research source id",
  );
  const sourceIds = new Set(data.sources.map(({ id }) => id));
  for (const source of data.sources) {
    if (!source.url.startsWith("https://"))
      throw new Error(`Research source is not HTTPS: ${source.id}`);
    if (
      source.verification.status !== "verified" ||
      source.verification.httpStatus !== 200
    )
      throw new Error(`Research source is not verified: ${source.id}`);
  }

  const ids = new Set<string>();
  const addId = (id: string) => {
    if (ids.has(id)) throw new Error(`Duplicate research record id: ${id}`);
    ids.add(id);
  };
  const checkSources = (record: { id: string; sourceIds: string[] }) => {
    if (!record.sourceIds.length)
      throw new Error(`Research record has no citations: ${record.id}`);
    const missing = record.sourceIds.filter((id) => !sourceIds.has(id));
    if (missing.length)
      throw new Error(
        `${record.id} has missing source(s): ${missing.join(", ")}`,
      );
  };
  const checkReviewedEvidence = (record: ScopedEvidence) => {
    checkSources(record);
    if (!record.locator.trim())
      throw new Error(`Research finding has no inspected span: ${record.id}`);
    if (record.reviewStatus !== "human-reviewed")
      throw new Error(`Research finding is not human reviewed: ${record.id}`);
    if (
      record.canonicalPassageIds?.length &&
      (!record.textIds?.length || !record.contentTypes?.length)
    )
      throw new Error(
        `Canonical mapping lacks work or classification metadata: ${record.id}`,
      );
  };

  for (const proposition of data.propositions) {
    addId(proposition.id);
    checkSources(proposition);
  }
  const propositionIds = new Set(data.propositions.map(({ id }) => id));
  for (const stance of data.oppositionStances) {
    addId(stance.id);
    checkReviewedEvidence(stance);
    if (!propositionIds.has(stance.propositionId))
      throw new Error(`Unknown proposition for stance ${stance.id}`);
    if (!oppositionCategories.includes(stance.category))
      throw new Error(`Unknown opposition category for ${stance.id}`);
    if (
      !stance.speakerOrCommunity ||
      !stance.historicalContext ||
      !stance.uncertainty
    )
      throw new Error(`Unbounded opposition stance: ${stance.id}`);
  }
  const seededCategories = new Set(
    data.oppositionStances.map(({ category }) => category),
  );
  if (oppositionCategories.some((category) => !seededCategories.has(category)))
    throw new Error("Opposition category coverage is incomplete");
  for (const proposition of data.propositions) {
    const linked = data.oppositionStances.filter(
      ({ propositionId }) => propositionId === proposition.id,
    );
    if (
      linked.length < 4 ||
      new Set(linked.map(({ category }) => category)).size < 3
    )
      throw new Error(`Opposition breadth is incomplete for ${proposition.id}`);
  }

  const seededDimensions = new Set<SimilarityDimension>();
  for (const comparison of data.comparisonCases) {
    addId(comparison.id);
    if (comparison.textIds.length < 2 || !comparison.themes.length)
      throw new Error(`Comparison applicability missing for ${comparison.id}`);
    const comparisonTextIds = new Set(comparison.textIds);
    const required = [
      comparison.subjectClaims,
      comparison.synthesisFindings,
      comparison.similarityFindings,
      comparison.contradictionFindings,
      comparison.chronologyFindings,
      comparison.alternativeInterpretations,
    ];
    if (required.some((section) => !section.length))
      throw new Error(`Comparison mode evidence missing for ${comparison.id}`);
    const influenceIds = new Set(
      comparison.influenceRelationships.map(({ id }) => id),
    );
    const sections: ScopedEvidence[][] = [
      comparison.subjectClaims,
      comparison.synthesisFindings,
      comparison.similarityFindings,
      comparison.contradictionFindings,
      comparison.chronologyFindings,
      comparison.influenceRelationships,
      comparison.alternativeInterpretations,
    ];
    for (const item of sections.flat()) {
      addId(item.id);
      checkReviewedEvidence(item);
      if (
        !item.textIds?.length ||
        item.textIds.some((textId) => !comparisonTextIds.has(textId))
      )
        throw new Error(`Comparison text scope missing for ${item.id}`);
    }
    for (const finding of comparison.similarityFindings) {
      seededDimensions.add(finding.dimension);
      if (
        finding.influenceRelationshipId &&
        !influenceIds.has(finding.influenceRelationshipId)
      )
        throw new Error(`Unsupported similarity influence: ${finding.id}`);
    }
    for (const finding of comparison.chronologyFindings) {
      if (!finding.survivalBiasWarning)
        throw new Error(`Chronology warning missing: ${finding.id}`);
      if (
        finding.influenceRelationshipId &&
        !influenceIds.has(finding.influenceRelationshipId)
      )
        throw new Error(`Unsupported chronological influence: ${finding.id}`);
    }
    if (comparison.influenceRelationships.some(({ documented }) => !documented))
      throw new Error(`Unverified influence in ${comparison.id}`);
  }
  if (
    similarityDimensions.some((dimension) => !seededDimensions.has(dimension))
  )
    throw new Error("Similarity dimension coverage is incomplete");

  const representedTraditions = new Set<string>();
  for (const conductCase of data.teachingConductCases) {
    addId(conductCase.id);
    checkSources(conductCase);
    representedTraditions.add(conductCase.traditionId);
    if (
      !conductCase.actorsAndInstitutions.length ||
      !conductCase.locations.length
    )
      throw new Error(`Historical context missing: ${conductCase.id}`);
    if (
      !conductCase.evidenceStatus ||
      !conductCase.disputes ||
      !conductCase.neutralityNote
    )
      throw new Error(`Evidence boundary missing: ${conductCase.id}`);
    for (const key of evidenceSectionKeys) {
      if (!conductCase[key].length)
        throw new Error(`${key} missing: ${conductCase.id}`);
      for (const item of conductCase[key]) {
        addId(item.id);
        checkReviewedEvidence(item);
        if (
          item.recordKind !== undefined &&
          item.recordKind !== "evidence" &&
          item.recordKind !== "documented-gap"
        )
          throw new Error(`Unknown teaching/conduct record kind: ${item.id}`);
        const isGap = item.recordKind === "documented-gap";
        const reportsMissingEvidence =
          item.evidenceStatus?.includes("not-established") ||
          item.evidenceStatus?.includes("documented-gap");
        if (isGap) {
          if (!reportsMissingEvidence)
            throw new Error(`Documented gap lacks a gap status: ${item.id}`);
          if (item.confidence !== "low" && item.confidence !== "contested")
            throw new Error(`Documented gap overstates confidence: ${item.id}`);
        } else if (reportsMissingEvidence) {
          throw new Error(`Evidence gap is not explicitly tagged: ${item.id}`);
        }
      }
    }
    const teaching = new Set(
      conductCase.teachingEvidence.flatMap(({ sourceIds: values }) => values),
    );
    const conduct = new Set(
      conductCase.conductEvidence.flatMap(({ sourceIds: values }) => values),
    );
    if (
      !teaching.size ||
      !conduct.size ||
      [...teaching].every((id) => conduct.has(id))
    )
      throw new Error(
        `Teaching and conduct lack independent evidence: ${conductCase.id}`,
      );
  }
  if (representedTraditions.size < 4)
    throw new Error("Teaching/conduct cases are not cross-traditional");
  return true;
}
