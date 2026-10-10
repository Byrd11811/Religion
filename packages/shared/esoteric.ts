import data from "@/data/seed/esoteric-literature.json";
import { texts } from "./catalog";
import { witnesses } from "./archive";

export const esotericPolicy = data.policy;
export const esotericClassifications = data.classifications;
export const esotericPracticeVocabulary = data.practiceVocabulary;
export const ritualPractices = data.ritualPractices;
export const necromancyRecords = data.necromancy;
export const sacrificeEvidence = data.sacrificeEvidence;
export const esotericOrganizations = data.organizations;
export const esotericWorks = texts.filter(
  (work) =>
    work.subcollection === "Occult / esoteric" ||
    work.subcollection === "Religious literature",
);
export const esotericWitnesses = witnesses.filter((witness) =>
  witness.workIds.some((id) => esotericWorks.some((work) => work.id === id)),
);

const unique = (rows: { id: string }[], label: string) => {
  const ids = new Set(rows.map((row) => row.id));
  if (ids.size !== rows.length || ids.has(""))
    throw new Error(`${label} requires unique nonempty IDs`);
};
const requireHttps = (url: string, label: string) => {
  if (!url.startsWith("https://"))
    throw new Error(`${label} requires an HTTPS source URL: ${url}`);
};
unique(ritualPractices, "Ritual practices");
unique(necromancyRecords, "Necromancy records");
unique(sacrificeEvidence, "Sacrifice evidence");
unique(esotericOrganizations, "Organizations");
for (const term of esotericPracticeVocabulary)
  if (
    !ritualPractices.some((practice) =>
      practice.practiceType.toLowerCase().includes(term.toLowerCase()),
    )
  )
    throw new Error(`Practice vocabulary lacks a source record for ${term}`);
const sacrificeClassifications = [
  "ARCHAEOLOGICALLY SUPPORTED RITUAL KILLING",
  "TEXTUALLY DOCUMENTED PRACTICE",
  "DOCUMENTED BUT INTERPRETATION DISPUTED",
  "HOSTILE OUTSIDER ACCUSATION",
  "RELIGIOUS POLEMIC",
  "COLONIAL ACCOUNT",
  "LATER LEGEND",
  "MODERN CLAIM",
  "UNVERIFIED CONSPIRACY CLAIM",
] as const;
if (
  sacrificeEvidence.length !== sacrificeClassifications.length ||
  sacrificeClassifications.some(
    (classification) =>
      !sacrificeEvidence.some((row) => row.classification === classification),
  )
)
  throw new Error("Sacrifice evidence must represent each required class once");
for (const record of necromancyRecords)
  if (!ritualPractices.some((practice) => practice.id === record.practiceId))
    throw new Error(`Orphan necromancy practice ${record.id}`);
for (const rows of [ritualPractices, sacrificeEvidence])
  for (const row of rows)
    if (row.workIds.some((id) => !texts.some((work) => work.id === id)))
      throw new Error(`Orphan Phase 12 work association ${row.id}`);
for (const work of esotericWorks) {
  if (!work.sourceUrl)
    throw new Error(`Work ${work.id} requires a reviewed source URL`);
  requireHttps(work.sourceUrl, `Work ${work.id}`);
  for (const url of work.metadataSources ?? [])
    requireHttps(url, `Work ${work.id}`);
}
for (const practice of ritualPractices)
  for (const record of practice.sources)
    requireHttps(record.url, `Practice ${practice.id}`);
for (const record of necromancyRecords)
  for (const url of record.sourceUrls)
    requireHttps(url, `Necromancy record ${record.id}`);
for (const record of sacrificeEvidence)
  for (const url of record.sourceUrls)
    requireHttps(url, `Sacrifice evidence ${record.id}`);
for (const organization of esotericOrganizations)
  for (const record of organization.sources)
    requireHttps(record.url, `Organization ${organization.id}`);

