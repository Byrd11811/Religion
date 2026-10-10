import type { AtlasDatabase } from "./client";
import * as ontology from "../shared/ontology-entities";

type SeedRecord = Record<string, unknown> & { id: string };

export interface OntologyPersistenceSeed {
  sources: SeedRecord[];
  concepts: SeedRecord[];
  conceptEdges: SeedRecord[];
  conceptTerms: SeedRecord[];
  entities: SeedRecord[];
  nameAssertions: SeedRecord[];
  occurrences: SeedRecord[];
  relationships: SeedRecord[];
  evolutionPaths: SeedRecord[];
  evolutionStages: SeedRecord[];
  conflictCauses: SeedRecord[];
  conversionModes: SeedRecord[];
  conflictCases: SeedRecord[];
  conflictCauseAssignments: SeedRecord[];
  conversionCases: SeedRecord[];
  conversionModeAssignments: SeedRecord[];
}

export const classificationSchemeIds = {
  conflictCauses: "conflict-causes",
  conversionModes: "conversion-modes",
} as const;

function records(value: unknown, label: string): SeedRecord[] {
  if (!Array.isArray(value))
    throw new Error(`Ontology persistence: ${label} must be an array`);
  return value as SeedRecord[];
}

function requiredString(record: SeedRecord, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`Ontology persistence: ${record.id}.${key} is required`);
  return value;
}

function nullableString(record: SeedRecord, key: string): string | null {
  const value = record[key];
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string")
    throw new Error(`Ontology persistence: ${record.id}.${key} must be text`);
  return value;
}

function requiredStrings(record: SeedRecord, key: string): string[] {
  const value = record[key];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string" || item.trim().length === 0)
  )
    throw new Error(
      `Ontology persistence: ${record.id}.${key} requires source IDs`,
    );
  return value;
}

function requiredTextList(record: SeedRecord, key: string): string[] {
  const value = record[key];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string" || item.trim().length === 0)
  )
    throw new Error(
      `Ontology persistence: ${record.id}.${key} requires non-empty text values`,
    );
  return value;
}

function requiredInteger(record: SeedRecord, key: string): number {
  const value = record[key];
  if (!Number.isSafeInteger(value) || (value as number) < 0)
    throw new Error(
      `Ontology persistence: ${record.id}.${key} must be a non-negative integer`,
    );
  return value as number;
}

function defaultSeed(): OntologyPersistenceSeed {
  ontology.validateOntologyEntityData();
  return {
    sources: records(ontology.ontologySources, "sources"),
    concepts: records(ontology.ontologyConcepts, "concepts"),
    conceptEdges: records(ontology.ontologyConceptEdges, "concept edges"),
    conceptTerms: records(ontology.ontologyConceptTerms, "concept terms"),
    entities: records(ontology.ontologyEntities, "entities"),
    nameAssertions: records(
      ontology.entityNameAssertions,
      "entity name assertions",
    ),
    occurrences: records(ontology.entityOccurrences, "entity occurrences"),
    relationships: records(
      ontology.entityRelationships,
      "contextual entity relationships",
    ),
    evolutionPaths: records(
      ontology.entityEvolutionPaths,
      "entity evolution paths",
    ),
    evolutionStages: records(
      ontology.entityEvolutionStages,
      "entity evolution stages",
    ),
    conflictCauses: records(
      ontology.conflictCauseVocabulary,
      "conflict-cause vocabulary",
    ),
    conversionModes: records(
      ontology.conversionModeVocabulary,
      "conversion-mode vocabulary",
    ),
    conflictCases: records(ontology.conflictCases, "conflict cases"),
    conflictCauseAssignments: records(
      ontology.conflictCauseAssignments,
      "conflict-cause assignments",
    ),
    conversionCases: records(ontology.conversionCases, "conversion cases"),
    conversionModeAssignments: records(
      ontology.conversionModeAssignments,
      "conversion-mode assignments",
    ),
  };
}

function validateSourceReferences(seed: OntologyPersistenceSeed) {
  for (const [label, collection] of [
    ["source", seed.sources],
    ["concept", seed.concepts],
    ["concept edge", seed.conceptEdges],
    ["concept term", seed.conceptTerms],
    ["entity", seed.entities],
    ["name assertion", seed.nameAssertions],
    ["occurrence", seed.occurrences],
    ["relationship", seed.relationships],
    ["evolution path", seed.evolutionPaths],
    ["evolution stage", seed.evolutionStages],
    ["conflict cause", seed.conflictCauses],
    ["conversion mode", seed.conversionModes],
    ["conflict case", seed.conflictCases],
    ["conflict-cause assignment", seed.conflictCauseAssignments],
    ["conversion case", seed.conversionCases],
    ["conversion-mode assignment", seed.conversionModeAssignments],
  ] as const) {
    const ids = new Set(collection.map((record) => record.id));
    if (ids.size !== collection.length)
      throw new Error(`Ontology persistence: ${label} IDs must be unique`);
  }

  const sourceIds = new Set(seed.sources.map((source) => source.id));
  for (const [label, collection] of [
    ["concept", seed.concepts],
    ["concept edge", seed.conceptEdges],
    ["concept term", seed.conceptTerms],
    ["entity", seed.entities],
    ["name assertion", seed.nameAssertions],
    ["occurrence", seed.occurrences],
    ["relationship", seed.relationships],
    ["evolution path", seed.evolutionPaths],
    ["evolution stage", seed.evolutionStages],
    ["conflict cause", seed.conflictCauses],
    ["conversion mode", seed.conversionModes],
    ["conflict case", seed.conflictCases],
    ["conflict-cause assignment", seed.conflictCauseAssignments],
    ["conversion case", seed.conversionCases],
    ["conversion-mode assignment", seed.conversionModeAssignments],
  ] as const)
    for (const record of collection)
      for (const sourceId of requiredStrings(record, "sourceIds"))
        if (!sourceIds.has(sourceId))
          throw new Error(
            `Ontology persistence: ${label} ${record.id} references unknown source ${sourceId}`,
          );
  for (const occurrence of seed.occurrences) {
    const sourceId = requiredString(occurrence, "sourceId");
    if (!sourceIds.has(sourceId))
      throw new Error(
        `Ontology persistence: occurrence ${occurrence.id} references unknown source ${sourceId}`,
      );
  }

  const conceptIds = new Set(seed.concepts.map(({ id }) => id));
  const entityIds = new Set(seed.entities.map(({ id }) => id));
  const pathIds = new Set(seed.evolutionPaths.map(({ id }) => id));
  const requireReference = (
    record: SeedRecord,
    key: string,
    ids: Set<string>,
    label: string,
  ) => {
    const id = requiredString(record, key);
    if (!ids.has(id))
      throw new Error(
        `Ontology persistence: ${label} ${record.id} references unknown ${key} ${id}`,
      );
  };
  for (const edge of seed.conceptEdges) {
    requireReference(edge, "broaderId", conceptIds, "concept edge");
    requireReference(edge, "narrowerId", conceptIds, "concept edge");
  }
  for (const term of seed.conceptTerms)
    requireReference(term, "conceptId", conceptIds, "concept term");
  for (const assertion of seed.nameAssertions)
    requireReference(assertion, "entityId", entityIds, "name assertion");
  for (const occurrence of seed.occurrences)
    requireReference(occurrence, "entityId", entityIds, "occurrence");
  for (const relationship of seed.relationships) {
    requireReference(relationship, "sourceEntityId", entityIds, "relationship");
    requireReference(relationship, "targetEntityId", entityIds, "relationship");
  }
  for (const path of seed.evolutionPaths)
    requireReference(path, "entityId", entityIds, "evolution path");
  for (const stage of seed.evolutionStages) {
    requireReference(stage, "pathId", pathIds, "evolution stage");
    requireReference(stage, "entityId", entityIds, "evolution stage");
  }
  const classificationIds = [
    ...seed.conflictCauses,
    ...seed.conversionModes,
  ].map(({ id }) => id);
  if (new Set(classificationIds).size !== classificationIds.length)
    throw new Error(
      "Ontology persistence: classification value IDs must be globally unique",
    );
  const conflictCaseIds = new Set(seed.conflictCases.map(({ id }) => id));
  const conflictCauseIds = new Set(seed.conflictCauses.map(({ id }) => id));
  for (const conflictCase of seed.conflictCases) {
    for (const key of [
      "name",
      "startDate",
      "endDate",
      "dateLabel",
      "summary",
      "statedCause",
      "disputedCausation",
      "uncertainty",
    ])
      requiredString(conflictCase, key);
    requiredTextList(conflictCase, "locations");
    requiredTextList(conflictCase, "actors");
    requiredTextList(conflictCase, "participantJustifications");
    requiredTextList(conflictCase, "scholarlyInterpretations");
  }
  for (const assignment of seed.conflictCauseAssignments) {
    requireReference(
      assignment,
      "conflictCaseId",
      conflictCaseIds,
      "conflict-cause assignment",
    );
    requireReference(
      assignment,
      "causeId",
      conflictCauseIds,
      "conflict-cause assignment",
    );
    requiredString(assignment, "evidence");
    requiredString(assignment, "evidenceBasis");
    requiredString(assignment, "confidence");
  }
  const conversionCaseIds = new Set(seed.conversionCases.map(({ id }) => id));
  const conversionModeIds = new Set(seed.conversionModes.map(({ id }) => id));
  for (const conversionCase of seed.conversionCases) {
    for (const key of [
      "name",
      "startDate",
      "endDate",
      "dateLabel",
      "summary",
      "statedPolicy",
      "statedJustification",
      "resistanceContinuity",
      "disputesUncertainty",
    ])
      requiredString(conversionCase, key);
    requiredTextList(conversionCase, "locations");
    requiredTextList(conversionCase, "actors");
  }
  for (const assignment of seed.conversionModeAssignments) {
    requireReference(
      assignment,
      "conversionCaseId",
      conversionCaseIds,
      "conversion-mode assignment",
    );
    requireReference(
      assignment,
      "modeId",
      conversionModeIds,
      "conversion-mode assignment",
    );
    requiredString(assignment, "evidence");
    requiredString(assignment, "evidenceStandard");
    requiredString(assignment, "confidence");
  }
  for (const relationship of seed.relationships)
    if (relationship.isEquivalence !== false)
      throw new Error(
        `Ontology persistence: ${relationship.id} cannot become an unconditional equivalence`,
      );
  for (const value of [...seed.conflictCauses, ...seed.conversionModes])
    if (value.requiresEvidence !== true)
      throw new Error(
        `Ontology persistence: ${value.id} must require classification evidence`,
      );
}

type OntologySeedTable =
  | "ontology_sources"
  | "ontology_concepts"
  | "ontology_concept_edges"
  | "ontology_concept_terms"
  | "ontology_entities"
  | "ontology_name_assertions"
  | "ontology_occurrences"
  | "ontology_contextual_relationships"
  | "ontology_evolution_paths"
  | "ontology_evolution_stages"
  | "ontology_conflict_cases"
  | "ontology_conflict_cause_assignments"
  | "ontology_conversion_cases"
  | "ontology_conversion_mode_assignments";

async function deleteIdsNotIn(
  db: Pick<AtlasDatabase, "query">,
  table: OntologySeedTable,
  records: SeedRecord[],
) {
  await db.query(`DELETE FROM ${table} WHERE NOT (id=ANY($1::text[]))`, [
    records.map(({ id }) => id),
  ]);
}

async function deleteObsoleteDependentRows(
  db: Pick<AtlasDatabase, "query">,
  seed: OntologyPersistenceSeed,
) {
  // Dependent records are removed before upserts so a renamed ID cannot collide
  // with a retained UNIQUE key such as (path_id, sequence).
  await deleteIdsNotIn(db, "ontology_evolution_stages", seed.evolutionStages);
  await deleteIdsNotIn(db, "ontology_concept_edges", seed.conceptEdges);
  await deleteIdsNotIn(db, "ontology_concept_terms", seed.conceptTerms);
  await deleteIdsNotIn(db, "ontology_name_assertions", seed.nameAssertions);
  await deleteIdsNotIn(db, "ontology_occurrences", seed.occurrences);
  await deleteIdsNotIn(
    db,
    "ontology_contextual_relationships",
    seed.relationships,
  );
  await deleteIdsNotIn(
    db,
    "ontology_conflict_cause_assignments",
    seed.conflictCauseAssignments,
  );
  await deleteIdsNotIn(
    db,
    "ontology_conversion_mode_assignments",
    seed.conversionModeAssignments,
  );
}

async function deleteObsoleteClassificationValues(
  db: Pick<AtlasDatabase, "query">,
  seed: OntologyPersistenceSeed,
) {
  await db.query(
    `DELETE FROM ontology_classification_values
     WHERE scheme_id=$1 AND NOT (id=ANY($2::text[]))`,
    [
      classificationSchemeIds.conflictCauses,
      seed.conflictCauses.map(({ id }) => id),
    ],
  );
  await db.query(
    `DELETE FROM ontology_classification_values
     WHERE scheme_id=$1 AND NOT (id=ANY($2::text[]))`,
    [
      classificationSchemeIds.conversionModes,
      seed.conversionModes.map(({ id }) => id),
    ],
  );
}

async function deleteObsoleteParentRows(
  db: Pick<AtlasDatabase, "query">,
  seed: OntologyPersistenceSeed,
) {
  // At this point retained dependents have been updated to their current parent
  // IDs, so parents and sources that disappeared from the seed are safe to drop.
  await deleteIdsNotIn(db, "ontology_conflict_cases", seed.conflictCases);
  await deleteIdsNotIn(db, "ontology_conversion_cases", seed.conversionCases);
  await deleteIdsNotIn(db, "ontology_evolution_paths", seed.evolutionPaths);
  await deleteIdsNotIn(db, "ontology_concepts", seed.concepts);
  await deleteIdsNotIn(db, "ontology_entities", seed.entities);
  await deleteIdsNotIn(db, "ontology_sources", seed.sources);
}

async function upsertClassificationScheme(
  db: Pick<AtlasDatabase, "query">,
  id: string,
  label: string,
  values: SeedRecord[],
) {
  await db.query(
    `INSERT INTO ontology_classification_schemes(id,label,evidence_required,metadata)
     VALUES($1,$2,true,$3)
     ON CONFLICT(id) DO UPDATE SET label=EXCLUDED.label,evidence_required=true,metadata=EXCLUDED.metadata`,
    [
      id,
      label,
      JSON.stringify({ id, label, valueIds: values.map((v) => v.id) }),
    ],
  );
  for (const value of values)
    await db.query(
      `INSERT INTO ontology_classification_values(id,scheme_id,value,label,definition,evidence_required,source_ids,metadata)
       VALUES($1,$2,$1,$3,$4,$5,$6,$7)
       ON CONFLICT(id) DO UPDATE SET scheme_id=EXCLUDED.scheme_id,value=EXCLUDED.value,label=EXCLUDED.label,definition=EXCLUDED.definition,evidence_required=EXCLUDED.evidence_required,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        value.id,
        id,
        requiredString(value, "label"),
        requiredString(value, "description"),
        true,
        requiredStrings(value, "sourceIds"),
        JSON.stringify(value),
      ],
    );
}

export async function syncOntology(
  db: Pick<AtlasDatabase, "query">,
  suppliedSeed?: OntologyPersistenceSeed,
) {
  const seed = suppliedSeed ?? defaultSeed();
  validateSourceReferences(seed);

  // The Phase 15 ontology tables are deterministic seed projections. Reconcile
  // obsolete dependents first and obsolete parents last to preserve every FK.
  await deleteObsoleteDependentRows(db, seed);

  for (const source of seed.sources)
    await db.query(
      `INSERT INTO ontology_sources(id,label,url,source_type,perspective,metadata)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(id) DO UPDATE SET label=EXCLUDED.label,url=EXCLUDED.url,source_type=EXCLUDED.source_type,perspective=EXCLUDED.perspective,metadata=EXCLUDED.metadata`,
      [
        source.id,
        requiredString(source, "label"),
        requiredString(source, "url"),
        requiredString(source, "kind"),
        requiredString(source, "perspective"),
        JSON.stringify(source),
      ],
    );

  for (const concept of seed.concepts)
    await db.query(
      `INSERT INTO ontology_concepts(id,canonical_name,definition,concept_kind,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(id) DO UPDATE SET canonical_name=EXCLUDED.canonical_name,definition=EXCLUDED.definition,concept_kind=EXCLUDED.concept_kind,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        concept.id,
        requiredString(concept, "label"),
        requiredString(concept, "description"),
        requiredString(concept, "level"),
        requiredStrings(concept, "sourceIds"),
        JSON.stringify(concept),
      ],
    );

  for (const edge of seed.conceptEdges)
    await db.query(
      `INSERT INTO ontology_concept_edges(id,broader_id,narrower_id,relationship_type,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(id) DO UPDATE SET broader_id=EXCLUDED.broader_id,narrower_id=EXCLUDED.narrower_id,relationship_type=EXCLUDED.relationship_type,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        edge.id,
        requiredString(edge, "broaderId"),
        requiredString(edge, "narrowerId"),
        requiredString(edge, "kind"),
        requiredStrings(edge, "sourceIds"),
        JSON.stringify(edge),
      ],
    );

  for (const term of seed.conceptTerms)
    await db.query(
      `INSERT INTO ontology_concept_terms(id,concept_id,term,language,script,transliteration,semantic_relation,semantic_scope,note,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT(id) DO UPDATE SET concept_id=EXCLUDED.concept_id,term=EXCLUDED.term,language=EXCLUDED.language,script=EXCLUDED.script,transliteration=EXCLUDED.transliteration,semantic_relation=EXCLUDED.semantic_relation,semantic_scope=EXCLUDED.semantic_scope,note=EXCLUDED.note,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        term.id,
        requiredString(term, "conceptId"),
        requiredString(term, "term"),
        requiredString(term, "language"),
        requiredString(term, "script"),
        nullableString(term, "transliteration"),
        requiredString(term, "semanticRelation"),
        requiredString(term, "scope"),
        requiredString(term, "note"),
        requiredStrings(term, "sourceIds"),
        JSON.stringify(term),
      ],
    );

  for (const entity of seed.entities)
    await db.query(
      `INSERT INTO ontology_entities(id,canonical_name,entity_type,description,earliest_attestation,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT(id) DO UPDATE SET canonical_name=EXCLUDED.canonical_name,entity_type=EXCLUDED.entity_type,description=EXCLUDED.description,earliest_attestation=EXCLUDED.earliest_attestation,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        entity.id,
        requiredString(entity, "canonicalName"),
        requiredString(entity, "entityType"),
        requiredString(entity, "description"),
        requiredString(entity, "earliestAttestation"),
        requiredStrings(entity, "sourceIds"),
        JSON.stringify(entity),
      ],
    );

  for (const assertion of seed.nameAssertions)
    await db.query(
      `INSERT INTO ontology_name_assertions(id,entity_id,asserted_name,normalized_name,assertion_kind,language,script,transliteration,scope,confidence,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT(id) DO UPDATE SET entity_id=EXCLUDED.entity_id,asserted_name=EXCLUDED.asserted_name,normalized_name=EXCLUDED.normalized_name,assertion_kind=EXCLUDED.assertion_kind,language=EXCLUDED.language,script=EXCLUDED.script,transliteration=EXCLUDED.transliteration,scope=EXCLUDED.scope,confidence=EXCLUDED.confidence,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        assertion.id,
        requiredString(assertion, "entityId"),
        requiredString(assertion, "name"),
        requiredString(assertion, "normalizedName"),
        requiredString(assertion, "assertionType"),
        nullableString(assertion, "language"),
        nullableString(assertion, "script"),
        nullableString(assertion, "transliteration"),
        requiredString(assertion, "scope"),
        requiredString(assertion, "confidence"),
        requiredStrings(assertion, "sourceIds"),
        JSON.stringify(assertion),
      ],
    );

  for (const occurrence of seed.occurrences)
    await db.query(
      `INSERT INTO ontology_occurrences(id,entity_id,attested_form,language,script,transliteration,work_id,source_id,locator,role_or_context,description,confidence,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT(id) DO UPDATE SET entity_id=EXCLUDED.entity_id,attested_form=EXCLUDED.attested_form,language=EXCLUDED.language,script=EXCLUDED.script,transliteration=EXCLUDED.transliteration,work_id=EXCLUDED.work_id,source_id=EXCLUDED.source_id,locator=EXCLUDED.locator,role_or_context=EXCLUDED.role_or_context,description=EXCLUDED.description,confidence=EXCLUDED.confidence,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        occurrence.id,
        requiredString(occurrence, "entityId"),
        requiredString(occurrence, "attestedForm"),
        requiredString(occurrence, "language"),
        requiredString(occurrence, "script"),
        nullableString(occurrence, "transliteration"),
        nullableString(occurrence, "workId"),
        requiredString(occurrence, "sourceId"),
        requiredString(occurrence, "locator"),
        requiredString(occurrence, "role"),
        requiredString(occurrence, "description"),
        requiredString(occurrence, "confidence"),
        requiredStrings(occurrence, "sourceIds"),
        JSON.stringify(occurrence),
      ],
    );

  for (const relationship of seed.relationships)
    await db.query(
      `INSERT INTO ontology_contextual_relationships(id,source_entity_id,target_entity_id,relationship_type,context_summary,scope,start_date,end_date,confidence,is_equivalence,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT(id) DO UPDATE SET source_entity_id=EXCLUDED.source_entity_id,target_entity_id=EXCLUDED.target_entity_id,relationship_type=EXCLUDED.relationship_type,context_summary=EXCLUDED.context_summary,scope=EXCLUDED.scope,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,confidence=EXCLUDED.confidence,is_equivalence=EXCLUDED.is_equivalence,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        relationship.id,
        requiredString(relationship, "sourceEntityId"),
        requiredString(relationship, "targetEntityId"),
        requiredString(relationship, "relationshipType"),
        requiredString(relationship, "summary"),
        requiredString(relationship, "scope"),
        nullableString(relationship, "startDate"),
        nullableString(relationship, "endDate"),
        requiredString(relationship, "confidence"),
        false,
        requiredStrings(relationship, "sourceIds"),
        JSON.stringify(relationship),
      ],
    );

  for (const path of seed.evolutionPaths)
    await db.query(
      `INSERT INTO ontology_evolution_paths(id,entity_id,title,summary,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(id) DO UPDATE SET entity_id=EXCLUDED.entity_id,title=EXCLUDED.title,summary=EXCLUDED.summary,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        path.id,
        requiredString(path, "entityId"),
        requiredString(path, "title"),
        requiredString(path, "summary"),
        requiredStrings(path, "sourceIds"),
        JSON.stringify(path),
      ],
    );

  for (const stage of seed.evolutionStages)
    await db.query(
      `INSERT INTO ontology_evolution_stages(id,path_id,entity_id,sequence,stage_type,stage_label,date_label,role_or_interpretation,summary,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT(id) DO UPDATE SET path_id=EXCLUDED.path_id,entity_id=EXCLUDED.entity_id,sequence=EXCLUDED.sequence,stage_type=EXCLUDED.stage_type,stage_label=EXCLUDED.stage_label,date_label=EXCLUDED.date_label,role_or_interpretation=EXCLUDED.role_or_interpretation,summary=EXCLUDED.summary,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        stage.id,
        requiredString(stage, "pathId"),
        requiredString(stage, "entityId"),
        requiredInteger(stage, "sequence"),
        requiredString(stage, "stageType"),
        requiredString(stage, "label"),
        requiredString(stage, "dateLabel"),
        requiredString(stage, "role"),
        requiredString(stage, "summary"),
        requiredStrings(stage, "sourceIds"),
        JSON.stringify(stage),
      ],
    );

  for (const conflictCase of seed.conflictCases)
    await db.query(
      `INSERT INTO ontology_conflict_cases(id,name,start_date,end_date,date_label,locations,actors,summary,stated_cause,participant_justifications,scholarly_interpretations,disputed_causation,uncertainty,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,date_label=EXCLUDED.date_label,locations=EXCLUDED.locations,actors=EXCLUDED.actors,summary=EXCLUDED.summary,stated_cause=EXCLUDED.stated_cause,participant_justifications=EXCLUDED.participant_justifications,scholarly_interpretations=EXCLUDED.scholarly_interpretations,disputed_causation=EXCLUDED.disputed_causation,uncertainty=EXCLUDED.uncertainty,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        conflictCase.id,
        requiredString(conflictCase, "name"),
        requiredString(conflictCase, "startDate"),
        requiredString(conflictCase, "endDate"),
        requiredString(conflictCase, "dateLabel"),
        requiredTextList(conflictCase, "locations"),
        requiredTextList(conflictCase, "actors"),
        requiredString(conflictCase, "summary"),
        requiredString(conflictCase, "statedCause"),
        requiredTextList(conflictCase, "participantJustifications"),
        requiredTextList(conflictCase, "scholarlyInterpretations"),
        requiredString(conflictCase, "disputedCausation"),
        requiredString(conflictCase, "uncertainty"),
        requiredStrings(conflictCase, "sourceIds"),
        JSON.stringify(conflictCase),
      ],
    );

  for (const conversionCase of seed.conversionCases)
    await db.query(
      `INSERT INTO ontology_conversion_cases(id,name,start_date,end_date,date_label,locations,actors,summary,stated_policy,stated_justification,resistance_continuity,disputes_uncertainty,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,date_label=EXCLUDED.date_label,locations=EXCLUDED.locations,actors=EXCLUDED.actors,summary=EXCLUDED.summary,stated_policy=EXCLUDED.stated_policy,stated_justification=EXCLUDED.stated_justification,resistance_continuity=EXCLUDED.resistance_continuity,disputes_uncertainty=EXCLUDED.disputes_uncertainty,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        conversionCase.id,
        requiredString(conversionCase, "name"),
        requiredString(conversionCase, "startDate"),
        requiredString(conversionCase, "endDate"),
        requiredString(conversionCase, "dateLabel"),
        requiredTextList(conversionCase, "locations"),
        requiredTextList(conversionCase, "actors"),
        requiredString(conversionCase, "summary"),
        requiredString(conversionCase, "statedPolicy"),
        requiredString(conversionCase, "statedJustification"),
        requiredString(conversionCase, "resistanceContinuity"),
        requiredString(conversionCase, "disputesUncertainty"),
        requiredStrings(conversionCase, "sourceIds"),
        JSON.stringify(conversionCase),
      ],
    );

  await upsertClassificationScheme(
    db,
    classificationSchemeIds.conflictCauses,
    "Conflict causes",
    seed.conflictCauses,
  );
  await upsertClassificationScheme(
    db,
    classificationSchemeIds.conversionModes,
    "Conversion modes",
    seed.conversionModes,
  );

  for (const assignment of seed.conflictCauseAssignments)
    await db.query(
      `INSERT INTO ontology_conflict_cause_assignments(id,conflict_case_id,cause_id,evidence,evidence_basis,confidence,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT(id) DO UPDATE SET conflict_case_id=EXCLUDED.conflict_case_id,cause_id=EXCLUDED.cause_id,evidence=EXCLUDED.evidence,evidence_basis=EXCLUDED.evidence_basis,confidence=EXCLUDED.confidence,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        assignment.id,
        requiredString(assignment, "conflictCaseId"),
        requiredString(assignment, "causeId"),
        requiredString(assignment, "evidence"),
        requiredString(assignment, "evidenceBasis"),
        requiredString(assignment, "confidence"),
        requiredStrings(assignment, "sourceIds"),
        JSON.stringify(assignment),
      ],
    );

  for (const assignment of seed.conversionModeAssignments)
    await db.query(
      `INSERT INTO ontology_conversion_mode_assignments(id,conversion_case_id,mode_id,evidence,evidence_standard,confidence,source_ids,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT(id) DO UPDATE SET conversion_case_id=EXCLUDED.conversion_case_id,mode_id=EXCLUDED.mode_id,evidence=EXCLUDED.evidence,evidence_standard=EXCLUDED.evidence_standard,confidence=EXCLUDED.confidence,source_ids=EXCLUDED.source_ids,metadata=EXCLUDED.metadata`,
      [
        assignment.id,
        requiredString(assignment, "conversionCaseId"),
        requiredString(assignment, "modeId"),
        requiredString(assignment, "evidence"),
        requiredString(assignment, "evidenceStandard"),
        requiredString(assignment, "confidence"),
        requiredStrings(assignment, "sourceIds"),
        JSON.stringify(assignment),
      ],
    );

  await deleteObsoleteClassificationValues(db, seed);

  await deleteObsoleteParentRows(db, seed);
}

function metadata<T>(value: unknown): T {
  return (typeof value === "string" ? JSON.parse(value) : value) as T;
}

type MetadataRow = { metadata: unknown };

async function allMetadata(
  db: Pick<AtlasDatabase, "query">,
  sql: string,
  params?: unknown[],
) {
  return (await db.query<MetadataRow>(sql, params)).rows.map((row) =>
    metadata<SeedRecord>(row.metadata),
  );
}

function collectSourceIds(records: SeedRecord[]) {
  return [
    ...new Set(
      records.flatMap((record) => {
        const sourceIds = record.sourceIds;
        return Array.isArray(sourceIds)
          ? sourceIds.filter((id): id is string => typeof id === "string")
          : [];
      }),
    ),
  ];
}

async function readSources(
  db: Pick<AtlasDatabase, "query">,
  sourceIds?: string[],
) {
  if (sourceIds && sourceIds.length === 0) return [];
  return allMetadata(
    db,
    sourceIds
      ? "SELECT metadata FROM ontology_sources WHERE id=ANY($1::text[]) ORDER BY lower(label),id"
      : "SELECT metadata FROM ontology_sources ORDER BY lower(label),id",
    sourceIds ? [sourceIds] : undefined,
  );
}

export async function readClassificationCases(
  db: Pick<AtlasDatabase, "query">,
) {
  const [
    conflictCases,
    conflictAssignments,
    conversionCases,
    conversionAssignments,
  ] = await Promise.all([
    allMetadata(
      db,
      "SELECT metadata FROM ontology_conflict_cases ORDER BY lower(name),id",
    ),
    allMetadata(
      db,
      "SELECT metadata FROM ontology_conflict_cause_assignments ORDER BY conflict_case_id,id",
    ),
    allMetadata(
      db,
      "SELECT metadata FROM ontology_conversion_cases ORDER BY lower(name),id",
    ),
    allMetadata(
      db,
      "SELECT metadata FROM ontology_conversion_mode_assignments ORDER BY conversion_case_id,id",
    ),
  ]);
  return {
    conflictCases: conflictCases.map((conflictCase) => ({
      ...conflictCase,
      assignments: conflictAssignments.filter(
        (assignment) => assignment.conflictCaseId === conflictCase.id,
      ),
    })),
    conversionCases: conversionCases.map((conversionCase) => ({
      ...conversionCase,
      assignments: conversionAssignments.filter(
        (assignment) => assignment.conversionCaseId === conversionCase.id,
      ),
    })),
  };
}

export async function readOntology(db: Pick<AtlasDatabase, "query">) {
  const [concepts, edges, sources, schemes, classificationCases] =
    await Promise.all([
      allMetadata(
        db,
        "SELECT metadata FROM ontology_concepts ORDER BY concept_kind,lower(canonical_name),id",
      ),
      allMetadata(
        db,
        "SELECT metadata FROM ontology_concept_edges ORDER BY broader_id,narrower_id,id",
      ),
      readSources(db),
      db.query<{ id: string; label: string; evidence_required: boolean }>(
        "SELECT id,label,evidence_required FROM ontology_classification_schemes ORDER BY id",
      ),
      readClassificationCases(db),
    ]);
  const narrowerIds = new Set(edges.map((edge) => edge.narrowerId));
  const classificationSchemes = await Promise.all(
    schemes.rows.map(async (scheme) => ({
      id: scheme.id,
      label: scheme.label,
      evidenceRequired: scheme.evidence_required,
      values: await allMetadata(
        db,
        "SELECT metadata FROM ontology_classification_values WHERE scheme_id=$1 ORDER BY lower(label),id",
        [scheme.id],
      ),
    })),
  );
  return {
    concepts,
    edges,
    roots: concepts.filter((concept) => !narrowerIds.has(concept.id)),
    sources,
    classificationSchemes,
    ...classificationCases,
  };
}

export async function readConcept(
  db: Pick<AtlasDatabase, "query">,
  id: string,
) {
  const result = await db.query<MetadataRow>(
    "SELECT metadata FROM ontology_concepts WHERE id=$1",
    [id],
  );
  if (!result.rows.length) return null;
  const [broader, narrower, incomingEdges, outgoingEdges, terms] =
    await Promise.all([
      allMetadata(
        db,
        `SELECT c.metadata FROM ontology_concept_edges e
       JOIN ontology_concepts c ON c.id=e.broader_id
       WHERE e.narrower_id=$1 ORDER BY lower(c.canonical_name),c.id`,
        [id],
      ),
      allMetadata(
        db,
        `SELECT c.metadata FROM ontology_concept_edges e
       JOIN ontology_concepts c ON c.id=e.narrower_id
       WHERE e.broader_id=$1 ORDER BY lower(c.canonical_name),c.id`,
        [id],
      ),
      allMetadata(
        db,
        "SELECT metadata FROM ontology_concept_edges WHERE narrower_id=$1 ORDER BY broader_id,id",
        [id],
      ),
      allMetadata(
        db,
        "SELECT metadata FROM ontology_concept_edges WHERE broader_id=$1 ORDER BY narrower_id,id",
        [id],
      ),
      allMetadata(
        db,
        "SELECT metadata FROM ontology_concept_terms WHERE concept_id=$1 ORDER BY language,script,lower(term),id",
        [id],
      ),
    ]);
  const concept = metadata<SeedRecord>(result.rows[0].metadata);
  return {
    concept,
    broader,
    narrower,
    edges: { incoming: incomingEdges, outgoing: outgoingEdges },
    terms,
    sources: await readSources(
      db,
      collectSourceIds([concept, ...incomingEdges, ...outgoingEdges, ...terms]),
    ),
  };
}

export async function readEntity(db: Pick<AtlasDatabase, "query">, id: string) {
  const result = await db.query<MetadataRow>(
    "SELECT metadata FROM ontology_entities WHERE id=$1",
    [id],
  );
  if (!result.rows.length) return null;
  const [names, relationships, occurrenceCount, paths] = await Promise.all([
    allMetadata(
      db,
      "SELECT metadata FROM ontology_name_assertions WHERE entity_id=$1 ORDER BY lower(asserted_name),id",
      [id],
    ),
    allMetadata(
      db,
      `SELECT metadata FROM ontology_contextual_relationships
       WHERE source_entity_id=$1 OR target_entity_id=$1 ORDER BY id`,
      [id],
    ),
    db.query<{ total: number }>(
      "SELECT count(*)::int AS total FROM ontology_occurrences WHERE entity_id=$1",
      [id],
    ),
    allMetadata(
      db,
      "SELECT metadata FROM ontology_evolution_paths WHERE entity_id=$1 ORDER BY id",
      [id],
    ),
  ]);
  const entity = metadata<SeedRecord>(result.rows[0].metadata);
  return {
    entity,
    names,
    relationships,
    occurrenceCount: occurrenceCount.rows[0].total,
    evolutionPaths: paths,
    sources: await readSources(
      db,
      collectSourceIds([entity, ...names, ...relationships, ...paths]),
    ),
  };
}

export async function readEntityOccurrences(
  db: Pick<AtlasDatabase, "query">,
  entityId: string,
) {
  const entity = await db.query<{ id: string }>(
    "SELECT id FROM ontology_entities WHERE id=$1",
    [entityId],
  );
  if (!entity.rows.length) return null;
  const items = await allMetadata(
    db,
    `SELECT metadata FROM ontology_occurrences
     WHERE entity_id=$1 ORDER BY id`,
    [entityId],
  );
  return {
    entityId,
    items,
    total: items.length,
    sources: await readSources(db, collectSourceIds(items)),
  };
}

export async function readEvolution(
  db: Pick<AtlasDatabase, "query">,
  entityOrPathId: string,
) {
  const paths = await db.query<{
    id: string;
    entity_id: string;
    metadata: unknown;
  }>(
    `SELECT id,entity_id,metadata FROM ontology_evolution_paths
     WHERE entity_id=$1 OR id=$1 ORDER BY id`,
    [entityOrPathId],
  );
  if (!paths.rows.length) return null;
  const hydratedPaths = await Promise.all(
    paths.rows.map(async (path) => ({
      ...metadata<SeedRecord>(path.metadata),
      stages: await allMetadata(
        db,
        `SELECT metadata FROM ontology_evolution_stages
         WHERE path_id=$1 ORDER BY sequence,id`,
        [path.id],
      ),
    })),
  );
  return {
    entityId: paths.rows[0].entity_id,
    paths: hydratedPaths,
    sources: await readSources(
      db,
      collectSourceIds(
        hydratedPaths.flatMap((path) => [
          path,
          ...((path.stages as SeedRecord[]) ?? []),
        ]),
      ),
    ),
  };
}
