import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  measureCoverage,
  type CoverageInput,
  uniqueIds,
} from "../packages/audit/coverage";
import {
  sections,
  requirementInventory,
  corpusTargets,
} from "../packages/audit/requirements";
import {
  texts,
  traditions,
  editions,
  relationships,
} from "../packages/shared/catalog";
import {
  witnesses,
  museumArtifacts,
  archiveImages,
} from "../packages/shared/archive";
import type { Passage } from "../packages/shared/types";
import { passageSeedFiles } from "../packages/shared/seed-files";
import mesopotamiaAdditions from "../data/seed/mesopotamia-additions.json";
import chinaAdditions from "../data/seed/china-additions.json";
import hornAdditions from "../data/seed/horn-additions.json";

const input: CoverageInput = {
  texts,
  traditions,
  editions,
  relationships,
  witnesses,
  artifacts: museumArtifacts,
  images: archiveImages,
  passages: passageSeedFiles.flatMap(
    (filename) =>
      JSON.parse(readFileSync(`data/seed/${filename}`, "utf8")) as Passage[],
  ),
  additionalCollections: {
    transliterationWorks: mesopotamiaAdditions.transliterationWorks,
    originalTextWorks: chinaAdditions.originalTextWorks,
    canonMemberships: hornAdditions.canonMemberships,
    recensions: hornAdditions.recensions,
    bibliographyWorks: hornAdditions.bibliographyWorks,
  },
};
const read = (file: string) => readFileSync(file, "utf8");
test("coverage distinguishes real edition content, complete editions, unknown classification and deployment counts", () => {
  const metrics = measureCoverage(input, 2026);
  const get = (id: string) => metrics.find((m) => m.id === id)!;
  assert.equal(get("works").seeded, 506);
  assert.equal(get("searchableWorks").seeded, 116);
  assert.equal(get("completeEditionWorks").seeded, 83);
  assert.equal(get("passages").seeded, 30680);
  assert.equal(get("primaryPassages").seeded, 18011);
  assert.equal(get("editorialPassages").seeded, 281);
  assert.equal(get("unclassifiedPassages").seeded, 12388);
  assert.equal(get("witnesses").seeded, 38);
  assert.equal(get("mappedWorks").seeded, 34);
  assert.equal(get("coordinateWorks").seeded, 34);
  assert.equal(get("languageMetadataWorks").seeded, 273);
  assert.equal(get("originalTextWorks").seeded, 30);
  assert.equal(get("transliterationWorks").seeded, 26);
  assert.equal(get("recensions").seeded, 2);
  assert.equal(get("canonMemberships").seeded, 5);
  assert.equal(get("bibliographyWorks").seeded, 4);
  assert.ok(
    metrics.every(
      (m) => m.persisted === null && m.tested === null && !m.complete,
    ),
  );
});
test("metadata editions and empty content cannot inflate searchable or complete work counts", () => {
  const metrics = measureCoverage(
    { ...input, passages: input.passages.map((p) => ({ ...p, content: " " })) },
    2026,
  );
  assert.equal(metrics.find((m) => m.id === "searchableWorks")!.seeded, 0);
  assert.equal(metrics.find((m) => m.id === "completeEditionWorks")!.seeded, 0);
});

test("named historical collections are measured from records instead of frozen zero counts", () => {
  const metrics = measureCoverage(
    { ...input, additionalCollections: { polities: [{ id: "test-polity" }] } },
    2026,
  );
  assert.equal(metrics.find((m) => m.id === "polities")!.seeded, 1);
  assert.equal(metrics.find((m) => m.id === "polities")!.persisted, null);
  assert.throws(
    () =>
      measureCoverage(
        {
          ...input,
          additionalCollections: { polities: [{ id: "same" }, { id: "same" }] },
        },
        2026,
      ),
    /duplicate/,
  );
});
test("duplicate and mismatched source associations fail instead of silently changing the denominator", () => {
  assert.throws(
    () => uniqueIds([{ id: "same" }, { id: "same" }], "fixture"),
    /duplicate/,
  );
  assert.throws(
    () =>
      measureCoverage(
        { ...input, passages: [{ ...input.passages[0], textId: "absent" }] },
        2026,
      ),
    /Orphan/,
  );
  assert.throws(
    () =>
      measureCoverage(
        { ...input, images: [{ ...input.images[0], artifactId: "absent" }] },
        2026,
      ),
    /Orphan/,
  );
});
test("coordinates at zero count while null coordinates and unknown dates are distinguished", () => {
  const selected = { ...input.texts[0], lat: 0, lng: 0, startDate: null };
  const minimal: CoverageInput = {
    texts: [selected],
    traditions: [],
    editions: [],
    passages: [],
    witnesses: [],
    artifacts: [],
    images: [],
    relationships: [],
  };
  const m = measureCoverage(minimal, 2026);
  assert.equal(m.find((r) => r.id === "coordinateWorks")!.seeded, 1);
  assert.equal(m.find((r) => r.id === "mappedWorks")!.seeded, 1);
  assert.equal(m.find((r) => r.id === "undatedWorks")!.seeded, 1);
});
test("requirement inventory covers all audit sections and both safety suites without closing features", () => {
  const audit = read("docs/atlas-completion-gap-audit.md");
  const expansion = read("docs/expansion-spec.md");
  const roadmap = read("docs/atlas-completion-roadmap.md");
  const directive = read("docs/atlas-final-completion-directive.md");
  const matrix = requirementInventory(audit, expansion, roadmap, directive);
  assert.equal(matrix.requirements.length, 233);
  assert.equal(matrix.quality.length, 58);
  assert.ok(matrix.requirements.every((r) => r.owners.length && !r.complete));
  assert.ok(
    matrix.quality.every((r) => !r.complete && r.status === "unverified"),
  );
  assert.throws(
    () =>
      requirementInventory(
        audit.replace("# 73.", "# 173."),
        expansion,
        roadmap,
        directive,
      ),
    /inventory changed/,
  );
  assert.throws(
    () =>
      requirementInventory(
        audit,
        expansion,
        roadmap.replace("35. Long-term religious", "36. Long-term religious"),
        directive,
      ),
    /Invalid rule/,
  );
  assert.deepEqual(sections(audit), sections(audit.replace(/\r?\n/g, "\r\n")));
  assert.throws(
    () => requirementInventory(audit, expansion, roadmap, directive.replace("# 119.", "# 120.")),
    /directive inventory changed/i,
  );
});

test("original title mapping retains repeated requirements without duplicating works and preserves expansion targets", () => {
  const targets = corpusTargets(
    read("docs/product-spec.md"),
    read("docs/expansion-spec.md"),
    texts,
  );
  assert.equal(targets.original.length, 250);
  assert.equal(new Set(targets.original.map((t) => t.targetId)).size, 248);
  assert.ok(targets.original.every((t) => t.workId && t.owner && !t.complete));
  assert.equal(targets.expansion.length, 53);
  assert.ok(
    targets.expansion.some(
      (t) => t.title.includes("JAPAN AND KOREA") && t.owner === "9A",
    ),
  );
  const missing = corpusTargets(
    read("docs/product-spec.md"),
    read("docs/expansion-spec.md"),
    [],
  );
  assert.ok(
    missing.original.every(
      (t) => t.workId === null && t.status === "intake-target",
    ),
  );
});
