export type Confidence = "A" | "B" | "C" | "D" | "E" | "Unreviewed";
export interface TextRecord {
  id: string;
  title: string;
  traditionId: string;
  tradition: string;
  category: string;
  canonStatus: string;
  startDate: number | null;
  endDate: number | null;
  dateConfidence: string;
  region: string;
  lat: number | null;
  lng: number | null;
  languages: string[];
  author: string;
  description: string;
  historicalContext: string;
  manuscripts: string;
  themes: string[];
  sourceStatus: string;
  copyright: string;
  sourceUrl: string | null;
  metadataSources: string[];
  editionId: string | null;
  confidence: Confidence;
  nativeTitle?: string;
  pinyin?: string;
  alternateTitles?: string[];
  subcollection?: string;
}
export interface Tradition {
  id: string;
  name: string;
  region: string;
  lat: number | null;
  lng: number | null;
  description: string;
  color: string;
}
export interface Edition {
  sourceFile?: string;
  sourceSections?:
    | {
        startHeading: string;
        endHeading: string | null;
        startOccurrence?: number;
        endOccurrence?: number;
      }[]
    | null;
  id: string;
  textId: string;
  title: string;
  translator: string;
  sourceUrl: string;
  downloadUrl: string;
  license: string;
  language: string;
  sha256: string;
  passageCount: number;
  complete: boolean;
  note: string;
}
export interface AlignmentSource {
  editionId: string;
  passageId: string;
  url: string;
  attribution: string;
  license: string;
}
export interface AlignedRendering {
  text: string;
  language: string;
  script: string;
  kind: "original" | "transliteration" | "literal" | "translation";
  machineGenerated: boolean;
  source: AlignmentSource;
}
export interface TranslationAlignment {
  id: string;
  textId: string;
  sharedReference: string;
  original: AlignedRendering;
  normalizedOriginal: string;
  transliteration: AlignedRendering | null;
  literalRendering: AlignedRendering | null;
  translations: AlignedRendering[];
  lexicalNotes: string[];
  translatorNotes: string[];
  manuscriptVariants: {
    witnessId: string;
    note: string;
    sourceUrl: string;
  }[];
  limitation: string;
}
export interface Passage {
  id: string;
  textId: string;
  editionId: string;
  sequence: number;
  reference: string;
  content: string;
  sourceUrl: string;
  themes: string[];
  contentType:
    | "Primary text"
    | "Translator note"
    | "Editorial introduction"
    | "Scholarly commentary"
    | "Footnote"
    | "Appendix"
    | "Unknown";
}
export interface SearchHit extends Passage {
  score: number;
  textTitle: string;
  tradition: string;
  translator: string;
}
export const federatedSearchModes = [
  "Broad",
  "Scholarly",
  "Opposition",
  "Deep Archive",
  "Manuscripts",
] as const;
export type FederatedSearchMode = (typeof federatedSearchModes)[number];
export type FederatedEntityType =
  | "work"
  | "tradition"
  | "subtradition"
  | "person"
  | "entity"
  | "concept"
  | "unresolved-corpus"
  | "witness"
  | "artifact";
export interface FederatedSearchHit {
  id: string;
  type: FederatedEntityType;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  aliases: string[];
  nameAssertions?: FederatedNameAssertion[];
  availability: string;
  score: number;
}
export interface FederatedNameAssertion {
  name: string;
  assertionType: string;
  language: string;
  script: string;
  scope: string;
  confidence: string;
}
export interface Finding {
  id: string;
  kind: "text" | "passage" | "query" | "comparison";
  textId?: string;
  editionId?: string;
  title: string;
  content: string;
  sourceUrl?: string;
  createdAt: string;
}
export interface Collection {
  id: string;
  name: string;
  notes: string;
  items: Finding[];
  createdAt: string;
  updatedAt: string;
}
export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: string;
  relationshipType: RelationshipType;
  confidence: Confidence;
  evidenceLevel: RelationshipEvidenceLevel;
  summary: string;
  sourceUrl: string;
  chronology: string;
  contact: string;
  difference: string;
  citations: RelationshipCitation[];
  counterarguments: RelationshipCounterargument[];
  sourceChain: RelationshipSourceChainLink[];
  claimStatus: RelationshipClaimStatus;
  interpretation?: ObjectInterpretation;
}
export const relationshipTypes = [
  "direct-citation",
  "translation-lineage",
  "commentary",
  "polemical-response",
  "shared-source",
  "likely-influence",
  "possible-influence",
  "cultural-contact",
  "thematic-parallel",
  "ritual-parallel",
  "linguistic-relationship",
  "modern-reinterpretation",
  "organization-membership",
  "organization-contact",
  "successor-claim",
  "object-interpretation",
] as const;
export type RelationshipType = (typeof relationshipTypes)[number];
export type RelationshipNodeType =
  | "work"
  | "tradition"
  | "person"
  | "concept"
  | "organization"
  | "artifact";
export interface RelationshipNode {
  id: string;
  type: RelationshipNodeType;
  label: string;
  subtitle: string;
  description: string;
  href: string | null;
  sourceUrls: string[];
}
export type RelationshipEvidenceLevel =
  | "documented"
  | "strong"
  | "qualified"
  | "exploratory"
  | "disputed";
export interface RelationshipCitation {
  id: string;
  label: string;
  url: string;
  locator?: string;
  sourceType:
    | "primary-source"
    | "scholarly-source"
    | "institutional-record"
    | "collection-record"
    | "community-source";
}
export interface RelationshipCounterargument {
  id: string;
  summary: string;
  citationIds: string[];
}
export interface RelationshipSourceChainLink {
  citationId: string;
  role: "evidence" | "counterevidence" | "claim-origin" | "context";
  note: string;
}
export type RelationshipClaimStatus =
  | "documented"
  | "documented-member"
  | "strong-documentary-evidence"
  | "probable-association"
  | "documented-contact-not-membership"
  | "claimed-member"
  | "later-attribution"
  | "no-verified-evidence"
  | "disproven-misidentified"
  | "claimed-successor"
  | "alleged"
  | "disputed"
  | "not-applicable";
export interface ObjectInterpretation {
  kind:
    | "object-fact"
    | "maker-explanation"
    | "institutional-explanation"
    | "iconographic-scholarship"
    | "religious-interpretation"
    | "esoteric-interpretation"
    | "later-popular-interpretation"
    | "contested-interpretation"
    | "unsupported-association";
  objectFactIds: string[];
  explanation: string;
  assertsOccultIntent: false;
}
export interface RelationshipObjectFact {
  id: string;
  artifactId: string;
  factType: "identity" | "creator" | "date" | "location" | "purpose" | "access";
  statement: string;
  citation: RelationshipCitation;
}
export interface Artifact {
  id: string;
  title: string;
  date: string;
  institution: string;
  creator: string;
  imageUrl: string;
  sourceUrl: string;
  license: string;
  caption: string;
}
export interface QueryAnswer {
  guide?: {
    title: string;
    summary: string;
    perspectives: {
      textId: string;
      label: string;
      interpretation: string;
      passageIds: string[];
    }[];
    agreements: string;
    differences: string;
    scope: string;
  };
  question: string;
  mode: string;
  summary: string;
  agreements: string[];
  disagreements: string[];
  distinctive: string[];
  history: string;
  influence: string;
  independent: string;
  alternatives: string;
  uncertainty: string[];
  passages: SearchHit[];
  synthesis?: string;
}
