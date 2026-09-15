import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
process.env.ATLAS_DATA_DIR = mkdtempSync(path.join(tmpdir(), "atlas-unit-"));
import test, { after } from "node:test";
import { closeDatabase, database } from "../packages/db/client";
import { syncArchive } from "../packages/db/archive";
import { createManifest, readManifest } from "../packages/shared/iiif";
import {
  workProfile,
  witnesses,
  archiveImages,
  validateImage,
  mayTranslate,
} from "../packages/shared/archive";
after(closeDatabase);
import assert from "node:assert/strict";
import {
  texts,
  traditions,
  editions,
  relationships,
} from "../packages/shared/catalog";
import { allPassages, search } from "../packages/search";
import { federatedSearch } from "../packages/search/federated";
import { answerQuestion, neutral } from "../packages/ai";
import {
  readingGuides,
  guideFor,
  comparisonCases,
} from "../packages/ai/guides";
import { detectConcepts } from "../packages/ontology";
import { exportCsv, exportMarkdown } from "../packages/citation";
import type { Collection } from "../packages/shared/types";
test("ingested editions preserve every source word in sequence", () => {
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
  for (const e of editions) {
    const raw = readFileSync(
      `data/public-domain/${e.sourceFile ?? e.id.replace("pg-", "") + ".txt"}`,
      "utf8",
    );
    const start = raw.match(
      /\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i,
    );
    const end = raw.search(
      /\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i,
    );
    assert.ok(start && end > 0);
    let original = raw
      .slice(start.index! + start[0].length, end)
      .replace(/\r\n|\r/g, "\n");
    if (e.sourceSections) {
      const full = original;
      const headingIndex = (h: string) => {
        const escaped = h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matches = [
          ...full.matchAll(new RegExp("^[ \\t]*" + escaped + "[ \\t]*$", "gm")),
        ];
        assert.ok(matches.length);
        return matches.at(-1)!.index!;
      };
      original = e.sourceSections
        .map((s) =>
          full.slice(
            headingIndex(s.startHeading),
            s.endHeading ? headingIndex(s.endHeading) : full.length,
          ),
        )
        .join("\n\n");
    }
    const ingested = allPassages()
      .filter((p) => p.editionId === e.id)
      .map((p) => p.content)
      .join("\n\n");
    assert.equal(normalize(ingested), normalize(original), e.id);
  }
});
test("catalog has unique records and valid tradition/edition references", () => {
  assert.ok(texts.length >= 100);
  assert.equal(new Set(texts.map((t) => t.id)).size, texts.length);
  for (const t of texts) {
    assert.ok(traditions.some((tr) => tr.id === t.traditionId));
    if (t.editionId)
      assert.ok(
        editions.some((e) => e.id === t.editionId && e.textId === t.id),
      );
    if (t.startDate !== null)
      assert.ok(t.endDate !== null && t.startDate <= t.endDate);
  }
});
test("Egypt starter expansion keeps sourced metadata separate from editions", () => {
  const sinuhe = texts.find((text) => text.id === "tale-of-sinuhe");
  const westcar = texts.find((text) => text.id === "westcar-papyrus-tales");
  const pyramid = texts.find((text) => text.id === "pyramid-texts");
  assert.ok(
    sinuhe?.metadataSources.every((source) => source.startsWith("https://")),
  );
  assert.equal(sinuhe?.editionId, null);
  assert.equal(westcar?.editionId, null);
  assert.equal(pyramid?.confidence, "B");
  assert.equal(pyramid?.lat, null);
  assert.equal(
    editions.some((edition) =>
      [sinuhe?.id, westcar?.id].includes(edition.textId),
    ),
    false,
  );
});
test("at least twenty distinct works have complete, attributed editions", () => {
  assert.ok(
    new Set(editions.filter((e) => e.complete).map((e) => e.textId)).size >= 20,
  );
  for (const e of editions) {
    assert.ok(e.translator.length > 0);
    assert.ok(e.license.includes("Public domain"));
    const p = allPassages().filter((p) => p.editionId === e.id);
    assert.equal(p.length, e.passageCount);
    assert.equal(p[0].sequence, 1);
    assert.equal(p.at(-1)?.sequence, e.passageCount);
    assert.ok(e.sha256.match(/^[a-f0-9]{64}$/));
  }
});
test("exact search returns verbatim content and honors text restrictions", () => {
  const hits = search("soul", { exact: true, textIds: ["plato-phaedo"] });
  assert.ok(hits.length > 0);
  for (const hit of hits) {
    assert.equal(hit.textId, "plato-phaedo");
    assert.ok(hit.content.toLowerCase().includes("soul"));
    assert.equal(
      allPassages().find((p) => p.id === hit.id)?.content,
      hit.content,
    );
  }
});
test("source-type filtering never presents scholarly studies as primary text", () => {
  const primary = search("God", {
    contentTypes: ["Primary text"],
    limit: 20,
  });
  assert.ok(primary.length > 0);
  assert.ok(primary.every((p) => p.contentType === "Primary text"));
  const commentary = search("Gilgamesh", {
    contentTypes: ["Scholarly commentary"],
    limit: 20,
  });
  assert.ok(commentary.length > 0);
  assert.ok(
    commentary.every(
      (p) =>
        p.contentType === "Scholarly commentary" &&
        p.editionId === "pg-11000-epic-of-gilgamesh",
    ),
  );
});
test("federated search resolves aliases and retains metadata-only works", () => {
  const alias = federatedSearch("Dao De Jing");
  assert.equal(alias[0]?.id, "tao-te-ching");
  assert.ok(alias[0]?.aliases.includes("Dao De Jing"));
  const metadata = federatedSearch("Enuma Elish");
  assert.equal(metadata[0]?.id, "enuma-elish");
  assert.equal(metadata[0]?.availability, "Metadata only");
});
test("federated modes filter scope before applying limits", () => {
  const manuscripts = federatedSearch("manuscript", {
    mode: "Manuscripts",
    limit: 1,
  });
  assert.equal(manuscripts.length, 1);
  assert.ok(manuscripts.every((item) => item.type === "witness"));
  const artifactOnly = federatedSearch("museum", {
    types: ["artifact"],
    limit: 5,
  });
  assert.ok(artifactOnly.length > 0);
  assert.ok(artifactOnly.every((item) => item.type === "artifact"));
  const hebrew = federatedSearch("Genesis", {
    language: "Hebrew",
    rights: "Public-domain text",
  });
  assert.equal(hebrew[0]?.id, "genesis");
  assert.equal(federatedSearch("Genesis", { language: "Greek" }).length, 0);
  const metadata = federatedSearch("Enuma Elish", {
    rights: "Rights review required",
  });
  assert.equal(metadata[0]?.availability, "Metadata only");
});
test("unknown queries never fabricate source results", () => {
  assert.deepEqual(search("zxqvnonexistentword"), []);
  assert.deepEqual(search("the and what"), []);
});
test("cross-tradition retrieval diversifies the evidence", () => {
  const hits = search("What happens after death?", { diverse: true });
  assert.ok(new Set(hits.map((h) => h.tradition)).size >= 4);
  assert.equal(new Set(hits.map((h) => h.textId)).size, hits.length);
});
test("query answer exposes limitations and source ids", async () => {
  const result = await answerQuestion("Why do we suffer?");
  assert.ok(result.passages.length);
  assert.ok(result.uncertainty.length >= 3);
  assert.ok(
    result.passages.every((p) =>
      p.sourceUrl.startsWith("https://www.gutenberg.org/"),
    ),
  );
  assert.ok(neutral(result.summary));
  assert.equal(neutral("This is the most true religion"), false);
});
test("relationships never omit evidence or uncertainty", () => {
  for (const r of relationships) {
    assert.ok(texts.some((t) => t.id === r.source));
    assert.ok(texts.some((t) => t.id === r.target));
    assert.ok(r.sourceUrl.startsWith("https://"));
    assert.ok(r.confidence);
    assert.ok(r.difference);
  }
});
test("concept expansion is bounded and explicit", () => {
  assert.ok(detectConcepts("death and soul").includes("afterlife"));
  assert.deepEqual(detectConcepts("zxqv"), []);
});
test("archive separates physical witnesses, works and image associations", () => {
  assert.ok(texts.every((t) => workProfile(t.id)?.id === t.id));
  assert.equal(
    witnesses.find((w) => w.id === "codex-gigas")?.type,
    "Manuscript compilation",
  );
  assert.equal(
    mayTranslate(witnesses.find((w) => w.id === "voynich-ms-408")!),
    false,
  );
  for (const coverage of ["Lost", "Hypothetical", "Restricted"] as const)
    assert.equal(
      mayTranslate({
        coverage,
        decipherment: "Not assessed",
        access: "Public metadata",
      }),
      false,
    );
  assert.equal(
    mayTranslate({
      decipherment: "Readable edition available",
      access: "Restricted",
    }),
    false,
  );
  for (const image of archiveImages) {
    validateImage(image);
    assert.ok(image.workIds.every((id) => texts.some((t) => t.id === id)));
    if (image.id === "assyrian-tablet" || image.id === "buddhist-leaf")
      assert.deepEqual(image.workIds, []);
  }
  assert.throws(() => validateImage({ ...archiveImages[0], rights: "" }));
  assert.throws(() =>
    validateImage({ ...archiveImages[0], sourceUrl: "javascript:alert(1)" }),
  );
});
test("IIIF manifests preserve source images and reject unsafe content URLs", () => {
  const images = archiveImages.filter((i) => i.artifactId === "met-548344");
  assert.ok(images.length > 1);
  const manifest = createManifest(
    "https://atlas.example/api/iiif/test",
    "Test artifact",
    images,
  );
  const result = readManifest(manifest);
  assert.equal(result.pages.length, images.length);
  assert.equal(result.pages[0].imageUrl, images[0].imageUrl);
  manifest.items[0].items[0].items[0].body.id = "javascript:alert(1)";
  assert.throws(() => readManifest(manifest));
});
test("archive migration is idempotent and preserves collection notes and old identifiers", async () => {
  const db = await database();
  const id = "11111111-1111-4111-8111-111111111111";
  await db.query(
    "INSERT INTO user_collections(id,name,notes) VALUES($1,'Migration check','Keep this research')",
    [id],
  );
  await syncArchive(db);
  await syncArchive(db);
  const result = await db.query<{ notes: string }>(
    "SELECT notes FROM user_collections WHERE id=$1",
    [id],
  );
  assert.equal(result.rows[0].notes, "Keep this research");
  const count = await db.query<{ total: number }>(
    "SELECT count(*)::int AS total FROM works WHERE id=legacy_text_id",
  );
  assert.equal(count.rows[0].total, texts.length);
  await db.query("DELETE FROM user_collections WHERE id=$1", [id]);
});
test("editorial guides retain actual evidence and respect restricted scope", () => {
  for (const guide of readingGuides())
    for (const p of guide.perspectives) {
      assert.ok(
        p.passageIds.every((id) =>
          allPassages().some((s) => s.id === id && s.textId === p.textId),
        ),
      );
    }
  assert.ok(guideFor("Why do we suffer?", {}));
  assert.equal(
    guideFor("Why do we suffer?", { textIds: ["dhammapada"] }),
    undefined,
  );
  assert.equal(guideFor("Why do we suffer?", { before: -2000 }), undefined);
  const ids = ["pg-216-30", "pg-3330-75"].map(
    (id) => allPassages().find((p) => p.id === id)!.textId,
  );
  assert.equal(comparisonCases(ids, "injury").length, 1);
  assert.equal(comparisonCases(ids, "creation").length, 0);
});
test("exports escape CSV formulas and preserve citation URLs", () => {
  const c: Collection = {
    id: "test",
    name: "Research",
    notes: "Context",
    createdAt: "2026",
    updatedAt: "2026",
    items: [
      {
        id: "item",
        kind: "text",
        title: "=1+1",
        content: 'A "quoted" line\nSecond line',
        sourceUrl: "https://example.org/source",
        createdAt: "2026",
      },
    ],
  };
  assert.ok(exportCsv(c).includes("'=1+1"));
  assert.ok(exportCsv(c).includes('""quoted""'));
  assert.ok(exportMarkdown(c).includes("https://example.org/source"));
});
