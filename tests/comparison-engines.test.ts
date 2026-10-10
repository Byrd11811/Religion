import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  comparisonCases,
  oppositionPropositions,
  oppositionStances,
  researchSources,
  teachingConductCases,
  validateResearchEngineData,
  type OppositionCategory,
  type ScopedEvidence,
} from "../packages/shared/research-engines";
import { findOpposition } from "../packages/research/opposition";
import {
  comparisonModes,
  runComparison,
} from "../packages/research/comparison";
import { findTeachingConductCases } from "../packages/research/teaching-conduct";
import { orderTextsByCompositionDate } from "../packages/research/chronology-order";
import { allPassages } from "../packages/search";

const expectedCategories = new Set<OppositionCategory>([
  "doctrinal-opposition",
  "philosophical-critique",
  "internal-heterodox-opposition",
  "skeptical-critique",
  "materialist-critique",
  "alternative-religious-interpretation",
  "mystical-reinterpretation",
  "adversarial-reinterpretation",
  "modern-secular-critique",
]);

test("Phase 16 research seed is exact, cited, verified, and deterministic", () => {
  assert.equal(validateResearchEngineData(), true);
  assert.equal(researchSources.length, 28);
  assert.equal(oppositionPropositions.length, 4);
  assert.equal(oppositionStances.length, 23);
  assert.equal(comparisonCases.length, 4);
  assert.equal(teachingConductCases.length, 4);
  assert.deepEqual(
    new Set(oppositionStances.map(({ category }) => category)),
    expectedCategories,
  );
  assert.ok(
    researchSources.every(
      ({ url, verification }) =>
        url.startsWith("https://") &&
        verification.status === "verified" &&
        verification.httpStatus === 200,
    ),
  );
  const bytes = readFileSync("data/seed/research-engines.json");
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "5a137f5e0b79e4f2fd6b63a4ccb99ab96ea22f732773213c8753c1ecbb1a4673",
  );
});

test("every static research finding has an inspected claim-level locator", () => {
  const comparisonEvidence: ScopedEvidence[] = comparisonCases.flatMap(
    (item) => [
      ...item.subjectClaims,
      ...item.synthesisFindings,
      ...item.similarityFindings,
      ...item.contradictionFindings,
      ...item.chronologyFindings,
      ...item.influenceRelationships,
      ...item.alternativeInterpretations,
    ],
  );
  const conductEvidence: ScopedEvidence[] = teachingConductCases.flatMap(
    (item) => [
      ...item.teachingEvidence,
      ...item.conductEvidence,
      ...item.justificationsAtTheTime,
      ...item.textsUsedToJustify,
      ...item.supportingReligiousVoices,
      ...item.opposingReligiousVoices,
      ...item.nonreligiousMotives,
      ...item.laterTheologicalInterpretations,
      ...item.modernScholarlyInterpretations,
    ],
  );
  const allEvidence: ScopedEvidence[] = [
    ...oppositionStances,
    ...comparisonEvidence,
    ...conductEvidence,
  ];
  assert.ok(
    allEvidence.every(
      ({ locator, reviewStatus, sourceIds }) =>
        locator.trim().length > 5 &&
        reviewStatus === "human-reviewed" &&
        sourceIds.length > 0,
    ),
  );

  const passages = new Map(allPassages().map((passage) => [passage.id, passage]));
  for (const [id, passageId] of [
    ["stance-dhammapada-hatred", "pg-2017-2"],
    ["stance-gita-enduring-self", "pg-2388-10"],
    ["tc-soto-teaching-nonhatred", "pg-2017-2"],
    ["tc-vaikom-teaching-equal-vision", "pg-2388-26"],
  ]) {
    const item = allEvidence.find((candidate) => candidate.id === id);
    const passage = passages.get(passageId);
    assert.ok(item);
    assert.ok(passage);
    assert.deepEqual(item.canonicalPassageIds, [passageId]);
    assert.deepEqual(item.textIds, [passage.textId]);
    assert.deepEqual(item.contentTypes, [passage.contentType]);
  }
});

test("opposition uses reviewed proposition links rather than tradition-name inference", () => {
  for (const proposition of oppositionPropositions) {
    const linked = oppositionStances.filter(
      ({ propositionId }) => propositionId === proposition.id,
    );
    assert.ok(linked.length >= 4);
    assert.ok(new Set(linked.map(({ category }) => category)).size >= 3);
    assert.ok(
      linked.every(
        ({ speakerOrCommunity, historicalContext, uncertainty, sourceIds }) =>
          speakerOrCommunity &&
          historicalContext &&
          uncertainty &&
          sourceIds.length,
      ),
    );
  }

  const enemies = findOpposition({
    query: "How should enemies answer injury?",
  });
  assert.equal(enemies.matches[0]?.proposition.id, "prop-enemy-love");
  assert.ok(enemies.matches[0].stances.length >= 5);
  assert.ok(
    enemies.matches[0].stances.some(
      ({ category }) => category === "adversarial-reinterpretation",
    ),
  );
  assert.equal(
    findOpposition({ query: "Christianity Buddhism Islam" }).matches.length,
    0,
  );

  const scoped = findOpposition({
    propositionId: "prop-enemy-love",
    scope: { traditionIds: ["laveyan-satanism"] },
    limit: 1,
  });
  assert.equal(scoped.matches.length, 1);
  assert.equal(scoped.matches[0].totalBeforeLimit, 1);
  assert.deepEqual(
    scoped.matches[0].stances.map(({ id }) => id),
    ["stance-satanic-vengeance"],
  );

  const buddhist = findOpposition({
    propositionId: "prop-enemy-love",
    scope: { traditionIds: ["buddhism"] },
  });
  assert.equal(buddhist.matches.length, 1);
  assert.deepEqual(buddhist.matches[0].proposition.sourceIds, [
    "src-gutenberg-dhammapada",
  ]);
  assert.ok(
    buddhist.matches[0].proposition.sourceIds.every((sourceId) =>
      buddhist.matches[0].stances.some((stance) =>
        stance.sourceIds.includes(sourceId),
      ),
    ),
  );
  const lucretius = findOpposition({
    propositionId: "prop-suffering-providence",
    scope: { sourceIds: ["src-gutenberg-lucretius"] },
  });
  assert.equal(lucretius.matches.length, 1);
  assert.deepEqual(lucretius.matches[0].proposition.sourceIds, [
    "src-gutenberg-lucretius",
  ]);
  assert.deepEqual(
    lucretius.matches[0].stances.map(({ id }) => id),
    ["stance-lucretius-natural-causes"],
  );
  assert.equal(
    findOpposition({ scope: { textIds: ["dhammapada"] } }).matches[0]
      ?.stances[0].id,
    "stance-dhammapada-hatred",
  );
});

test("every advertised opposition stance remains retrievable through its own evidence", () => {
  const propositionById = new Map(
    oppositionPropositions.map((item) => [item.id, item]),
  );
  for (const stance of oppositionStances) {
    const proposition = propositionById.get(stance.propositionId);
    assert.ok(proposition, stance.id);
    assert.ok(
      stance.sourceIds.some((sourceId) => proposition.sourceIds.includes(sourceId)),
      `${stance.id} has no proposition source overlap`,
    );
    const result = findOpposition({
      propositionId: stance.propositionId,
      scope: { sourceIds: stance.sourceIds },
    });
    assert.ok(
      result.matches[0]?.stances.some(({ id }) => id === stance.id),
      `${stance.id} disappeared under its own source scope`,
    );
  }
});

test("chronology ordering keeps unknown dates last in both directions", () => {
  const fixture = [
    { id: "unknown", startDate: null },
    { id: "early", startDate: -500 },
    { id: "late", startDate: 1200 },
  ];
  assert.deepEqual(
    orderTextsByCompositionDate(fixture, "earlier").map(({ id }) => id),
    ["early", "late", "unknown"],
  );
  assert.deepEqual(
    orderTextsByCompositionDate(fixture, "later").map(({ id }) => id),
    ["late", "early", "unknown"],
  );
});

test("the six compare modes dispatch distinct evidence structures", () => {
  const signatures = new Map<string, string>();
  for (const mode of comparisonModes) {
    const response = runComparison(mode);
    assert.equal(response.mode, mode);
    assert.ok(response.cases.length > 0, `${mode} returned no cases`);
    const sectionKinds = [
      ...new Set(
        response.cases.flatMap(({ sections }) =>
          sections.map(({ kind }) => kind),
        ),
      ),
    ].sort();
    signatures.set(mode, sectionKinds.join(","));
  }
  assert.equal(new Set(signatures.values()).size, comparisonModes.length);

  const contradictions = runComparison("contradictions");
  const contradictionItems = contradictions.cases.flatMap(({ sections }) =>
    sections.flatMap((section) =>
      section.kind === "contradictions" ? section.items : [],
    ),
  );
  assert.ok(contradictionItems.length >= 5);
  assert.ok(
    contradictionItems.every(
      ({
        propositionAId,
        propositionBId,
        speakerContext,
        harmonization,
        counterReading,
      }) =>
        propositionAId &&
        propositionBId &&
        speakerContext &&
        harmonization &&
        counterReading,
    ),
  );

  const similarities = runComparison("similarities");
  const similarityItems = similarities.cases.flatMap(({ sections }) =>
    sections.flatMap((section) =>
      section.kind === "similarities" ? section.items : [],
    ),
  );
  assert.deepEqual(
    new Set(similarityItems.map(({ dimension }) => dimension)),
    new Set(["motif", "semantic", "ritual", "narrative", "theological"]),
  );
  const influenceIds = new Set(
    similarities.cases.flatMap(({ sections }) =>
      sections.flatMap((section) =>
        section.kind === "influence" ? section.items.map(({ id }) => id) : [],
      ),
    ),
  );
  for (const finding of similarityItems) {
    assert.ok(
      finding.influenceRelationshipId === null ||
        influenceIds.has(finding.influenceRelationshipId),
    );
  }

  const earlier = runComparison("earlier-parallels");
  const earlierItems = earlier.cases.flatMap(({ sections }) =>
    sections.flatMap((section) =>
      section.kind === "chronology" ? section.items : [],
    ),
  );
  assert.ok(earlierItems.length >= 4);
  assert.ok(
    earlierItems.every(
      ({ kind, survivalBiasWarning, earlierDate, laterDate }) =>
        kind === "earlier-parallel" &&
        survivalBiasWarning &&
        earlierDate.confidence &&
        laterDate.confidence,
    ),
  );
  assert.ok(
    earlierItems.every(
      ({ influenceRelationshipId }) => !influenceRelationshipId,
    ),
  );

  const later = runComparison("later-echoes");
  const laterItems = later.cases.flatMap(({ sections }) =>
    sections.flatMap((section) =>
      section.kind === "chronology" ? section.items : [],
    ),
  );
  assert.equal(laterItems.length, 2);
  assert.ok(
    laterItems.every(({ influenceRelationshipId }) => influenceRelationshipId),
  );

  const alternatives = runComparison("alternative-interpretations");
  assert.ok(
    alternatives.cases.every(({ sections }) =>
      sections.every(
        (section) =>
          section.kind === "alternative-interpretations" &&
          section.items.every(
            ({ interpretationSource }) => interpretationSource,
          ),
      ),
    ),
  );
});

test("comparison scope is enforced in every section before limits", () => {
  const allowed = ["src-gutenberg-bible", "src-church-satan-statements"];
  const result = runComparison("contradictions", {
    caseIds: ["cmp-response-to-injury"],
    scope: { sourceIds: allowed },
    limitPerSection: 1,
  });
  assert.equal(result.cases.length, 1);
  const sections = result.cases[0].sections;
  const contradictions = sections.find(({ kind }) => kind === "contradictions");
  assert.ok(contradictions && contradictions.items.length === 1);
  for (const section of sections) {
    for (const item of section.items as ScopedEvidence[]) {
      assert.ok(item.sourceIds.every((sourceId) => allowed.includes(sourceId)));
    }
  }
  assert.deepEqual(result.cases[0].sourceIds.sort(), [...allowed].sort());
});

test("comparison text and theme scope retain only findings about the selected works", () => {
  const selected = ["tao-te-ching", "analects"];
  const result = runComparison("contradictions", {
    textIds: selected,
    theme: "responses to injury",
  });
  assert.deepEqual(
    result.cases.map(({ caseId }) => caseId),
    ["cmp-response-to-injury"],
  );
  assert.deepEqual(
    result.cases[0].sections
      .flatMap(({ items }) => items)
      .map(({ id }) => id)
      .sort(),
    ["claim-analects-justice", "claim-tao-kindness", "con-injury-kindness-justice"],
  );
  for (const item of result.cases[0].sections.flatMap(({ items }) => items)) {
    assert.ok(item.textIds?.length);
    assert.ok(item.textIds?.every((textId) => selected.includes(textId)));
  }
  assert.equal(result.noApplicableAnalysis, null);

  const unrelated = runComparison("contradictions", {
    textIds: ["dhammapada", "bhagavad-gita"],
    theme: "flood",
  });
  assert.deepEqual(unrelated.cases, []);
  assert.match(unrelated.noApplicableAnalysis ?? "", /selected texts.*theme/i);

  const wrongTheme = runComparison("contradictions", {
    textIds: selected,
    theme: "flood",
  });
  assert.deepEqual(wrongTheme.cases, []);

  const partialWord = runComparison("contradictions", {
    textIds: selected,
    theme: "just",
  });
  assert.deepEqual(partialWord.cases, []);
});

test("Teaching vs Historical Conduct retains all lanes and separates documented gaps", () => {
  assert.deepEqual(
    new Set(teachingConductCases.map(({ traditionId }) => traditionId)),
    new Set(["christianity", "buddhism", "islam", "hindu"]),
  );
  const required = [
    "teachingEvidence",
    "conductEvidence",
    "justificationsAtTheTime",
    "textsUsedToJustify",
    "supportingReligiousVoices",
    "opposingReligiousVoices",
    "nonreligiousMotives",
    "laterTheologicalInterpretations",
    "modernScholarlyInterpretations",
  ] as const;
  for (const conductCase of teachingConductCases) {
    assert.ok(conductCase.actorsAndInstitutions.length >= 3);
    assert.ok(conductCase.locations.length);
    assert.ok(conductCase.evidenceStatus);
    assert.ok(conductCase.disputes);
    assert.ok(conductCase.neutralityNote.length > 40);
    for (const key of required) {
      assert.ok(conductCase[key].length, `${conductCase.id} lacks ${key}`);
      assert.ok(
        conductCase[key].every(
          ({ sourceIds, summary }) => sourceIds.length && summary.length,
        ),
      );
    }
    const teaching = new Set(
      conductCase.teachingEvidence.flatMap(({ sourceIds }) => sourceIds),
    );
    const conduct = new Set(
      conductCase.conductEvidence.flatMap(({ sourceIds }) => sourceIds),
    );
    assert.notDeepEqual(teaching, conduct);
  }
  const laneItems = teachingConductCases.flatMap((conductCase) =>
    required.flatMap((key) => conductCase[key]),
  );
  const documentedGaps = laneItems.filter(
    ({ recordKind }) => recordKind === "documented-gap",
  );
  assert.equal(laneItems.length, 40);
  assert.equal(documentedGaps.length, 5);
  assert.equal(
    laneItems.filter(({ recordKind }) => recordKind !== "documented-gap").length,
    35,
  );
  assert.ok(
    documentedGaps.every(
      ({ evidenceStatus, confidence, sourceIds }) =>
        evidenceStatus?.includes("not-established") &&
        confidence === "low" &&
        sourceIds.length > 0,
    ),
  );
  assert.ok(
    teachingConductCases
      .find(({ id }) => id === "tc-ottoman-devshirme")
      ?.supportingReligiousVoices.some(
        ({ evidenceStatus, recordKind }) =>
          recordKind === "documented-gap" &&
          evidenceStatus === "named-supporting-religious-voice-not-established",
      ),
  );

  for (const traditionId of ["christianity", "buddhism", "islam", "hindu"]) {
    const scoped = findTeachingConductCases({
      scope: { traditionIds: [traditionId] },
    });
    assert.equal(scoped.cases.length, 1, `${traditionId} lost its dossier`);
    const dossier = scoped.cases[0];
    assert.equal(dossier.traditionId, traditionId);
    for (const key of required)
      assert.ok(dossier[key].length, `${traditionId} lost ${key}`);
  }

  assert.deepEqual(
    findTeachingConductCases({ scope: { textIds: ["dhammapada"] } }).cases.map(
      ({ id }) => id,
    ),
    ["tc-soto-imperial-war"],
  );
  assert.deepEqual(
    findTeachingConductCases({ scope: { textIds: ["bhagavad-gita"] } }).cases.map(
      ({ id }) => id,
    ),
    ["tc-vaikom-exclusion"],
  );

  const islam = findTeachingConductCases({
    scope: { traditionIds: ["islam"] },
  }).cases[0];
  assert.ok(
    islam.nonreligiousMotives.some(({ traditionIds }) =>
      traditionIds.includes("ottoman-state"),
    ),
    "the Islam filter must retain independently attributed Ottoman-state evidence",
  );

  const hindu = findTeachingConductCases({
    scope: { traditionIds: ["hindu"] },
  }).cases[0];
  assert.ok(
    hindu.modernScholarlyInterpretations.some(({ traditionIds }) =>
      traditionIds.includes("indian-national-movement"),
    ),
    "the Hindu filter must retain independently attributed historical evidence",
  );

  const christian = findTeachingConductCases({
    scope: {
      traditionIds: ["christianity"],
      sourceIds: [
        "src-gutenberg-bible",
        "src-church-england-codrington",
        "src-cambridge-atlantic-slavery",
        "src-brill-spg-slavery",
      ],
    },
    limit: 1,
  });
  assert.deepEqual(
    christian.cases.map(({ id }) => id),
    ["tc-spg-codrington"],
  );
  assert.ok(
    christian.cases[0].sourceIds.every((id) =>
      [
        "src-gutenberg-bible",
        "src-church-england-codrington",
        "src-cambridge-atlantic-slavery",
        "src-brill-spg-slavery",
      ].includes(id),
    ),
  );
});
