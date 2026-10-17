import assert from "node:assert/strict";
import test from "node:test";
import {
  buildChangePointYears,
  buildSacredCurrentsTimeYears,
  dateEvidenceStateFromNote,
  earliestSacredCurrentsYear,
  buildSacredCurrentsScene,
  filterSacredCurrents,
  formatSacredRange,
  formatSacredYear,
  sacredYearOrdinal,
  validateSacredCurrentsCatalog,
  type SacredCurrentsRecord,
} from "../packages/shared/sacred-currents";
import {
  sacredCurrentsAnchors,
  sacredCurrentsCatalog,
  sacredCurrentsConnections,
  sacredCurrentsConnectionsForRecord,
  sacredCurrentsCoverage,
  sacredCurrentsRecord,
  sacredCurrentsRecords,
  sacredCurrentsStreams,
} from "../packages/shared/sacred-currents-catalog";

test("Sacred Currents exposes honest catalog and archive coverage", () => {
  assert.equal(validateSacredCurrentsCatalog(sacredCurrentsCatalog), true);
  assert.equal(sacredCurrentsCoverage.totals.works, 600);
  assert.equal(sacredCurrentsCoverage.totals.datedWorks, 111);
  assert.equal(sacredCurrentsCoverage.totals.mappedWorks, 33);
  assert.equal(sacredCurrentsCoverage.totals.datedAndMappedWorks, 22);
  assert.equal(sacredCurrentsCoverage.totals.witnesses, 61);
  assert.equal(sacredCurrentsCoverage.totals.datedWitnesses, 46);
  assert.equal(sacredCurrentsCoverage.totals.mappedWitnesses, 0);
  assert.equal(
    sacredCurrentsCoverage.totals.artifacts,
    sacredCurrentsRecords.filter(({ kind }) => kind === "artifact").length,
  );
  assert.ok(sacredCurrentsCoverage.totals.artifacts >= 400);
  assert.equal(sacredCurrentsCoverage.totals.traditions, 52);
  assert.equal(
    sacredCurrentsRecords.length,
    sacredCurrentsCoverage.totals.works +
      sacredCurrentsCoverage.totals.witnesses +
      sacredCurrentsCoverage.totals.artifacts +
      sacredCurrentsCoverage.totals.traditions,
  );
  assert.equal(sacredCurrentsCoverage.totals.relationships, 22);
  assert.ok(sacredCurrentsStreams.length > 10);
  assert.equal(sacredCurrentsAnchors.length, 12);
  assert.ok(sacredCurrentsCatalog.changePointYears.length > 50);
});

test("unsupported geographic layers stay explicitly unavailable", () => {
  for (const id of [
    "historical-borders",
    "migration-routes",
    "trade-routes",
    "repository-paths",
  ] as const) {
    const layer = sacredCurrentsCoverage.layers.find((item) => item.id === id);
    assert.equal(layer?.status, "unavailable", id);
    assert.match(layer?.note ?? "", /no |cannot|not /iu, id);
  }
  assert.ok(
    sacredCurrentsRecords
      .filter(({ kind }) => kind === "witness")
      .every(({ geography }) => geography === null),
  );
  assert.ok(
    sacredCurrentsRecords
      .filter(({ geography }) => geography !== null)
      .every(
        ({ geography }) =>
          geography?.precision === "approximate-editorial-anchor" &&
          /not a historical border/iu.test(geography.note),
      ),
  );
});

test("Phase 17 connections retain citations, limits, and non-route semantics", () => {
  assert.equal(sacredCurrentsConnections.length, 22);
  assert.ok(
    sacredCurrentsConnections.every(
      (connection) =>
        connection.citations.length > 0 &&
        connection.citations.every(({ url }) => url.startsWith("https://")) &&
        connection.counterarguments.length > 0 &&
        connection.geographicMeaning === "relationship-not-route" &&
        connection.renderAsRoute === false,
    ),
  );
  assert.ok(
    sacredCurrentsConnections.some(({ drawableBetweenAnchors }) =>
      Boolean(drawableBetweenAnchors),
    ),
  );
  assert.ok(sacredCurrentsConnectionsForRecord("1-enoch").length >= 2);
  assert.equal(sacredCurrentsConnectionsForRecord("missing-record").length, 0);
});

test("historical date helpers skip year zero and format BCE/CE", () => {
  assert.equal(formatSacredYear(-300), "300 BCE");
  assert.equal(formatSacredYear(1), "1 CE");
  assert.equal(formatSacredYear(null), "Date unavailable");
  assert.equal(formatSacredRange(-300, 100), "300 BCE–100 CE");
  assert.equal(sacredYearOrdinal(-1) + 1, sacredYearOrdinal(1));
  assert.throws(() => formatSacredYear(0), /cannot be zero/iu);
  assert.throws(() => sacredYearOrdinal(0), /cannot be zero/iu);
});

test("Sacred Currents time domain remains fixed from 5000 BCE through present", () => {
  const years = buildSacredCurrentsTimeYears(
    [-6000, -2600, -1, 1, 1994, 2030],
    2026,
  );
  assert.equal(years[0], earliestSacredCurrentsYear);
  assert.equal(years.at(-1), 2026);
  assert.deepEqual(years, [-5000, -2600, -1, 1, 1994, 2026]);
  assert.equal(years.includes(0), false);
  assert.throws(
    () => buildSacredCurrentsTimeYears([-1, 0, 1], 2026),
    /year zero/iu,
  );
});

test("work date evidence comes from date-specific notes, not general confidence", () => {
  assert.equal(
    dateEvidenceStateFromNote(
      -300,
      "Editorial estimate · requires scholarly review",
    ),
    "provisional",
  );
  assert.equal(
    dateEvidenceStateFromNote(
      1969,
      "Documented publication or issue year in the linked source",
    ),
    "documented",
  );
  assert.equal(
    dateEvidenceStateFromNote(
      -2353,
      "Approximate range stated by the cited institutional source",
    ),
    "qualified",
  );
  assert.equal(dateEvidenceStateFromNote(1900, ""), "unreviewed");
  assert.equal(
    dateEvidenceStateFromNote(null, "Documented publication year"),
    "unavailable",
  );

  assert.equal(
    sacredCurrentsRecord("pyramid-texts")?.dateEvidence,
    "qualified",
  );
  assert.equal(sacredCurrentsRecord("1-enoch")?.dateEvidence, "provisional");
  assert.equal(
    sacredCurrentsRecord("the-satanic-bible")?.dateEvidence,
    "documented",
  );
});

test("search and filters are deterministic and preserve unknown evidence", () => {
  const enoch = filterSacredCurrents(sacredCurrentsRecords, {
    query: "enoch levant",
    kinds: ["work"],
  });
  assert.equal(enoch[0]?.entityId, "1-enoch");
  assert.ok(enoch.every(({ kind }) => kind === "work"));
  const mappedThrough500Bce = filterSacredCurrents(sacredCurrentsRecords, {
    year: -500,
    mappedOnly: true,
    includeUndated: false,
  });
  assert.ok(mappedThrough500Bce.length > 0);
  assert.ok(
    mappedThrough500Bce.every(
      ({ startYear, geography }) =>
        startYear !== null && startYear <= -500 && geography !== null,
    ),
  );
  const unknown = filterSacredCurrents(sacredCurrentsRecords, {
    year: 1,
    includeUndated: true,
    evidenceStates: ["unavailable"],
  });
  assert.ok(unknown.length > 0);
  assert.ok(unknown.every(({ startYear }) => startYear === null));
  assert.throws(
    () => filterSacredCurrents(sacredCurrentsRecords, { year: 0 }),
    /year zero/iu,
  );
  const artifactsWithImages = filterSacredCurrents(sacredCurrentsRecords, {
    kinds: ["artifact"],
    withImagesOnly: true,
  });
  assert.equal(
    artifactsWithImages.length,
    sacredCurrentsRecords.filter(
      ({ kind, hasImage }) => kind === "artifact" && hasImage,
    ).length,
  );
  assert.ok(artifactsWithImages.length >= 400);
  assert.ok(
    artifactsWithImages.every(
      ({ kind, hasImage }) => kind === "artifact" && hasImage,
    ),
  );
  const traditionGroups = filterSacredCurrents(sacredCurrentsRecords, {
    kinds: ["tradition"],
    geography: "unlocated",
  });
  assert.equal(traditionGroups.length, 52);
  assert.ok(traditionGroups.every(({ geography }) => geography === null));
});

test("scenes synchronize records, streams, anchors, and connections", () => {
  const scene = buildSacredCurrentsScene(sacredCurrentsCatalog, {
    query: "Enoch",
    year: 500,
    includeUndated: false,
  });
  assert.equal(scene.yearLabel, "500 CE");
  assert.ok(scene.records.some(({ entityId }) => entityId === "1-enoch"));
  assert.equal(scene.counts.records, scene.records.length);
  assert.equal(
    scene.counts.mapped,
    scene.anchors.flatMap(({ recordIds }) => recordIds).length,
  );
  const visibleIds = new Set(scene.records.map(({ id }) => id));
  assert.ok(
    scene.streams.every(({ recordIds }) =>
      recordIds.every((id) => visibleIds.has(id)),
    ),
  );
  assert.ok(
    scene.connections.every(
      ({ source, target }) =>
        (source.recordId !== null && visibleIds.has(source.recordId)) ||
        (target.recordId !== null && visibleIds.has(target.recordId)),
    ),
  );
  assert.equal(sacredCurrentsRecord("work:1-enoch")?.entityId, "1-enoch");
  assert.equal(sacredCurrentsRecord("1-enoch")?.id, "work:1-enoch");
});

test("change points are unique, chronological, and derive only from dates", () => {
  const records: SacredCurrentsRecord[] = [
    {
      ...sacredCurrentsRecords[0],
      id: "test:a",
      startYear: -1,
      endYear: 1,
    },
    {
      ...sacredCurrentsRecords[0],
      id: "test:b",
      startYear: -1,
      endYear: null,
    },
  ];
  assert.deepEqual(buildChangePointYears(records), [-1, 1]);
});
