import textsData from "@/data/seed/texts.json";
import traditionsData from "@/data/seed/traditions.json";
import editionsData from "@/data/seed/editions.json";
import relationshipsData from "@/data/seed/relationships.json";
import imagesData from "@/data/seed/images.json";
import egyptAdditions from "@/data/seed/egypt-additions.json";
import egyptEditions from "@/data/seed/egypt-editions.json";
import mesopotamiaAdditions from "@/data/seed/mesopotamia-additions.json";
import mesopotamiaEditions from "@/data/seed/mesopotamia-editions.json";
import chinaAdditions from "@/data/seed/china-additions.json";
import chinaEditions from "@/data/seed/china-editions.json";
import hornAdditions from "@/data/seed/horn-additions.json";
import indigenousAdditions from "@/data/seed/indigenous-additions.json";
import regionalCoverage from "@/data/seed/regional-coverage.json";
import manuscriptExpansion from "@/data/seed/manuscript-expansion.json";
import type {
  TextRecord,
  Tradition,
  Edition,
  Relationship,
  Artifact,
} from "./types";
const egyptOverrides = new Map(
  (egyptAdditions.overrides as (Partial<TextRecord> & { id: string })[]).map(
    (record) => [record.id, record],
  ),
);
const mesopotamiaOverrides = new Map(
  (
    mesopotamiaAdditions.overrides as (Partial<TextRecord> & { id: string })[]
  ).map((record) => [record.id, record]),
);
const chinaOverrides = new Map(
  (chinaAdditions.records as TextRecord[]).map((record) => [record.id, record]),
);
const hornOverrides = new Map(
  (hornAdditions.overrides as (Partial<TextRecord> & { id: string })[]).map(
    (record) => [record.id, record],
  ),
);
const regionalOverrides = new Map(
  (regionalCoverage.overrides as (Partial<TextRecord> & { id: string })[]).map(
    (record) => [record.id, record],
  ),
);
for (const id of egyptOverrides.keys()) {
  if (mesopotamiaOverrides.has(id))
    throw new Error(`Catalog override collision for ${id}`);
}
export const texts = [
  ...(textsData as TextRecord[]).map((record) => ({
    ...record,
    ...(egyptOverrides.get(record.id) ?? {}),
    ...(mesopotamiaOverrides.get(record.id) ?? {}),
    ...(chinaOverrides.get(record.id) ?? {}),
    ...(hornOverrides.get(record.id) ?? {}),
    ...(regionalOverrides.get(record.id) ?? {}),
  })),
  ...(egyptAdditions.records as TextRecord[]),
  ...(mesopotamiaAdditions.records as TextRecord[]),
  ...(chinaAdditions.records as TextRecord[]).filter(
    (record) => !(textsData as TextRecord[]).some((item) => item.id === record.id),
  ),
  ...(hornAdditions.records as TextRecord[]),
  ...(indigenousAdditions.records as TextRecord[]),
  ...(regionalCoverage.records as TextRecord[]),
  ...(manuscriptExpansion.workRecords as TextRecord[]),
];
export const traditions = traditionsData as Tradition[];
export const editions = [
  ...(editionsData as Edition[]),
  ...(egyptEditions as Edition[]),
  ...(mesopotamiaEditions as Edition[]),
  ...(chinaEditions as Edition[]),
];
export const relationships = relationshipsData as Relationship[];
export const artifacts = imagesData as Artifact[];
export function dateLabel(start: number | null, end?: number | null) {
  if (start === null) return "Date unreviewed";
  const fmt = (n: number) => `${Math.abs(n)} ${n < 0 ? "BCE" : "CE"}`;
  return end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}
