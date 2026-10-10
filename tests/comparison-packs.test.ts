import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  comparisonPackCoverage,
  comparisonPackDisplayComparisons,
  comparisonPackProvenanceSnapshot,
  comparisonPacks,
  getComparisonPack,
  resolveComparisonSlot,
  validateComparisonPacks,
} from "../packages/shared/comparison-packs";
import { allPassages } from "../packages/search";
import { editions } from "../packages/shared/catalog";

const expectedIds = [
  "afterlife",
  "creation",
  "wisdom",
  "devil-evil",
  "anunnaki",
  "ethiopian-tradition",
  "indigenous-creation",
];

test("comparison pack seed contains exactly seven stable discoverable routes", () => {
  assert.equal(validateComparisonPacks(), true);
  assert.deepEqual(
    comparisonPacks.map((pack) => pack.id),
    expectedIds,
  );
  assert.deepEqual(
    comparisonPacks.map((pack) => pack.route),
    expectedIds.map((id) => `/compare/${id}`),
  );
  assert.equal(
    new Set(
      comparisonPacks.flatMap((pack) =>
        pack.topicRoutes.map((route) => route.href),
      ),
    ).size >= 7,
    true,
  );
  assert.equal(
    comparisonPacks.reduce((sum, pack) => sum + pack.slots.length, 0),
    72,
  );

  const totals = comparisonPacks.reduce(
    (sum, pack) => {
      const coverage = comparisonPackCoverage(pack);
      sum.evidence += coverage.evidenceReady;
      sum.metadata += coverage.metadataOnly;
      sum.unclassified += coverage.unclassifiedSelection;
      sum.missing += coverage.missingSource;
      sum.restricted += coverage.culturallyRestricted;
      return sum;
    },
    { evidence: 0, metadata: 0, unclassified: 0, missing: 0, restricted: 0 },
  );
  assert.deepEqual(totals, {
    evidence: 17,
    metadata: 23,
    unclassified: 17,
    missing: 1,
    restricted: 14,
  });
  const bytes = readFileSync("data/seed/comparison-packs.json");
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "de01a22d52de542c81baee77970e7fdee7a776bac47ab39a6a5a018ce199efda",
  );
});

test("every cited passage and repository reference resolves without promoting metadata", () => {
  const passageById = new Map(
    allPassages().map((passage) => [passage.id, passage]),
  );
  for (const pack of comparisonPacks) {
    for (const slot of pack.slots) {
      const resolved = resolveComparisonSlot(slot);
      assert.ok(
        resolved.references.length > 0 || slot.status === "missing-source",
      );
      for (const citation of slot.citations) {
        const passage = passageById.get(citation.passageId);
        assert.ok(
          passage,
          `${slot.id} passage ${citation.passageId} must resolve`,
        );
        assert.equal(
          passage.textId,
          slot.workIds.find((id) => id === passage.textId),
        );
        assert.equal(passage.editionId, citation.editionId);
        assert.equal(passage.reference, citation.locator);
        assert.equal(passage.contentType, citation.contentType);
        assert.equal(passage.sourceUrl, citation.sourceUrl);
      }
      if (slot.status === "evidence-ready") {
        assert.ok(slot.citations.length > 0 || slot.researchRefs.length > 0);
        assert.ok(
          slot.citations.every(
            (citation) => citation.contentType !== "Unknown",
          ),
        );
      } else if (slot.status === "unclassified-selection") {
        assert.ok(slot.citations.length > 0);
        assert.ok(
          slot.citations.every(
            (citation) => citation.contentType === "Unknown",
          ),
        );
        assert.equal(slot.researchRefs.length, 0);
        assert.ok(slot.gap.trim());
      } else {
        assert.equal(
          slot.citations.length,
          0,
          `${slot.id} must not count metadata/restricted content as passage evidence`,
        );
        assert.equal(
          slot.researchRefs.length,
          0,
          `${slot.id} must not count metadata/restricted content as research evidence`,
        );
        assert.ok(slot.gap.trim(), `${slot.id} must expose its gap`);
      }
      if (slot.status === "culturally-restricted") {
        assert.ok(slot.protocolIds.length > 0);
        assert.ok(slot.community.trim());
        assert.equal(
          resolved.references.some(
            (reference) => reference.kind === "protocol",
          ),
          true,
        );
      }
    }
  }
});

test("requested cultural ranges and source-category boundaries remain explicit", () => {
  const afterlife = getComparisonPack("afterlife")!;
  assert.deepEqual(
    afterlife.slots.slice(0, 5).map((slot) => slot.requestedRange),
    [
      "Pyramid Texts",
      "Coffin Texts",
      "Book of the Dead",
      "Amduat",
      "Book of Gates",
    ],
  );
  for (const required of [
    "Zoroastrian afterlife",
    "Chinese traditions",
    "Indigenous traditions",
  ])
    assert.ok(afterlife.slots.some((slot) => slot.requestedRange === required));

  const anunnaki = getComparisonPack("anunnaki")!;
  const ancient = anunnaki.slots.find(
    (slot) => slot.id === "anunnaki-ancient",
  )!;
  const scholarship = anunnaki.slots.find(
    (slot) => slot.id === "anunnaki-scholarship",
  )!;
  const alternatives = anunnaki.slots.find(
    (slot) => slot.id === "anunnaki-alternatives",
  )!;
  const modern = anunnaki.slots.find((slot) => slot.id === "anunnaki-modern")!;
  assert.equal(ancient.researchRefs.length, 9);
  assert.ok(
    ancient.researchRefs.every((ref) => ref.collection === "primarySources"),
  );
  assert.ok(
    scholarship.researchRefs.every((ref) => ref.collection === "scholarship"),
  );
  assert.ok(
    alternatives.researchRefs.every((ref) => ref.collection === "alternatives"),
  );
  assert.ok(
    modern.researchRefs.every((ref) => ref.collection === "modernClaims"),
  );
  assert.match(modern.evidenceNote, /not evidence about ancient Mesopotamia/i);

  const ethiopian = getComparisonPack("ethiopian-tradition")!;
  const meqabyan = ethiopian.slots.find(
    (slot) => slot.id === "ethiopian-meqabyan",
  )!;
  const maccabees = ethiopian.slots.find(
    (slot) => slot.id === "ethiopian-western-canon",
  )!;
  assert.deepEqual(meqabyan.workIds, [
    "ethiopic-1-meqabyan",
    "ethiopic-2-meqabyan",
    "ethiopic-3-meqabyan",
  ]);
  assert.deepEqual(maccabees.workIds, ["1-maccabees", "2-maccabees"]);
  assert.equal(
    meqabyan.workIds.some((id) => maccabees.workIds.includes(id)),
    false,
  );
  assert.ok(ethiopian.slots.some((slot) => slot.requestedRange === "Enoch"));
  assert.ok(ethiopian.slots.some((slot) => slot.requestedRange === "Jubilees"));
  assert.equal(
    ethiopian.slots.filter(
      (slot) => slot.requestedRange === "church-order texts",
    ).length,
    4,
  );
  assert.ok(
    ethiopian.slots.some((slot) => slot.requestedRange === "Kebra Nagast"),
  );
});

test("Indigenous creation stays community-specific, protocol-aware, and honest about unavailable content", () => {
  const pack = getComparisonPack("indigenous-creation")!;
  assert.equal(pack.slots.length, 6);
  assert.equal(new Set(pack.slots.map((slot) => slot.community)).size, 6);
  assert.equal(new Set(pack.slots.flatMap((slot) => slot.protocolIds)).size, 6);
  assert.ok(
    pack.slots.every((slot) => slot.status === "culturally-restricted"),
  );
  assert.ok(pack.slots.every((slot) => slot.citations.length === 0));
  assert.ok(pack.slots.every((slot) => slot.researchRefs.length === 0));
  assert.match(pack.completionNote, /intentionally incomplete/i);
  const influence = pack.comparisons.find(
    (output) => output.id === "indigenous-alternative",
  )!;
  assert.equal(influence.influenceAssessment, "not-assessed");
  assert.match(influence.summary, /no source-level contact evidence/i);
  assert.match(influence.caution, /not proof of isolation/i);
});

test("each pack exposes distinct source-aware outputs without unsupported influence", () => {
  for (const pack of comparisonPacks) {
    assert.equal(pack.comparisons.length, 3);
    assert.equal(
      new Set(pack.comparisons.map((output) => output.mode)).size,
      3,
    );
    assert.equal(
      new Set(pack.comparisons.map((output) => output.summary)).size,
      3,
    );
    const slots = new Map(pack.slots.map((slot) => [slot.id, slot]));
    for (const output of pack.comparisons) {
      const referenced = [...output.evidenceSlotIds, ...output.contextSlotIds];
      assert.ok(referenced.length > 0);
      const actualCategories = new Set(
        (output.kind === "comparison-finding"
          ? output.evidenceSlotIds
          : output.contextSlotIds
        ).map((id) => slots.get(id)!.sourceCategory),
      );
      assert.ok(
        output.sourceCategories.every((category) =>
          actualCategories.has(category),
        ),
      );
      assert.ok(output.influenceAssessment.trim());
      assert.ok(output.caution.trim());
      if (output.kind === "comparison-finding") {
        assert.ok(output.evidenceSlotIds.length >= 2);
        assert.ok(
          output.evidenceSlotIds.every(
            (id) => slots.get(id)!.status === "evidence-ready",
          ),
        );
        assert.ok(
          output.contextSlotIds.every(
            (id) => slots.get(id)!.status !== "evidence-ready",
          ),
        );
      } else {
        assert.equal(output.evidenceSlotIds.length, 0);
        assert.ok(output.contextSlotIds.length > 0);
      }
      if (output.mode === "similarity")
        assert.notEqual(output.influenceAssessment, "documented-influence");
    }
  }
});

test("provenance snapshots are serializable, bounded, and contain no passage text", () => {
  for (const id of expectedIds) {
    const snapshot = comparisonPackProvenanceSnapshot(id);
    assert.ok(snapshot);
    const encoded = JSON.stringify(snapshot);
    assert.deepEqual(JSON.parse(encoded), snapshot);
    assert.equal("content" in (snapshot as object), false);
    assert.doesNotMatch(encoded, /"content"\s*:/);
    assert.equal(snapshot.pack.route, `/compare/${id}`);
    assert.equal(
      snapshot.evidence.length,
      getComparisonPack(id)!.slots.filter(
        (slot) => slot.status !== "culturally-restricted",
      ).length,
    );
    assert.equal(
      snapshot.omittedRestrictedSlotCount,
      getComparisonPack(id)!.slots.filter(
        (slot) => slot.status === "culturally-restricted",
      ).length,
    );
    const restrictedSlotIds = new Set(
      getComparisonPack(id)!
        .slots.filter((slot) => slot.status === "culturally-restricted")
        .map((slot) => slot.id),
    );
    const restrictedComparisonIds = getComparisonPack(id)!
      .comparisons.filter((comparison) =>
        [...comparison.evidenceSlotIds, ...comparison.contextSlotIds].some(
          (slotId) => restrictedSlotIds.has(slotId),
        ),
      )
      .map((comparison) => comparison.id);
    assert.equal(
      snapshot.omittedRestrictedComparisonCount,
      restrictedComparisonIds.length,
    );
    for (const slotId of restrictedSlotIds) {
      assert.equal(encoded.includes(slotId), false);
    }
    for (const comparisonId of restrictedComparisonIds) {
      assert.equal(encoded.includes(comparisonId), false);
    }
    assert.ok(
      snapshot.evidence.every(
        (entry) => entry.status !== "culturally-restricted",
      ),
    );
    assert.ok(
      snapshot.evidence
        .flatMap((entry) => entry.sourceUrls)
        .every((url) => url.startsWith("https://")),
    );
    assert.ok(
      snapshot.evidence.every((entry) =>
        entry.citations.every(
          (citation) =>
            citation.passageId.trim() &&
            citation.editionId.trim() &&
            citation.locator.trim() &&
            citation.contentType.trim() &&
            citation.sourceUrl.startsWith("https://"),
        ),
      ),
    );
    assert.ok(
      snapshot.comparisons.every(
        (comparison) => comparison.title.trim() && comparison.summary.trim(),
      ),
    );
    for (const entry of snapshot.evidence) {
      if (entry.status !== "evidence-ready") assert.ok(entry.gap.trim());
    }
  }
  assert.equal(comparisonPackProvenanceSnapshot("not-a-pack"), undefined);
});

test("pack provenance omits rights-revoked evidence and dependent findings", () => {
  const edition = editions.find(
    ({ id }) => id === "pg-7145-book-of-the-dead",
  );
  assert.ok(edition);
  const original = edition.license;
  const pack = getComparisonPack("afterlife")!;
  const slot = pack.slots.find(
    ({ id }) => id === "afterlife-book-of-dead",
  )!;
  const originalEvidenceReady = comparisonPackCoverage(pack).evidenceReady;
  try {
    edition.license = "Rights status unknown";
    const visibleSlot = resolveComparisonSlot(slot);
    assert.equal(visibleSlot.status, "metadata-only");
    assert.equal(
      visibleSlot.references.some(({ kind }) =>
        kind === "passage" || kind === "edition",
      ),
      false,
    );
    assert.equal(
      comparisonPackCoverage(pack).evidenceReady,
      originalEvidenceReady - 1,
    );
    const visibleComparisons = comparisonPackDisplayComparisons(pack);
    assert.equal(
      visibleComparisons.some(({ id }) => id === "afterlife-similarity"),
      false,
    );
    assert.equal(
      visibleComparisons.some(({ id }) => id === "afterlife-difference"),
      false,
    );
    const snapshot = comparisonPackProvenanceSnapshot("afterlife");
    assert.ok(snapshot);
    assert.equal(
      snapshot.evidence.some(
        ({ slotId }) => slotId === "afterlife-book-of-dead",
      ),
      false,
    );
    assert.equal(
      snapshot.comparisons.some(({ id }) => id === "afterlife-similarity"),
      false,
    );
    assert.equal(
      snapshot.comparisons.some(({ id }) => id === "afterlife-difference"),
      false,
    );
    assert.doesNotMatch(JSON.stringify(snapshot), /pg-7145-book-of-the-dead/iu);
  } finally {
    edition.license = original;
  }
});
