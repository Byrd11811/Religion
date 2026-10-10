import data from "@/data/seed/modern-religions.json";
import { texts } from "./catalog";
import type { TextRecord, Tradition } from "./types";

export const modernEvidenceCategories = [
  "Official teaching",
  "Academic history",
  "Legal/government record",
  "Criticism",
  "Church response",
  "Former-member account",
  "Media report",
  "Unverified claim",
] as const;

export type ModernEvidenceCategory = (typeof modernEvidenceCategories)[number];

export interface ModernSource {
  label: string;
  url: string;
  perspective: string;
}

export interface ModernProfile {
  id: string;
  name: string;
  aliases: string[];
  originStart: number;
  originEnd: number;
  region: string;
  summary: string;
  classificationBoundary: string;
  centralAuthority: string;
  canonNote: string;
  workIds: string[];
  sources: ModernSource[];
  sensitiveNote?: string;
}

export interface ModernEvidenceRecord {
  id: string;
  subjectType: "tradition" | "work";
  subjectId: string;
  section:
    | "Official Teaching"
    | "Historical / Academic Analysis"
    | "Legal / Government Records"
    | "Criticism / Controversy"
    | "Church Responses";
  category: ModernEvidenceCategory;
  sourceType: string;
  perspective: string;
  status: string;
  summary: string;
  evidentiaryLimit: string;
  sourceTitle: string;
  publisher: string;
  publicationDate: string;
  sourceUrl: string;
  additionalSourceUrls?: string[];
  independenceGroup: string;
  derivedFromIds: string[];
  responseToIds: string[];
  jurisdiction?: string;
  docketReference?: string;
  decisionDate?: string;
  disposition?: string;
  rights: string;
}

export interface ModernBibliographyRecord {
  id: string;
  subjectId: string;
  title: string;
  author: string;
  published: string;
  perspective: string;
  sourceUrl: string;
  rights: string;
  scope: string;
}

export interface ModernOriginClaim {
  id: string;
  workId: string;
  documentedDate: string;
  claimedOrigin: string;
  datingExplanation: string;
  sourceUrl: string;
}

interface ModernReligionsData {
  policy: string;
  copyrightPolicy: string;
  traditions: Tradition[];
  profiles: ModernProfile[];
  overrides: TextRecord[];
  records: TextRecord[];
  evidenceRecords: ModernEvidenceRecord[];
  bibliographyEntries: ModernBibliographyRecord[];
  originClaims: ModernOriginClaim[];
}

export interface ModernWork extends TextRecord {
  sourceUrl: string;
}

const modernData = data as unknown as ModernReligionsData;

export const modernPolicy = modernData.policy;
export const modernCopyrightPolicy = modernData.copyrightPolicy;
export const modernProfiles = modernData.profiles;
export const modernEvidenceRecords = modernData.evidenceRecords;
export const modernBibliography = modernData.bibliographyEntries;
export const modernOriginClaims = modernData.originClaims;
export const modernWorks = texts.filter(
  (work) =>
    work.subcollection === "Modern religions and new religious movements",
) as ModernWork[];
export const scientologyWorks = modernWorks.filter(
  (work) => work.traditionId === "scientology",
);

export const requiredModernProfileIds = [
  "scientology",
  "bahai-faith-modern",
  "latter-day-saint-movement",
  "christian-science",
  "theosophy-modern",
  "anthroposophy",
  "modern-spiritualism",
  "cao-dai",
  "tenrikyo",
  "falun-gong",
  "rastafari",
  "nation-of-islam",
  "thelema",
  "modern-satanism",
  "luciferian-traditions",
  "new-thought",
  "new-age-movements",
  "ufo-religions",
] as const;

export const requiredScientologyWorkIds = [
  "dianetics-modern-science-mental-health",
  "dianetics-original-thesis",
  "dianetics-evolution-science",
  "science-of-survival",
  "self-analysis-hubbard",
  "handbook-for-preclears",
  "scientology-history-of-man",
  "scientology-8-80",
  "scientology-8-8008",
  "creation-of-human-ability",
  "scientology-fundamentals-thought",
  "problems-of-work",
  "scientology-new-slant-life",
  "phoenix-lectures",
  "creed-church-scientology",
  "auditors-code",
  "code-of-honor-scientology",
  "code-of-a-scientologist",
] as const;

const requiredOriginWorkIds = [
  "oahspe",
  "urantia-book",
  "a-course-in-miracles",
  "law-of-one-ra-material",
  "seth-material",
] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Modern religions data: ${message}`);
}

function requireUniqueIds(rows: { id: string }[], label: string) {
  const ids = rows.map((row) => row.id);
  assert(ids.every(Boolean), `${label} require nonempty IDs`);
  assert(new Set(ids).size === ids.length, `${label} require unique IDs`);
}

function requireExactIds(
  actual: readonly string[],
  expected: readonly string[],
  label: string,
) {
  const left = [...actual].sort();
  const right = [...expected].sort();
  assert(
    left.length === right.length &&
      left.every((value, index) => value === right[index]),
    `${label} must be exactly ${right.join(", ")}`,
  );
}

function requireHttps(url: string | null, label: string) {
  assert(
    typeof url === "string" && url.startsWith("https://"),
    `${label} requires an HTTPS source URL: ${String(url)}`,
  );
}

requireUniqueIds(modernProfiles, "Profiles");
requireUniqueIds(modernData.traditions, "Traditions");
requireUniqueIds(modernData.overrides, "Overrides");
requireUniqueIds(modernData.records, "Works");
requireUniqueIds(modernWorks, "Catalog modern works");
requireUniqueIds(modernEvidenceRecords, "Evidence records");
requireUniqueIds(modernBibliography, "Bibliography records");
requireUniqueIds(modernOriginClaims, "Origin claims");

requireExactIds(
  modernProfiles.map((profile) => profile.id),
  requiredModernProfileIds,
  "profile IDs",
);
requireExactIds(
  modernData.traditions.map((tradition) => tradition.id),
  requiredModernProfileIds,
  "tradition IDs",
);

const profileIds = new Set(modernProfiles.map((profile) => profile.id));
const workIds = new Set(texts.map((work) => work.id));
const modernSeedWorkIds = new Set(
  [...modernData.overrides, ...modernData.records].map((work) => work.id),
);
assert(
  modernSeedWorkIds.size ===
    modernData.overrides.length + modernData.records.length,
  "override and new-work IDs must not overlap",
);

for (const profile of modernProfiles) {
  assert(
    profile.originStart >= 1800 && profile.originEnd >= profile.originStart,
    `profile ${profile.id} requires a documented modern date range`,
  );
  assert(
    new Set(profile.workIds).size === profile.workIds.length,
    `profile ${profile.id} contains duplicate work references`,
  );
  for (const workId of profile.workIds)
    assert(workIds.has(workId), `profile ${profile.id} references ${workId}`);
  for (const source of profile.sources)
    requireHttps(source.url, `profile ${profile.id}`);
  assert(
    !/\bcults?\b/i.test(`${profile.summary} ${profile.classificationBoundary}`),
    `profile ${profile.id} uses an unqualified cult label`,
  );
}

for (const work of modernWorks) {
  assert(
    profileIds.has(work.traditionId),
    `work ${work.id} references unknown profile ${work.traditionId}`,
  );
  const profile = modernProfiles.find((item) => item.id === work.traditionId);
  assert(
    profile?.workIds.includes(work.id),
    `profile ${work.traditionId} does not enumerate work ${work.id}`,
  );
  requireHttps(work.sourceUrl, `work ${work.id}`);
  for (const url of work.metadataSources ?? [])
    requireHttps(url, `work ${work.id}`);

  const rights = work.copyright.toLowerCase();
  const sourceStatus = work.sourceStatus.toLowerCase();
  const hasProtectedEdition =
    sourceStatus.includes("copyrighted text not reproduced") ||
    (/(copyright|protected|permission-controlled|no open license)/.test(
      rights,
    ) &&
      !/(public-domain|public domain|open license|licensed edition)/.test(
        rights,
      ));
  assert(
    !hasProtectedEdition || work.editionId === null,
    `protected work ${work.id} cannot have a bundled edition`,
  );
  assert(
    !["B", "C"].includes(work.confidence),
    `work ${work.id} cannot claim reviewed confidence without a linked scholarly review`,
  );
}

const spiritualismProfile = modernProfiles.find(
  (profile) => profile.id === "modern-spiritualism",
);
assert(spiritualismProfile, "Modern Spiritualism profile is missing");
assert(
  spiritualismProfile.workIds.includes("modern-spiritualism-literature-guide") &&
    !spiritualismProfile.workIds.includes("spirits-book"),
  "Modern Spiritualism must not collapse Kardecist Spiritism into its own work inventory",
);

const scientologyIds = new Set(scientologyWorks.map((work) => work.id));
for (const id of requiredScientologyWorkIds)
  assert(scientologyIds.has(id), `required Scientology work ${id} is missing`);
const additionalHubbardWorks = scientologyWorks.filter(
  (work) =>
    !requiredScientologyWorkIds.includes(
      work.id as (typeof requiredScientologyWorkIds)[number],
    ) &&
    work.author === "L. Ron Hubbard" &&
    work.startDate !== null &&
    !work.category.startsWith("Collection guide"),
);
assert(
  additionalHubbardWorks.length >= 3,
  "at least three additional dated Hubbard works are required",
);
for (const work of scientologyWorks) {
  assert(
    work.editionId === null,
    `copyrighted Scientology work ${work.id} cannot have a bundled edition`,
  );
  assert(
    /copyright/i.test(work.copyright) &&
      /(metadata|collection guide)/i.test(work.sourceStatus),
    `Scientology work ${work.id} must remain copyright-safe metadata`,
  );
}

const bookOfMormon = texts.find((work) => work.id === "book-of-mormon");
assert(bookOfMormon, "Book of Mormon record is missing");
assert(
  bookOfMormon.editionId === "pg-17",
  "Book of Mormon must retain the reviewed pg-17 public-domain edition",
);

requireExactIds(
  [...new Set(modernEvidenceRecords.map((record) => record.category))],
  modernEvidenceCategories,
  "evidence categories",
);
const evidenceIds = new Set(modernEvidenceRecords.map((record) => record.id));
for (const record of modernEvidenceRecords) {
  requireHttps(record.sourceUrl, `evidence record ${record.id}`);
  for (const url of record.additionalSourceUrls ?? [])
    requireHttps(url, `evidence record ${record.id}`);
  if (record.subjectType === "tradition")
    assert(
      profileIds.has(record.subjectId),
      `evidence record ${record.id} references unknown tradition`,
    );
  else
    assert(
      workIds.has(record.subjectId),
      `evidence record ${record.id} references unknown work`,
    );
  for (const id of [...record.derivedFromIds, ...record.responseToIds])
    assert(
      evidenceIds.has(id),
      `evidence record ${record.id} references ${id}`,
    );

  const officialSource =
    record.category === "Official teaching" ||
    record.category === "Church response" ||
    record.sourceType.toLowerCase().startsWith("official");
  assert(
    !officialSource || record.independenceGroup.startsWith("official-"),
    `official evidence ${record.id} needs an official independence group`,
  );
  if (record.category === "Church response") {
    assert(
      record.responseToIds.length > 0,
      `Church response ${record.id} must link to the record it addresses`,
    );
    assert(
      record.responseToIds.every(
        (id) =>
          modernEvidenceRecords.find((candidate) => candidate.id === id)
            ?.category !== "Church response",
      ),
      `Church response ${record.id} cannot respond only to another response`,
    );
  }
  if (record.category === "Unverified claim") {
    assert(
      record.status === "Unverified",
      `unverified record ${record.id} must have Unverified status`,
    );
    assert(
      /not independently verified/i.test(record.evidentiaryLimit),
      `unverified record ${record.id} needs an explicit verification limit`,
    );
  }
}

for (const record of modernBibliography) {
  assert(
    profileIds.has(record.subjectId),
    `bibliography record ${record.id} references unknown profile`,
  );
  requireHttps(record.sourceUrl, `bibliography record ${record.id}`);
  assert(
    record.perspective.trim().length > 0,
    `bibliography record ${record.id} requires a source perspective`,
  );
}

const originWorkIds = new Set(modernOriginClaims.map((claim) => claim.workId));
for (const id of requiredOriginWorkIds)
  assert(originWorkIds.has(id), `origin-claim record for ${id} is missing`);
for (const claim of modernOriginClaims) {
  const work = texts.find((candidate) => candidate.id === claim.workId);
  assert(work, `origin claim ${claim.id} references unknown work`);
  assert(
    work.startDate !== null && work.startDate >= 1800,
    `origin claim ${claim.id} must use a modern catalog date`,
  );
  const documentedYear = claim.documentedDate.match(/\b(1[89]\d{2}|20\d{2})\b/);
  assert(
    documentedYear && Number(documentedYear[1]) === work.startDate,
    `origin claim ${claim.id} must agree with its catalog date`,
  );
  assert(
    /date|timeline|publication|modern|recorded/i.test(claim.datingExplanation),
    `origin claim ${claim.id} needs a modern dating explanation`,
  );
  requireHttps(claim.sourceUrl, `origin claim ${claim.id}`);
}
