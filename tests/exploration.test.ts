import test from "node:test";
import assert from "node:assert/strict";
import { explorationRecords } from "../packages/shared/exploration-catalog";
import {
  explorationScope,
  groupCoordinates,
  hasCoordinates,
  mapWorkScope,
  timelinePosition,
  selectedHistoricalYear,
  type ExplorationFilters,
} from "../packages/shared/exploration";
import { texts } from "../packages/shared/catalog";

const filters: ExplorationFilters = {
  kind: "work",
  year: 2026,
  traditionId: "",
  region: "",
  includeUndated: true,
  fullText: false,
  images: false,
  geography: "all",
};
test("map includes undated anchors and reports unlocated records without invented geography", () => {
  const scope = explorationScope(explorationRecords, filters);
  assert.equal(scope.mapped.length, 37);
  assert.equal(scope.unlocated.length, 274);
  assert.equal(scope.undated.length, 277);
  assert.equal(
    explorationScope(explorationRecords, { ...filters, includeUndated: false })
      .mapped.length,
    26,
  );
  assert.deepEqual(
    new Set(scope.mapped.map((r) => r.id.slice(5))),
    new Set(mapWorkScope(texts, 2026).mapped.map((r) => r.id)),
  );
});
test("timeline and missing-date denominators follow the same community and layer filters", () => {
  const traditionId = texts.find((t) => t.region === "Egypt")!.traditionId;
  const scope = explorationScope(explorationRecords, {
    ...filters,
    traditionId,
  });
  assert.equal(
    scope.scoped.length,
    texts.filter((t) => t.traditionId === traditionId).length,
  );
  assert.equal(
    scope.undated.length,
    texts.filter((t) => t.traditionId === traditionId && t.startDate === null)
      .length,
  );
  const witnesses = explorationScope(explorationRecords, {
    ...filters,
    kind: "witness",
  });
  assert.equal(witnesses.dated.length, 17);
  assert.equal(witnesses.undated.length, 3);
  assert.equal(witnesses.mapped.length, 0);
  assert.equal(witnesses.unlocated.length, 20);
  assert.ok(
    witnesses.dated.every(
      (w) => w.dateNotes && w.sources.length && w.kind === "witness",
    ),
  );
});
test("timeline scale covers 5000 BCE through present without a year zero", () => {
  assert.equal(timelinePosition(-5000, 2026), 0);
  assert.equal(timelinePosition(2026, 2026), 100);
  assert.ok(timelinePosition(-3000, 2026) > 0);
  assert.ok(timelinePosition(-3000, 2026) < timelinePosition(-1000, 2026));
  assert.ok(
    Math.abs(
      timelinePosition(1, 2026) - timelinePosition(-1, 2026) - 100 / 7025,
    ) < 0.000001,
  );
  assert.equal(selectedHistoricalYear("0"), 1);
  assert.equal(selectedHistoricalYear("0", 1), -1);
  assert.equal(selectedHistoricalYear("0", -1), 1);
  assert.throws(() => timelinePosition(0, 2026), /Invalid/);
});
test("coincident markers retain exact source coordinates and all their records", () => {
  const original = explorationRecords.find((r) => hasCoordinates(r))!;
  const duplicate = {
    ...original,
    id: "test:overlap",
    title: "Synthetic overlap fixture",
  };
  const groups = groupCoordinates([
    original,
    duplicate,
    { ...original, id: "test:null", lat: null },
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].lat, original.lat);
  assert.equal(groups[0].lng, original.lng);
  assert.equal(groups[0].records.length, 2);
  assert.equal(hasCoordinates({ lat: 91, lng: 0 }), false);
  assert.equal(hasCoordinates({ lat: 0, lng: 0 }), true);
});
test("evidence/availability filters do not manufacture dates or positions", () => {
  const scope = explorationScope(explorationRecords, {
    ...filters,
    geography: "unlocated",
  });
  assert.equal(scope.mapped.length, 0);
  assert.ok(scope.inPeriod.every((r) => !hasCoordinates(r)));
  const images = explorationScope(explorationRecords, {
    ...filters,
    kind: "witness",
    images: true,
  });
  assert.equal(images.inPeriod.length, 15);
  assert.equal(images.mapped.length, 0);
});
