import { texts, traditions, editions } from "./catalog";
import { witnesses, museumArtifacts, archiveImages } from "./archive";
import { hasCoordinates, type ExplorationRecord } from "./exploration";

const workById = new Map(texts.map((t) => [t.id, t]));
const traditionsForWorks = (ids: string[]) => [
  ...new Set(ids.flatMap((id) => workById.get(id)?.traditionId ?? [])),
];

export const explorationRecords: ExplorationRecord[] = [
  ...texts.map((t) => ({
    id: `work:${t.id}`,
    kind: "work" as const,
    title: t.title,
    href: `/texts/${t.id}`,
    traditionIds: [t.traditionId],
    region: t.region,
    startDate: t.startDate,
    endDate: t.endDate,
    dateNotes: t.dateConfidence,
    lat: t.lat,
    lng: t.lng,
    locationType: "Work origin" as const,
    precision: hasCoordinates(t)
      ? ("Approximate editorial anchor" as const)
      : ("Coordinates unavailable" as const),
    context: t.historicalContext,
    sources: t.metadataSources,
    fullText: editions.some((e) => e.textId === t.id),
    images: archiveImages.some((i) => i.workIds.includes(t.id)),
  })),
  ...witnesses.map((w) => ({
    id: `witness:${w.id}`,
    kind: "witness" as const,
    title: w.title,
    href: `/witnesses/${w.id}`,
    traditionIds: traditionsForWorks(w.workIds),
    region: w.currentLocation,
    startDate: w.dateStart,
    endDate: w.dateEnd,
    dateNotes: w.dateNotes,
    lat: null,
    lng: null,
    locationType: "Repository location" as const,
    precision: "Coordinates unavailable" as const,
    context: `${w.description} Repository: ${w.repository}. Find/discovery context: ${w.discoveryLocation ?? "Unavailable"}. These are distinct locations; no coordinates are inferred from their names.`,
    sources: w.sources,
    fullText: false,
    images: archiveImages.some((i) => i.witnessId === w.id),
  })),
  ...museumArtifacts.map((a) => ({
    id: `artifact:${a.id}`,
    kind: "artifact" as const,
    title: a.title,
    href: `/artifacts/${a.id}`,
    traditionIds: traditionsForWorks(
      archiveImages
        .filter((i) => i.artifactId === a.id)
        .flatMap((i) => i.workIds),
    ),
    region: a.institution,
    startDate: null,
    endDate: null,
    dateNotes:
      a.date ?? "No normalized artifact date range; consult the object source.",
    lat: null,
    lng: null,
    locationType: "Repository location" as const,
    precision: "Coordinates unavailable" as const,
    context: a.description,
    sources: [a.sourceUrl],
    fullText: false,
    images: archiveImages.some((i) => i.artifactId === a.id),
  })),
  ...traditions.map((t) => ({
    id: `tradition:${t.id}`,
    kind: "tradition" as const,
    title: t.name,
    href: `/traditions/${t.id}`,
    traditionIds: [t.id],
    region: t.region,
    startDate: null,
    endDate: null,
    dateNotes: "No reviewed tradition date interval.",
    lat: null,
    lng: null,
    locationType: "Catalog region" as const,
    precision: "Coordinates unavailable" as const,
    context: `${t.description} Navigation group coordinates have not been reviewed as historical tradition geography and are not plotted.`,
    sources: [
      "docs/product-spec.md, section 9 (catalog taxonomy, not geographic evidence)",
    ],
    fullText: false,
    images: false,
  })),
];
