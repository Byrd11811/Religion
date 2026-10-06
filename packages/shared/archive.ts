import { texts, editions, artifacts } from "./catalog";
import additions from "@/data/seed/archive-additions.json";

export const coverageStatuses = [
  "Complete named work",
  "Complete available edition",
  "Substantial selection",
  "Partial translation",
  "Fragments",
  "Metadata only",
  "Image only",
  "Transliteration only",
  "Undeciphered",
  "Partially deciphered",
  "Disputed decipherment",
  "Lost",
  "Reconstructed",
  "Hypothetical",
  "Restricted",
] as const;
export type CoverageStatus = (typeof coverageStatuses)[number];
export type Decipherment =
  | "Not assessed"
  | "Readable edition available"
  | "Undeciphered"
  | "Partially deciphered"
  | "Disputed decipherment";
export type EvidenceStatus =
  | "Unreviewed"
  | "Securely attested"
  | "Strong scholarly consensus"
  | "Majority scholarly position"
  | "Disputed"
  | "Speculative"
  | "Fragmentary"
  | "Indirectly attested"
  | "Lost"
  | "Reconstructed"
  | "Hypothetical"
  | "Undeciphered"
  | "Partially deciphered"
  | "Disputed authenticity"
  | "Suspected forgery"
  | "Demonstrated forgery"
  | "Hoax-associated"
  | "Restricted / culturally sensitive"
  | "Banned / suppressed"
  | "Controversial";
export interface WorkProfile {
  id: string;
  title: string;
  alternateTitles: string[];
  tradition: string;
  workType: string;
  genre: string[];
  canonStatus: string;
  compositionStart: number | null;
  compositionEnd: number | null;
  compositionNotes: string;
  originalLanguages: string[];
  scripts: string[];
  region: string;
  authorship: string;
  authorshipConfidence: string;
  description: string;
  historicalContext: string;
  transmission: string;
  coverage: CoverageStatus;
  decipherment: Decipherment;
  evidence: EvidenceStatus;
  scholarlyReview: string;
  sourceQuality: string;
  copyright: string;
  sources: string[];
  access: "Public metadata" | "Restricted";
  culturalRestrictions: string;
  sourceDepth: Record<string, string>;
  editionIds: string[];
}
export interface Recension {
  id: string;
  workId: string;
  title: string;
  description: string;
  sources: string[];
  evidence: EvidenceStatus;
}
export interface Witness {
  id: string;
  title: string;
  workIds: string[];
  recensionId: string | null;
  type: string;
  inventoryNumber: string | null;
  repository: string;
  discoveryLocation: string | null;
  currentLocation: string;
  dateStart: number | null;
  dateEnd: number | null;
  dateNotes: string;
  material: string | null;
  languages: string[];
  scripts: string[];
  condition: string | null;
  completeness: string | null;
  provenance: string;
  digitizationUrl: string | null;
  iiifManifest: string | null;
  rights: string;
  sources: string[];
  decipherment: Decipherment;
  evidence: EvidenceStatus;
  description: string;
  access: "Public metadata" | "Restricted";
}
export interface MuseumArtifact {
  collection?: string | null;
  period?: string;
  date?: string;
  culture?: string | null;
  sourceApi?: string;
  sourceHash?: string;
  verifiedAt?: string;
  sensitivity?: string;
  protocolReview?: string;
  id: string;
  title: string;
  witnessId: string | null;
  inventoryNumber: string | null;
  institution: string;
  sourceUrl: string;
  description: string;
}
export interface ArchiveImage {
  verifiedAt?: string;
  id: string;
  artifactId: string;
  witnessId: string | null;
  workIds: string[];
  title: string;
  institution: string;
  imageUrl: string;
  thumbnail: string;
  iiifService: string | null;
  sourceUrl: string;
  rights: string;
  attribution: string;
  publicDomain: boolean;
  caption: string;
}
export function workProfile(id: string): WorkProfile | undefined {
  const t = texts.find((t) => t.id === id);
  if (!t) return;
  const available = editions.filter((e) => e.textId === id);
  const complete = available.find((e) => e.complete);
  const coverage: CoverageStatus = complete
    ? complete.sourceSections
      ? "Complete named work"
      : "Complete available edition"
    : available.length
      ? "Partial translation"
      : "Metadata only";
  return {
    id,
    title: t.title,
    alternateTitles: [],
    tradition: t.tradition,
    workType: t.category,
    genre: [],
    canonStatus: t.canonStatus,
    compositionStart: t.startDate,
    compositionEnd: t.endDate,
    compositionNotes: t.dateConfidence,
    originalLanguages: t.languages,
    scripts: [],
    region: t.region,
    authorship: t.author,
    authorshipConfidence: "Unreviewed",
    description: t.description,
    historicalContext: t.historicalContext,
    transmission: t.manuscripts,
    coverage,
    decipherment: available.length
      ? "Readable edition available"
      : "Not assessed",
    evidence: "Unreviewed",
    scholarlyReview: "Awaiting scholarly review",
    sourceQuality: available.length
      ? "Attributed historical edition; apparatus not separately classified"
      : "Catalog metadata; detailed review pending",
    copyright: t.copyright,
    sources: t.metadataSources,
    access: "Public metadata",
    culturalRestrictions:
      "Not assessed; public metadata does not authorize reproduction of cultural material",
    sourceDepth: {
      Metadata: "Catalog record",
      "Primary text": coverage,
      Translation: available.length
        ? "English edition available"
        : "Data unavailable",
      "Original language": "No transcription bundled",
      "Witness imagery": archiveImages.some((i) => i.workIds.includes(id))
        ? "Institution-linked images available"
        : "No verified association",
      Scholarship: "Review pending",
      Relationships: "See individually qualified graph records",
    },
    editionIds: available.map((e) => e.id),
  };
}
const yale =
  "https://beinecke.library.yale.edu/beinecke/collections/beinecke-cipher-voynich-manuscript";
const kb =
  "https://www.kb.se/eng/the-codex-gigas/the-codex-gigas---devils-bible.html";
export const witnesses: Witness[] = [
  ...(additions.witnesses as Witness[]),
  {
    id: "voynich-ms-408",
    title: "Voynich Manuscript",
    workIds: [],
    recensionId: null,
    type: "Codex",
    inventoryNumber: "Beinecke MS 408",
    repository: "Beinecke Rare Book and Manuscript Library, Yale University",
    discoveryLocation: null,
    currentLocation: "Yale University",
    dateStart: null,
    dateEnd: null,
    dateNotes:
      "Yale discusses scientific evidence for fifteenth-century materials; dating the materials and interpreting the text are separate questions.",
    material: null,
    languages: [],
    scripts: ["Unidentified script"],
    condition: null,
    completeness: "Missing leaves; consult institutional foliation",
    provenance:
      "Acquired by Wilfrid Voynich in 1912; donated to Yale by H. P. Kraus in 1969.",
    digitizationUrl: yale,
    iiifManifest: null,
    rights:
      "Linked institutional record; image reproduction rights not yet assessed",
    sources: [yale],
    decipherment: "Undeciphered",
    evidence: "Securely attested",
    description:
      "Illustrated manuscript in an unidentified script. No accepted translation exists. Its illustrations do not establish a translation of the text.",
    access: "Public metadata",
  },
  {
    id: "codex-gigas",
    title: "Codex Gigas / Devil’s Bible",
    workIds: [],
    recensionId: null,
    type: "Manuscript compilation",
    inventoryNumber: null,
    repository: "National Library of Sweden",
    discoveryLocation: null,
    currentLocation: "National Library of Sweden",
    dateStart: null,
    dateEnd: null,
    dateNotes:
      "Medieval manuscript; detailed chronology awaiting catalog review",
    material: null,
    languages: [],
    scripts: [],
    condition: null,
    completeness: null,
    provenance: "See the National Library of Sweden's manuscript history.",
    digitizationUrl: kb,
    iiifManifest: null,
    rights:
      "Linked institutional record; image reproduction rights not yet assessed",
    sources: [kb],
    decipherment: "Not assessed",
    evidence: "Securely attested",
    description:
      "A medieval manuscript compilation, not an independent scripture. The institutional description identifies its full-page Devil portrait; the nickname does not establish supernatural authorship.",
    access: "Public metadata",
  },
];
export const museumArtifacts: MuseumArtifact[] = artifacts
  .map<MuseumArtifact>((a) => ({
    id: a.id,
    title: a.title,
    witnessId: null,
    inventoryNumber: a.institution.split(" · ")[1] ?? null,
    institution: a.institution.split(" · ")[0],
    sourceUrl: a.sourceUrl,
    description: a.caption,
  }))
  .concat(additions.artifacts as MuseumArtifact[]);
export const archiveImages: ArchiveImage[] = artifacts
  .map<ArchiveImage>((a) => ({
    id: a.id,
    artifactId: a.id,
    witnessId: null,
    workIds: [],
    title: a.title,
    institution: a.institution,
    imageUrl: a.imageUrl,
    thumbnail: a.imageUrl,
    iiifService: null,
    sourceUrl: a.sourceUrl,
    rights: a.license,
    attribution: `${a.title} · ${a.institution} · ${a.creator} · ${a.license}`,
    publicDomain: true,
    caption: a.caption,
  }))
  .concat(additions.images as ArchiveImage[]);
export function mayTranslate(record: {
  decipherment: Decipherment;
  coverage?: CoverageStatus;
  access: string;
}) {
  return (
    record.access !== "Restricted" &&
    !["Undeciphered", "Partially deciphered", "Disputed decipherment"].includes(
      record.decipherment,
    ) &&
    !["Lost", "Hypothetical", "Restricted"].includes(record.coverage ?? "")
  );
}
export function validateImage(image: ArchiveImage) {
  if (
    !image.rights.trim() ||
    !image.attribution.trim() ||
    !/^https:\/\//.test(image.sourceUrl) ||
    !/^https:\/\//.test(image.imageUrl)
  )
    throw new Error("Image requires HTTPS provenance, rights, and attribution");
}
