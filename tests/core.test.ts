import { mkdtempSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
  museumArtifacts,
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
  const oracc = JSON.parse(
    readFileSync("data/open-data/oracc-epsd2-literary-selected.json", "utf8"),
  ) as {
    works: {
      qId: string;
      sourceJsonSha256: string;
      lines: { label: string; text: string }[];
    }[];
  };
  for (const e of editions) {
    if (e.id.startsWith("oracc-epsd2-")) {
      const qId = e.id.replace("oracc-epsd2-", "").toUpperCase();
      const retained = oracc.works.find((work) => work.qId === qId);
      assert.ok(retained, e.id);
      assert.match(retained.sourceJsonSha256, /^[a-f0-9]{64}$/);
      const original = retained.lines
        .map((line) => `${line.label}: ${line.text}`)
        .join("\n");
      const ingested = allPassages()
        .filter((p) => p.editionId === e.id)
        .map((p) => p.content)
        .join("\n");
      assert.equal(ingested, original, e.id);
      assert.equal(
        createHash("sha256").update(original).digest("hex"),
        e.sha256,
        e.id,
      );
      continue;
    }
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
      const headingIndex = (h: string, occurrence?: number) => {
        const escaped = h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matches = [
          ...full.matchAll(new RegExp("^[ \\t]*" + escaped + "[ \\t]*$", "gm")),
        ];
        assert.ok(matches.length);
        return (
          occurrence === undefined ? matches.at(-1) : matches[occurrence]
        )!.index!;
      };
      original = e.sourceSections
        .map((s) =>
          full.slice(
            headingIndex(s.startHeading, s.startOccurrence),
            s.endHeading
              ? headingIndex(s.endHeading, s.endOccurrence)
              : full.length,
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
test("Mesopotamian depth release keeps composites, tablets, translations and modern claims separate", () => {
  const additions = JSON.parse(
    readFileSync("data/seed/mesopotamia-additions.json", "utf8"),
  ) as {
    overrides: { id: string }[];
    records: { id: string; editionId: string | null }[];
    transliterationWorks: { id: string }[];
  };
  assert.equal(additions.overrides.length, 15);
  assert.equal(additions.records.length, 62);
  assert.equal(additions.transliterationWorks.length, 26);
  const mesopotamian = texts.filter(
    (text) =>
      text.traditionId ===
      "ancient-mesopotamia-sumer-akkad-babylon-assyria",
  );
  assert.equal(mesopotamian.length, 77);
  for (const id of additions.overrides.map((record) => record.id)) {
    const record = texts.find((text) => text.id === id);
    assert.ok(record, id);
    assert.notEqual(record.confidence, "Unreviewed", id);
    assert.ok(record.sourceUrl?.startsWith("https://"), id);
    assert.ok(record.metadataSources.every((url) => url.startsWith("https://")));
  }
  const oraccEditions = editions.filter((edition) =>
    edition.id.startsWith("oracc-epsd2-"),
  );
  assert.equal(oraccEditions.length, 26);
  assert.ok(
    oraccEditions.every(
      (edition) =>
        !edition.complete &&
        edition.language === "Sumerian transliteration" &&
        edition.note.includes("not an English translation") &&
        edition.note.includes("not a diplomatic edition"),
    ),
  );
  const mesopotamianPassages = allPassages().filter((passage) =>
    passage.editionId.startsWith("oracc-epsd2-"),
  );
  assert.equal(mesopotamianPassages.length, 477);
  assert.equal(
    new Set(mesopotamianPassages.map((passage) => passage.textId)).size,
    26,
  );
  assert.ok(
    mesopotamianPassages.every(
      (passage) =>
        passage.contentType === "Primary text" &&
        passage.sourceUrl.startsWith(
          "https://oracc.museum.upenn.edu/epsd2/literary/Q",
        ),
    ),
  );
  for (const record of additions.records.filter((item) => !item.editionId)) {
    assert.equal(
      mesopotamianPassages.some((passage) => passage.textId === record.id),
      false,
      record.id,
    );
  }
  const profile = workProfile("enki-and-ninmah")!;
  assert.equal(profile.coverage, "Transliteration only");
  assert.equal(profile.sourceDepth.Translation, "No translation bundled");
  assert.match(profile.sourceDepth["Original language"], /transliteration/i);
  const tablets = witnesses.filter((witness) =>
    witness.id.startsWith("cdli-p"),
  );
  assert.equal(tablets.length, 10);
  assert.ok(
    tablets.every(
      (witness) =>
        witness.sources.some((source) => source.startsWith("https://cdli.earth/P")) &&
        witness.description.includes("does not establish"),
    ),
  );
  const passageHits = search("Anunnaki", {
    preferPrimary: true,
    traditions: ["ancient-mesopotamia-sumer-akkad-babylon-assyria"],
  });
  assert.ok(passageHits.length >= 9);
  assert.equal(passageHits[0].contentType, "Primary text");
  assert.ok(passageHits.every((hit) => hit.sourceUrl.includes("oracc")));
  assert.ok(passageHits.some((hit) => hit.themes.includes("anunnaki")));
  for (const alias of ["Anunnaki", "Anunna", "Anuna", "Anunnaku"]) {
    const result = federatedSearch(alias, { mode: "Scholarly" });
    assert.equal(result[0]?.href, "/explore/anunnaki", alias);
    assert.equal(result[0]?.availability, "Sourced research guide", alias);
  }
  const research = JSON.parse(
    readFileSync("data/research/anunnaki-evidence.json", "utf8"),
  ) as {
    primarySources: { id: string; workId: string; sourceUrl: string }[];
    scholarship: { sourceUrl: string }[];
    alternatives: { sourceUrl: string }[];
    modernClaims: { id: string; sourceUrl: string }[];
    comparisons: {
      modernClaimId: string;
      ancientEvidenceIds: string[];
      limitation: string;
    }[];
  };
  const evidenceIds = new Set(research.primarySources.map((item) => item.id));
  const claimIds = new Set(research.modernClaims.map((item) => item.id));
  assert.ok(
    [...research.scholarship, ...research.alternatives, ...research.modernClaims].every(
      (item) => item.sourceUrl.startsWith("https://"),
    ),
  );
  assert.ok(
    research.primarySources.every(
      (item) =>
        texts.some((work) => work.id === item.workId) &&
        item.sourceUrl.startsWith("https://oracc"),
    ),
  );
  assert.ok(
    research.comparisons.every(
      (item) =>
        claimIds.has(item.modernClaimId) &&
        item.ancientEvidenceIds.every((id) => evidenceIds.has(id)) &&
        item.limitation.length > 30,
    ),
  );
  assert.ok(
    allPassages().every(
      (passage) => !research.modernClaims.some((claim) => passage.id === claim.id),
    ),
  );
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
test("Egypt expansion distinguishes sourced metadata from bounded editions", () => {
  const sinuhe = texts.find((text) => text.id === "tale-of-sinuhe");
  const westcar = texts.find((text) => text.id === "westcar-papyrus-tales");
  const pyramid = texts.find((text) => text.id === "pyramid-texts");
  assert.ok(
    sinuhe?.metadataSources.every((source) => source.startsWith("https://")),
  );
  assert.equal(sinuhe?.editionId, "pg-7386-tale-of-sinuhe");
  assert.equal(westcar?.editionId, "pg-7386-westcar-papyrus-tales");
  assert.equal(pyramid?.confidence, "B");
  assert.equal(pyramid?.lat, null);
  const egyptPassages = allPassages().filter(
    (passage) =>
      passage.editionId.startsWith("pg-7386-") ||
      passage.editionId.startsWith("pg-30508-") ||
      passage.editionId.startsWith("pg-7413-") ||
      passage.editionId.startsWith("pg-9411-") ||
      passage.editionId.startsWith("pg-15932-"),
  );
  assert.equal(egyptPassages.length, 348);
  assert.ok(
    egyptPassages.every(
      (passage) => !/(^|\n)\s*Remarks\s*($|\n)/m.test(passage.content),
    ),
  );
  assert.equal(
    new Set(egyptPassages.map((passage) => passage.editionId)).size,
    19,
  );
  assert.ok(
    egyptPassages
      .filter((passage) => passage.editionId === "pg-7413-taking-of-joppa")
      .every((passage) => passage.contentType === "Unknown"),
  );
  assert.ok(
    egyptPassages
      .filter((passage) => passage.editionId === "pg-7413-tale-of-two-brothers")
      .every((passage) => passage.contentType === "Primary text"),
  );
  const doomedBreak = egyptPassages.find((passage) =>
    passage.content.includes("[Here the papyrus breaks off.]"),
  );
  assert.equal(doomedBreak?.editionId, "pg-7413-doomed-prince");
  assert.equal(doomedBreak?.contentType, "Unknown");
  const setna = egyptPassages.filter(
    (passage) => passage.editionId === "pg-7413-setna-i-magic-book",
  );
  assert.deepEqual(
    setna
      .filter((passage) => passage.contentType === "Unknown")
      .map((p) => p.sequence),
    [1, 2, 16],
  );
  assert.ok(
    setna
      .filter((passage) => ![1, 2, 16].includes(passage.sequence))
      .every((passage) => passage.contentType === "Primary text"),
  );
  const downloads = JSON.parse(
    readFileSync("data/seed/downloads.json", "utf8"),
  ) as {
    id: number;
    sourceHeaderCredits: Record<string, string[]>;
  }[];
  const anthology = downloads.find((download) => download.id === 7413);
  assert.deepEqual(anthology?.sourceHeaderCredits.translator, []);
  assert.ok(
    anthology?.sourceHeaderCredits.author.includes("W. M. Flinders Petrie"),
  );
  for (const sourceId of [9411, 15932]) {
    const budge = downloads.find((download) => download.id === sourceId);
    assert.deepEqual(budge?.sourceHeaderCredits.translator, []);
    assert.ok(
      budge?.sourceHeaderCredits.author.includes("Sir E. A. Wallis Budge"),
    );
  }
  const reviewed = egyptPassages.filter(
    (passage) =>
      passage.editionId.startsWith("pg-9411-") ||
      passage.editionId.startsWith("pg-15932-"),
  );
  const reviewedEditionIds = new Set(reviewed.map((passage) => passage.editionId));
  assert.equal(reviewedEditionIds.size, 9);
  assert.ok(
    [...reviewedEditionIds].every((id) =>
      reviewed.some(
        (passage) =>
          passage.editionId === id && passage.contentType === "Primary text",
      ),
    ),
  );
  assert.ok(
    reviewed
      .filter((passage) => passage.contentType === "Footnote")
      .every((passage) =>
        /^(?:\[FN#\d+\]|\[Footnote \d+:)/.test(passage.content),
      ),
  );
  assert.equal(
    editions.find(
      (edition) => edition.id === "pg-9411-book-of-knowing-evolutions-ra",
    )?.sourceSections?.length,
    2,
  );
  assert.equal(
    editions.filter((edition) =>
      edition.id.startsWith("pg-9411-metternich-stela-"),
    ).length,
    1,
  );
  const egyptIds = new Set(
    texts
      .filter((text) => text.traditionId === "ancient-egypt")
      .map((text) => text.id),
  );
  assert.equal(egyptIds.size, 72);
  const newResearchRecordIds = [
    "book-of-nut",
    "books-of-breathing",
    "book-of-traversing-eternity",
    "opening-of-the-mouth-ritual",
    "book-of-two-ways",
    "instruction-of-hordedef",
    "teaching-for-king-merikare",
    "teaching-of-amenemhat-i",
    "loyalist-teaching",
    "instruction-of-ani",
    "instruction-of-ankhsheshonq",
    "instruction-of-khety-satire-of-trades",
    "teaching-of-a-man-for-his-son",
    "kemyt",
    "tale-of-wenamun",
    "tale-of-truth-and-falsehood",
    "setna-ii-si-osire",
    "dispute-of-a-man-with-his-ba",
    "harpers-songs",
    "admonitions-of-ipuwer",
    "prophecy-of-neferti",
    "apophis-and-seqenenre",
    "tale-of-neferkara-and-sasenet",
    "hymn-to-the-nile-flood",
    "chester-beatty-love-songs",
    "leiden-hymns-to-amun",
    "dramatic-ramesseum-papyrus",
    "harris-magical-papyrus",
    "london-leiden-demotic-magical-papyrus",
    "greek-egyptian-magical-formularies",
    "ancient-egyptian-book-of-thoth",
    "book-of-the-faiyum",
    "chester-beatty-dream-book",
    "egyptian-execration-texts",
    "egyptian-protective-amulet-texts",
    "dream-stele-of-thutmose-iv",
    "merneptah-victory-stele",
    "piye-victory-stela",
    "abydos-king-list",
    "annals-of-thutmose-iii-at-karnak",
    "battle-of-kadesh-inscriptions",
  ];
  assert.equal(newResearchRecordIds.length, 41);
  for (const id of newResearchRecordIds) {
    const record = texts.find((text) => text.id === id);
    assert.ok(record, id);
    assert.equal(record.traditionId, "ancient-egypt", id);
    assert.equal(record.editionId, null, id);
    assert.equal(record.confidence, "B", id);
    assert.equal(record.startDate, null, id);
    assert.equal(record.endDate, null, id);
    assert.equal(record.lat, null, id);
    assert.equal(record.lng, null, id);
    assert.equal(
      record.sourceStatus,
      "Reviewed academic or institutional metadata; no source text bundled",
      id,
    );
    assert.ok(record.sourceUrl?.startsWith("https://"), id);
    assert.ok(
      record.metadataSources.length > 0 &&
        record.metadataSources.every((source) => source.startsWith("https://")),
      id,
    );
    assert.ok(record.description.trim(), id);
    assert.ok(record.historicalContext.trim(), id);
    assert.ok(record.manuscripts.trim(), id);
  }
  const reviewedOriginalIds = [
    "pyramid-texts",
    "coffin-texts",
    "instruction-of-ptahhotep",
    "book-of-the-dead",
    "amduat",
    "book-of-gates",
    "book-of-caverns",
    "book-of-the-earth",
    "litany-of-re",
    "memphite-theology-shabaka-stone",
    "instruction-of-amenemope",
    "great-hymn-to-the-aten",
    "contendings-of-horus-and-seth",
  ];
  for (const id of reviewedOriginalIds) {
    const record = texts.find((text) => text.id === id);
    assert.ok(record, id);
    assert.notEqual(record.confidence, "Unreviewed", id);
    assert.ok(record.sourceUrl?.startsWith("https://"), id);
    assert.ok(
      record.metadataSources.length > 0 &&
        record.metadataSources.every((source) => source.startsWith("https://")),
      id,
    );
  }
  assert.equal(
    new Set(
      allPassages()
        .filter((passage) => egyptIds.has(passage.textId))
        .map((passage) => passage.textId),
    ).size,
    20,
  );
  assert.ok(
    editions
      .filter(
        (edition) =>
          edition.id.startsWith("pg-7386-") ||
          edition.id.startsWith("pg-30508-") ||
          edition.id.startsWith("pg-7413-"),
      )
      .every((edition) => edition.sourceSections?.length === 1),
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
  const harris = witnesses.find((w) => w.id === "bm-ea10060-harris-500");
  assert.deepEqual(harris?.workIds, ["taking-of-joppa", "doomed-prince"]);
  assert.deepEqual(harris?.languages, ["Late Egyptian"]);
  const dorbiney = witnesses.find((w) => w.id === "bm-ea10183-dorbiney");
  assert.deepEqual(dorbiney?.workIds, ["tale-of-two-brothers"]);
  assert.equal(dorbiney?.dateStart, -1215);
  const bremnerRhind = witnesses.find(
    (w) => w.id === "bm-ea10188-bremner-rhind",
  );
  assert.deepEqual(bremnerRhind?.workIds, ["book-of-knowing-evolutions-ra"]);
  assert.equal(bremnerRhind?.dateStart, -305);
  const metReview = JSON.parse(
    readFileSync("data/intake/met-egypt-reviewed.json", "utf8"),
  ) as {
    criteria: string;
    objects: {
      id: number;
      decision: string;
      expectedMinImages: number;
      witnessType: string | null;
      reviewNote: string;
    }[];
  };
  assert.equal(metReview.objects.length, 24);
  assert.ok(metReview.criteria.includes("No human remains"));
  for (const reviewed of metReview.objects) {
    assert.equal(reviewed.decision, "approved");
    assert.ok(reviewed.reviewNote.length > 20);
    const artifact = museumArtifacts.find(
      (item) => item.id === `met-${reviewed.id}`,
    );
    assert.ok(artifact);
    assert.ok(artifact.protocolReview);
    assert.ok(artifact.sensitivity);
    assert.ok(
      archiveImages.filter((image) => image.artifactId === artifact.id).length >=
        reviewed.expectedMinImages,
    );
    assert.ok(
      archiveImages
        .filter((image) => image.artifactId === artifact.id)
        .every((image) => image.workIds.length === 0),
    );
    assert.equal(Boolean(artifact.witnessId), Boolean(reviewed.witnessType));
  }
  assert.ok(
    ["Papyrus", "Ostracon", "Inscribed relief"].every((type) =>
      witnesses.some((witness) => witness.type === type),
    ),
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
