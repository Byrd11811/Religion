import assert from "node:assert/strict";
import test from "node:test";
import {
  historicalCaseStudies,
  historicalPhases,
  validateHistoricalCaseStudies,
} from "../packages/shared/historical-geography";
import seed from "../data/seed/historical-geography.json";

test("historical case studies retain four sourced, independent states", () => {
  assert.deepEqual(seed.cases, historicalCaseStudies);
  assert.equal(validateHistoricalCaseStudies(), true);
  assert.ok(historicalCaseStudies.length >= 2);
  for (const study of historicalCaseStudies) {
    assert.deepEqual(
      new Set(study.states.map(({ phase }) => phase)),
      new Set(historicalPhases),
    );
    assert.ok(study.sources.every(({ url }) => url.startsWith("https://")));
    assert.ok(study.states.every(({ sourceIds }) => sourceIds.length > 0));
    assert.ok(
      study.features.every(({ boundaryType }) => boundaryType !== "unknown"),
    );
  }
});

test("political, religious, legal, conflict, and community layers stay distinct", () => {
  const layers = new Set(
    historicalCaseStudies.flatMap((study) =>
      study.features.map(({ layer }) => layer),
    ),
  );
  for (const layer of [
    "political-control",
    "religious-presence",
    "state-religion",
    "legal-policy",
    "conflict",
    "community",
  ])
    assert.ok(layers.has(layer as never), layer);
  assert.ok(
    historicalCaseStudies
      .flatMap(({ deltas }) => deltas)
      .some(({ summary }) =>
        /does not support|do not support|lacks|gap/iu.test(summary),
      ),
  );
});

test("influence flows name a mechanism and reject population inference", () => {
  const flows = historicalCaseStudies.flatMap(({ flows }) => flows);
  assert.ok(flows.length > 0);
  assert.ok(
    flows.every(
      ({ mechanism, evidence }) =>
        mechanism && /not |institution/iu.test(evidence),
    ),
  );
  assert.ok(flows.every(({ sourceIds }) => sourceIds.length > 0));
});
