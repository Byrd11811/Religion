import data from "@/data/seed/ontology-entities.json";

export type OntologyConfidence = "high" | "medium" | "low" | "contested";
export type OntologyConceptLevel = "root" | "branch" | "concept";
export type OntologyEdgeKind = "root" | "primary" | "secondary";
export type ConceptTermRelation =
  | "tradition-specific"
  | "translation-gloss"
  | "related"
  | "contrast"
  | "language-form";
export type OntologyEntityType =
  "deity" | "person" | "work" | "religious-figure" | "institution" | "council";
export type NameAssertionType =
  | "canonical"
  | "alternate-name"
  | "language-form"
  | "transliteration"
  | "translation-rendering"
  | "former-name"
  | "abbreviation";

export interface OntologySource {
  id: string;
  label: string;
  url: string;
  kind: string;
  perspective: string;
  accessed: string;
}

export interface OntologyPolicy {
  concepts: string;
  names: string;
  occurrences: string;
  classification: string;
}

export interface OntologyConcept {
  id: string;
  label: string;
  description: string;
  level: OntologyConceptLevel;
  keywords: string[];
  sourceIds: string[];
}

export interface OntologyConceptEdge {
  id: string;
  broaderId: string;
  narrowerId: string;
  kind: OntologyEdgeKind;
  rationale: string;
  sourceIds: string[];
}

export interface OntologyConceptTerm {
  id: string;
  conceptId: string;
  term: string;
  language: string;
  script: string;
  transliteration: string;
  semanticRelation: ConceptTermRelation;
  scope: string;
  note: string;
  sourceIds: string[];
}

export interface OntologyEntity {
  id: string;
  canonicalName: string;
  entityType: OntologyEntityType;
  traditions: string[];
  earliestAttestation: string;
  description: string;
  sourceIds: string[];
}

export interface EntityNameAssertion {
  id: string;
  entityId: string;
  name: string;
  normalizedName: string;
  language: string;
  script: string;
  transliteration: string;
  assertionType: NameAssertionType;
  scope: string;
  sourceIds: string[];
  confidence: OntologyConfidence;
}

export interface EntityOccurrence {
  id: string;
  entityId: string;
  sourceId: string;
  workId: string | null;
  locator: string;
  attestedForm: string;
  originalForm: string | null;
  language: string;
  script: string;
  transliteration: string;
  role: string;
  description: string;
  sourceIds: string[];
  confidence: OntologyConfidence;
}

export interface EntityRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: string;
  scope: string;
  startDate: string | null;
  endDate: string | null;
  summary: string;
  sourceIds: string[];
  confidence: OntologyConfidence;
  isEquivalence: false;
}

export interface EntityEvolutionPath {
  id: string;
  entityId: string;
  title: string;
  summary: string;
  sourceIds: string[];
}

export interface EntityEvolutionStage {
  id: string;
  pathId: string;
  entityId: string;
  sequence: number;
  stageType: string;
  label: string;
  dateLabel: string;
  role: string;
  summary: string;
  sourceIds: string[];
}

export interface ClassificationVocabularyItem {
  id: string;
  label: string;
  description: string;
  requiresEvidence: true;
  sourceIds: string[];
}

export interface ClassificationSchemes {
  conflictCauses: ClassificationVocabularyItem[];
  conversionModes: ClassificationVocabularyItem[];
}

export type ConflictEvidenceBasis =
  | "primary-source"
  | "archival-primary-source-dossier"
  | "scholarly-analysis"
  | "primary-and-scholarly";

export interface ConflictCase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dateLabel: string;
  locations: string[];
  actors: string[];
  summary: string;
  statedCause: string;
  participantJustifications: string[];
  scholarlyInterpretations: string[];
  disputedCausation: string;
  uncertainty: string;
  sourceIds: string[];
}

export interface ConflictCauseAssignment {
  id: string;
  conflictCaseId: string;
  causeId: string;
  evidence: string;
  evidenceBasis: ConflictEvidenceBasis;
  confidence: OntologyConfidence;
  sourceIds: string[];
}

export type ConversionEvidenceStandard =
  | "documented-direct-force"
  | "documented-threat"
  | "documented-state-policy"
  | "documented-continuity"
  | "documented-discrimination";

export interface ConversionCase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dateLabel: string;
  locations: string[];
  actors: string[];
  summary: string;
  statedPolicy: string;
  statedJustification: string;
  resistanceContinuity: string;
  disputesUncertainty: string;
  sourceIds: string[];
}

export interface ConversionModeAssignment {
  id: string;
  conversionCaseId: string;
  modeId: string;
  evidence: string;
  evidenceStandard: ConversionEvidenceStandard;
  confidence: OntologyConfidence;
  sourceIds: string[];
}

export interface OntologyEntityData {
  formatVersion: number;
  reviewedAt: string;
  policy: OntologyPolicy;
  sources: OntologySource[];
  concepts: OntologyConcept[];
  conceptEdges: OntologyConceptEdge[];
  conceptTerms: OntologyConceptTerm[];
  entities: OntologyEntity[];
  nameAssertions: EntityNameAssertion[];
  occurrences: EntityOccurrence[];
  relationships: EntityRelationship[];
  evolutionPaths: EntityEvolutionPath[];
  evolutionStages: EntityEvolutionStage[];
  classificationSchemes: ClassificationSchemes;
  conflictCases: ConflictCase[];
  conflictCauseAssignments: ConflictCauseAssignment[];
  conversionCases: ConversionCase[];
  conversionModeAssignments: ConversionModeAssignment[];
}

export const ontologyEntityData = data as unknown as OntologyEntityData;
export const ontologyEntityPolicy = ontologyEntityData.policy;
export const ontologySources = ontologyEntityData.sources;
export const ontologyConcepts = ontologyEntityData.concepts;
export const ontologyConceptEdges = ontologyEntityData.conceptEdges;
export const ontologyConceptTerms = ontologyEntityData.conceptTerms;
export const ontologyEntities = ontologyEntityData.entities;
export const entityNameAssertions = ontologyEntityData.nameAssertions;
export const entityOccurrences = ontologyEntityData.occurrences;
export const entityRelationships = ontologyEntityData.relationships;
export const contextualRelationships = entityRelationships;
export const entityEvolutionPaths = ontologyEntityData.evolutionPaths;
export const entityEvolutionStages = ontologyEntityData.evolutionStages;
export const classificationSchemes = ontologyEntityData.classificationSchemes;
export const conflictCauseVocabulary = classificationSchemes.conflictCauses;
export const conversionModeVocabulary = classificationSchemes.conversionModes;
export const conflictCases = ontologyEntityData.conflictCases;
export const conflictCauseAssignments =
  ontologyEntityData.conflictCauseAssignments;
export const conversionCases = ontologyEntityData.conversionCases;
export const conversionModeAssignments =
  ontologyEntityData.conversionModeAssignments;

export const requiredOntologyEntityIds = [
  "anunna",
  "enki-ea",
  "inanna-ishtar",
  "utu-shamash",
  "osiris-wsir",
  "isis-aset",
  "thoth-djehuty",
  "horus-heru",
  "laozi",
  "yijing",
  "belial",
  "baal",
  "satan",
  "lucifer",
  "azazel",
  "isac",
  "first-council-nicaea",
] as const;

const expectedConflictCauseIds = [
  "religious",
  "theological",
  "political",
  "dynastic",
  "territorial",
  "economic",
  "ethnic",
  "imperial",
  "succession",
  "resource-related",
  "anti-colonial",
  "nationalist",
  "ideological",
  "mixed",
  "disputed",
] as const;

const expectedConversionModeIds = [
  "voluntary-conversion",
  "missionary-persuasion",
  "patronage-incentive",
  "elite-conversion",
  "social-pressure",
  "legal-disadvantage",
  "religious-discrimination",
  "state-sponsorship",
  "legal-prohibition",
  "conversion-under-threat",
  "forced-conversion",
  "conquest-gradual-change",
  "forced-assimilation",
  "cultural-assimilation",
  "suppression-traditional-religion",
  "syncretic-adaptation",
  "continuity-despite-change",
] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Ontology/entity data: ${message}`);
}

function assertNonempty(value: string, label: string) {
  assert(
    typeof value === "string" && value.trim().length > 0,
    `${label} is required`,
  );
}

function assertNonemptyStringList(values: string[], label: string) {
  assert(Array.isArray(values) && values.length > 0, `${label} is required`);
  for (const [index, value] of values.entries())
    assertNonempty(value, `${label}[${index}]`);
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

function requireUniqueIds(records: readonly { id: string }[], label: string) {
  assert(
    new Set(records.map(({ id }) => id)).size === records.length,
    `${label} IDs must be unique`,
  );
}

function validateSourceIds(
  record: { id: string; sourceIds: string[] },
  sourceIdSet: ReadonlySet<string>,
) {
  assert(record.sourceIds.length > 0, `${record.id} needs evidence sources`);
  assert(
    new Set(record.sourceIds).size === record.sourceIds.length,
    `${record.id} has duplicate source IDs`,
  );
  for (const sourceId of record.sourceIds)
    assert(sourceIdSet.has(sourceId), `${record.id} references ${sourceId}`);
}

export function validateOntologyEntityData() {
  requireExactValues(
    Object.keys(ontologyEntityData),
    [
      "formatVersion",
      "reviewedAt",
      "policy",
      "sources",
      "concepts",
      "conceptEdges",
      "conceptTerms",
      "entities",
      "nameAssertions",
      "occurrences",
      "relationships",
      "evolutionPaths",
      "evolutionStages",
      "classificationSchemes",
      "conflictCases",
      "conflictCauseAssignments",
      "conversionCases",
      "conversionModeAssignments",
    ],
    "top-level keys",
  );
  assert(ontologyEntityData.formatVersion === 1, "format version must be 1");
  assertNonempty(ontologyEntityData.reviewedAt, "review date");
  for (const [key, value] of Object.entries(ontologyEntityPolicy))
    assertNonempty(value, `policy ${key}`);

  const sourceIdSet = new Set(ontologySources.map(({ id }) => id));
  requireUniqueIds(ontologySources, "source");
  for (const source of ontologySources) {
    assertNonempty(source.label, `${source.id} label`);
    assertNonempty(source.kind, `${source.id} kind`);
    assertNonempty(source.perspective, `${source.id} perspective`);
    assert(
      source.url.startsWith("https://"),
      `${source.id} requires an HTTPS URL`,
    );
  }

  assert(ontologyConcepts.length === 89, "requires exactly 89 concepts");
  assert(
    ontologyConcepts.filter(({ level }) => level === "root").length === 1,
    "requires one root concept",
  );
  assert(
    ontologyConcepts.filter(({ level }) => level === "branch").length === 9,
    "requires nine concept branches",
  );
  assert(
    ontologyConcepts.filter(({ level }) => level === "concept").length === 79,
    "requires 79 normalized leaf concepts",
  );
  assert(
    ontologyConceptEdges.length === 115,
    "requires exactly 115 concept edges",
  );
  assert(
    ontologyConceptEdges.filter(({ kind }) => kind === "root").length === 9,
    "requires nine root edges",
  );
  assert(
    ontologyConceptEdges.filter(({ kind }) => kind === "primary").length === 79,
    "requires 79 primary edges",
  );
  assert(
    ontologyConceptEdges.filter(({ kind }) => kind === "secondary").length ===
      27,
    "requires 27 secondary edges",
  );
  requireUniqueIds(ontologyConcepts, "concept");
  requireUniqueIds(ontologyConceptEdges, "concept-edge");
  const conceptIdSet = new Set(ontologyConcepts.map(({ id }) => id));
  assert(
    ontologyConcepts.some(
      ({ id, level }) => id === "religion-and-worldview" && level === "root",
    ),
    "religion-and-worldview root is required",
  );
  const primaryChildren = new Set<string>();
  for (const edge of ontologyConceptEdges) {
    assert(
      conceptIdSet.has(edge.broaderId) && conceptIdSet.has(edge.narrowerId),
      `${edge.id} has an invalid concept reference`,
    );
    assert(
      edge.broaderId !== edge.narrowerId,
      `${edge.id} is self-referential`,
    );
    if (edge.kind === "primary") {
      assert(
        !primaryChildren.has(edge.narrowerId),
        `${edge.narrowerId} has multiple primary parents`,
      );
      primaryChildren.add(edge.narrowerId);
    }
    validateSourceIds(edge, sourceIdSet);
  }
  assert(primaryChildren.size === 79, "every leaf needs one primary parent");
  for (const concept of ontologyConcepts) {
    assertNonempty(concept.label, `${concept.id} label`);
    assertNonempty(concept.description, `${concept.id} description`);
    assert(concept.keywords.length > 0, `${concept.id} requires keywords`);
    assert(
      concept.sourceIds.some((sourceId) => sourceId !== "src-atlas-gap-audit"),
      `${concept.id} needs subject-matter provenance in addition to requirement provenance`,
    );
    validateSourceIds(concept, sourceIdSet);
  }
  assert(
    new Set(
      ontologyConcepts
        .filter(({ level }) => level === "concept")
        .map(({ description }) => description),
    ).size === 79,
    "leaf concepts require 79 substantive, non-template descriptions",
  );
  assert(
    new Set(ontologyConceptEdges.map(({ rationale }) => rationale)).size ===
      115,
    "concept edges require record-specific rationales",
  );
  for (const edge of ontologyConceptEdges)
    assert(
      edge.sourceIds.some((sourceId) => sourceId !== "src-atlas-gap-audit"),
      `${edge.id} needs subject-matter provenance in addition to requirement provenance`,
    );

  assert(
    ontologyConceptTerms.length === 20,
    "requires exactly 20 source-scoped concept terms",
  );
  requireUniqueIds(ontologyConceptTerms, "concept-term");
  const conceptTermRelations = new Set<ConceptTermRelation>([
    "tradition-specific",
    "translation-gloss",
    "related",
    "contrast",
    "language-form",
  ]);
  for (const term of ontologyConceptTerms) {
    assert(conceptIdSet.has(term.conceptId), `${term.id} has invalid concept`);
    assertNonempty(term.term, `${term.id} term`);
    assertNonempty(term.language, `${term.id} language`);
    assertNonempty(term.script, `${term.id} script`);
    assertNonempty(term.transliteration, `${term.id} transliteration`);
    assertNonempty(term.scope, `${term.id} scope`);
    assertNonempty(term.note, `${term.id} note`);
    assert(
      conceptTermRelations.has(term.semanticRelation),
      `${term.id} has an invalid semantic relation`,
    );
    validateSourceIds(term, sourceIdSet);
  }
  const anatta = ontologyConceptTerms.find(({ id }) => id === "term-anatta");
  assert(
    anatta?.conceptId === "soul" && anatta.semanticRelation === "contrast",
    "anattā must remain a contrast to soul, never a soul alias",
  );

  assert(ontologyEntities.length === 17, "requires exactly 17 entities");
  requireExactValues(
    ontologyEntities.map(({ id }) => id),
    requiredOntologyEntityIds,
    "entity IDs",
  );
  requireUniqueIds(ontologyEntities, "entity");
  const entityIdSet = new Set(ontologyEntities.map(({ id }) => id));
  for (const entity of ontologyEntities) {
    assertNonempty(entity.canonicalName, `${entity.id} canonical name`);
    assertNonempty(
      entity.earliestAttestation,
      `${entity.id} earliest attestation`,
    );
    assertNonempty(entity.description, `${entity.id} description`);
    assert(entity.traditions.length > 0, `${entity.id} needs traditions`);
    validateSourceIds(entity, sourceIdSet);
  }

  assert(
    entityNameAssertions.length === 73,
    "requires exactly 73 name assertions",
  );
  requireUniqueIds(entityNameAssertions, "name-assertion");
  const nameAssertionTypes = new Set<NameAssertionType>([
    "canonical",
    "alternate-name",
    "language-form",
    "transliteration",
    "translation-rendering",
    "former-name",
    "abbreviation",
  ]);
  for (const assertion of entityNameAssertions) {
    assert(
      entityIdSet.has(assertion.entityId),
      `${assertion.id} has invalid entity`,
    );
    assertNonempty(assertion.name, `${assertion.id} name`);
    assertNonempty(assertion.normalizedName, `${assertion.id} normalized name`);
    assertNonempty(assertion.scope, `${assertion.id} scope`);
    assert(
      nameAssertionTypes.has(assertion.assertionType),
      `${assertion.id} has an invalid assertion type`,
    );
    assert(
      assertion.scope.includes(assertion.name) &&
        !assertion.scope.includes("Source- and period-scoped name evidence"),
      `${assertion.id} needs assertion-specific language, period, and context`,
    );
    validateSourceIds(assertion, sourceIdSet);
  }
  const assertionById = new Map(
    entityNameAssertions.map((assertion) => [assertion.id, assertion]),
  );
  assert(
    assertionById.get("name-satan-article")?.assertionType ===
      "transliteration",
    "ha-satan must remain a transliteration assertion",
  );
  assert(
    assertionById.get("name-lucifer-heylel")?.assertionType ===
      "transliteration",
    "hêlēl must remain a transliteration assertion",
  );
  assert(
    assertionById.get("name-lucifer-heosphoros")?.name === "ἑωσφόρος" &&
      assertionById.get("name-lucifer-heosphoros")?.assertionType ===
        "translation-rendering",
    "Lucifer's Septuagint assertion must preserve the Isaiah 14:12 rendering ἑωσφόρος",
  );
  assert(
    entityNameAssertions.some(
      ({ entityId, name, assertionType }) =>
        entityId === "yijing" &&
        name === "I Ching" &&
        assertionType === "alternate-name",
    ),
    "Yijing must resolve I Ching",
  );
  const belialNames = new Set(
    entityNameAssertions
      .filter(({ entityId }) => entityId === "belial")
      .map(({ normalizedName }) => normalizedName),
  );
  const baalNames = new Set(
    entityNameAssertions
      .filter(({ entityId }) => entityId === "baal")
      .map(({ normalizedName }) => normalizedName),
  );
  assert(
    ![...belialNames].some((name) => baalNames.has(name)),
    "Belial and Baal cannot share an unconditional normalized name",
  );
  const luciferNames = new Set(
    entityNameAssertions
      .filter(({ entityId }) => entityId === "lucifer")
      .map(({ normalizedName }) => normalizedName),
  );
  const satanNames = new Set(
    entityNameAssertions
      .filter(({ entityId }) => entityId === "satan")
      .map(({ normalizedName }) => normalizedName),
  );
  assert(
    ![...luciferNames].some((name) => satanNames.has(name)),
    "Lucifer and Satan must not be unconditional aliases",
  );

  assert(
    entityOccurrences.length === 54,
    "requires exactly 54 source-specific occurrences",
  );
  requireUniqueIds(entityOccurrences, "entity-occurrence");
  for (const occurrence of entityOccurrences) {
    assert(
      entityIdSet.has(occurrence.entityId),
      `${occurrence.id} has invalid entity`,
    );
    assert(
      sourceIdSet.has(occurrence.sourceId),
      `${occurrence.id} has invalid direct source`,
    );
    assert(
      occurrence.workId === null ||
        (typeof occurrence.workId === "string" &&
          occurrence.workId.trim().length > 0),
      `${occurrence.id} work ID must be a catalog ID or null when unlinked`,
    );
    assertNonempty(occurrence.locator, `${occurrence.id} locator`);
    assertNonempty(occurrence.attestedForm, `${occurrence.id} attested form`);
    if (occurrence.originalForm !== null)
      assertNonempty(occurrence.originalForm, `${occurrence.id} original form`);
    assertNonempty(
      occurrence.transliteration,
      `${occurrence.id} transliteration`,
    );
    if (occurrence.script === "Han" || occurrence.script === "Hebrew") {
      assert(
        occurrence.originalForm === occurrence.attestedForm,
        `${occurrence.id} must retain its original-script form`,
      );
      assert(
        occurrence.transliteration !== occurrence.originalForm &&
          !/[\u3400-\u9fff\u0590-\u05ff]/u.test(occurrence.transliteration),
        `${occurrence.id} transliteration must be romanized`,
      );
    }
    assertNonempty(occurrence.role, `${occurrence.id} role`);
    validateSourceIds(occurrence, sourceIdSet);
    assert(
      occurrence.sourceIds.includes(occurrence.sourceId),
      `${occurrence.id} must cite its direct source`,
    );
  }
  const anunnaOccurrences = entityOccurrences.filter(
    ({ entityId }) => entityId === "anunna",
  );
  assert(
    anunnaOccurrences.length === 9 &&
      anunnaOccurrences.every(
        ({ sourceId, transliteration }) =>
          sourceId.startsWith("src-oracc-q") &&
          transliteration.includes("a-nun-na"),
      ),
    "Anunna requires the nine retained ORACC occurrences",
  );
  assert(
    new Set(entityOccurrences.map(({ entityId }) => entityId)).size === 17,
    "every entity requires at least one occurrence",
  );
  assert(
    entityOccurrences
      .filter(({ entityId }) => entityId === "yijing")
      .every(
        ({ attestedForm }) => attestedForm !== "乾" && attestedForm !== "坤",
      ),
    "Yijing entity occurrences must attest work titles, not hexagram headings",
  );

  assert(
    entityRelationships.length === 8,
    "requires exactly eight contextual relationships",
  );
  requireUniqueIds(entityRelationships, "entity-relationship");
  for (const relationship of entityRelationships) {
    assert(
      entityIdSet.has(relationship.sourceEntityId) &&
        entityIdSet.has(relationship.targetEntityId),
      `${relationship.id} has invalid entity references`,
    );
    assert(
      relationship.sourceEntityId !== relationship.targetEntityId,
      `${relationship.id} is self-referential`,
    );
    assert(
      relationship.isEquivalence === false,
      `${relationship.id} cannot be unconditional equivalence`,
    );
    assertNonempty(relationship.scope, `${relationship.id} scope`);
    assertNonempty(relationship.summary, `${relationship.id} summary`);
    validateSourceIds(relationship, sourceIdSet);
  }
  assert(
    entityRelationships.some(
      ({ id, relationshipType, sourceEntityId, targetEntityId }) =>
        id === "rel-belial-baal-rejected" &&
        relationshipType === "rejected-identification" &&
        sourceEntityId === "belial" &&
        targetEntityId === "baal",
    ),
    "Belial/Baal rejected identification is required",
  );
  assert(
    entityRelationships.some(
      ({ id, relationshipType, sourceEntityId, targetEntityId }) =>
        id === "rel-lucifer-satan-later-conflation" &&
        relationshipType === "later-contextual-conflation" &&
        sourceEntityId === "lucifer" &&
        targetEntityId === "satan",
    ),
    "Lucifer/Satan must remain a later contextual conflation",
  );

  assert(
    entityEvolutionPaths.length === 9,
    "requires exactly nine evolution paths",
  );
  assert(
    entityEvolutionStages.length === 28,
    "requires exactly 28 evolution stages",
  );
  requireUniqueIds(entityEvolutionPaths, "evolution-path");
  requireUniqueIds(entityEvolutionStages, "evolution-stage");
  const pathById = new Map(entityEvolutionPaths.map((path) => [path.id, path]));
  for (const path of entityEvolutionPaths) {
    assert(entityIdSet.has(path.entityId), `${path.id} has invalid entity`);
    assertNonempty(path.title, `${path.id} title`);
    validateSourceIds(path, sourceIdSet);
  }
  const sequences = new Map<string, number[]>();
  for (const stage of entityEvolutionStages) {
    const path = pathById.get(stage.pathId);
    assert(path, `${stage.id} has invalid path`);
    assert(
      path.entityId === stage.entityId,
      `${stage.id} entity must match its path`,
    );
    assert(stage.sequence > 0, `${stage.id} requires a positive sequence`);
    assertNonempty(stage.dateLabel, `${stage.id} date`);
    assertNonempty(stage.role, `${stage.id} role`);
    assertNonempty(stage.summary, `${stage.id} summary`);
    validateSourceIds(stage, sourceIdSet);
    sequences.set(stage.pathId, [
      ...(sequences.get(stage.pathId) ?? []),
      stage.sequence,
    ]);
  }
  for (const [pathId, pathSequences] of sequences) {
    const sorted = [...pathSequences].sort((a, b) => a - b);
    assert(
      sorted.every((sequence, index) => sequence === index + 1),
      `${pathId} stage sequence must be contiguous`,
    );
  }

  requireExactValues(
    conflictCauseVocabulary.map(({ id }) => id),
    expectedConflictCauseIds,
    "conflict-cause vocabulary",
  );
  requireExactValues(
    conversionModeVocabulary.map(({ id }) => id),
    expectedConversionModeIds,
    "conversion-mode vocabulary",
  );
  for (const item of [
    ...conflictCauseVocabulary,
    ...conversionModeVocabulary,
  ]) {
    assertNonempty(item.label, `${item.id} label`);
    assertNonempty(item.description, `${item.id} description`);
    assert(item.requiresEvidence === true, `${item.id} must require evidence`);
    validateSourceIds(item, sourceIdSet);
  }

  assert(
    conflictCases.length >= 2,
    "requires at least two conflict application cases",
  );
  assert(
    conversionCases.length >= 2,
    "requires at least two conversion application cases",
  );
  requireUniqueIds(conflictCases, "conflict case");
  requireUniqueIds(conflictCauseAssignments, "conflict-cause assignment");
  requireUniqueIds(conversionCases, "conversion case");
  requireUniqueIds(conversionModeAssignments, "conversion-mode assignment");

  const confidenceValues = new Set<OntologyConfidence>([
    "high",
    "medium",
    "low",
    "contested",
  ]);
  const conflictEvidenceBases = new Set<ConflictEvidenceBasis>([
    "primary-source",
    "archival-primary-source-dossier",
    "scholarly-analysis",
    "primary-and-scholarly",
  ]);
  const conflictCaseById = new Map(
    conflictCases.map((conflictCase) => [conflictCase.id, conflictCase]),
  );
  const conflictCauseIdSet = new Set(
    conflictCauseVocabulary.map(({ id }) => id),
  );
  for (const conflictCase of conflictCases) {
    assertNonempty(conflictCase.name, `${conflictCase.id} name`);
    assertNonempty(conflictCase.startDate, `${conflictCase.id} start date`);
    assertNonempty(conflictCase.endDate, `${conflictCase.id} end date`);
    assertNonempty(conflictCase.dateLabel, `${conflictCase.id} date label`);
    assertNonemptyStringList(
      conflictCase.locations,
      `${conflictCase.id} locations`,
    );
    assertNonemptyStringList(conflictCase.actors, `${conflictCase.id} actors`);
    assertNonempty(conflictCase.summary, `${conflictCase.id} summary`);
    assertNonempty(conflictCase.statedCause, `${conflictCase.id} stated cause`);
    assertNonemptyStringList(
      conflictCase.participantJustifications,
      `${conflictCase.id} participant justifications`,
    );
    assertNonemptyStringList(
      conflictCase.scholarlyInterpretations,
      `${conflictCase.id} scholarly interpretations`,
    );
    assertNonempty(
      conflictCase.disputedCausation,
      `${conflictCase.id} disputed causation`,
    );
    assertNonempty(conflictCase.uncertainty, `${conflictCase.id} uncertainty`);
    validateSourceIds(conflictCase, sourceIdSet);
    assert(
      !conflictCase.sourceIds.includes("src-atlas-gap-audit"),
      `${conflictCase.id} requires case-specific historical sources`,
    );
    const assignments = conflictCauseAssignments.filter(
      ({ conflictCaseId }) => conflictCaseId === conflictCase.id,
    );
    assert(
      assignments.length >= 2,
      `${conflictCase.id} requires multiple cause assignments`,
    );
    assert(
      new Set(assignments.map(({ causeId }) => causeId)).size ===
        assignments.length,
      `${conflictCase.id} cannot repeat a cause assignment`,
    );
  }
  for (const assignment of conflictCauseAssignments) {
    const conflictCase = conflictCaseById.get(assignment.conflictCaseId);
    assert(conflictCase, `${assignment.id} has an invalid conflict case`);
    assert(
      conflictCauseIdSet.has(assignment.causeId),
      `${assignment.id} has an invalid conflict cause`,
    );
    assertNonempty(assignment.evidence, `${assignment.id} evidence`);
    assert(
      conflictEvidenceBases.has(assignment.evidenceBasis),
      `${assignment.id} has an invalid evidence basis`,
    );
    assert(
      confidenceValues.has(assignment.confidence),
      `${assignment.id} has invalid confidence`,
    );
    validateSourceIds(assignment, sourceIdSet);
    assert(
      assignment.sourceIds.every((sourceId) =>
        conflictCase.sourceIds.includes(sourceId),
      ),
      `${assignment.id} sources must be declared by its case`,
    );
    assert(
      !assignment.sourceIds.includes("src-atlas-gap-audit"),
      `${assignment.id} requires case-specific historical evidence`,
    );
  }

  const conversionEvidenceStandards = new Set<ConversionEvidenceStandard>([
    "documented-direct-force",
    "documented-threat",
    "documented-state-policy",
    "documented-continuity",
    "documented-discrimination",
  ]);
  const conversionCaseById = new Map(
    conversionCases.map((conversionCase) => [
      conversionCase.id,
      conversionCase,
    ]),
  );
  const conversionModeIdSet = new Set(
    conversionModeVocabulary.map(({ id }) => id),
  );
  for (const conversionCase of conversionCases) {
    assertNonempty(conversionCase.name, `${conversionCase.id} name`);
    assertNonempty(conversionCase.startDate, `${conversionCase.id} start date`);
    assertNonempty(conversionCase.endDate, `${conversionCase.id} end date`);
    assertNonempty(conversionCase.dateLabel, `${conversionCase.id} date label`);
    assertNonemptyStringList(
      conversionCase.locations,
      `${conversionCase.id} locations`,
    );
    assertNonemptyStringList(
      conversionCase.actors,
      `${conversionCase.id} actors`,
    );
    assertNonempty(conversionCase.summary, `${conversionCase.id} summary`);
    assertNonempty(
      conversionCase.statedPolicy,
      `${conversionCase.id} stated policy`,
    );
    assertNonempty(
      conversionCase.statedJustification,
      `${conversionCase.id} stated justification`,
    );
    assertNonempty(
      conversionCase.resistanceContinuity,
      `${conversionCase.id} resistance or continuity`,
    );
    assertNonempty(
      conversionCase.disputesUncertainty,
      `${conversionCase.id} disputes or uncertainty`,
    );
    validateSourceIds(conversionCase, sourceIdSet);
    assert(
      !conversionCase.sourceIds.includes("src-atlas-gap-audit"),
      `${conversionCase.id} requires case-specific historical sources`,
    );
    const assignments = conversionModeAssignments.filter(
      ({ conversionCaseId }) => conversionCaseId === conversionCase.id,
    );
    assert(
      assignments.length > 0,
      `${conversionCase.id} requires a conversion-mode assignment`,
    );
    assert(
      new Set(assignments.map(({ modeId }) => modeId)).size ===
        assignments.length,
      `${conversionCase.id} cannot repeat a conversion mode`,
    );
  }
  for (const assignment of conversionModeAssignments) {
    const conversionCase = conversionCaseById.get(assignment.conversionCaseId);
    assert(conversionCase, `${assignment.id} has an invalid conversion case`);
    assert(
      conversionModeIdSet.has(assignment.modeId),
      `${assignment.id} has an invalid conversion mode`,
    );
    assertNonempty(assignment.evidence, `${assignment.id} evidence`);
    assert(
      conversionEvidenceStandards.has(assignment.evidenceStandard),
      `${assignment.id} has an invalid evidence standard`,
    );
    assert(
      confidenceValues.has(assignment.confidence),
      `${assignment.id} has invalid confidence`,
    );
    validateSourceIds(assignment, sourceIdSet);
    assert(
      assignment.sourceIds.every((sourceId) =>
        conversionCase.sourceIds.includes(sourceId),
      ),
      `${assignment.id} sources must be declared by its case`,
    );
    assert(
      !assignment.sourceIds.includes("src-atlas-gap-audit"),
      `${assignment.id} requires case-specific historical evidence`,
    );
    if (assignment.modeId === "forced-conversion")
      assert(
        assignment.evidenceStandard === "documented-direct-force",
        `${assignment.id} cannot infer forced conversion from conquest or patronage`,
      );
  }
  assert(
    conversionModeAssignments
      .filter(
        ({ conversionCaseId }) =>
          conversionCaseId === "conversion-constantinian-christian-sponsorship",
      )
      .every(({ modeId }) => modeId !== "forced-conversion"),
    "Constantinian patronage and toleration cannot be classified as forced conversion",
  );

  const globallyIdentified = [
    ...ontologyConcepts,
    ...ontologyConceptEdges,
    ...ontologyConceptTerms,
    ...ontologyEntities,
    ...entityNameAssertions,
    ...entityOccurrences,
    ...entityRelationships,
    ...entityEvolutionPaths,
    ...entityEvolutionStages,
    ...conflictCases,
    ...conflictCauseAssignments,
    ...conversionCases,
    ...conversionModeAssignments,
  ];
  requireUniqueIds(globallyIdentified, "global ontology/entity record");
  return true;
}

export function ontologyConceptById(id: string) {
  return ontologyConcepts.find((concept) => concept.id === id);
}

export function ontologyEntityById(id: string) {
  return ontologyEntities.find((entity) => entity.id === id);
}

export function sourcesForOntologyRecord(record: { sourceIds: string[] }) {
  return record.sourceIds.map((sourceId) => {
    const source = ontologySources.find(({ id }) => id === sourceId);
    if (!source) throw new Error(`Ontology/entity data: missing ${sourceId}`);
    return source;
  });
}

export function namesForOntologyEntity(entityId: string) {
  return entityNameAssertions.filter(
    (assertion) => assertion.entityId === entityId,
  );
}

export function occurrencesForOntologyEntity(entityId: string) {
  return entityOccurrences.filter(
    (occurrence) => occurrence.entityId === entityId,
  );
}

export function evolutionForOntologyEntity(entityId: string) {
  return entityEvolutionPaths
    .filter((path) => path.entityId === entityId)
    .map((path) => ({
      ...path,
      stages: entityEvolutionStages
        .filter((stage) => stage.pathId === path.id)
        .sort((left, right) => left.sequence - right.sequence),
    }));
}

validateOntologyEntityData();
