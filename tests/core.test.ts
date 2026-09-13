import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
process.env.ATLAS_DATA_DIR = mkdtempSync(path.join(tmpdir(), "atlas-unit-"));
import test, { after } from "node:test";
import { closeDatabase } from "../packages/db/client";
after(closeDatabase);
import assert from "node:assert/strict";
import {
  texts,
  traditions,
  editions,
  relationships,
} from "../packages/shared/catalog";
import { allPassages, search } from "../packages/search";
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
