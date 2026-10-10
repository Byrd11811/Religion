import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { NextRequest } from "next/server";
import { GET } from "../app/api/[...path]/route";
import type { AtlasDatabase } from "../packages/db/client";
import {
  classificationSchemeIds,
  readClassificationCases,
  readConcept,
  readEntity,
  readEntityOccurrences,
  readEvolution,
  readOntology,
  syncOntology,
} from "../packages/db/ontology";
import type { OntologyPersistenceSeed } from "../packages/db/ontology";
import {
  conflictCases,
  conflictCauseAssignments,
  conflictCauseVocabulary,
  conversionCases,
  conversionModeAssignments,
  conversionModeVocabulary,
  entityEvolutionPaths,
  entityEvolutionStages,
  entityNameAssertions,
  entityOccurrences,
  entityRelationships,
  ontologyConceptEdges,
  ontologyConceptTerms,
  ontologyConcepts,
  ontologyEntities,
  ontologySources,
} from "../packages/shared/ontology-entities";
import { themes } from "../packages/ontology";
import { allPassages } from "../packages/search";

async function count(db: PGlite, table: string) {
  const allowed = new Set([
    "ontology_sources",
    "ontology_concepts",
    "ontology_concept_edges",
    "ontology_concept_terms",
    "ontology_entities",
    "ontology_name_assertions",
    "ontology_occurrences",
    "ontology_contextual_relationships",
    "ontology_evolution_paths",
    "ontology_evolution_stages",
    "ontology_classification_values",
    "ontology_conflict_cases",
    "ontology_conflict_cause_assignments",
    "ontology_conversion_cases",
    "ontology_conversion_mode_assignments",
  ]);
  if (!allowed.has(table)) throw new Error(`Unexpected table ${table}`);
  const result = await db.query<{ total: number }>(
    `SELECT count(*)::int AS total FROM ${table}`,
  );
  return result.rows[0].total;
}

function completePersistenceSeed(): OntologyPersistenceSeed {
  return structuredClone({
    sources: ontologySources,
    concepts: ontologyConcepts,
    conceptEdges: ontologyConceptEdges,
    conceptTerms: ontologyConceptTerms,
    entities: ontologyEntities,
    nameAssertions: entityNameAssertions,
    occurrences: entityOccurrences,
    relationships: entityRelationships,
    evolutionPaths: entityEvolutionPaths,
    evolutionStages: entityEvolutionStages,
    conflictCauses: conflictCauseVocabulary,
    conversionModes: conversionModeVocabulary,
    conflictCases,
    conflictCauseAssignments,
    conversionCases,
    conversionModeAssignments,
  }) as unknown as OntologyPersistenceSeed;
}

function reducedRenamedSeed() {
  const seed = completePersistenceSeed();
  const conceptIds = new Set([
    "religion-and-worldview",
    "cosmology-origins-world-order",
    "creation",
  ]);
  seed.concepts = seed.concepts.filter(({ id }) => conceptIds.has(id));
  seed.conceptEdges = seed.conceptEdges.filter(
    (edge) =>
      conceptIds.has(String(edge.broaderId)) &&
      conceptIds.has(String(edge.narrowerId)),
  );
  seed.conceptTerms = seed.conceptTerms.filter((term) =>
    conceptIds.has(String(term.conceptId)),
  );

  seed.entities = seed.entities.filter(({ id }) => id === "anunna");
  seed.nameAssertions = seed.nameAssertions.filter(
    (assertion) => assertion.entityId === "anunna",
  );
  seed.occurrences = seed.occurrences.filter(
    (occurrence) => occurrence.entityId === "anunna",
  );
  seed.relationships = [];
  seed.evolutionPaths = seed.evolutionPaths.filter(
    ({ id }) => id === "path-anunna",
  );
  seed.evolutionStages = seed.evolutionStages.filter(
    (stage) => stage.pathId === "path-anunna",
  );
  seed.conflictCases = seed.conflictCases.slice(0, 1);
  seed.conflictCauseAssignments = seed.conflictCauseAssignments
    .filter(
      (assignment) => assignment.conflictCaseId === seed.conflictCases[0].id,
    )
    .slice(0, 1);
  seed.conflictCauses = seed.conflictCauses.filter(
    ({ id }) => id === seed.conflictCauseAssignments[0].causeId,
  );
  seed.conversionCases = seed.conversionCases.slice(0, 1);
  seed.conversionModeAssignments = seed.conversionModeAssignments
    .filter(
      (assignment) =>
        assignment.conversionCaseId === seed.conversionCases[0].id,
    )
    .slice(0, 1);
  seed.conversionModes = seed.conversionModes.filter(
    ({ id }) => id === seed.conversionModeAssignments[0].modeId,
  );

  const renamedEdge = seed.conceptEdges.find(
    (edge) => edge.narrowerId === "creation",
  );
  assert.ok(renamedEdge);
  const originalEdgeId = renamedEdge.id;
  renamedEdge.id = `${originalEdgeId}-renamed`;

  const renamedStage = seed.evolutionStages[0];
  assert.ok(renamedStage);
  const originalStageId = renamedStage.id;
  renamedStage.id = `${originalStageId}-renamed`;

  const renamedConflictAssignment = seed.conflictCauseAssignments[0];
  assert.ok(renamedConflictAssignment);
  const originalConflictAssignmentId = renamedConflictAssignment.id;
  renamedConflictAssignment.id = `${originalConflictAssignmentId}-renamed`;

  const sourceIds = new Set<string>();
  for (const collection of [
    seed.concepts,
    seed.conceptEdges,
    seed.conceptTerms,
    seed.entities,
    seed.nameAssertions,
    seed.occurrences,
    seed.relationships,
    seed.evolutionPaths,
    seed.evolutionStages,
    seed.conflictCauses,
    seed.conversionModes,
    seed.conflictCases,
    seed.conflictCauseAssignments,
    seed.conversionCases,
    seed.conversionModeAssignments,
  ])
    for (const record of collection) {
      if (Array.isArray(record.sourceIds))
        for (const sourceId of record.sourceIds)
          if (typeof sourceId === "string") sourceIds.add(sourceId);
      if (typeof record.sourceId === "string") sourceIds.add(record.sourceId);
    }
  seed.sources = seed.sources.filter(({ id }) => sourceIds.has(id));

  return {
    seed,
    originalEdgeId,
    renamedEdgeId: renamedEdge.id,
    originalStageId,
    renamedStageId: renamedStage.id,
    originalConflictAssignmentId,
    renamedConflictAssignmentId: renamedConflictAssignment.id,
  };
}

async function hasId(db: PGlite, table: string, id: string) {
  const allowed = new Set([
    "ontology_sources",
    "ontology_concepts",
    "ontology_concept_edges",
    "ontology_entities",
    "ontology_evolution_stages",
    "ontology_conflict_cases",
    "ontology_conflict_cause_assignments",
    "ontology_conversion_cases",
    "ontology_conversion_mode_assignments",
  ]);
  if (!allowed.has(table)) throw new Error(`Unexpected table ${table}`);
  const result = await db.query<{ found: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM ${table} WHERE id=$1) AS found`,
    [id],
  );
  return result.rows[0].found;
}

test("ontology synchronization removes stale rows and restores the complete seed", async () => {
  const db = new PGlite({ extensions: { vector } });
  try {
    await db.waitReady;
    await db.exec(readFileSync("packages/db/schema.sql", "utf8"));
    await syncOntology(db);

    const reduced = reducedRenamedSeed();
    const removedSourceId = ontologySources.find(
      ({ id }) => !reduced.seed.sources.some((source) => source.id === id),
    )?.id;
    assert.ok(removedSourceId);
    await syncOntology(db, reduced.seed);

    assert.equal(
      await count(db, "ontology_sources"),
      reduced.seed.sources.length,
    );
    assert.equal(
      await count(db, "ontology_concepts"),
      reduced.seed.concepts.length,
    );
    assert.equal(
      await count(db, "ontology_concept_edges"),
      reduced.seed.conceptEdges.length,
    );
    assert.equal(
      await count(db, "ontology_entities"),
      reduced.seed.entities.length,
    );
    assert.equal(
      await count(db, "ontology_evolution_stages"),
      reduced.seed.evolutionStages.length,
    );
    assert.equal(
      await count(db, "ontology_classification_values"),
      reduced.seed.conflictCauses.length + reduced.seed.conversionModes.length,
    );
    assert.equal(
      await count(db, "ontology_conflict_cases"),
      reduced.seed.conflictCases.length,
    );
    assert.equal(
      await count(db, "ontology_conflict_cause_assignments"),
      reduced.seed.conflictCauseAssignments.length,
    );
    assert.equal(
      await count(db, "ontology_conversion_cases"),
      reduced.seed.conversionCases.length,
    );
    assert.equal(
      await count(db, "ontology_conversion_mode_assignments"),
      reduced.seed.conversionModeAssignments.length,
    );
    assert.equal(await hasId(db, "ontology_concepts", "cosmology"), false);
    assert.equal(await hasId(db, "ontology_entities", "enki-ea"), false);
    assert.equal(await hasId(db, "ontology_sources", removedSourceId), false);
    assert.equal(
      await hasId(db, "ontology_concept_edges", reduced.originalEdgeId),
      false,
    );
    assert.equal(
      await hasId(db, "ontology_concept_edges", reduced.renamedEdgeId),
      true,
    );
    assert.equal(
      await hasId(db, "ontology_evolution_stages", reduced.originalStageId),
      false,
    );
    assert.equal(
      await hasId(db, "ontology_evolution_stages", reduced.renamedStageId),
      true,
    );
    assert.equal(
      await hasId(
        db,
        "ontology_conflict_cause_assignments",
        reduced.originalConflictAssignmentId,
      ),
      false,
    );
    assert.equal(
      await hasId(
        db,
        "ontology_conflict_cause_assignments",
        reduced.renamedConflictAssignmentId,
      ),
      true,
    );

    await syncOntology(db);
    assert.equal(await count(db, "ontology_sources"), ontologySources.length);
    assert.equal(await count(db, "ontology_concepts"), ontologyConcepts.length);
    assert.equal(
      await count(db, "ontology_concept_edges"),
      ontologyConceptEdges.length,
    );
    assert.equal(
      await count(db, "ontology_concept_terms"),
      ontologyConceptTerms.length,
    );
    assert.equal(await count(db, "ontology_entities"), ontologyEntities.length);
    assert.equal(
      await count(db, "ontology_name_assertions"),
      entityNameAssertions.length,
    );
    assert.equal(
      await count(db, "ontology_occurrences"),
      entityOccurrences.length,
    );
    assert.equal(
      await count(db, "ontology_contextual_relationships"),
      entityRelationships.length,
    );
    assert.equal(
      await count(db, "ontology_evolution_paths"),
      entityEvolutionPaths.length,
    );
    assert.equal(
      await count(db, "ontology_evolution_stages"),
      entityEvolutionStages.length,
    );
    assert.equal(
      await count(db, "ontology_classification_values"),
      conflictCauseVocabulary.length + conversionModeVocabulary.length,
    );
    assert.equal(
      await count(db, "ontology_conflict_cases"),
      conflictCases.length,
    );
    assert.equal(
      await count(db, "ontology_conflict_cause_assignments"),
      conflictCauseAssignments.length,
    );
    assert.equal(
      await count(db, "ontology_conversion_cases"),
      conversionCases.length,
    );
    assert.equal(
      await count(db, "ontology_conversion_mode_assignments"),
      conversionModeAssignments.length,
    );
    assert.equal(
      await hasId(db, "ontology_concept_edges", reduced.renamedEdgeId),
      false,
    );
    assert.equal(
      await hasId(db, "ontology_concept_edges", reduced.originalEdgeId),
      true,
    );
    assert.equal(
      await hasId(db, "ontology_evolution_stages", reduced.renamedStageId),
      false,
    );
    assert.equal(
      await hasId(db, "ontology_evolution_stages", reduced.originalStageId),
      true,
    );
    assert.equal(
      await hasId(
        db,
        "ontology_conflict_cause_assignments",
        reduced.renamedConflictAssignmentId,
      ),
      false,
    );
    assert.equal(
      await hasId(
        db,
        "ontology_conflict_cause_assignments",
        reduced.originalConflictAssignmentId,
      ),
      true,
    );
  } finally {
    await db.close();
  }
});

test("ontology persistence is normalized, source-backed, and idempotent", async () => {
  const db = new PGlite({ extensions: { vector } });
  const state = globalThis as unknown as {
    atlasDatabase?: Promise<AtlasDatabase>;
  };
  try {
    await db.waitReady;
    await db.exec(readFileSync("packages/db/schema.sql", "utf8"));
    await syncOntology(db);
    await syncOntology(db);

    for (const theme of themes)
      await db.query(
        "INSERT INTO themes(id,name) VALUES($1,$1) ON CONFLICT DO NOTHING",
        [theme],
      );
    const seededPassageThemes = [
      ...new Set(allPassages().flatMap((passage) => passage.themes)),
    ].sort();
    const persistedPassageThemes = await db.query<{ id: string }>(
      "SELECT id FROM themes WHERE id=ANY($1::text[]) ORDER BY id",
      [seededPassageThemes],
    );
    assert.deepEqual(
      persistedPassageThemes.rows.map(({ id }) => id),
      seededPassageThemes,
    );

    assert.equal(await count(db, "ontology_sources"), ontologySources.length);
    assert.equal(await count(db, "ontology_concepts"), 89);
    assert.equal(await count(db, "ontology_concept_edges"), 115);
    assert.equal(await count(db, "ontology_concept_terms"), 20);
    assert.equal(await count(db, "ontology_entities"), 17);
    assert.equal(await count(db, "ontology_name_assertions"), 73);
    assert.equal(await count(db, "ontology_occurrences"), 54);
    assert.equal(await count(db, "ontology_contextual_relationships"), 8);
    assert.equal(await count(db, "ontology_evolution_paths"), 9);
    assert.equal(await count(db, "ontology_evolution_stages"), 28);
    assert.equal(
      await count(db, "ontology_classification_values"),
      conflictCauseVocabulary.length + conversionModeVocabulary.length,
    );
    assert.equal(await count(db, "ontology_conflict_cases"), 2);
    assert.equal(await count(db, "ontology_conflict_cause_assignments"), 9);
    assert.equal(await count(db, "ontology_conversion_cases"), 2);
    assert.equal(await count(db, "ontology_conversion_mode_assignments"), 7);

    assert.equal(ontologyConcepts.length, 89);
    assert.equal(ontologyConceptEdges.length, 115);
    assert.equal(ontologyConceptTerms.length, 20);
    assert.equal(ontologyEntities.length, 17);
    assert.equal(entityNameAssertions.length, 73);
    assert.equal(entityOccurrences.length, 54);
    assert.equal(entityRelationships.length, 8);
    assert.equal(entityEvolutionPaths.length, 9);
    assert.equal(entityEvolutionStages.length, 28);
    assert.equal(conflictCauseVocabulary.length, 15);
    assert.equal(conversionModeVocabulary.length, 17);
    assert.equal(conflictCases.length, 2);
    assert.equal(conflictCauseAssignments.length, 9);
    assert.equal(conversionCases.length, 2);
    assert.equal(conversionModeAssignments.length, 7);
    const missingSources = await db.query<{ total: number }>(
      `SELECT count(*)::int AS total
       FROM (
         SELECT unnest(source_ids) AS source_id FROM ontology_concepts
         UNION ALL SELECT unnest(source_ids) FROM ontology_concept_edges
         UNION ALL SELECT unnest(source_ids) FROM ontology_concept_terms
         UNION ALL SELECT unnest(source_ids) FROM ontology_entities
         UNION ALL SELECT unnest(source_ids) FROM ontology_name_assertions
         UNION ALL SELECT unnest(source_ids) FROM ontology_occurrences
         UNION ALL SELECT unnest(source_ids) FROM ontology_contextual_relationships
         UNION ALL SELECT unnest(source_ids) FROM ontology_evolution_paths
         UNION ALL SELECT unnest(source_ids) FROM ontology_evolution_stages
         UNION ALL SELECT unnest(source_ids) FROM ontology_classification_values
         UNION ALL SELECT unnest(source_ids) FROM ontology_conflict_cases
         UNION ALL SELECT unnest(source_ids) FROM ontology_conflict_cause_assignments
         UNION ALL SELECT unnest(source_ids) FROM ontology_conversion_cases
         UNION ALL SELECT unnest(source_ids) FROM ontology_conversion_mode_assignments
       ) source_references
       LEFT JOIN ontology_sources sources ON sources.id=source_references.source_id
       WHERE sources.id IS NULL`,
    );
    assert.equal(missingSources.rows[0].total, 0);

    const invalidCaseAssignments = await db.query<{ total: number }>(
      `SELECT count(*)::int AS total
       FROM (
         SELECT a.id
         FROM ontology_conflict_cause_assignments a
         LEFT JOIN ontology_conflict_cases c ON c.id=a.conflict_case_id
         LEFT JOIN ontology_classification_values v ON v.id=a.cause_id
         WHERE c.id IS NULL OR v.id IS NULL OR v.scheme_id<>$1
         UNION ALL
         SELECT a.id
         FROM ontology_conversion_mode_assignments a
         LEFT JOIN ontology_conversion_cases c ON c.id=a.conversion_case_id
         LEFT JOIN ontology_classification_values v ON v.id=a.mode_id
         WHERE c.id IS NULL OR v.id IS NULL OR v.scheme_id<>$2
       ) invalid`,
      [
        classificationSchemeIds.conflictCauses,
        classificationSchemeIds.conversionModes,
      ],
    );
    assert.equal(invalidCaseAssignments.rows[0].total, 0);

    const overview = await readOntology(db);
    assert.deepEqual(
      overview.roots.map(({ id }) => id),
      ["religion-and-worldview"],
    );
    assert.equal(overview.concepts.length, ontologyConcepts.length);
    assert.equal(overview.edges.length, ontologyConceptEdges.length);
    assert.equal(overview.sources.length, ontologySources.length);
    assert.deepEqual(
      overview.classificationSchemes.map(({ id, values }) => [
        id,
        values.length,
      ]),
      [
        [classificationSchemeIds.conflictCauses, 15],
        [classificationSchemeIds.conversionModes, 17],
      ],
    );
    assert.equal(overview.conflictCases.length, conflictCases.length);
    assert.equal(overview.conversionCases.length, conversionCases.length);
    assert.equal(
      overview.conflictCases.reduce(
        (total, conflictCase) => total + conflictCase.assignments.length,
        0,
      ),
      conflictCauseAssignments.length,
    );
    assert.equal(
      overview.conversionCases.reduce(
        (total, conversionCase) => total + conversionCase.assignments.length,
        0,
      ),
      conversionModeAssignments.length,
    );
    const classifiedCases = await readClassificationCases(db);
    assert.deepEqual(classifiedCases, {
      conflictCases: overview.conflictCases,
      conversionCases: overview.conversionCases,
    });
    assert.ok(
      classifiedCases.conflictCases.every((conflictCase) =>
        conflictCase.assignments.every(
          (assignment) =>
            typeof assignment.evidence === "string" &&
            Array.isArray(assignment.sourceIds) &&
            assignment.sourceIds.length > 0,
        ),
      ),
    );
    assert.ok(
      classifiedCases.conversionCases.every((conversionCase) =>
        conversionCase.assignments.every(
          (assignment) =>
            typeof assignment.evidence === "string" &&
            Array.isArray(assignment.sourceIds) &&
            assignment.sourceIds.length > 0,
        ),
      ),
    );

    const soul = await readConcept(db, "soul");
    assert.equal(soul?.concept.id, "soul");
    assert.ok(soul?.terms.some(({ id }) => id === "term-atman"));
    assert.ok(soul?.terms.some(({ id }) => id === "term-anatta"));
    assert.ok(soul?.edges.incoming.length);
    assert.ok(soul?.sources.length);

    const anunna = await readEntity(db, "anunna");
    assert.equal(anunna?.entity.canonicalName, "Anunna");
    assert.equal(anunna?.occurrenceCount, 9);
    assert.ok(anunna?.names.length);
    assert.ok(anunna?.sources.length);

    const occurrences = await readEntityOccurrences(db, "anunna");
    assert.equal(occurrences?.total, 9);
    assert.ok(
      occurrences?.items.every(
        (occurrence) => occurrence.entityId === "anunna" && occurrence.sourceId,
      ),
    );
    assert.ok(occurrences?.sources.length);

    const evolution = await readEvolution(db, "path-anunna");
    assert.equal(evolution?.entityId, "anunna");
    assert.equal(evolution?.paths[0].id, "path-anunna");
    assert.ok(evolution?.paths[0].stages.length);
    assert.ok(evolution?.sources.length);

    const relationshipFlags = await db.query<{ is_equivalence: boolean }>(
      "SELECT is_equivalence FROM ontology_contextual_relationships",
    );
    assert.ok(relationshipFlags.rows.every((row) => !row.is_equivalence));

    const distinctNames = await db.query<{
      entity_id: string;
      normalized_name: string;
    }>(
      `SELECT entity_id,normalized_name FROM ontology_name_assertions
       WHERE entity_id IN ('belial','baal')`,
    );
    assert.ok(
      !distinctNames.rows.some(
        (row) =>
          (row.entity_id === "belial" && row.normalized_name === "baal") ||
          (row.entity_id === "baal" && row.normalized_name === "belial"),
      ),
    );

    const fixtureEntity = ontologyEntities[0];
    await assert.rejects(
      db.query(
        `INSERT INTO ontology_name_assertions(id,entity_id,asserted_name,normalized_name,assertion_kind,scope,confidence,source_ids)
         VALUES('invalid-conflation',$1,'Later conflation','later conflation','later-conflation','Test-only invalid assertion','high',$2)`,
        [fixtureEntity.id, fixtureEntity.sourceIds],
      ),
      /check constraint/i,
    );
    await assert.rejects(
      db.query(
        `INSERT INTO ontology_contextual_relationships(id,source_entity_id,target_entity_id,relationship_type,context_summary,scope,confidence,is_equivalence,source_ids)
         VALUES('invalid-equivalence','belial','baal','later-conflation','Test-only invalid relationship','Test scope','low',true,$1)`,
        [ontologyEntities.find(({ id }) => id === "belial")!.sourceIds],
      ),
      /check constraint/i,
    );

    const routeDatabase: AtlasDatabase = {
      async exec(sql) {
        await db.exec(sql);
      },
      async query<T>(sql: string, params?: unknown[]) {
        const result = await db.query<T>(sql, params);
        return { rows: result.rows };
      },
    };
    state.atlasDatabase = Promise.resolve(routeDatabase);
    const request = async (path: string[]) => {
      const response = await GET(
        new NextRequest(`http://atlas.test/api/${path.join("/")}`),
        { params: Promise.resolve({ path }) },
      );
      return { response, body: await response.json() };
    };
    const ontologyResponse = await request(["ontology"]);
    assert.equal(ontologyResponse.response.status, 200);
    assert.deepEqual(
      ontologyResponse.body.roots.map(({ id }: { id: string }) => id),
      ["religion-and-worldview"],
    );
    assert.equal(ontologyResponse.body.conflictCases.length, 2);
    assert.equal(ontologyResponse.body.conversionCases.length, 2);
    assert.equal(
      ontologyResponse.body.conflictCases.reduce(
        (total: number, conflictCase: { assignments: unknown[] }) =>
          total + conflictCase.assignments.length,
        0,
      ),
      9,
    );
    assert.equal(
      ontologyResponse.body.conversionCases.reduce(
        (total: number, conversionCase: { assignments: unknown[] }) =>
          total + conversionCase.assignments.length,
        0,
      ),
      7,
    );
    const conceptResponse = await request(["concepts", "soul"]);
    assert.equal(conceptResponse.response.status, 200);
    assert.equal(conceptResponse.body.concept.id, "soul");
    const entityResponse = await request(["entities", "anunna"]);
    assert.equal(entityResponse.response.status, 200);
    assert.equal(entityResponse.body.occurrenceCount, 9);
    const occurrenceResponse = await request([
      "entities",
      "anunna",
      "occurrences",
    ]);
    assert.equal(occurrenceResponse.response.status, 200);
    assert.equal(occurrenceResponse.body.total, 9);
    const evolutionResponse = await request(["evolution", "path-anunna"]);
    assert.equal(evolutionResponse.response.status, 200);
    assert.equal(evolutionResponse.body.entityId, "anunna");
    assert.equal(
      (await request(["entities", "belial", "aliases"])).response.status,
      404,
    );
    assert.equal(
      (await request(["concepts", "not-a-concept"])).response.status,
      404,
    );
  } finally {
    delete state.atlasDatabase;
    await db.close();
  }
});
