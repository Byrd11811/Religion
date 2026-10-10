import data from "@/data/seed/forbidden-lost-disputed.json";

export const restrictionTypes = [
  "canon-excluded",
  "ecclesiastically-prohibited",
  "state-banned",
  "censored",
  "destroyed",
  "restricted-to-qualified-audience",
  "blasphemy-restriction",
  "obscenity-restriction",
  "political-religious-suppression",
] as const;

export const survivalStatuses = [
  "LOST",
  "INDIRECTLY_ATTESTED",
  "FRAGMENTARY",
  "DISPUTED_LOST_WORK",
] as const;

export const authenticityStatuses = [
  "DEMONSTRATED_MODERN_FORGERY",
  "DISPUTED_AUTHENTICITY",
  "MODERN_FORGERY_OR_HOAX",
  "MODERN_FORGERY",
  "DEMONSTRATED_HOAX",
  "SUSPECTED_FORGERY_DISPUTED",
] as const;

export const sourceChainStages = [
  "ORIGINAL",
  "COPY_OR_QUOTE",
  "TRANSLATION",
  "SECONDARY",
  "DERIVATIVE",
] as const;

export type RestrictionType = (typeof restrictionTypes)[number];
export type SurvivalStatus = (typeof survivalStatuses)[number];
export type AuthenticityStatus = (typeof authenticityStatuses)[number];
export type SourceChainStage = (typeof sourceChainStages)[number];
export type ResearchConfidence = "high" | "medium" | "low" | "contested";

export interface ResearchSource {
  id: string;
  label: string;
  url: string;
  kind: string;
  perspective: string;
  accessed: string;
}

export interface TruthfulnessRegressionCase {
  headline:
    | "Lost Work"
    | "Fragmentary Text"
    | "Hypothetical Q Source"
    | "Disputed Forgery";
  recordId: string;
  rule: string;
}

export interface ForbiddenLostDisputedDefinitions {
  policy: string;
  restrictionTypes: Record<RestrictionType, string>;
  survivalStatuses: Record<SurvivalStatus, string>;
  authenticityStatuses: Record<AuthenticityStatus, string>;
  sourceChainStages: SourceChainStage[];
  truthfulnessRegressionCases: TruthfulnessRegressionCase[];
}

export interface ResearchRecordBase {
  id: string;
  title: string;
  collection: "forbidden" | "lost" | "hypothetical" | "disputed";
  recordKind: string;
  traditions: string[];
  regions: string[];
  dateLabel: string;
  statusLabel: string;
  headline: string;
  summary: string;
  confidence: ResearchConfidence;
  sourceIds: string[];
  reviewedAt: string;
  rightsStatus: string;
  culturalRestrictions: string[];
  safetyNotes: string[];
  mayTranslate: false;
  editions: unknown[];
  segments: unknown[];
  fullText: null;
}

export interface SuppressionEvent extends ResearchRecordBase {
  collection: "forbidden";
  recordKind:
    | "restriction-event"
    | "destruction-event"
    | "canon-boundary"
    | "audience-restriction";
  restrictionTypes: RestrictionType[];
  restrictionType: RestrictionType;
  authority: string;
  jurisdiction: string;
  restrictionDate: string;
  restrictionEnd: string;
  reasonAsStated: string;
  currentStatus: string;
  isCanonExcluded: boolean;
  isBanned: boolean;
  isLegallyOrInstitutionallyProhibited: boolean;
}

export interface SourceChainNode {
  stage: SourceChainStage;
  label: string;
  sourceId?: string;
  independenceGroup?: string;
  nodeId?: string;
  derivedFrom?: string[];
}

export interface FragmentCitation {
  sourceId: string;
  locator: string;
  note: string;
}

export interface LostWorkRecord extends ResearchRecordBase {
  collection: "lost";
  recordKind:
    | "lost-work"
    | "indirectly-attested-work"
    | "fragmentary-work"
    | "disputed-lost-work";
  survivalStatus: SurvivalStatus;
  attestationType: string;
  earliestAttestation: string;
  attestingSourceIds: string[];
  attestingSources: string[];
  survivingMaterial: string;
  reconstructionLevel:
    | "none"
    | "title-only"
    | "outline"
    | "quoted-fragments"
    | "direct-fragments"
    | "partial-text";
  sourceChain: SourceChainNode[];
  fragmentCitations: FragmentCitation[];
  hasCompleteText: false;
}

export interface HypotheticalSourceRecord extends ResearchRecordBase {
  collection: "hypothetical";
  recordKind:
    | "hypothetical-source"
    | "reconstructed-source-family"
    | "hypothetical-literary-construct"
    | "comparative-reconstruction"
    | "reconstructed-transmission";
  hypothesisType: string;
  proposedEntity: string;
  argumentsFor: string[];
  argumentsAgainst: string[];
  physicalWitness: null;
  quotations: unknown[];
  quotationPolicy: "none";
  currentAssessment: string;
  modelBoundary: string;
}

export interface EvidenceItem {
  claim: string;
  sourceIds: string[];
}

export interface Historiography {
  olderView: string;
  laterChallenge: string;
  currentMajority: string;
  minorityPosition: string;
  supersededClaims: string[];
  evidenceCausingChange: string[];
  lastReviewed: string;
}

export interface DisputedWorkRecord extends ResearchRecordBase {
  collection: "disputed";
  recordKind: "authenticity-case";
  authenticityStatus: AuthenticityStatus;
  forgeryStatusProminent: true;
  claimedDate: string;
  claimedAuthorship: string;
  claimedProvenance: string;
  physicalDate: string;
  materialDescription: string;
  findProvenance: string;
  evidenceFor: EvidenceItem[];
  evidenceAgainst: EvidenceItem[];
  receptionHistory: EvidenceItem[];
  legalDisposition: EvidenceItem | null;
  currentAssessment: string;
  majorityView: string;
  minorityView: string;
  historiography: Historiography;
}

export type ForbiddenLostDisputedRecord =
  | SuppressionEvent
  | LostWorkRecord
  | HypotheticalSourceRecord
  | DisputedWorkRecord;

interface ForbiddenLostDisputedData {
  sources: ResearchSource[];
  definitions: ForbiddenLostDisputedDefinitions;
  suppressionEvents: SuppressionEvent[];
  lostWorks: LostWorkRecord[];
  hypotheticalSources: HypotheticalSourceRecord[];
  disputedWorks: DisputedWorkRecord[];
}

const researchData = data as unknown as ForbiddenLostDisputedData;

export const forbiddenLostDisputedDefinitions = researchData.definitions;
export const forbiddenLostDisputedPolicy = researchData.definitions.policy;
export const forbiddenLostDisputedSources = researchData.sources;
export const phase14Definitions: unknown = forbiddenLostDisputedDefinitions;
export const phase14Policy = forbiddenLostDisputedPolicy;
export const phase14Sources = forbiddenLostDisputedSources;
export const suppressionEvents = researchData.suppressionEvents;
export const lostWorks = researchData.lostWorks;
export const hypotheticalSources = researchData.hypotheticalSources;
export const disputedWorks = researchData.disputedWorks;
export const forbiddenLostDisputedRecords: ForbiddenLostDisputedRecord[] = [
  ...suppressionEvents,
  ...lostWorks,
  ...hypotheticalSources,
  ...disputedWorks,
];

export const requiredSuppressionEventIds = [
  "forbidden-copernicus-de-revolutionibus-1616",
  "forbidden-foscarini-letter-1616",
  "forbidden-tyndale-new-testament-1526",
  "forbidden-watchtower-golden-age-germany-1933",
  "destroyed-maya-books-yucatan-1562",
  "forbidden-zhuan-falun-china-1996",
  "canon-shepherd-of-hermas-sinaiticus",
  "restricted-chariot-and-creation-exposition-hagigah",
  "forbidden-love-that-dares-to-speak-1977",
  "forbidden-kama-sutra-portugal-1965",
] as const;

export const requiredLostWorkIds = [
  "lost-book-of-wars-of-yhwh",
  "lost-book-of-jashar",
  "lost-gospel-of-the-egyptians",
  "indirect-gospel-of-the-ebionites",
  "lost-cihrdad-nask",
  "lost-mani-arzhang",
  "fragmentary-mani-book-of-giants",
  "lost-berossus-babyloniaca",
  "lost-manetho-aegyptiaca",
  "fragmentary-orphic-rhapsodies",
  "alleged-lost-classic-of-music",
] as const;

export const requiredHypotheticalSourceIds = [
  "hypothetical-q-source",
  "reconstructed-pentateuchal-source-models",
  "hypothetical-deuteronomistic-history",
  "reconstructed-proto-indo-european-religion",
  "reconstructed-proto-indo-iranian-religion",
  "reconstructed-rigvedic-oral-compositional-history",
] as const;

export const requiredDisputedWorkIds = [
  "forgery-gospel-of-jesus-wife",
  "disputed-secret-gospel-of-mark",
  "hoax-oera-linda-book",
  "forgery-book-of-veles",
  "hoax-kinderhook-plates",
  "disputed-jehoash-inscription",
  "disputed-shapira-deuteronomy-strips",
  "forgery-salamander-letter",
] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Forbidden/lost/disputed data: ${message}`);
}

function assertNonempty(value: string, label: string) {
  assert(
    typeof value === "string" && value.trim().length > 0,
    `${label} is required`,
  );
}

function requireExactValues(
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

function validateSourceIds(
  sourceIds: readonly string[],
  sourceIdSet: ReadonlySet<string>,
  label: string,
) {
  assert(sourceIds.length > 0, `${label} requires at least one source`);
  assert(
    new Set(sourceIds).size === sourceIds.length,
    `${label} has duplicate source IDs`,
  );
  for (const sourceId of sourceIds)
    assert(sourceIdSet.has(sourceId), `${label} references ${sourceId}`);
}

function validateNoSyntheticText(record: ResearchRecordBase) {
  assert(record.mayTranslate === false, `${record.id} must refuse translation`);
  assert(record.fullText === null, `${record.id} cannot contain full text`);
  assert(record.editions.length === 0, `${record.id} cannot bundle an edition`);
  assert(record.segments.length === 0, `${record.id} cannot contain segments`);
}

const expectedSuppressionKinds: Record<string, SuppressionEvent["recordKind"]> =
  {
    "forbidden-copernicus-de-revolutionibus-1616": "restriction-event",
    "forbidden-foscarini-letter-1616": "restriction-event",
    "forbidden-tyndale-new-testament-1526": "restriction-event",
    "forbidden-watchtower-golden-age-germany-1933": "restriction-event",
    "destroyed-maya-books-yucatan-1562": "destruction-event",
    "forbidden-zhuan-falun-china-1996": "restriction-event",
    "canon-shepherd-of-hermas-sinaiticus": "canon-boundary",
    "restricted-chariot-and-creation-exposition-hagigah":
      "audience-restriction",
    "forbidden-love-that-dares-to-speak-1977": "restriction-event",
    "forbidden-kama-sutra-portugal-1965": "restriction-event",
  };

const expectedLostStatuses: Record<string, SurvivalStatus> = {
  "lost-book-of-wars-of-yhwh": "LOST",
  "lost-book-of-jashar": "LOST",
  "lost-gospel-of-the-egyptians": "INDIRECTLY_ATTESTED",
  "indirect-gospel-of-the-ebionites": "INDIRECTLY_ATTESTED",
  "lost-cihrdad-nask": "LOST",
  "lost-mani-arzhang": "LOST",
  "fragmentary-mani-book-of-giants": "FRAGMENTARY",
  "lost-berossus-babyloniaca": "INDIRECTLY_ATTESTED",
  "lost-manetho-aegyptiaca": "INDIRECTLY_ATTESTED",
  "fragmentary-orphic-rhapsodies": "FRAGMENTARY",
  "alleged-lost-classic-of-music": "DISPUTED_LOST_WORK",
};

const expectedAuthenticityStatuses: Record<string, AuthenticityStatus> = {
  "forgery-gospel-of-jesus-wife": "DEMONSTRATED_MODERN_FORGERY",
  "disputed-secret-gospel-of-mark": "DISPUTED_AUTHENTICITY",
  "hoax-oera-linda-book": "MODERN_FORGERY_OR_HOAX",
  "forgery-book-of-veles": "MODERN_FORGERY",
  "hoax-kinderhook-plates": "DEMONSTRATED_HOAX",
  "disputed-jehoash-inscription": "SUSPECTED_FORGERY_DISPUTED",
  "disputed-shapira-deuteronomy-strips": "SUSPECTED_FORGERY_DISPUTED",
  "forgery-salamander-letter": "DEMONSTRATED_MODERN_FORGERY",
};

export function validateForbiddenLostDisputedData() {
  requireExactValues(
    Object.keys(researchData).sort(),
    [
      "sources",
      "definitions",
      "suppressionEvents",
      "lostWorks",
      "hypotheticalSources",
      "disputedWorks",
    ].sort(),
    "top-level dataset keys",
  );

  assert(suppressionEvents.length === 10, "requires 10 suppression records");
  assert(lostWorks.length === 11, "requires 11 lost/fragmentary records");
  assert(
    hypotheticalSources.length === 6,
    "requires 6 hypothetical/reconstructed records",
  );
  assert(disputedWorks.length === 8, "requires 8 disputed records");

  requireExactValues(
    suppressionEvents.map((record) => record.id),
    requiredSuppressionEventIds,
    "suppression IDs",
  );
  requireExactValues(
    lostWorks.map((record) => record.id),
    requiredLostWorkIds,
    "lost-work IDs",
  );
  requireExactValues(
    hypotheticalSources.map((record) => record.id),
    requiredHypotheticalSourceIds,
    "hypothetical-source IDs",
  );
  requireExactValues(
    disputedWorks.map((record) => record.id),
    requiredDisputedWorkIds,
    "disputed-work IDs",
  );

  const sourceIdSet = new Set(forbiddenLostDisputedSources.map(({ id }) => id));
  assert(
    sourceIdSet.size === forbiddenLostDisputedSources.length,
    "source IDs must be unique",
  );
  for (const source of forbiddenLostDisputedSources) {
    assertNonempty(source.id, "source ID");
    assertNonempty(source.label, `source ${source.id} label`);
    assertNonempty(source.kind, `source ${source.id} kind`);
    assertNonempty(source.perspective, `source ${source.id} perspective`);
    assert(
      source.url.startsWith("https://"),
      `source ${source.id} requires an HTTPS URL`,
    );
  }

  const recordIds = forbiddenLostDisputedRecords.map(({ id }) => id);
  assert(
    new Set(recordIds).size === recordIds.length,
    "all record IDs must be globally unique",
  );
  for (const record of forbiddenLostDisputedRecords) {
    assertNonempty(record.title, `${record.id} title`);
    assertNonempty(record.dateLabel, `${record.id} date`);
    assertNonempty(record.statusLabel, `${record.id} status`);
    assertNonempty(record.summary, `${record.id} summary`);
    assertNonempty(record.rightsStatus, `${record.id} rights status`);
    assertNonempty(record.reviewedAt, `${record.id} reviewed date`);
    validateSourceIds(record.sourceIds, sourceIdSet, record.id);
    validateNoSyntheticText(record);
  }

  requireExactValues(
    Object.keys(forbiddenLostDisputedDefinitions.restrictionTypes),
    restrictionTypes,
    "restriction definitions",
  );
  requireExactValues(
    Object.keys(forbiddenLostDisputedDefinitions.survivalStatuses),
    survivalStatuses,
    "survival definitions",
  );
  requireExactValues(
    Object.keys(forbiddenLostDisputedDefinitions.authenticityStatuses),
    authenticityStatuses,
    "authenticity definitions",
  );
  requireExactValues(
    forbiddenLostDisputedDefinitions.sourceChainStages,
    sourceChainStages,
    "source-chain stages",
  );

  requireExactValues(
    forbiddenLostDisputedDefinitions.truthfulnessRegressionCases.map(
      ({ headline }) => headline,
    ),
    [
      "Lost Work",
      "Fragmentary Text",
      "Hypothetical Q Source",
      "Disputed Forgery",
    ],
    "truthfulness regression headlines",
  );
  for (const fixture of forbiddenLostDisputedDefinitions.truthfulnessRegressionCases) {
    assert(
      recordIds.includes(fixture.recordId),
      `${fixture.headline} references unknown record ${fixture.recordId}`,
    );
    assertNonempty(fixture.rule, `${fixture.headline} rule`);
  }

  const observedRestrictionTypes = new Set<RestrictionType>();
  for (const event of suppressionEvents) {
    assert(
      event.collection === "forbidden",
      `${event.id} has wrong collection`,
    );
    assert(
      event.recordKind === expectedSuppressionKinds[event.id],
      `${event.id} has an unexpected record kind`,
    );
    assertNonempty(event.authority, `${event.id} authority`);
    assertNonempty(event.jurisdiction, `${event.id} jurisdiction`);
    assertNonempty(event.restrictionDate, `${event.id} restriction date`);
    assertNonempty(event.restrictionEnd, `${event.id} restriction end`);
    assertNonempty(event.reasonAsStated, `${event.id} reason`);
    assertNonempty(event.currentStatus, `${event.id} current status`);
    assert(
      event.restrictionTypes.length > 0,
      `${event.id} needs a restriction type`,
    );
    assert(
      event.restrictionType === event.restrictionTypes[0],
      `${event.id} primary restriction type must be first`,
    );
    for (const type of event.restrictionTypes) {
      assert(
        restrictionTypes.includes(type),
        `${event.id} has invalid ${type}`,
      );
      observedRestrictionTypes.add(type);
    }
    if (
      event.isCanonExcluded ||
      event.restrictionTypes.includes("canon-excluded")
    )
      assert(
        event.isBanned === false &&
          event.isLegallyOrInstitutionallyProhibited === false,
        `${event.id}: canon-excluded is not banned`,
      );
  }
  requireExactValues(
    [...observedRestrictionTypes],
    restrictionTypes,
    "represented restriction types",
  );

  for (const record of lostWorks) {
    assert(record.collection === "lost", `${record.id} has wrong collection`);
    assert(
      record.survivalStatus === expectedLostStatuses[record.id],
      `${record.id} has an unexpected survival status`,
    );
    assert(
      survivalStatuses.includes(record.survivalStatus),
      `${record.id} has an invalid survival status`,
    );
    assertNonempty(record.attestationType, `${record.id} attestation type`);
    assertNonempty(
      record.earliestAttestation,
      `${record.id} earliest attestation`,
    );
    assertNonempty(record.survivingMaterial, `${record.id} surviving material`);
    assert(record.hasCompleteText === false, `${record.id} cannot be complete`);
    validateSourceIds(record.attestingSourceIds, sourceIdSet, record.id);
    requireExactValues(
      record.attestingSources,
      record.attestingSourceIds,
      `${record.id} attesting-source aliases`,
    );
    assert(record.sourceChain.length > 0, `${record.id} needs a source chain`);
    for (const node of record.sourceChain) {
      assert(
        sourceChainStages.includes(node.stage),
        `${record.id} has invalid source stage ${node.stage}`,
      );
      assertNonempty(node.label, `${record.id} source-chain label`);
      if (node.sourceId)
        assert(
          sourceIdSet.has(node.sourceId),
          `${record.id} source chain references ${node.sourceId}`,
        );
      if (node.derivedFrom)
        assert(
          node.derivedFrom.length > 0,
          `${record.id} has an empty derived-from list`,
        );
    }
    for (const citation of record.fragmentCitations) {
      assert(
        sourceIdSet.has(citation.sourceId),
        `${record.id} fragment references ${citation.sourceId}`,
      );
      assertNonempty(citation.locator, `${record.id} fragment locator`);
      assertNonempty(citation.note, `${record.id} fragment note`);
    }
    if (record.survivalStatus === "FRAGMENTARY")
      assert(
        record.fragmentCitations.length > 0,
        `${record.id} needs direct fragment citations`,
      );
  }

  const berossus = lostWorks.find(
    ({ id }) => id === "lost-berossus-babyloniaca",
  );
  assert(berossus, "Berossus regression record is missing");
  const berossusNodes = new Map(
    berossus.sourceChain.map((node) => [node.nodeId, node]),
  );
  assert(
    berossusNodes.size === berossus.sourceChain.length &&
      !berossusNodes.has(undefined),
    "Berossus requires unique source-chain node IDs",
  );
  for (const node of berossus.sourceChain)
    for (const parentId of node.derivedFrom ?? [])
      assert(
        berossusNodes.has(parentId),
        `Berossus ${node.nodeId} derives from missing ${parentId}`,
      );
  assert(
    berossusNodes
      .get("josephus-witness")
      ?.derivedFrom?.includes("polyhistor-epitome") &&
      berossusNodes
        .get("abydenus-witness")
        ?.derivedFrom?.includes("polyhistor-epitome") &&
      berossusNodes
        .get("eusebius-witness")
        ?.derivedFrom?.includes("abydenus-witness") &&
      !berossus.sourceChain.some(({ label }) => /Syncellus/i.test(label)),
    "Berossus must preserve the dependent Polyhistor transmission branch",
  );
  assert(
    !berossus.sourceChain.some(({ stage }) => stage === "TRANSLATION"),
    "Berossus cannot acquire a generic translation stage without a cited witness",
  );

  for (const record of hypotheticalSources) {
    assert(
      record.collection === "hypothetical",
      `${record.id} has wrong collection`,
    );
    assert(
      record.physicalWitness === null,
      `${record.id} cannot have a witness`,
    );
    assert(
      record.quotations.length === 0,
      `${record.id} cannot have quotations`,
    );
    assert(
      record.quotationPolicy === "none",
      `${record.id} must refuse hypothetical quotations`,
    );
    assert(
      record.argumentsFor.length > 0,
      `${record.id} needs supporting arguments`,
    );
    assert(
      record.argumentsAgainst.length > 0,
      `${record.id} needs counterarguments`,
    );
    assertNonempty(record.hypothesisType, `${record.id} hypothesis type`);
    assertNonempty(record.proposedEntity, `${record.id} proposed entity`);
    assertNonempty(record.currentAssessment, `${record.id} assessment`);
    assertNonempty(record.modelBoundary, `${record.id} model boundary`);
  }

  for (const record of disputedWorks) {
    assert(
      record.collection === "disputed",
      `${record.id} has wrong collection`,
    );
    assert(
      record.authenticityStatus === expectedAuthenticityStatuses[record.id],
      `${record.id} has an unexpected authenticity status`,
    );
    assert(
      authenticityStatuses.includes(record.authenticityStatus),
      `${record.id} has invalid authenticity status`,
    );
    assert(
      record.forgeryStatusProminent === true,
      `${record.id} must show forgery status prominently`,
    );
    for (const [label, value] of [
      ["claimed date", record.claimedDate],
      ["claimed authorship", record.claimedAuthorship],
      ["claimed provenance", record.claimedProvenance],
      ["physical date", record.physicalDate],
      ["material description", record.materialDescription],
      ["find provenance", record.findProvenance],
      ["current assessment", record.currentAssessment],
      ["majority view", record.majorityView],
      ["minority view", record.minorityView],
    ] as const)
      assertNonempty(value, `${record.id} ${label}`);
    assert(
      record.claimedDate !== record.physicalDate,
      `${record.id} must separate claimed and physical dates`,
    );
    assert(
      record.claimedProvenance !== record.findProvenance,
      `${record.id} must separate claimed and find provenance`,
    );
    assert(
      record.evidenceAgainst.length > 0,
      `${record.id} needs evidence against authenticity`,
    );
    if (
      record.authenticityStatus === "DISPUTED_AUTHENTICITY" ||
      record.authenticityStatus === "SUSPECTED_FORGERY_DISPUTED"
    )
      assert(
        record.evidenceFor.length > 0,
        `${record.id} needs evidence cited in support of the disputed position`,
      );
    for (const [label, items] of [
      ["evidence for", record.evidenceFor],
      ["evidence against", record.evidenceAgainst],
      ["reception history", record.receptionHistory],
    ] as const) {
      for (const item of items) {
        assertNonempty(item.claim, `${record.id} ${label} claim`);
        validateSourceIds(item.sourceIds, sourceIdSet, `${record.id} ${label}`);
      }
    }
    if (record.legalDisposition) {
      assertNonempty(
        record.legalDisposition.claim,
        `${record.id} legal disposition`,
      );
      validateSourceIds(
        record.legalDisposition.sourceIds,
        sourceIdSet,
        `${record.id} legal disposition`,
      );
    }
    for (const [label, value] of [
      ["older view", record.historiography.olderView],
      ["later challenge", record.historiography.laterChallenge],
      ["current majority", record.historiography.currentMajority],
      ["minority position", record.historiography.minorityPosition],
      ["last reviewed", record.historiography.lastReviewed],
    ] as const)
      assertNonempty(value, `${record.id} historiography ${label}`);
    assert(
      record.historiography.supersededClaims.length > 0,
      `${record.id} needs superseded claims`,
    );
    assert(
      record.historiography.evidenceCausingChange.length > 0,
      `${record.id} needs evidence causing change`,
    );
  }

  const jesusWife = disputedWorks.find(
    ({ id }) => id === "forgery-gospel-of-jesus-wife",
  );
  assert(jesusWife, "Gospel of Jesus' Wife regression record is missing");
  assert(
    jesusWife.headline ===
      "Modern forgery — ancient papyrus does not date the writing",
    "Gospel of Jesus' Wife needs the support-versus-writing headline",
  );
  assert(
    /papyrus support may be ancient/i.test(jesusWife.physicalDate) &&
      /ancient coptic fragment/i.test(jesusWife.claimedDate),
    "Gospel of Jesus' Wife must keep physical support separate from the claimed date",
  );

  const shepherd = suppressionEvents.find(
    ({ id }) => id === "canon-shepherd-of-hermas-sinaiticus",
  );
  assert(
    shepherd?.headline === "Canon boundary — not a ban" &&
      shepherd.isCanonExcluded &&
      !shepherd.isBanned &&
      !shepherd.isLegallyOrInstitutionallyProhibited,
    "Shepherd of Hermas must remain the banned-versus-noncanonical regression",
  );
  const hagigah = suppressionEvents.find(
    ({ id }) => id === "restricted-chariot-and-creation-exposition-hagigah",
  );
  assert(
    hagigah?.headline ===
      "Qualified-audience restriction — possession is not prohibited" &&
      !hagigah.isBanned &&
      !hagigah.isLegallyOrInstitutionallyProhibited,
    "Hagigah must remain an audience rule rather than a work prohibition",
  );
  const mayaDestruction = suppressionEvents.find(
    ({ id }) => id === "destroyed-maya-books-yucatan-1562",
  );
  assert(
    mayaDestruction &&
      !mayaDestruction.isBanned &&
      !mayaDestruction.isLegallyOrInstitutionallyProhibited &&
      !mayaDestruction.title.includes("Maní"),
    "The Maya destruction record cannot imply a continuing ban or unsupported Maní location",
  );
  for (const id of [
    "hoax-oera-linda-book",
    "forgery-book-of-veles",
    "hoax-kinderhook-plates",
  ]) {
    const settled = disputedWorks.find((record) => record.id === id);
    assert(
      settled?.evidenceFor.length === 0 && settled.receptionHistory.length > 0,
      `${id}: reception cannot be labeled authenticity evidence`,
    );
  }
  const jehoash = disputedWorks.find(
    ({ id }) => id === "disputed-jehoash-inscription",
  );
  assert(
    jehoash?.legalDisposition?.sourceIds.includes(
      "src-latimes-jehoash-verdict",
    ),
    "Jehoash criminal-case scope requires a post-verdict source",
  );

  return true;
}

export function forbiddenLostDisputedRecord(id: string) {
  return forbiddenLostDisputedRecords.find((record) => record.id === id);
}

export function forbiddenLostDisputedSource(sourceId: string) {
  return forbiddenLostDisputedSources.find((source) => source.id === sourceId);
}

export const sourceForForbiddenLostDisputedRecord = forbiddenLostDisputedSource;

export function sourcesForForbiddenLostDisputedRecord(
  record: ForbiddenLostDisputedRecord,
) {
  return record.sourceIds.map((sourceId) => {
    const source = forbiddenLostDisputedSource(sourceId);
    if (!source)
      throw new Error(
        `Forbidden/lost/disputed data: ${record.id} references ${sourceId}`,
      );
    return source;
  });
}

validateForbiddenLostDisputedData();
