import assert from "node:assert/strict";
import test from "node:test";
import {
  researchKinds,
  researchRecord,
  researchRecords,
  validateResearchRecords,
} from "../packages/shared/research-records";

test("linked research views cover every Phase 20 record type with provenance", () => {
  assert.equal(validateResearchRecords(), true);
  for (const kind of researchKinds)
    assert.ok(
      researchRecords.some((item) => item.kind === kind),
      kind,
    );
  assert.ok(
    researchRecords.every((item) =>
      item.sourceUrls.every((url) => url.startsWith("https://")),
    ),
  );
});

test("historical research links resolve without collapsing record types", () => {
  const historical = researchRecords.filter((item) =>
    ["event", "polity", "community", "site"].includes(item.kind),
  );
  assert.ok(historical.length >= 10);
  for (const item of historical)
    for (const related of item.related)
      assert.ok(researchRecord(related), `${item.id} -> ${related}`);
  assert.ok(
    researchRecords.some(
      (item) =>
        item.kind === "practice" &&
        /operational|artifact|historical/iu.test(
          `${item.summary} ${item.evidence}`,
        ),
    ),
  );
});
