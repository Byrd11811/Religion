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
  sourceSections?: { startHeading: string; endHeading: string | null }[] | null;
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
export interface Passage {
  id: string;
  textId: string;
  editionId: string;
  sequence: number;
  reference: string;
  content: string;
  sourceUrl: string;
  themes: string[];
}
export interface SearchHit extends Passage {
  score: number;
  textTitle: string;
  tradition: string;
  translator: string;
}
export interface Finding {
  id: string;
  kind: "text" | "passage" | "query" | "comparison";
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
  confidence: Confidence;
  summary: string;
  sourceUrl: string;
  chronology: string;
  contact: string;
  difference: string;
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
