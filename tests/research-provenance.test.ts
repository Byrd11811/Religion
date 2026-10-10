import test from "node:test";
import assert from "node:assert/strict";
import { evidenceOnlyAnswer } from "../packages/ai/claims";
import { deterministicNeutralityAudit } from "../packages/ai/neutrality";
import {
  comparisonProvenanceSnapshot,
  MAX_QUESTION_PROVENANCE_CHARS,
  questionProvenanceSnapshot,
} from "../packages/shared/research-provenance";
import type {
  CanonicalResearchSource,
  QuestionEngineResult,
} from "../packages/shared/research";
import { buildLegacyComparisonSections } from "../packages/research/legacy-comparison";
import { runComparison } from "../packages/research/comparison";
import { researchSources } from "../packages/shared/research-engines";

const source: CanonicalResearchSource = {
  id: "source-1",
  sourceId: "source-1",
  sourceRole: "primary-source",
  evidenceType: "primary-text",
  title: "Verified source",
  text: "A canonical passage that must not be copied into the saved snapshot.",
  url: "https://example.org/source-1",
  locator: "line 1",
  workId: "work-1",
  editionId: "edition-1",
  eligibleForAi: true,
  rights: "Public domain",
};

test("question provenance preserves scope, ladders, and audits without passage text", () => {
  const answer = evidenceOnlyAnswer(
    "What is attested?",
    [source],
    "Limits remain.",
  );
  const result: QuestionEngineResult = {
    mode: "evidence-only",
    answer,
    attempts: 0,
    synthesisAudited: false,
    deterministicAudit: deterministicNeutralityAudit(answer),
    providerAudit: null,
    notices: ["Evidence only."],
  };
  const snapshot = questionProvenanceSnapshot(
    result,
    {
      textIds: ["work-1"],
      traditions: ["tradition-1"],
      region: "Test region",
      after: -500,
      before: 500,
      contentTypes: ["Primary text"],
    },
    "2026-10-10T00:00:00.000Z",
  );

  assert.equal(snapshot.formatVersion, "atlas-question-provenance/v1");
  assert.deepEqual(snapshot.scope.textIds, ["work-1"]);
  assert.deepEqual(snapshot.scope.traditions, ["tradition-1"]);
  assert.equal(snapshot.scope.region, "Test region");
  assert.equal(snapshot.scope.after, -500);
  assert.equal(snapshot.scope.before, 500);
  assert.equal(snapshot.deterministicAudit.items.length, 12);
  assert.equal(snapshot.providerAudit, null);
  assert.equal(snapshot.sections.primaryEvidence[0].evidenceLadder.length, 1);
  assert.equal(
    snapshot.sections.primaryEvidence[0].evidenceLadder[0].citationId,
    snapshot.sections.primaryEvidence[0].citations[0].citationId,
  );
  const serialized = JSON.stringify(snapshot);
  assert.doesNotMatch(serialized, /must not be copied/iu);
  assert.match(serialized, /source-1/iu);
});

test("question provenance rejects a whole snapshot that cannot be saved", () => {
  const answer = evidenceOnlyAnswer(
    "What is attested?",
    [source],
    "Limits remain.",
  );
  const result: QuestionEngineResult = {
    mode: "evidence-only",
    answer,
    attempts: 2,
    synthesisAudited: false,
    deterministicAudit: deterministicNeutralityAudit(answer),
    providerAudit: null,
    notices: ["x".repeat(MAX_QUESTION_PROVENANCE_CHARS)],
  };

  assert.throws(
    () => questionProvenanceSnapshot(result, {}, "2026-10-10T00:00:00.000Z"),
    /Question provenance exceeds 60000 characters/u,
  );
});

test("a twelve-work comparison saves bounded, reviewable provenance", () => {
  const textIds = [
    "paradise-regained",
    "marcus-aurelius-meditations",
    "job",
    "book-of-mormon",
    "plato-phaedo",
    "epic-of-gilgamesh",
    "odyssey",
    "quran",
    "plato-timaeus",
    "gospel-of-matthew",
    "beyond-good-and-evil",
    "huainanzi",
  ];
  const theme = "spirit";
  const legacy = buildLegacyComparisonSections({ textIds, theme });
  const engineAnalysis = runComparison("synthesize", {
    textIds: legacy.texts.map((text) => text.id),
    theme,
  });
  const citedSourceIds = new Set(
    engineAnalysis.cases.flatMap((item) => item.sourceIds),
  );
  const fullResult = {
    ...legacy,
    engineAnalysis,
    researchSources: researchSources.filter((item) =>
      citedSourceIds.has(item.id),
    ),
    note: "Retrieved parallels are reading aids.",
  };
  assert.ok(JSON.stringify(fullResult).length > 60_000);

  const snapshot = comparisonProvenanceSnapshot(
    fullResult,
    { textIds, theme, mode: "synthesize" },
    "2026-10-10T00:00:00.000Z",
  );
  const serialized = JSON.stringify(snapshot);
  assert.equal(snapshot.formatVersion, "atlas-comparison-provenance/v1");
  assert.deepEqual(snapshot.request.textIds, textIds);
  assert.equal(snapshot.request.theme, theme);
  assert.equal(snapshot.admittedTexts.length, 12);
  assert.ok(snapshot.passages.length > 0);
  assert.ok(
    snapshot.passages.every(
      (passage) =>
        passage.passageId &&
        passage.workId &&
        passage.editionId &&
        passage.locator &&
        passage.contentType &&
        passage.sourceUrl.startsWith("https://"),
    ),
  );
  assert.doesNotMatch(serialized, /"content"\s*:/u);
  assert.ok(serialized.length < 60_000);
});
