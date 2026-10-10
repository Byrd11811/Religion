import { hasCoordinates, mapWorkScope } from "../shared/exploration";
import type {
  TextRecord,
  Edition,
  Passage,
  Tradition,
  Relationship,
} from "../shared/types";
import type { Witness, MuseumArtifact, ArchiveImage } from "../shared/archive";

export interface CoverageInput {
  texts: TextRecord[];
  traditions: Tradition[];
  editions: Edition[];
  passages: Passage[];
  witnesses: Witness[];
  artifacts: MuseumArtifact[];
  images: ArchiveImage[];
  relationships: Relationship[];
  additionalCollections?: Record<string, { id: string }[]>;
}
export interface Metric {
  id: string;
  label: string;
  seeded: number;
  persisted: number | null;
  reviewed: number | null;
  exposed: number | null;
  tested: number | null;
  complete: false;
  rule: string;
  source: string;
}
export function uniqueIds(records: { id: string }[], label: string) {
  const ids = new Set<string>();
  for (const row of records) {
    if (!row.id || ids.has(row.id))
      throw new Error(`${label}: missing or duplicate ID ${row.id}`);
    ids.add(row.id);
  }
  return ids;
}

// These are absent normalized datasets, not zero occurrences of a word in a text.
// An unknown deployment database is never inferred to be empty from these facts.
export const absentDatasets = [
  ["subtraditions", "Subtraditions"],
  ["recensions", "Recensions / textual families"],
  ["canonMemberships", "Community-specific canon memberships"],
  ["evidenceRecords", "Structured evidence records"],
  ["modernProfiles", "Modern religion and movement profiles"],
  ["originClaims", "Modern origin-claim chronology records"],
  ["culturalProtocols", "Cultural protocols"],
  ["suppressionEvents", "Sourced suppression events"],
  ["originalTextWorks", "Works with original-language transcription"],
  ["transliterationWorks", "Works with transliteration"],
  ["bibliographyWorks", "Works with reviewed scholarly bibliography"],
  ["bibliographyEntries", "Reviewed bibliography entries"],
  ["polities", "Historical polity records"],
  ["territorialSnapshots", "Territorial snapshots"],
  ["conflicts", "Conflict records"],
  ["geocodedConflicts", "Geocoded conflict events"],
  ["politicalBorders", "Political-border layers"],
  ["religiousInfluence", "Religious-influence layers"],
  ["policyTransitions", "Religious-policy transitions"],
  ["persecutionCoercion", "Persecution/coercion events"],
  ["forcedConversions", "Documented forced-conversion events"],
  ["migrationExileRoutes", "Migration/exile routes"],
  ["missionaryRoutes", "Missionary routes"],
  ["siteDestruction", "Sacred-site destruction events"],
  ["siteReuse", "Sacred-site reuse events"],
  ["conflictMapPairs", "Before/after conflict map pairs"],
  ["historicalMapCases", "Curated historical map case studies"],
  ["ritualPractices", "Ritual-practice records"],
  ["necromancy", "Necromancy records"],
  ["spiritEntities", "Demon/spirit/entity records"],
  ["entityAliases", "Source-specific entity aliases"],
  ["organizations", "Organization records"],
  ["memberships", "Organization memberships"],
  ["membershipEvidence", "Membership-evidence records"],
  ["sacrificeEvidence", "Sacrifice-evidence records"],
  ["artworks", "First-class artwork records"],
  ["architecture", "Architectural records"],
  ["symbols", "Symbol records"],
  ["symbolInterpretations", "Symbol-interpretation records"],
  ["researchQueue", "Unresolved research-queue records"],
] as const;

export function measureCoverage(
  input: CoverageInput,
  throughYear: number,
): Metric[] {
  if (!Number.isInteger(throughYear))
    throw new Error("A whole through-year is required");
  const workIds = uniqueIds(input.texts, "works");
  uniqueIds(input.traditions, "traditions");
  const editionIds = uniqueIds(input.editions, "editions");
  uniqueIds(input.passages, "passages");
  const witnessIds = uniqueIds(input.witnesses, "witnesses");
  const artifactIds = uniqueIds(input.artifacts, "artifacts");
  uniqueIds(input.images, "images");
  uniqueIds(input.relationships, "relationships");
  for (const collection of [
    "originalTextWorks",
    "transliterationWorks",
    "bibliographyWorks",
  ]) {
    for (const row of input.additionalCollections?.[collection] ?? []) {
      if (!workIds.has(row.id))
        throw new Error(`Orphan ${collection} association ${row.id}`);
    }
  }
  const editionsById = new Map(input.editions.map((e) => [e.id, e]));
  const populated = new Set<string>();
  for (const e of input.editions) {
    if (!workIds.has(e.textId)) throw new Error(`Orphan edition ${e.id}`);
  }
  for (const p of input.passages) {
    if (
      !workIds.has(p.textId) ||
      !editionIds.has(p.editionId) ||
      editionsById.get(p.editionId)?.textId !== p.textId
    )
      throw new Error(`Orphan or mismatched passage ${p.id}`);
    if (p.content.trim()) populated.add(p.editionId);
  }
  for (const w of input.witnesses) {
    if (w.workIds.some((id) => !workIds.has(id)))
      throw new Error(`Orphan witness association ${w.id}`);
  }
  for (const a of input.artifacts) {
    if (a.witnessId && !witnessIds.has(a.witnessId))
      throw new Error(`Orphan artifact ${a.id}`);
  }
  for (const i of input.images) {
    if (
      !artifactIds.has(i.artifactId) ||
      (i.witnessId && !witnessIds.has(i.witnessId)) ||
      i.workIds.some((id) => !workIds.has(id))
    )
      throw new Error(`Orphan image ${i.id}`);
  }
  for (const r of input.relationships) {
    if (!workIds.has(r.source) || !workIds.has(r.target))
      throw new Error(`Orphan relationship ${r.id}`);
  }
  const available = input.editions.filter(
    (e) => populated.has(e.id) && e.sourceUrl && e.license && e.sha256,
  );
  const searchable = new Set(available.map((e) => e.textId));
  const complete = new Set(
    available.filter((e) => e.complete).map((e) => e.textId),
  );
  const withEdition = new Set(input.editions.map((e) => e.textId));
  const coords = input.texts.filter(hasCoordinates);
  const dated = input.texts.filter((t) => t.startDate !== null);
  const result: Metric[] = [];
  const add = (
    id: string,
    label: string,
    seeded: number,
    rule: string,
    source: string,
    exposed: number | null = null,
  ) =>
    result.push({
      id,
      label,
      seeded,
      persisted: null,
      reviewed: null,
      exposed,
      tested: null,
      complete: false,
      rule,
      source,
    });
  add(
    "works",
    "Catalog/work records",
    workIds.size,
    "Distinct work IDs; legacy texts and derived works are the same works, not additive.",
    "data/seed/texts.json + collection additions",
  );
  add(
    "traditions",
    "Broad tradition groupings",
    input.traditions.length,
    "Distinct navigation grouping IDs; not reviewed community taxonomy.",
    "data/seed/traditions.json",
  );
  add(
    "editions",
    "Source editions",
    input.editions.length,
    "Distinct edition IDs.",
    "data/seed/*-editions.json",
  );
  add(
    "searchableWorks",
    "Searchable edition-backed works",
    searchable.size,
    "Distinct works with nonempty passages and edition source, license and hash metadata; not certification of primary content or license law.",
    "data/seed/*-editions.json + data/seed/*-passages.json",
  );
  add(
    "completeEditionWorks",
    "Complete named-work/edition coverage",
    complete.size,
    "Distinct populated works with edition complete flag; historical study vs named work remains source-specific.",
    "data/seed/*-editions.json",
  );
  add(
    "metadataOnly",
    "Works without source editions",
    input.texts.filter((t) => !withEdition.has(t.id)).length,
    "No edition association, regardless of decorative metadata.",
    "data/seed/texts.json + collection additions + data/seed/*-editions.json",
  );
  add(
    "passages",
    "Edition segments",
    input.passages.length,
    "Distinct segment IDs; not all segments are primary text.",
    "data/seed/*-passages.json",
  );
  for (const [id, label, type] of [
    [
      "primaryPassages",
      "Explicitly classified primary segments",
      "Primary text",
    ],
    [
      "editorialPassages",
      "Explicitly classified editorial segments",
      "editorial",
    ],
  ]) {
    const editorial = new Set([
      "Translator note",
      "Editorial introduction",
      "Scholarly commentary",
      "Footnote",
      "Appendix",
    ]);
    const count = input.passages.filter((p) => {
      const c = (p as Passage & { contentType?: string }).contentType;
      return type === "editorial" ? editorial.has(c ?? "") : c === type;
    }).length;
    add(
      id,
      label,
      count,
      "Only explicit contentType labels count; edition wording does not establish primary status.",
      "data/seed/*-passages.json",
    );
  }
  const classified =
    result.find((m) => m.id === "primaryPassages")!.seeded +
    result.find((m) => m.id === "editorialPassages")!.seeded;
  add(
    "unclassifiedPassages",
    "Unclassified/unknown segments",
    input.passages.length - classified,
    "Segments not explicitly labeled primary or editorial.",
    "data/seed/*-passages.json",
  );
  add(
    "witnesses",
    "Physical witnesses",
    input.witnesses.length,
    "Distinct imported and starter witness IDs, independent of works.",
    "packages/shared/archive.ts + data/seed/archive-additions.json",
  );
  add(
    "artifacts",
    "Museum artifacts",
    input.artifacts.length,
    "Distinct physical object IDs; not additional works or first-class artwork catalog coverage.",
    "packages/shared/archive.ts + data/seed/archive-additions.json",
  );
  add(
    "images",
    "Archive image references",
    input.images.length,
    "Distinct image IDs; externally hosted references, not downloaded binaries or current URL health certification.",
    "packages/shared/archive.ts + data/seed/archive-additions.json",
  );
  add(
    "rightsAttributedImages",
    "Images with source/rights/attribution",
    input.images.filter(
      (i) => i.sourceUrl && i.rights && i.attribution && i.publicDomain,
    ).length,
    "Recorded public-domain assertion and attribution; not fresh legal review.",
    "packages/shared/archive.ts + data/seed/archive-additions.json",
  );
  add(
    "relationships",
    "Curated relationship records",
    input.relationships.length,
    "Distinct explicit edges; do not infer relationships from similarity.",
    "data/seed/relationships.json",
  );
  add(
    "datedWorks",
    "Works with start dates",
    dated.length,
    "Non-null start date; includes provisional dates.",
    "data/seed/texts.json",
  );
  add(
    "undatedWorks",
    "Works without start dates",
    input.texts.length - dated.length,
    "Null start date.",
    "data/seed/texts.json",
  );
  add(
    "coordinateWorks",
    "Works with coordinates",
    coords.length,
    "Finite latitude and longitude; presence does not establish geographic precision.",
    "data/seed/texts.json",
  );
  add(
    "unlocatedWorks",
    "Works without coordinates",
    input.texts.length - coords.length,
    "Missing either coordinate.",
    "data/seed/texts.json",
  );
  const mapped = mapWorkScope(input.texts, throughYear).mapped.length;
  add(
    "mappedWorks",
    `Map-eligible works through ${throughYear}`,
    mapped,
    "Shared map predicate includes undated coordinate-bearing records by default, all traditions; unknown dates are not placed in time.",
    "packages/shared/exploration.ts + data/seed/texts.json",
    mapped,
  );
  add(
    "timelineWorks",
    `Timeline-eligible works through ${throughYear}`,
    dated.filter((t) => t.startDate! <= throughYear).length,
    "Current dated-through-year predicate, all traditions.",
    "packages/shared/exploration.ts + data/seed/texts.json",
  );
  add(
    "languageMetadataWorks",
    "Works with language metadata",
    input.texts.filter((t) => t.languages.length).length,
    "Language labels only, not original-language transcriptions.",
    "data/seed/texts.json",
  );
  for (const [id, label] of absentDatasets)
    add(
      id,
      label,
      uniqueIds(input.additionalCollections?.[id] ?? [], id).size,
      "Distinct IDs in the matching named collection of the reviewed seed registry; absent collections have zero records. Text mentions, schema tables and generic metadata do not count. Re-evaluate adapters whenever intake changes.",
      "docs/phase-0-model-evaluation.md",
    );
  return result;
}
