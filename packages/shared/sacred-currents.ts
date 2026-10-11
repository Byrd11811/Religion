import type {
  Confidence,
  RelationshipEvidenceLevel,
  RelationshipNodeType,
  RelationshipType,
} from "./types";

export type SacredCurrentsRecordKind =
  | "work"
  | "witness"
  | "artifact"
  | "tradition";
export type SacredCurrentsEvidenceState =
  | "documented"
  | "strong"
  | "qualified"
  | "provisional"
  | "unreviewed"
  | "unavailable";

export interface SacredCurrentsGeography {
  lat: number;
  lng: number;
  precision: "approximate-editorial-anchor";
  label: string;
  note: string;
}

export interface SacredCurrentsRecord {
  id: string;
  entityId: string;
  kind: SacredCurrentsRecordKind;
  title: string;
  href: string;
  traditionId: string | null;
  traditionName: string;
  traditionColor: string;
  region: string;
  startYear: number | null;
  endYear: number | null;
  dateLabel: string;
  dateNote: string;
  dateEvidence: SacredCurrentsEvidenceState;
  evidenceLabel: string;
  geography: SacredCurrentsGeography | null;
  sourceUrls: string[];
  sourceNotes: string[];
  description: string;
  relatedWorkIds: string[];
  hasImage: boolean;
  hasText: boolean;
}

export interface SacredCurrentsStream {
  id: string;
  traditionId: string;
  label: string;
  color: string;
  recordIds: string[];
  workCount: number;
  witnessCount: number;
  startYear: number;
  endYear: number;
}

export interface SacredCurrentsAnchor {
  id: string;
  lat: number;
  lng: number;
  label: string;
  recordIds: string[];
  datedRecordCount: number;
  undatedRecordCount: number;
  precision: "approximate-editorial-anchor";
  note: string;
}

export interface SacredCurrentsConnectionEndpoint {
  nodeId: string;
  nodeType: RelationshipNodeType;
  label: string;
  href: string | null;
  recordId: string | null;
}

export interface SacredCurrentsConnection {
  id: string;
  relationshipType: RelationshipType;
  evidenceLevel: RelationshipEvidenceLevel;
  confidence: Confidence;
  summary: string;
  source: SacredCurrentsConnectionEndpoint;
  target: SacredCurrentsConnectionEndpoint;
  citations: {
    id: string;
    label: string;
    url: string;
    locator?: string;
  }[];
  counterarguments: string[];
  geographicMeaning: "relationship-not-route";
  renderAsRoute: false;
  drawableBetweenAnchors: boolean;
}

export type SacredCurrentsLayerId =
  | "work-chronology"
  | "work-anchors"
  | "witness-chronology"
  | "witness-geography"
  | "artifact-catalog"
  | "tradition-catalog"
  | "evidence-connections"
  | "historical-borders"
  | "migration-routes"
  | "trade-routes"
  | "repository-paths";

export interface SacredCurrentsLayerCoverage {
  id: SacredCurrentsLayerId;
  label: string;
  status: "available" | "partial" | "unavailable";
  recordCount: number;
  totalCount: number;
  note: string;
}

export interface SacredCurrentsCoverage {
  totals: {
    works: number;
    datedWorks: number;
    mappedWorks: number;
    datedAndMappedWorks: number;
    witnesses: number;
    datedWitnesses: number;
    mappedWitnesses: number;
    artifacts: number;
    traditions: number;
    relationships: number;
    drawableRelationshipConnections: number;
  };
  layers: SacredCurrentsLayerCoverage[];
  limitations: string[];
}

export interface SacredCurrentsCatalog {
  records: SacredCurrentsRecord[];
  streams: SacredCurrentsStream[];
  anchors: SacredCurrentsAnchor[];
  connections: SacredCurrentsConnection[];
  changePointYears: number[];
  coverage: SacredCurrentsCoverage;
}

export interface SacredCurrentsFilters {
  query?: string;
  kinds?: SacredCurrentsRecordKind[];
  traditionIds?: string[];
  regions?: string[];
  evidenceStates?: SacredCurrentsEvidenceState[];
  year?: number;
  includeUndated?: boolean;
  geography?: "all" | "mapped" | "unlocated";
  mappedOnly?: boolean;
  withImagesOnly?: boolean;
  withTextOnly?: boolean;
}

export interface SacredCurrentsScene {
  year: number | null;
  yearLabel: string;
  records: SacredCurrentsRecord[];
  streams: SacredCurrentsStream[];
  anchors: SacredCurrentsAnchor[];
  connections: SacredCurrentsConnection[];
  counts: {
    records: number;
    dated: number;
    undated: number;
    mapped: number;
    connections: number;
  };
}

const https = (value: string) => value.startsWith("https://");

export const earliestSacredCurrentsYear = -5000;

/** Historical years omit a year zero: 1 BCE is followed by 1 CE. */
export function sacredYearOrdinal(year: number) {
  if (!Number.isInteger(year) || year === 0)
    throw new Error(
      "A Sacred Currents year must be an integer and cannot be zero",
    );
  return year > 0 ? year - 1 : year;
}

export function formatSacredYear(year: number | null) {
  if (year === null) return "Date unavailable";
  if (!Number.isInteger(year) || year === 0)
    throw new Error(
      "A Sacred Currents year must be an integer and cannot be zero",
    );
  return `${Math.abs(year).toLocaleString("en-US")} ${year < 0 ? "BCE" : "CE"}`;
}

export function formatSacredRange(
  startYear: number | null,
  endYear: number | null,
) {
  if (startYear === null) return "Date unavailable";
  if (endYear === null || endYear === startYear)
    return formatSacredYear(startYear);
  return `${formatSacredYear(startYear)}–${formatSacredYear(endYear)}`;
}

export function dateEvidenceStateFromNote(
  startYear: number | null,
  dateNote: string,
): SacredCurrentsEvidenceState {
  if (startYear === null) return "unavailable";
  const note = dateNote.trim();
  if (!note) return "unreviewed";
  if (
    /editorial estimate|requires scholarly review|claimed|approximate work chronology|consult the linked catalog or edition/iu.test(
      note,
    )
  )
    return "provisional";
  if (/\bdocumented\b/iu.test(note)) return "documented";
  return "qualified";
}

export function buildSacredCurrentsTimeYears(
  changePointYears: readonly number[],
  presentYear = new Date().getUTCFullYear(),
) {
  if (!Number.isInteger(presentYear) || presentYear <= 0)
    throw new Error("Sacred Currents present year must be a positive integer");
  const years = new Set<number>([earliestSacredCurrentsYear, presentYear]);
  for (const year of changePointYears) {
    if (!Number.isInteger(year) || year === 0)
      throw new Error(
        "Sacred Currents change points must be integers and cannot use year zero",
      );
    if (year >= earliestSacredCurrentsYear && year <= presentYear)
      years.add(year);
  }
  return [...years].sort((a, b) => sacredYearOrdinal(a) - sacredYearOrdinal(b));
}

export function buildChangePointYears(records: SacredCurrentsRecord[]) {
  const years = new Set<number>();
  for (const record of records) {
    if (record.startYear !== null) years.add(record.startYear);
    if (record.endYear !== null) years.add(record.endYear);
  }
  return [...years].sort((a, b) => sacredYearOrdinal(a) - sacredYearOrdinal(b));
}

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filterSacredCurrents(
  records: SacredCurrentsRecord[],
  filters: SacredCurrentsFilters = {},
) {
  const query = normalized(filters.query?.trim() ?? "");
  const terms = query.split(/\s+/u).filter(Boolean);
  return records.filter((record) => {
    if (filters.kinds?.length && !filters.kinds.includes(record.kind))
      return false;
    if (
      filters.traditionIds?.length &&
      (!record.traditionId ||
        !filters.traditionIds.includes(record.traditionId))
    )
      return false;
    if (filters.regions?.length && !filters.regions.includes(record.region))
      return false;
    if (
      filters.evidenceStates?.length &&
      !filters.evidenceStates.includes(record.dateEvidence)
    )
      return false;
    if (
      (filters.mappedOnly || filters.geography === "mapped") &&
      !record.geography
    )
      return false;
    if (filters.geography === "unlocated" && record.geography) return false;
    if (filters.withImagesOnly && !record.hasImage) return false;
    if (filters.withTextOnly && !record.hasText) return false;
    if (filters.year !== undefined) {
      if (!Number.isInteger(filters.year) || filters.year === 0)
        throw new Error("Sacred Currents filters cannot use year zero");
      if (record.startYear === null) {
        if (!(filters.includeUndated ?? false)) return false;
      } else if (
        sacredYearOrdinal(record.startYear) > sacredYearOrdinal(filters.year)
      ) {
        return false;
      }
    } else if (record.startYear === null && filters.includeUndated === false) {
      return false;
    }
    if (!terms.length) return true;
    const haystack = normalized(
      [
        record.title,
        record.traditionName,
        record.region,
        record.description,
        record.dateNote,
        record.evidenceLabel,
      ].join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });
}

function scopedStreams(
  streams: SacredCurrentsStream[],
  visibleRecordIds: Set<string>,
): SacredCurrentsStream[] {
  return streams
    .map((stream) => ({
      ...stream,
      recordIds: stream.recordIds.filter((id) => visibleRecordIds.has(id)),
    }))
    .filter((stream) => stream.recordIds.length > 0);
}

function scopedAnchors(
  anchors: SacredCurrentsAnchor[],
  visibleRecordIds: Set<string>,
  recordById: Map<string, SacredCurrentsRecord>,
): SacredCurrentsAnchor[] {
  return anchors
    .map((anchor) => {
      const recordIds = anchor.recordIds.filter((id) =>
        visibleRecordIds.has(id),
      );
      return {
        ...anchor,
        recordIds,
        datedRecordCount: recordIds.filter(
          (id) => recordById.get(id)?.startYear !== null,
        ).length,
        undatedRecordCount: recordIds.filter(
          (id) => recordById.get(id)?.startYear === null,
        ).length,
      };
    })
    .filter((anchor) => anchor.recordIds.length > 0);
}

export function buildSacredCurrentsScene(
  catalog: SacredCurrentsCatalog,
  filters: SacredCurrentsFilters = {},
): SacredCurrentsScene {
  const records = filterSacredCurrents(catalog.records, filters);
  const recordById = new Map(
    catalog.records.map((record) => [record.id, record]),
  );
  const visibleRecordIds = new Set(records.map((record) => record.id));
  const connections = catalog.connections.filter((connection) => {
    const source = connection.source.recordId;
    const target = connection.target.recordId;
    return (
      (source !== null && visibleRecordIds.has(source)) ||
      (target !== null && visibleRecordIds.has(target))
    );
  });
  return {
    year: filters.year ?? null,
    yearLabel:
      filters.year === undefined
        ? "All reviewed dates"
        : formatSacredYear(filters.year),
    records,
    streams: scopedStreams(catalog.streams, visibleRecordIds),
    anchors: scopedAnchors(catalog.anchors, visibleRecordIds, recordById),
    connections,
    counts: {
      records: records.length,
      dated: records.filter(({ startYear }) => startYear !== null).length,
      undated: records.filter(({ startYear }) => startYear === null).length,
      mapped: records.filter(({ geography }) => geography !== null).length,
      connections: connections.length,
    },
  };
}

export function validateSacredCurrentsCatalog(catalog: SacredCurrentsCatalog) {
  const recordIds = new Set<string>();
  for (const record of catalog.records) {
    if (recordIds.has(record.id))
      throw new Error(`Duplicate Sacred Currents record ${record.id}`);
    recordIds.add(record.id);
    if (record.startYear === 0 || record.endYear === 0)
      throw new Error(
        `Sacred Currents record ${record.id} uses historical year zero`,
      );
    if (record.sourceUrls.some((url) => !https(url)))
      throw new Error(
        `Sacred Currents record ${record.id} has a non-HTTPS source URL`,
      );
    if (
      record.geography &&
      (!Number.isFinite(record.geography.lat) ||
        !Number.isFinite(record.geography.lng) ||
        Math.abs(record.geography.lat) > 90 ||
        Math.abs(record.geography.lng) > 180)
    )
      throw new Error(
        `Sacred Currents record ${record.id} has invalid coordinates`,
      );
  }
  for (const stream of catalog.streams)
    if (stream.recordIds.some((id) => !recordIds.has(id)))
      throw new Error(
        `Sacred Currents stream ${stream.id} references an unknown record`,
      );
  for (const anchor of catalog.anchors)
    if (anchor.recordIds.some((id) => !recordIds.has(id)))
      throw new Error(
        `Sacred Currents anchor ${anchor.id} references an unknown record`,
      );
  const connectionIds = new Set<string>();
  for (const connection of catalog.connections) {
    if (connectionIds.has(connection.id))
      throw new Error(`Duplicate Sacred Currents connection ${connection.id}`);
    connectionIds.add(connection.id);
    if (
      !connection.citations.length ||
      connection.citations.some(({ url }) => !https(url))
    )
      throw new Error(
        `Sacred Currents connection ${connection.id} lacks HTTPS evidence`,
      );
    if (connection.renderAsRoute !== false)
      throw new Error(
        `Sacred Currents connection ${connection.id} cannot imply a route`,
      );
    for (const endpoint of [connection.source, connection.target])
      if (endpoint.recordId !== null && !recordIds.has(endpoint.recordId))
        throw new Error(
          `Sacred Currents connection ${connection.id} references an unknown record`,
        );
  }
  if (
    catalog.changePointYears.some((year, index, years) =>
      index
        ? sacredYearOrdinal(year) <= sacredYearOrdinal(years[index - 1])
        : false,
    )
  )
    throw new Error(
      "Sacred Currents change points must be unique and chronological",
    );
  return true;
}
