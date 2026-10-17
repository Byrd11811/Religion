import { historicalCaseStudies } from "./historical-geography";
import { ritualPractices, esotericOrganizations } from "./esoteric";
import { ontologyEntities, ontologySources } from "./ontology-entities";
import { relationshipNodes } from "./relationships";

export const researchKinds = [
  "event",
  "polity",
  "community",
  "site",
  "practice",
  "entity",
  "organization",
  "object",
] as const;
export type ResearchKind = (typeof researchKinds)[number];
export interface ResearchRecord {
  id: string;
  sourceId: string;
  kind: ResearchKind;
  title: string;
  subtitle: string;
  summary: string;
  evidence: string;
  sourceUrls: string[];
  related: string[];
  canonicalHref: string | null;
}

const sourceUrl = new Map(ontologySources.map((item) => [item.id, item.url]));
const records: ResearchRecord[] = [];
const featureKind = (layer: string, radius: number): ResearchKind =>
  layer === "political-control" ? "polity" : radius <= 1 ? "site" : "community";
for (const study of historicalCaseStudies) {
  const urls = study.sources.map(({ url }) => url);
  for (const state of study.states)
    records.push({
      id: `event-${state.id}`,
      sourceId: state.id,
      kind: "event",
      title: `${study.title}: ${state.label}`,
      subtitle: `${state.year < 0 ? `${Math.abs(state.year)} BCE` : `${state.year} CE`} · ${study.scope}`,
      summary: state.summary,
      evidence: `${state.sourceIds.length} case source${state.sourceIds.length === 1 ? "" : "s"}; independent historical state`,
      sourceUrls: state.sourceIds.map(
        (id) => study.sources.find((item) => item.id === id)!.url,
      ),
      related: state.featureIds.map((id) => {
        const feature = study.features.find((item) => item.id === id)!;
        return `${featureKind(feature.layer, feature.radius)}-${id}`;
      }),
      canonicalHref: "/map",
    });
  for (const feature of study.features) {
    const kind = featureKind(feature.layer, feature.radius);
    records.push({
      id: `${kind}-${feature.id}`,
      sourceId: feature.id,
      kind,
      title: feature.label,
      subtitle: `${feature.layer} · ${feature.boundaryType}`,
      summary: feature.summary,
      evidence: `${feature.confidence} confidence; ${feature.boundaryType} geographic representation`,
      sourceUrls: feature.sourceIds.map(
        (id) => study.sources.find((item) => item.id === id)!.url,
      ),
      related: study.states
        .filter((state) => state.featureIds.includes(feature.id))
        .map((state) => `event-${state.id}`),
      canonicalHref: "/map",
    });
  }
  if (
    !records.some(
      (item) => item.kind === "polity" && item.title.includes(study.title),
    )
  )
    records.push({
      id: `polity-${study.id}`,
      sourceId: study.id,
      kind: "polity",
      title: study.title,
      subtitle: study.scope,
      summary: study.caution,
      evidence: "Curated historical-case boundary",
      sourceUrls: urls,
      related: study.states.map((state) => `event-${state.id}`),
      canonicalHref: "/map",
    });
}
for (const practice of ritualPractices)
  records.push({
    id: `practice-${practice.id}`,
    sourceId: practice.id,
    kind: "practice",
    title: practice.title,
    subtitle: `${practice.practiceType} · ${practice.community}`,
    summary: practice.description,
    evidence: practice.evidenceSummary,
    sourceUrls: practice.sources.map(({ url }) => url),
    related: practice.workIds.map((id) => `work-${id}`),
    canonicalHref: "/library/esoteric",
  });
for (const entity of ontologyEntities)
  records.push({
    id: `entity-${entity.id}`,
    sourceId: entity.id,
    kind: "entity",
    title: entity.canonicalName,
    subtitle: `${entity.entityType} · ${entity.traditions.join(", ")}`,
    summary: entity.description,
    evidence: entity.earliestAttestation,
    sourceUrls: entity.sourceIds
      .map((id) => sourceUrl.get(id))
      .filter((url): url is string => Boolean(url)),
    related: [],
    canonicalHref: `/entities/${entity.id}`,
  });
for (const organization of esotericOrganizations)
  records.push({
    id: `organization-${organization.id}`,
    sourceId: organization.id,
    kind: "organization",
    title: organization.title,
    subtitle: organization.founding,
    summary: organization.context,
    evidence: `${organization.evidenceStatus}. ${organization.historicalBoundary}`,
    sourceUrls: organization.sources.map(({ url }) => url),
    related: [],
    canonicalHref: "/library/esoteric",
  });
for (const object of relationshipNodes.filter(
  ({ type }) => type === "artifact",
))
  records.push({
    id: `object-${object.id}`,
    sourceId: object.id,
    kind: "object",
    title: object.label,
    subtitle: object.subtitle,
    summary: object.description,
    evidence: "Institutional object facts precede interpretation",
    sourceUrls: object.sourceUrls,
    related: [],
    canonicalHref: object.href,
  });

export const researchRecords = records.sort(
  (a, b) => a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title),
);
export function researchRecord(id: string) {
  return researchRecords.find((item) => item.id === id) ?? null;
}
export function validateResearchRecords(items = researchRecords) {
  const ids = new Set(items.map(({ id }) => id));
  if (ids.size !== items.length)
    throw new Error("Research records require unique IDs");
  for (const kind of researchKinds)
    if (!items.some((item) => item.kind === kind))
      throw new Error(`Research views require ${kind} records`);
  for (const item of items)
    if (
      !item.sourceUrls.length ||
      item.sourceUrls.some((url) => !url.startsWith("https://"))
    )
      throw new Error(`${item.id} requires HTTPS provenance`);
  return true;
}
validateResearchRecords();
