import rawData from "@/data/seed/comparison-packs.json";
import anunnakiResearch from "@/data/research/anunnaki-evidence.json";
import hornData from "@/data/seed/horn-additions.json";
import {
  archiveImageDisplayAllowed,
  archiveImages,
  witnesses,
} from "./archive";
import { editions, texts } from "./catalog";
import { culturalProtocols, protocolDecision } from "./protocols";
import { aiRightsDecision } from "./rights";

export const comparisonPackStatuses = [
  "evidence-ready",
  "unclassified-selection",
  "metadata-only",
  "missing-source",
  "culturally-restricted",
] as const;
export type ComparisonPackStatus = (typeof comparisonPackStatuses)[number];

export const comparisonPackModes = [
  "similarity",
  "difference",
  "chronology",
  "contradiction",
  "later-echo",
  "alternative-interpretation",
] as const;
export type ComparisonPackMode = (typeof comparisonPackModes)[number];

export interface ComparisonPackCitation {
  passageId: string;
  editionId: string;
  locator: string;
  contentType: string;
  sourceUrl: string;
}

export interface ComparisonPackResearchReference {
  collection:
    "primarySources" | "scholarship" | "alternatives" | "modernClaims";
  id: string;
}

export interface ComparisonPackSlot {
  id: string;
  label: string;
  requestedRange: string;
  status: ComparisonPackStatus;
  sourceCategory: string;
  evidenceNote: string;
  workIds: string[];
  witnessIds: string[];
  artifactIds: string[];
  protocolIds: string[];
  recensionIds: string[];
  citations: ComparisonPackCitation[];
  researchRefs: ComparisonPackResearchReference[];
  gap: string;
  community: string;
}

export interface ComparisonPackOutput {
  id: string;
  kind: "comparison-finding" | "coverage-note";
  mode: ComparisonPackMode;
  title: string;
  summary: string;
  evidenceSlotIds: string[];
  contextSlotIds: string[];
  sourceCategories: string[];
  influenceAssessment: string;
  caution: string;
}

export interface ComparisonPack {
  id: string;
  title: string;
  route: string;
  subtitle: string;
  topicRoutes: { label: string; href: string }[];
  slots: ComparisonPackSlot[];
  comparisons: ComparisonPackOutput[];
  completionNote: string;
}

export interface ComparisonPackSeed {
  formatVersion: number;
  datasetVersion: string;
  policy: {
    metadataIsNotEvidence: boolean;
    similarityDoesNotProveInfluence: boolean;
    restrictedContentExcluded: boolean;
    modernClaimsSeparatedFromAncientEvidence: boolean;
    communityAndEditionSpecificityRequired: boolean;
    snapshotContainsNoPassageText: boolean;
  };
  packs: ComparisonPack[];
}

export interface ResolvedComparisonReference {
  id: string;
  kind:
    | "work"
    | "edition"
    | "witness"
    | "artifact"
    | "protocol"
    | "recension"
    | "research"
    | "passage";
  label: string;
  href: string | null;
  sourceUrl: string | null;
  category: string;
}

export interface ResolvedComparisonSlot extends ComparisonPackSlot {
  references: ResolvedComparisonReference[];
}

type ResearchRecord = {
  id: string;
  title?: string;
  qId?: string;
  line?: string;
  publication?: string;
  year?: number;
  author?: string;
  claimant?: string;
  sourceUrl: string;
  evidence?: string;
};

type RecensionRecord = {
  id: string;
  workId: string;
  title: string;
  sources: string[];
};

const seed = rawData as unknown as ComparisonPackSeed;
const workById = new Map(texts.map((item) => [item.id, item]));
const editionById = new Map(editions.map((item) => [item.id, item]));
const witnessById = new Map(witnesses.map((item) => [item.id, item]));
const artifactById = new Map(archiveImages.map((item) => [item.id, item]));
const protocolById = new Map(culturalProtocols.map((item) => [item.id, item]));
const recensions = hornData.recensions as RecensionRecord[];
const recensionById = new Map(recensions.map((item) => [item.id, item]));

function researchCollection(
  collection: ComparisonPackResearchReference["collection"],
): ResearchRecord[] {
  switch (collection) {
    case "primarySources":
      return anunnakiResearch.primarySources as ResearchRecord[];
    case "scholarship":
      return anunnakiResearch.scholarship as ResearchRecord[];
    case "alternatives":
      return anunnakiResearch.alternatives as ResearchRecord[];
    case "modernClaims":
      return anunnakiResearch.modernClaims as ResearchRecord[];
  }
}

function researchRecord(ref: ComparisonPackResearchReference) {
  return researchCollection(ref.collection).find((item) => item.id === ref.id);
}

const researchSourceRoles: Record<
  ComparisonPackResearchReference["collection"],
  string
> = {
  primarySources: "primary-transliteration",
  scholarship: "scholarly-analysis",
  alternatives: "scholarly-alternative-interpretation",
  modernClaims: "modern-claim-source",
};

function resolvedResearchReference(ref: ComparisonPackResearchReference) {
  const item = researchRecord(ref);
  if (!item)
    throw new Error(
      `Missing comparison research reference ${ref.collection}:${ref.id}`,
    );
  const label = item.title ?? item.publication ?? item.qId ?? item.id;
  const locator = item.qId
    ? `${item.qId}${item.line ? ` line ${item.line}` : ""}`
    : item.publication
      ? `${item.publication}${item.year ? ` (${item.year})` : ""}`
      : label;
  return {
    ...ref,
    label,
    locator,
    sourceRole: researchSourceRoles[ref.collection],
    evidenceCategory: item.evidence ?? researchSourceRoles[ref.collection],
    sourceUrl: item.sourceUrl,
  };
}

const exactPackIds = [
  "afterlife",
  "creation",
  "wisdom",
  "devil-evil",
  "anunnaki",
  "ethiopian-tradition",
  "indigenous-creation",
] as const;

export type ComparisonPackId = (typeof exactPackIds)[number];

const requiredRequestedRanges: Record<ComparisonPackId, string[]> = {
  afterlife: [
    "Pyramid Texts",
    "Coffin Texts",
    "Book of the Dead",
    "Amduat",
    "Book of Gates",
    "Mesopotamian underworld",
    "Zoroastrian afterlife",
    "Greek underworld",
    "Jewish traditions",
    "Christianity",
    "Islam",
    "Hinduism",
    "Buddhism",
    "Tibetan Bardo",
    "Chinese traditions",
    "Indigenous traditions",
  ],
  creation: [
    "Egyptian creation traditions",
    "Enuma Elish",
    "Genesis",
    "Rig Veda",
    "Popol Vuh",
    "Greek Theogony",
    "Norse",
    "Chinese traditions",
    "Polynesian traditions",
    "Indigenous creation narratives",
  ],
  wisdom: [
    "Ptahhotep",
    "Amenemope",
    "Proverbs",
    "Ecclesiastes",
    "Analects",
    "Tao Te Ching",
    "Dhammapada",
    "Stoics",
    "Indigenous wisdom traditions",
  ],
  "devil-evil": [
    "Hebrew Bible",
    "Second Temple literature",
    "New Testament",
    "Quran",
    "Zoroastrian texts",
    "Codex Gigas imagery",
    "demonology",
    "Lesser Key of Solomon",
    "Dante",
    "Faust",
    "Paradise Lost",
    "Satanic writings",
    "skeptical philosophical critiques",
  ],
  anunnaki: [
    "ancient occurrences",
    "Mesopotamian mythology",
    "academic scholarship",
    "alternative scholarship",
    "modern Sitchin/ancient-astronaut claims",
  ],
  "ethiopian-tradition": [
    "Western canon comparison",
    "Ethiopian canon",
    "Enoch",
    "Jubilees",
    "Meqabyan",
    "church-order texts",
    "Kebra Nagast",
  ],
  "indigenous-creation": ["Multiple community-specific creation traditions"],
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Comparison pack validation: ${message}`);
}

function assertUnique(values: string[], context: string) {
  assert(new Set(values).size === values.length, `${context} must be unique`);
}

export function validateComparisonPacks(value: ComparisonPackSeed = seed) {
  assert(value.formatVersion === 1, "formatVersion must be 1");
  assert(value.datasetVersion.trim(), "datasetVersion is required");
  assert(
    value.packs.length === exactPackIds.length,
    "exactly seven packs are required",
  );
  assertUnique(
    value.packs.map((item) => item.id),
    "pack IDs",
  );
  assert(
    exactPackIds.every((id) => value.packs.some((item) => item.id === id)),
    "the seven required stable IDs must all be present",
  );
  for (const policyValue of Object.values(value.policy))
    assert(policyValue === true, "all comparison safety policies must be true");

  for (const pack of value.packs) {
    assert(
      exactPackIds.includes(pack.id as ComparisonPackId),
      `unknown pack ID ${pack.id}`,
    );
    assert(
      pack.route === `/compare/${pack.id}`,
      `${pack.id} has an unstable route`,
    );
    assert(
      pack.title.trim() && pack.subtitle.trim(),
      `${pack.id} needs display copy`,
    );
    assert(pack.topicRoutes.length > 0, `${pack.id} needs a topic route`);
    assert(
      pack.topicRoutes.every(
        (route) => route.label.trim() && route.href.startsWith("/"),
      ),
      `${pack.id} has an invalid topic route`,
    );
    assertUnique(
      pack.slots.map((item) => item.id),
      `${pack.id} slot IDs`,
    );
    assertUnique(
      pack.comparisons.map((item) => item.id),
      `${pack.id} comparison IDs`,
    );
    const requested = new Set(pack.slots.map((item) => item.requestedRange));
    for (const required of requiredRequestedRanges[pack.id as ComparisonPackId])
      assert(
        requested.has(required),
        `${pack.id} is missing requested range ${required}`,
      );

    const slotById = new Map(pack.slots.map((item) => [item.id, item]));
    for (const item of pack.slots) {
      assert(
        comparisonPackStatuses.includes(item.status),
        `${pack.id}/${item.id} has an invalid status`,
      );
      assert(
        item.id.trim() &&
          item.label.trim() &&
          item.requestedRange.trim() &&
          item.sourceCategory.trim() &&
          item.evidenceNote.trim(),
        `${pack.id}/${item.id} is missing required text`,
      );
      assertUnique(item.workIds, `${item.id} work references`);
      assertUnique(item.witnessIds, `${item.id} witness references`);
      assertUnique(item.artifactIds, `${item.id} artifact references`);
      assertUnique(item.protocolIds, `${item.id} protocol references`);
      assertUnique(item.recensionIds, `${item.id} recension references`);
      assertUnique(
        item.citations.map((entry) => entry.passageId),
        `${item.id} passage references`,
      );
      assertUnique(
        item.researchRefs.map((entry) => `${entry.collection}:${entry.id}`),
        `${item.id} research references`,
      );

      if (item.status === "evidence-ready")
        assert(
          item.citations.length > 0 || item.researchRefs.length > 0,
          `${item.id} claims evidence readiness without a citation or research reference`,
        );
      if (item.status === "metadata-only")
        assert(
          item.citations.length === 0 && item.researchRefs.length === 0,
          `${item.id} metadata may not count as evidence`,
        );
      if (item.status === "unclassified-selection")
        assert(
          item.citations.length > 0 &&
            item.researchRefs.length === 0 &&
            item.citations.every(
              (citation) => citation.contentType === "Unknown",
            ),
          `${item.id} must retain only explicitly unclassified source selections`,
        );
      if (item.status === "missing-source")
        assert(
          item.workIds.length === 0 &&
            item.witnessIds.length === 0 &&
            item.artifactIds.length === 0 &&
            item.citations.length === 0 &&
            item.researchRefs.length === 0,
          `${item.id} is missing-source but contains a source reference`,
        );
      if (item.status === "culturally-restricted") {
        assert(
          item.protocolIds.length > 0,
          `${item.id} needs a cultural protocol`,
        );
        assert(
          item.community.trim(),
          `${item.id} needs a named community authority`,
        );
        assert(
          item.citations.length === 0 && item.researchRefs.length === 0,
          `${item.id} may not expose restricted evidence`,
        );
      }
      if (item.status !== "evidence-ready")
        assert(item.gap.trim(), `${item.id} must display its evidence gap`);

      for (const id of item.workIds)
        assert(workById.has(id), `${item.id} references unknown work ${id}`);
      for (const id of item.witnessIds)
        assert(
          witnessById.has(id),
          `${item.id} references unknown witness ${id}`,
        );
      for (const id of item.artifactIds)
        assert(
          artifactById.has(id),
          `${item.id} references unknown artifact ${id}`,
        );
      for (const id of item.protocolIds) {
        const protocol = protocolById.get(id);
        assert(protocol, `${item.id} references unknown protocol ${id}`);
        assert(
          item.workIds.includes(protocol.workId),
          `${item.id} protocol ${id} does not govern one of its works`,
        );
      }
      for (const id of item.recensionIds) {
        const recension = recensionById.get(id);
        assert(recension, `${item.id} references unknown recension ${id}`);
        assert(
          item.workIds.includes(recension.workId),
          `${item.id} recension ${id} does not belong to one of its works`,
        );
      }
      for (const entry of item.citations) {
        const edition = editionById.get(entry.editionId);
        assert(
          edition,
          `${item.id} references unknown edition ${entry.editionId}`,
        );
        assert(
          item.workIds.includes(edition.textId),
          `${item.id} citation edition does not belong to one of its works`,
        );
        assert(entry.passageId.trim(), `${item.id} has an empty passage ID`);
        assert(entry.locator.trim(), `${item.id} has an empty locator`);
        assert(
          /^https:\/\//.test(entry.sourceUrl),
          `${item.id} citation requires an HTTPS source`,
        );
      }
      for (const ref of item.researchRefs)
        assert(
          researchRecord(ref),
          `${item.id} references unknown ${ref.collection}:${ref.id}`,
        );
    }

    assert(
      pack.comparisons.length >= 3,
      `${pack.id} needs distinct comparison outputs`,
    );
    assert(
      new Set(pack.comparisons.map((item) => item.mode)).size >= 3,
      `${pack.id} comparison modes must be distinct`,
    );
    assertUnique(
      pack.comparisons.map((item) => item.summary),
      `${pack.id} comparison summaries`,
    );
    for (const output of pack.comparisons) {
      assert(
        comparisonPackModes.includes(output.mode),
        `${output.id} has an invalid comparison mode`,
      );
      assert(
        output.kind === "comparison-finding" || output.kind === "coverage-note",
        `${output.id} has an invalid output kind`,
      );
      assertUnique(
        [...output.evidenceSlotIds, ...output.contextSlotIds],
        `${output.id} slot references`,
      );
      for (const id of [...output.evidenceSlotIds, ...output.contextSlotIds])
        assert(slotById.has(id), `${output.id} references unknown slot ${id}`);
      if (output.kind === "comparison-finding") {
        assert(
          output.evidenceSlotIds.length >= 2,
          `${output.id} needs at least two evidence-ready slots`,
        );
        assert(
          output.evidenceSlotIds.every(
            (id) => slotById.get(id)!.status === "evidence-ready",
          ),
          `${output.id} cites a non-ready slot as evidence`,
        );
        assert(
          output.contextSlotIds.every(
            (id) => slotById.get(id)!.status !== "evidence-ready",
          ),
          `${output.id} must not demote ready evidence to context`,
        );
      } else {
        assert(
          output.evidenceSlotIds.length === 0 &&
            output.contextSlotIds.length > 0,
          `${output.id} coverage notes must use context slots and no evidence slots`,
        );
      }
      const categorySlotIds =
        output.kind === "comparison-finding"
          ? output.evidenceSlotIds
          : output.contextSlotIds;
      const actualCategories = new Set(
        categorySlotIds.map((id) => slotById.get(id)!.sourceCategory),
      );
      assert(
        output.sourceCategories.every((category) =>
          actualCategories.has(category),
        ),
        `${output.id} lists a source category not present in its evidence slots`,
      );
      assert(
        output.title.trim() &&
          output.summary.trim() &&
          output.influenceAssessment.trim() &&
          output.caution.trim(),
        `${output.id} needs a bounded finding and caution`,
      );
    }
  }

  const ethiopian = value.packs.find(
    (item) => item.id === "ethiopian-tradition",
  )!;
  const meqabyan = ethiopian.slots.find(
    (item) => item.id === "ethiopian-meqabyan",
  )!;
  const western = ethiopian.slots.find(
    (item) => item.id === "ethiopian-western-canon",
  )!;
  assert(
    meqabyan.workIds.every(
      (id) => id.startsWith("ethiopic-") && id.endsWith("-meqabyan"),
    ),
    "Meqabyan must retain Ethiopian work identities",
  );
  assert(
    western.workIds.every((id) => id.endsWith("-maccabees")),
    "Greek Maccabees must remain in the Western comparison slot",
  );
  assert(
    !meqabyan.workIds.some((id) => western.workIds.includes(id)),
    "Meqabyan and Maccabees may not be merged",
  );

  const anunnaki = value.packs.find((item) => item.id === "anunnaki")!;
  const ancient = anunnaki.slots.find(
    (item) => item.id === "anunnaki-ancient",
  )!;
  const modern = anunnaki.slots.find((item) => item.id === "anunnaki-modern")!;
  assert(
    ancient.researchRefs.every((ref) => ref.collection === "primarySources"),
    "modern claims may not enter ancient Anunnaki evidence",
  );
  assert(
    modern.researchRefs.every((ref) => ref.collection === "modernClaims"),
    "Sitchin claims must stay in the modern-claim category",
  );

  const indigenous = value.packs.find(
    (item) => item.id === "indigenous-creation",
  )!;
  assert(
    indigenous.slots.every(
      (item) =>
        item.status === "culturally-restricted" &&
        item.protocolIds.length > 0 &&
        item.community.trim(),
    ),
    "Indigenous creation entries must remain community-specific and protocol-aware",
  );
  return true;
}

validateComparisonPacks(seed);

export const comparisonPackPolicy = seed.policy;
export const comparisonPackDatasetVersion = seed.datasetVersion;
export const comparisonPacks = seed.packs;
export const comparisonPackById = new Map(
  comparisonPacks.map((item) => [item.id, item]),
);

export function getComparisonPack(id: string) {
  return comparisonPackById.get(id);
}

export function comparisonPackCoverage(pack: ComparisonPack) {
  const currentSlots = pack.slots.map(resolveComparisonSlot);
  const count = (status: ComparisonPackStatus) =>
    currentSlots.filter((item) => item.status === status).length;
  return {
    total: currentSlots.length,
    evidenceReady: count("evidence-ready"),
    metadataOnly: count("metadata-only"),
    unclassifiedSelection: count("unclassified-selection"),
    missingSource: count("missing-source"),
    culturallyRestricted: count("culturally-restricted"),
    complete: currentSlots.every((item) => item.status === "evidence-ready"),
  };
}

function currentDisplaySlot(slot: ComparisonPackSlot): ComparisonPackSlot {
  // A deliberately culturally restricted seed slot exposes public protocol
  // metadata only. It has no passage or research evidence to revoke.
  if (slot.status === "culturally-restricted") return slot;
  const protocolsAllowed =
    slot.workIds.every((workId) => protocolDecision(workId, "display").allowed) &&
    slot.protocolIds.every((protocolId) => {
      const protocol = protocolById.get(protocolId);
      return Boolean(
        protocol && protocolDecision(protocol.workId, "display").allowed,
      );
    });
  const citationsAllowed = slot.citations.every((citation) => {
    const edition = editionById.get(citation.editionId);
    const work = edition ? workById.get(edition.textId) : undefined;
    return Boolean(
      edition &&
        work &&
        slot.workIds.includes(work.id) &&
        protocolDecision(work.id, "display").allowed &&
        aiRightsDecision(edition.license, work.copyright).allowed,
    );
  });
  const witnessesAllowed = slot.witnessIds.every(
    (id) => witnessById.get(id)?.access !== "Restricted",
  );
  const artifactsAllowed = slot.artifactIds.every((id) => {
    const artifact = artifactById.get(id);
    return Boolean(artifact && archiveImageDisplayAllowed(artifact));
  });
  if (
    protocolsAllowed &&
    citationsAllowed &&
    witnessesAllowed &&
    artifactsAllowed
  )
    return slot;

  const reason = protocolsAllowed
    ? "Current rights or access review does not permit the cited evidence to be displayed."
    : "Current cultural protocol does not permit this evidence to be displayed.";
  return {
    ...slot,
    status: protocolsAllowed ? "metadata-only" : "culturally-restricted",
    evidenceNote: reason,
    workIds: protocolsAllowed ? slot.workIds : [],
    witnessIds: [],
    artifactIds: [],
    citations: [],
    researchRefs: [],
    recensionIds: [],
    gap: reason,
  };
}

export function resolveComparisonSlot(
  slot: ComparisonPackSlot,
): ResolvedComparisonSlot {
  slot = currentDisplaySlot(slot);
  const references: ResolvedComparisonReference[] = [];
  for (const id of slot.workIds) {
    const item = workById.get(id)!;
    references.push({
      id,
      kind: "work",
      label: item.title,
      href: `/texts/${id}`,
      sourceUrl: item.sourceUrl,
      category: item.category,
    });
  }
  for (const entry of slot.citations) {
    const edition = editionById.get(entry.editionId)!;
    references.push({
      id: entry.passageId,
      kind: "passage",
      label: entry.locator,
      href: `/texts/${edition.textId}`,
      sourceUrl: entry.sourceUrl,
      category: entry.contentType,
    });
    references.push({
      id: edition.id,
      kind: "edition",
      label: edition.title,
      href: `/texts/${edition.textId}`,
      sourceUrl: edition.sourceUrl,
      category: edition.language,
    });
  }
  for (const id of slot.witnessIds) {
    const item = witnessById.get(id)!;
    references.push({
      id,
      kind: "witness",
      label: item.title,
      href: `/witnesses/${id}`,
      sourceUrl: item.sources[0] ?? null,
      category: item.type,
    });
  }
  for (const id of slot.artifactIds) {
    const item = artifactById.get(id)!;
    references.push({
      id,
      kind: "artifact",
      label: item.title,
      href: `/artifacts/${id}`,
      sourceUrl: item.sourceUrl,
      category: item.rights,
    });
  }
  for (const id of slot.protocolIds) {
    const item = protocolById.get(id)!;
    references.push({
      id,
      kind: "protocol",
      label: item.communityAuthority,
      href: `/library/indigenous`,
      sourceUrl: item.sourceUrl,
      category: item.protocolStatus,
    });
  }
  for (const id of slot.recensionIds) {
    const item = recensionById.get(id)!;
    references.push({
      id,
      kind: "recension",
      label: item.title,
      href: `/texts/${item.workId}`,
      sourceUrl: item.sources[0] ?? null,
      category: "Textual tradition / recension metadata",
    });
  }
  for (const ref of slot.researchRefs) {
    const item = researchRecord(ref)!;
    const resolved = resolvedResearchReference(ref);
    references.push({
      id: `${ref.collection}:${ref.id}`,
      kind: "research",
      label: resolved.label,
      href: null,
      sourceUrl: item.sourceUrl,
      category: resolved.evidenceCategory,
    });
  }
  return { ...slot, references };
}

export function comparisonPackDisplayComparisons(pack: ComparisonPack) {
  const dynamicallyBlocked = new Set(
    pack.slots
      .filter((slot) => resolveComparisonSlot(slot).status !== slot.status)
      .map(({ id }) => id),
  );
  return pack.comparisons.filter(
    (output) =>
      ![...output.evidenceSlotIds, ...output.contextSlotIds].some((slotId) =>
        dynamicallyBlocked.has(slotId),
      ),
  );
}

export function comparisonPackProvenanceSnapshot(id: string) {
  const pack = getComparisonPack(id);
  if (!pack) return undefined;
  const exportableSlots = pack.slots.filter(
    (item) =>
      item.status !== "culturally-restricted" &&
      item.workIds.every(
        (workId) => protocolDecision(workId, "export").allowed,
      ) &&
      item.protocolIds.every((protocolId) => {
        const protocol = protocolById.get(protocolId);
        return Boolean(
          protocol && protocolDecision(protocol.workId, "export").allowed,
        );
      }) &&
      item.citations.every((citation) => {
        const edition = editions.find(
          (candidate) => candidate.id === citation.editionId,
        );
        const work = edition
          ? texts.find((candidate) => candidate.id === edition.textId)
          : undefined;
        return Boolean(
          edition &&
            work &&
            item.workIds.includes(work.id) &&
            protocolDecision(work.id, "export").allowed &&
            aiRightsDecision(edition.license, work.copyright).allowed,
        );
      }),
  );
  const exportableSlotIds = new Set(exportableSlots.map((item) => item.id));
  const restrictedSlotIds = new Set(
    pack.slots
      .filter((item) => !exportableSlotIds.has(item.id))
      .map((item) => item.id),
  );
  const slotById = new Map(pack.slots.map((item) => [item.id, item]));
  const exportableComparisons = pack.comparisons.filter(
    (item) =>
      ![...item.evidenceSlotIds, ...item.contextSlotIds].some((slotId) =>
        restrictedSlotIds.has(slotId),
      ),
  );
  return {
    schemaVersion: 2,
    datasetVersion: comparisonPackDatasetVersion,
    pack: { id: pack.id, title: pack.title, route: pack.route },
    omittedRestrictedSlotCount: pack.slots.length - exportableSlots.length,
    omittedRestrictedComparisonCount:
      pack.comparisons.length - exportableComparisons.length,
    topicRoutes: pack.topicRoutes.map((item) => ({ ...item })),
    policy: { ...comparisonPackPolicy },
    evidence: exportableSlots.map((item) => ({
      slotId: item.id,
      label: item.label,
      requestedRange: item.requestedRange,
      status: item.status,
      sourceCategory: item.sourceCategory,
      workIds: [...item.workIds],
      editionIds: [...new Set(item.citations.map((entry) => entry.editionId))],
      passageIds: item.citations.map((entry) => entry.passageId),
      citations: item.citations.map((entry) => ({
        passageId: entry.passageId,
        editionId: entry.editionId,
        locator: entry.locator,
        contentType: entry.contentType,
        sourceUrl: entry.sourceUrl,
      })),
      witnessIds: [...item.witnessIds],
      artifactIds: [...item.artifactIds],
      protocolIds: [...item.protocolIds],
      recensionIds: [...item.recensionIds],
      researchRefs: item.researchRefs.map(resolvedResearchReference),
      sourceUrls: [
        ...new Set(
          resolveComparisonSlot(item)
            .references.map((reference) => reference.sourceUrl)
            .filter((url): url is string => Boolean(url)),
        ),
      ],
      gap: item.gap,
      community: item.community,
    })),
    comparisons: exportableComparisons.flatMap((item) => {
      const evidenceSlotIds = item.evidenceSlotIds.filter((slotId) =>
        exportableSlotIds.has(slotId),
      );
      const contextSlotIds = item.contextSlotIds.filter((slotId) =>
        exportableSlotIds.has(slotId),
      );
      const retainedIds = [...evidenceSlotIds, ...contextSlotIds];
      if (!retainedIds.length) return [];
      return [
        {
          id: item.id,
          mode: item.mode,
          kind: item.kind,
          title: item.title,
          summary: item.summary,
          evidenceSlotIds,
          contextSlotIds,
          sourceCategories: [
            ...new Set(
              retainedIds.map((slotId) => slotById.get(slotId)!.sourceCategory),
            ),
          ],
          influenceAssessment: item.influenceAssessment,
          caution: item.caution,
        },
      ];
    }),
    completionNote: pack.completionNote,
  };
}

export function formatComparisonTerm(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
