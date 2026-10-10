import test from "node:test";
import assert from "node:assert/strict";
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
  validateOntologyEntityData,
} from "../packages/shared/ontology-entities";
import {
  concepts,
  detectConcepts,
  resolveOntologyEntities,
  themes,
  tokenize,
} from "../packages/ontology";
import {
  federatedSearch,
  tokenizeFederatedSearch,
} from "../packages/search/federated";
import { texts } from "../packages/shared/catalog";
import { allPassages } from "../packages/search";

const legacyConceptTerms: Record<string, string[]> = {
  afterlife: ["death", "dead", "immortal", "heaven", "hell", "soul"],
  creation: ["creation", "created", "beginning", "origin", "world"],
  flood: ["flood", "deluge", "waters", "ark"],
  suffering: ["suffering", "pain", "sorrow", "grief"],
  soul: ["soul", "self", "spirit", "mind"],
  reincarnation: ["rebirth", "birth", "born", "transmigration"],
  forgiveness: ["forgive", "forgiveness", "enemy", "enemies", "mercy"],
  evil: ["evil", "wicked", "sin", "satan"],
  wisdom: ["wisdom", "knowledge", "understanding", "truth"],
  law: ["law", "duty", "obedience", "command"],
  wealth: ["wealth", "rich", "poor", "poverty", "money"],
  peace: ["peace", "war", "violence", "battle"],
  enlightenment: ["enlightenment", "liberation", "desire", "nirvana"],
  ritual: ["prayer", "sacrifice", "ritual", "worship"],
  consciousness: ["consciousness", "mind", "perception", "reality"],
  judgment: ["judgment", "judgement", "punishment", "reward"],
  anunnaki: ["anunna", "anuna", "anunnaku", "anunnaki"],
};

test("Phase 15 ontology has the exact reviewed hierarchy and scoped terminology", () => {
  assert.equal(validateOntologyEntityData(), true);
  assert.equal(ontologyConcepts.length, 89);
  assert.equal(
    ontologyConcepts.filter((concept) => concept.level === "root").length,
    1,
  );
  assert.equal(
    ontologyConcepts.filter((concept) => concept.level === "branch").length,
    9,
  );
  assert.equal(
    ontologyConcepts.filter((concept) => concept.level === "concept").length,
    79,
  );
  assert.equal(ontologyConceptEdges.length, 115);
  assert.equal(
    ontologyConceptEdges.filter((edge) => edge.kind === "secondary").length,
    27,
  );
  assert.equal(ontologyConceptTerms.length, 20);
  assert.deepEqual(
    new Set(
      ontologyConcepts
        .filter((concept) => concept.level === "concept")
        .map((concept) => concept.id),
    ).has("rebirth"),
    true,
  );
  assert.ok(ontologyConcepts.some(({ id }) => id === "reincarnation"));
  assert.ok(ontologyConcepts.some(({ id }) => id === "consciousness"));
  assert.ok(ontologyConcepts.some(({ id }) => id === "mind"));
  assert.ok(ontologyConcepts.some(({ id }) => id === "soul"));
  assert.equal(
    ontologyConceptTerms.find(({ id }) => id === "term-anatta")
      ?.semanticRelation,
    "contrast",
  );
});

test("legacy concepts and every seeded passage theme remain compatible", () => {
  for (const [id, terms] of Object.entries(legacyConceptTerms)) {
    assert.ok(themes.includes(id), `${id} is missing from exported themes`);
    assert.ok(concepts[id], `${id} is missing from exported concepts`);
    assert.ok(
      terms.every((term) => concepts[id].includes(term)),
      `${id} lost a legacy discovery term`,
    );
  }
  const seededThemes = new Set(
    allPassages().flatMap((passage) => passage.themes),
  );
  assert.deepEqual(
    [...seededThemes].filter((theme) => !themes.includes(theme)),
    [],
  );
  assert.ok(seededThemes.has("anunnaki"));
});

test("Phase 15 entities keep names separate from contextual relationships", () => {
  assert.equal(ontologyEntities.length, 17);
  assert.equal(entityNameAssertions.length, 73);
  assert.equal(entityOccurrences.length, 54);
  assert.equal(entityRelationships.length, 8);
  assert.equal(entityEvolutionPaths.length, 9);
  assert.equal(entityEvolutionStages.length, 28);
  assert.equal(conflictCauseVocabulary.length, 15);
  assert.equal(conversionModeVocabulary.length, 17);
  assert.ok(
    [...conflictCauseVocabulary, ...conversionModeVocabulary].every(
      ({ requiresEvidence }) => requiresEvidence,
    ),
  );

  const names = (entityId: string) =>
    new Set(
      entityNameAssertions
        .filter((assertion) => assertion.entityId === entityId)
        .map((assertion) => assertion.normalizedName),
    );
  assert.equal(
    [...names("belial")].some((name) => names("baal").has(name)),
    false,
  );
  assert.equal(
    [...names("lucifer")].some((name) => names("satan").has(name)),
    false,
  );
  assert.ok(
    entityRelationships.some(
      (relationship) =>
        relationship.id === "rel-belial-baal-rejected" &&
        relationship.relationshipType === "rejected-identification" &&
        !relationship.isEquivalence,
    ),
  );
  assert.ok(
    entityRelationships.some(
      (relationship) =>
        relationship.id === "rel-lucifer-satan-later-conflation" &&
        relationship.relationshipType === "later-contextual-conflation" &&
        !relationship.isEquivalence,
    ),
  );
});

test("historical classifications keep case references, mixed causes, and direct-force evidence bounded", () => {
  assert.equal(conflictCases.length, 2);
  assert.equal(conflictCauseAssignments.length, 9);
  assert.equal(conversionCases.length, 2);
  assert.equal(conversionModeAssignments.length, 7);

  const sourceIds = new Set(ontologySources.map((source) => source.id));
  const conflictCaseById = new Map(
    conflictCases.map((conflictCase) => [conflictCase.id, conflictCase]),
  );
  const conflictCauseIds = new Set(
    conflictCauseVocabulary.map((cause) => cause.id),
  );
  for (const conflictCase of conflictCases) {
    const assignments = conflictCauseAssignments.filter(
      ({ conflictCaseId }) => conflictCaseId === conflictCase.id,
    );
    assert.ok(assignments.length >= 2);
    assert.equal(
      new Set(assignments.map(({ causeId }) => causeId)).size,
      assignments.length,
    );
    assert.ok(assignments.some(({ causeId }) => causeId === "mixed"));
    assert.ok(
      assignments.some(
        ({ causeId }) => !["religious", "mixed", "disputed"].includes(causeId),
      ),
    );
    assert.ok(conflictCase.participantJustifications.length > 0);
    assert.ok(conflictCase.scholarlyInterpretations.length > 0);
    assert.ok(conflictCase.disputedCausation.length > 0);
    assert.ok(conflictCase.uncertainty.length > 0);
  }
  for (const assignment of conflictCauseAssignments) {
    const conflictCase = conflictCaseById.get(assignment.conflictCaseId);
    assert.ok(conflictCase);
    assert.ok(conflictCauseIds.has(assignment.causeId));
    assert.ok(assignment.evidence.length > 0);
    assert.ok(assignment.sourceIds.length > 0);
    assert.ok(
      assignment.sourceIds.every(
        (sourceId) =>
          sourceIds.has(sourceId) && conflictCase.sourceIds.includes(sourceId),
      ),
    );
  }

  const conversionCaseById = new Map(
    conversionCases.map((conversionCase) => [
      conversionCase.id,
      conversionCase,
    ]),
  );
  const conversionModeIds = new Set(
    conversionModeVocabulary.map((mode) => mode.id),
  );
  for (const assignment of conversionModeAssignments) {
    const conversionCase = conversionCaseById.get(assignment.conversionCaseId);
    assert.ok(conversionCase);
    assert.ok(conversionModeIds.has(assignment.modeId));
    assert.ok(assignment.evidence.length > 0);
    assert.ok(assignment.sourceIds.length > 0);
    assert.ok(
      assignment.sourceIds.every(
        (sourceId) =>
          sourceIds.has(sourceId) &&
          conversionCase.sourceIds.includes(sourceId),
      ),
    );
  }
  const forcedAssignments = conversionModeAssignments.filter(
    ({ modeId }) => modeId === "forced-conversion",
  );
  assert.equal(forcedAssignments.length, 1);
  assert.equal(
    forcedAssignments[0]?.conversionCaseId,
    "conversion-safavid-shiism-iran",
  );
  assert.equal(
    forcedAssignments[0]?.evidenceStandard,
    "documented-direct-force",
  );
  assert.ok(
    forcedAssignments[0]?.sourceIds.includes("src-openstax-safavid-conversion"),
  );
  assert.equal(
    conversionModeAssignments.some(
      ({ conversionCaseId, modeId }) =>
        conversionCaseId === "conversion-constantinian-christian-sponsorship" &&
        modeId === "forced-conversion",
    ),
    false,
  );
});

test("Phase 15 preserves exact source occurrences and the Yijing catalog link", () => {
  const catalogWorkIds = new Set(texts.map((work) => work.id));
  assert.ok(
    entityOccurrences.every(
      (occurrence) =>
        occurrence.workId === null || catalogWorkIds.has(occurrence.workId),
    ),
  );
  const sourceIds = new Set(ontologySources.map((source) => source.id));
  assert.ok(
    [
      ...ontologyConcepts,
      ...ontologyConceptEdges,
      ...ontologyConceptTerms,
      ...ontologyEntities,
      ...entityNameAssertions,
      ...entityOccurrences,
      ...entityRelationships,
      ...entityEvolutionPaths,
      ...entityEvolutionStages,
      ...conflictCauseVocabulary,
      ...conversionModeVocabulary,
    ].every((record) =>
      record.sourceIds.every((sourceId) => sourceIds.has(sourceId)),
    ),
  );
  const anunna = entityOccurrences.filter(
    (occurrence) => occurrence.entityId === "anunna",
  );
  assert.equal(anunna.length, 9);
  assert.ok(
    anunna.every(
      (occurrence) =>
        occurrence.sourceId.startsWith("src-oracc-q") &&
        occurrence.transliteration.includes("a-nun-na"),
    ),
  );
  assert.ok(
    entityNameAssertions.some(
      (assertion) =>
        assertion.entityId === "yijing" && assertion.name === "I Ching",
    ),
  );
  assert.ok(
    entityOccurrences.some(
      (occurrence) =>
        occurrence.entityId === "yijing" && occurrence.workId === "i-ching",
    ),
  );
});

test("Unicode tokenization and sourced aliases resolve without flattening entities", () => {
  assert.ok(tokenize("老子 易經 בְּלִיַּעַל").includes("老子"));
  assert.ok(tokenizeFederatedSearch("老子 易經 בְּלִיַּעַל").includes("易經"));
  assert.deepEqual(
    resolveOntologyEntities("Lao Tzu").map(({ entityId }) => entityId),
    ["laozi"],
  );
  assert.deepEqual(
    resolveOntologyEntities("易經").map(({ entityId }) => entityId),
    ["yijing"],
  );
  assert.ok(detectConcepts("ā́tman").includes("soul"));
  assert.ok(detectConcepts("pò").includes("spirit"));
  assert.ok(detectConcepts("poor").includes("wealth"));
  assert.equal(detectConcepts("poor").includes("spirit"), false);
  assert.deepEqual(resolveOntologyEntities("reason"), []);
  assert.deepEqual(resolveOntologyEntities("ease"), []);
  assert.deepEqual(
    resolveOntologyEntities("The source names Ea here").map(
      ({ entityId }) => entityId,
    ),
    ["enki-ea"],
  );

  const laoziHits = federatedSearch("老子", { types: ["entity"] });
  assert.equal(laoziHits[0]?.id, "laozi");
  const yijingHits = federatedSearch("I Ching", { types: ["entity"] });
  assert.equal(yijingHits[0]?.id, "yijing");
  const belialHits = federatedSearch("Belial", { types: ["entity"] });
  assert.equal(belialHits[0]?.id, "belial");
  const belial = belialHits.find(({ id }) => id === "belial");
  assert.deepEqual(belial?.aliases, []);
  assert.ok(belial?.nameAssertions?.length);
  assert.ok(
    belial?.nameAssertions?.every(
      (assertion) =>
        assertion.scope !== "Source- and period-scoped name evidence.",
    ),
  );
});
