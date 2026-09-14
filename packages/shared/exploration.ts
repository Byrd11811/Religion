import type { TextRecord } from "./types";

export const earliestAtlasYear = -5000;
export const currentAtlasYear = () => new Date().getUTCFullYear();
export function hasCoordinates(record: {
  lat: number | null;
  lng: number | null;
}): boolean {
  return (
    record.lat !== null &&
    record.lng !== null &&
    Number.isFinite(record.lat) &&
    Number.isFinite(record.lng) &&
    Math.abs(record.lat) <= 90 &&
    Math.abs(record.lng) <= 180
  );
}
export function mapWorkScope(
  works: TextRecord[],
  year: number,
  traditionId = "",
  includeUndated = true,
) {
  const scoped = works.filter(
    (w) => !traditionId || w.traditionId === traditionId,
  );
  const inPeriod = scoped.filter((w) =>
    w.startDate === null ? includeUndated : w.startDate <= year,
  );
  return {
    scoped,
    inPeriod,
    mapped: inPeriod.filter(hasCoordinates),
    unlocated: inPeriod.filter((w) => !hasCoordinates(w)),
    undated: scoped.filter((w) => w.startDate === null),
  };
}

// Astronomical zero is not a selectable historical year. -1 BCE is followed by 1 CE.
const ordinal = (year: number) => (year > 0 ? year - 1 : year);
export function timelinePosition(
  year: number,
  endYear: number,
  startYear = earliestAtlasYear,
) {
  if (
    !Number.isFinite(year) ||
    year === 0 ||
    !Number.isFinite(endYear) ||
    ordinal(endYear) <= ordinal(startYear)
  )
    throw new Error("Invalid timeline year/range");
  return Math.max(
    0,
    Math.min(
      100,
      ((ordinal(year) - ordinal(startYear)) /
        (ordinal(endYear) - ordinal(startYear))) *
        100,
    ),
  );
}
export function timelineTicks(endYear: number) {
  return [earliestAtlasYear, -3000, -1000, 1, 1000, endYear].filter(
    (v, i, values) => values.indexOf(v) === i && v <= endYear,
  );
}
export function selectedHistoricalYear(value: string, previousYear = -1) {
  const year = Number(value);
  return year === 0 ? (previousYear > 0 ? -1 : 1) : year;
}

export interface ExplorationRecord {
  id: string;
  kind: "work" | "witness" | "artifact" | "tradition";
  title: string;
  href: string;
  traditionIds: string[];
  region: string;
  startDate: number | null;
  endDate: number | null;
  dateNotes: string;
  lat: number | null;
  lng: number | null;
  locationType: "Work origin" | "Repository location" | "Catalog region";
  precision: "Approximate editorial anchor" | "Coordinates unavailable";
  context: string;
  sources: string[];
  fullText: boolean;
  images: boolean;
}
export interface ExplorationFilters {
  kind: ExplorationRecord["kind"] | "all";
  year: number;
  traditionId: string;
  region: string;
  includeUndated: boolean;
  fullText: boolean;
  images: boolean;
  geography: "all" | "approximate" | "unlocated";
}
export function explorationScope(
  records: ExplorationRecord[],
  filters: ExplorationFilters,
) {
  const scoped = records.filter(
    (r) =>
      (filters.kind === "all" || r.kind === filters.kind) &&
      (!filters.traditionId || r.traditionIds.includes(filters.traditionId)) &&
      (!filters.region || r.region === filters.region) &&
      (!filters.fullText || r.fullText) &&
      (!filters.images || r.images) &&
      (filters.geography === "all" ||
        (filters.geography === "approximate"
          ? hasCoordinates(r)
          : !hasCoordinates(r))),
  );
  const undated = scoped.filter((r) => r.startDate === null);
  const dated = scoped
    .filter((r) => r.startDate !== null && r.startDate <= filters.year)
    .sort((a, b) => a.startDate! - b.startDate! || a.id.localeCompare(b.id));
  const inPeriod = [...dated, ...(filters.includeUndated ? undated : [])];
  return {
    scoped,
    dated,
    undated,
    inPeriod,
    mapped: inPeriod.filter(hasCoordinates),
    unlocated: inPeriod.filter((r) => !hasCoordinates(r)),
    afterYear: scoped.filter(
      (r) => r.startDate !== null && r.startDate > filters.year,
    ),
  };
}
export function groupCoordinates(records: ExplorationRecord[]) {
  const groups = new Map<
    string,
    { lat: number; lng: number; records: ExplorationRecord[] }
  >();
  for (const record of records) {
    if (!hasCoordinates(record)) continue;
    const key = `${record.lat},${record.lng}`;
    if (!groups.has(key))
      groups.set(key, { lat: record.lat!, lng: record.lng!, records: [] });
    groups.get(key)!.records.push(record);
  }
  return [...groups.values()];
}
