import type { Confidence } from "./types";

export const researchSectionIds = [
  "shortAnswer",
  "primaryEvidence",
  "oldestSurvivingEvidence",
  "crossCulturalSimilarities",
  "importantDifferences",
  "historicalDevelopment",
  "documentedInfluence",
  "possibleInfluence",
  "independentDevelopment",
  "oppositionCompetingViews",
  "modernReinterpretations",
  "scholarlyConsensus",
  "disputedIssues",
  "imagesArtifacts",
  "uncertainty",
] as const;

export type ResearchSectionId = (typeof researchSectionIds)[number];

export const researchSourceRoles = [
  "primary-source",
  "translator-editor-commentary",
  "scholarly-source",
  "modern-interpretation",
  "model-synthesis",
  "unclassified",
] as const;

export type ResearchSourceRole = (typeof researchSourceRoles)[number];

export const researchEvidenceTypes = [
  "primary-text",
  "translation-editorial",
  "scholarly-secondary",
  "manuscript",
  "archaeological",
  "museum-institutional",
  "legal-government",
  "oral-community",
  "image-artifact",
  "modern-interpretation",
  "model-synthesis",
  "unclassified",
] as const;

export type ResearchEvidenceType = (typeof researchEvidenceTypes)[number];

export const researchClaimStatuses = [
  "known",
  "claimed",
  "disputed",
  "unknown",
  "unsupported",
] as const;

export type ResearchClaimStatus = (typeof researchClaimStatuses)[number];

export const researchClaimTypes = [
  "retrieval-status",
  "textual-attestation",
  "historical-context",
  "scholarly-interpretation",
  "comparison",
  "historical-influence",
  "independent-development",
  "modern-interpretation",
  "artifact-observation",
  "uncertainty",
] as const;

export type ResearchClaimType = (typeof researchClaimTypes)[number];

/**
 * These are the original Atlas meanings. Confidence grades describe the kind
 * of support for a claim; they do not collapse authenticity, historicity,
 * decipherment, canon, access, and attestation into one score.
 */
export const claimConfidenceDefinitions: Record<Confidence, string> = {
  A: "Directly supported by a primary source. This establishes attestation, not automatic historical truth.",
  B: "Strong scholarly consensus supported by independent scholarly evidence.",
  C: "A scholarly-majority interpretation that is common but not universal.",
  D: "A claim with meaningful scholarly disagreement; it must be labeled disputed.",
  E: "A speculative hypothesis lacking strong evidence; it must be labeled speculative.",
  Unreviewed:
    "Not yet reviewed. This is a workflow state, not evidence of scholarly disagreement.",
};

export interface CanonicalResearchSource {
  id: string;
  sourceId: string;
  sourceRole: ResearchSourceRole;
  evidenceType: ResearchEvidenceType;
  title: string;
  text: string;
  url: string;
  locator: string;
  workId?: string;
  editionId?: string;
  witnessId?: string;
  artifactId?: string;
  author?: string;
  editor?: string;
  translator?: string;
  /** Provisional work-level range; never evidence for a surviving witness. */
  compositionDateLabel?: string;
  compositionDateConfidence?: string;
  /** Object-level chronology, present only when a cited physical witness supports it. */
  witnessDateLabel?: string;
  /** Date-specific precision/basis assessment; never the witness's general attestation status. */
  witnessDateConfidence?: string;
  survivalBiasNote?: string;
  eligibleForAi: boolean;
  rights?: string;
}

/** Provider output names canonical source IDs only; metadata always comes from the resolver. */
export interface ResearchCitationDraft {
  sourceId: string;
  excerpt: string;
  expectedRole?: ResearchSourceRole;
}

export interface ResolvedResearchCitation {
  id: string;
  sourceId: string;
  sourceRole: ResearchSourceRole;
  evidenceType: ResearchEvidenceType;
  title: string;
  excerpt: string;
  url: string;
  locator: string;
  workId?: string;
  editionId?: string;
  witnessId?: string;
  artifactId?: string;
  author?: string;
  editor?: string;
  translator?: string;
  compositionDateLabel?: string;
  compositionDateConfidence?: string;
  witnessDateLabel?: string;
  /** Date-specific precision/basis assessment; never the witness's general attestation status. */
  witnessDateConfidence?: string;
  survivalBiasNote?: string;
  rights?: string;
}

export interface EvidenceLadderStepDraft {
  sourceId: string;
  contribution: string;
  limitation: string;
}

export interface EvidenceLadderStep extends EvidenceLadderStepDraft {
  citationId: string;
  sourceRole: ResearchSourceRole;
  evidenceType: ResearchEvidenceType;
}

export interface ResearchClaimDraft {
  id: string;
  statement: string;
  claimType: ResearchClaimType;
  status: ResearchClaimStatus;
  confidence: Confidence;
  reasoning: string;
  alternatives: string[];
  citations: ResearchCitationDraft[];
  evidenceLadder: EvidenceLadderStepDraft[];
}

export interface ResearchClaim extends Omit<
  ResearchClaimDraft,
  "citations" | "evidenceLadder"
> {
  citations: ResolvedResearchCitation[];
  evidenceLadder: EvidenceLadderStep[];
}

export type ResearchClaimSections<TClaim> = Record<ResearchSectionId, TClaim[]>;

export interface StructuredQuestionDraft extends ResearchClaimSections<ResearchClaimDraft> {
  question: string;
  sources: ResearchCitationDraft[];
}

export interface StructuredQuestionAnswer extends ResearchClaimSections<ResearchClaim> {
  question: string;
  sources: ResolvedResearchCitation[];
}

export const neutralityChecklistIds = [
  "religious-truth-ranking",
  "primitive-religion-framing",
  "western-default-categories",
  "oral-tradition-as-scripture",
  "mythology-as-falsehood",
  "canon-as-historical-truth",
  "skepticism-as-superior",
  "religion-as-irrational",
  "overstated-textual-borrowing",
  "chronology-ignored",
  "similarity-as-direct-influence",
  "alternative-scholarship-omitted",
] as const;

export type NeutralityChecklistId = (typeof neutralityChecklistIds)[number];

export interface NeutralityAuditItem {
  id: NeutralityChecklistId;
  passed: boolean;
  explanation: string;
  claimIds: string[];
}

export interface NeutralityAudit {
  passed: boolean;
  items: NeutralityAuditItem[];
}

export interface ProviderNeutralityAudit extends NeutralityAudit {
  provider: string;
  claimAudits: ProviderClaimAudit[];
}

export interface ProviderClaimAudit {
  claimId: string;
  citationAudits: ProviderCitationAudit[];
  inScope: boolean;
  sourceRoleValid: boolean;
  confidenceValid: boolean;
  passed: boolean;
  explanation: string;
}

export interface ProviderCitationAudit {
  citationId: string;
  sourceId: string;
  entailed: boolean;
  explanation: string;
}

export type QuestionEngineMode = "audited-synthesis" | "evidence-only";

export interface QuestionEngineResult {
  mode: QuestionEngineMode;
  answer: StructuredQuestionAnswer;
  attempts: number;
  synthesisAudited: boolean;
  deterministicAudit: NeutralityAudit;
  providerAudit: ProviderNeutralityAudit | null;
  notices: string[];
}

export type QuestionStreamEvent =
  | {
      type: "status";
      stage:
        | "retrieval-started"
        | "evidence-verified"
        | "safeguard-applied"
        | "generation-started"
        | "audit-started"
        | "retry-started"
        | "fallback-started";
      message: string;
      attempt?: number;
    }
  | {
      type: "evidence";
      source: Omit<CanonicalResearchSource, "text"> & { excerpt: string };
    }
  | { type: "complete"; result: QuestionEngineResult };
