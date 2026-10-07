import textsData from "@/data/seed/texts.json";
import traditionsData from "@/data/seed/traditions.json";
import editionsData from "@/data/seed/editions.json";
import relationshipsData from "@/data/seed/relationships.json";
import imagesData from "@/data/seed/images.json";
import egyptAdditions from "@/data/seed/egypt-additions.json";
import egyptEditions from "@/data/seed/egypt-editions.json";
import mesopotamiaAdditions from "@/data/seed/mesopotamia-additions.json";
import mesopotamiaEditions from "@/data/seed/mesopotamia-editions.json";
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
for (const id of egyptOverrides.keys()) {
  if (mesopotamiaOverrides.has(id))
    throw new Error(`Catalog override collision for ${id}`);
}
export const texts = [
  ...(textsData as TextRecord[]).map((record) => ({
    ...record,
    ...(egyptOverrides.get(record.id) ?? {}),
    ...(mesopotamiaOverrides.get(record.id) ?? {}),
  })),
  ...(egyptAdditions.records as TextRecord[]),
  ...(mesopotamiaAdditions.records as TextRecord[]),
];
export const traditions = traditionsData as Tradition[];
export const editions = [
  ...(editionsData as Edition[]),
  ...(egyptEditions as Edition[]),
  ...(mesopotamiaEditions as Edition[]),
];
export const relationships = relationshipsData as Relationship[];
export const artifacts = imagesData as Artifact[];
export function dateLabel(start: number | null, end?: number | null) {
  if (start === null) return "Date unreviewed";
  const fmt = (n: number) => `${Math.abs(n)} ${n < 0 ? "BCE" : "CE"}`;
  return end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}
