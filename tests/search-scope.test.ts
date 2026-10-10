import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import assert from "node:assert/strict";

process.env.ATLAS_DATA_DIR = mkdtempSync(path.join(tmpdir(), "atlas-scope-"));

import { database, closeDatabase } from "../packages/db/client";
import { semanticCandidates } from "../packages/ai/embeddings";
import { editions, texts } from "../packages/shared/catalog";
import {
  databaseLexicalCandidates,
  mergeHybridCandidates,
} from "../packages/search/hybrid";
import {
  filterSearchProtocolCandidates,
  passageScopeSql,
} from "../packages/search/scope";
import type { Passage, SearchHit } from "../packages/shared/types";

after(closeDatabase);

test("database scope predicates are parameterized before candidate limits", () => {
  const params: unknown[] = ["question"];
  const sql = passageScopeSql(
    {
      textIds: ["target"],
      editionIds: ["edition"],
      traditions: ["tradition"],
      region: "Region",
      before: 200,
      after: -200,
      contentTypes: ["Primary text"],
    },
    params,
  );
  assert.match(sql, /p\.text_id = ANY\(\$3::text\[\]\)/);
  assert.match(sql, /p\.public_domain=true/);
  assert.match(sql, /t\.public_domain_available=true/);
  assert.match(sql, /e\.public_domain=true/);
  assert.match(sql, /t\.tradition_id = ANY\(\$5::text\[\]\)/);
  assert.match(sql, /approximate_start_date <= \$7/);
  assert.match(sql, /approximate_end_date >= \$8/);
  assert.match(sql, /NOT \(p\.text_id = ANY\(\$9::text\[\]\)\)/);
  assert.deepEqual(params.slice(0, 8), [
    "question",
    ["Primary text"],
    ["target"],
    ["edition"],
    ["tradition"],
    "Region",
    200,
    -200,
  ]);
  const protocolRestrictedIds = params[8] as string[];
  assert.ok(protocolRestrictedIds.includes("popol-vuh"));
  assert.ok(protocolRestrictedIds.includes("ifugao-hudhud-chants"));
});

function candidatePassage(
  id: string,
  textId: string,
  editionId: string,
): Passage {
  return {
    id,
    textId,
    editionId,
    sequence: 990000,
    reference: "Protocol regression fixture",
    content: "protocol candidate fixture",
    sourceUrl: "https://example.org/protocol-fixture",
    themes: [],
    contentType: "Primary text",
  };
}

test("simulated database and semantic candidates cannot bypass search protocols", () => {
  const allowedEdition = editions[0];
  const allowedText = texts.find((text) => text.id === allowedEdition.textId);
  assert.ok(allowedText);
  const allowed = candidatePassage(
    "protocol-allowed-candidate",
    allowedText.id,
    allowedEdition.id,
  );
  const restricted = candidatePassage(
    "protocol-restricted-candidate",
    "popol-vuh",
    "adversarial-restricted-edition",
  );

  const guarded = filterSearchProtocolCandidates([
    { metadata: restricted, textId: restricted.textId, rank: 100 },
    { metadata: allowed, textId: allowed.textId, rank: 1 },
    // A normalized-column/metadata mismatch also fails closed.
    { metadata: allowed, textId: restricted.textId, rank: 200 },
  ]);
  assert.deepEqual(
    guarded.map((row) => row.metadata.id),
    [allowed.id],
  );

  const restrictedLexical: SearchHit = {
    ...restricted,
    textTitle: "Restricted fixture",
    tradition: "Restricted fixture",
    translator: "Fixture",
    score: 500,
  };
  const merged = mergeHybridCandidates(
    [restrictedLexical],
    [{ metadata: restricted, textId: restricted.textId, rank: 400 }],
    [
      { metadata: restricted, textId: restricted.textId, rank: 300 },
      { metadata: allowed, textId: allowed.textId, rank: 1 },
    ],
  );
  assert.deepEqual(
    merged.map((hit) => hit.id),
    [allowed.id],
  );
});

test("more than one hundred out-of-scope hits cannot hide an in-scope passage", async () => {
  const db = await database();
  const targetEdition = editions[0];
  const distractorEdition = editions.find(
    (edition) => edition.textId !== targetEdition.textId,
  );
  assert.ok(distractorEdition);

  const phrase = "scoperanking sentinel";
  const targetId = "scope-regression-target";
  const rows = [
    {
      id: targetId,
      textId: targetEdition.textId,
      editionId: targetEdition.id,
      sequence: 900000,
      reference: "Scope regression target",
      content: phrase,
      sourceUrl: targetEdition.sourceUrl,
      themes: [],
      contentType: "Primary text",
    },
    ...Array.from({ length: 101 }, (_, index) => ({
      id: `scope-regression-distractor-${index}`,
      textId: distractorEdition.textId,
      editionId: distractorEdition.id,
      sequence: 900000 + index,
      reference: `Scope regression distractor ${index}`,
      content: Array(20).fill(phrase).join(" "),
      sourceUrl: distractorEdition.sourceUrl,
      themes: [],
      contentType: "Primary text",
    })),
  ];

  try {
    await db.query(
      `INSERT INTO passages(id,text_id,edition_id,sequence,reference,translation,translator,copyright_status,public_domain,source_url,content_type,metadata)
       SELECT v->>'id',v->>'textId',v->>'editionId',(v->>'sequence')::int,v->>'reference',v->>'content','Regression fixture','Public domain',true,v->>'sourceUrl',v->>'contentType',v
       FROM jsonb_array_elements($1::jsonb) AS v`,
      [JSON.stringify(rows)],
    );

    const global = await databaseLexicalCandidates(phrase);
    assert.equal(global.rows.length, 100);
    assert.equal(
      global.rows.some((row) => row.metadata.id === targetId),
      false,
    );

    const scoped = await databaseLexicalCandidates(phrase, {
      textIds: [targetEdition.textId],
      contentTypes: ["Primary text"],
    });
    assert.equal(
      scoped.rows.some((row) => row.metadata.id === targetId),
      true,
    );
    assert.ok(
      scoped.rows.every((row) => row.metadata.textId === targetEdition.textId),
    );
  } finally {
    await db.query("DELETE FROM passages WHERE id LIKE 'scope-regression-%'");
  }
});

test("restricted rows cannot crowd out public lexical or semantic evidence", async () => {
  const db = await database();
  const restrictedTextId = "popol-vuh";
  const allowedEdition = editions[0];
  const restrictedEditionId = "protocol-regression-restricted-edition";
  const phrase = "protocolcrowding sentinel";
  const targetId = "protocol-regression-allowed-target";
  const embeddingEnvironment = {
    key: process.env.ATLAS_EMBEDDING_API_KEY,
    base: process.env.ATLAS_EMBEDDING_BASE_URL,
    model: process.env.ATLAS_EMBEDDING_MODEL,
  };
  const originalFetch = globalThis.fetch;
  const original = await db.query<{ publicDomainAvailable: boolean }>(
    `SELECT public_domain_available AS "publicDomainAvailable"
     FROM texts WHERE id=$1`,
    [restrictedTextId],
  );
  assert.equal(original.rows.length, 1);

  const restrictedRows = Array.from({ length: 101 }, (_, index) =>
    candidatePassage(
      `protocol-regression-restricted-${index}`,
      restrictedTextId,
      restrictedEditionId,
    ),
  ).map((passage, index) => ({
    ...passage,
    sequence: 991000 + index,
    reference: `Restricted protocol regression ${index}`,
    content: Array(20).fill(phrase).join(" "),
  }));
  const target = {
    ...candidatePassage(targetId, allowedEdition.textId, allowedEdition.id),
    sequence: 992000,
    reference: "Allowed protocol regression target",
    content: phrase,
    sourceUrl: allowedEdition.sourceUrl,
  };

  try {
    await db.query(
      `UPDATE texts SET public_domain_available=true WHERE id=$1`,
      [restrictedTextId],
    );
    await db.query(
      `INSERT INTO editions(id,text_id,title,translator,language,license,source_url,sha256,public_domain,metadata)
       VALUES($1,$2,'Restricted protocol fixture','Fixture','English','Public domain','https://example.org/restricted-fixture','fixture',true,'{}'::jsonb)`,
      [restrictedEditionId, restrictedTextId],
    );
    await db.query(
      `INSERT INTO passages(id,text_id,edition_id,sequence,reference,translation,translator,copyright_status,public_domain,source_url,content_type,metadata)
       SELECT v->>'id',v->>'textId',v->>'editionId',(v->>'sequence')::int,v->>'reference',v->>'content','Regression fixture','Public domain',true,v->>'sourceUrl',v->>'contentType',v
       FROM jsonb_array_elements($1::jsonb) AS v`,
      [JSON.stringify([...restrictedRows, target])],
    );

    const result = await databaseLexicalCandidates(phrase);
    assert.equal(
      result.rows.some((row) => row.metadata.id === targetId),
      true,
    );
    assert.equal(
      result.rows.some((row) => row.metadata.textId === restrictedTextId),
      false,
    );

    await db.query(
      `UPDATE passages
       SET embedding=CASE WHEN text_id=$1 THEN '[1,0,0]'::vector ELSE '[0,1,0]'::vector END,
           embedding_model='protocol-regression-model'
       WHERE id LIKE 'protocol-regression-%'`,
      [restrictedTextId],
    );
    process.env.ATLAS_EMBEDDING_API_KEY = "protocol-regression-key";
    process.env.ATLAS_EMBEDDING_BASE_URL = "https://example.org";
    process.env.ATLAS_EMBEDDING_MODEL = "protocol-regression-model";
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ data: [{ embedding: [1, 0, 0] }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    const semantic = await semanticCandidates(phrase);
    assert.equal(
      semantic.some((row) => row.metadata.id === targetId),
      true,
    );
    assert.equal(
      semantic.some((row) => row.metadata.textId === restrictedTextId),
      false,
    );
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of [
      ["ATLAS_EMBEDDING_API_KEY", embeddingEnvironment.key],
      ["ATLAS_EMBEDDING_BASE_URL", embeddingEnvironment.base],
      ["ATLAS_EMBEDDING_MODEL", embeddingEnvironment.model],
    ] as const) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    await db.query(
      "DELETE FROM passages WHERE id LIKE 'protocol-regression-%'",
    );
    await db.query("DELETE FROM editions WHERE id=$1", [restrictedEditionId]);
    await db.query("UPDATE texts SET public_domain_available=$1 WHERE id=$2", [
      original.rows[0].publicDomainAvailable,
      restrictedTextId,
    ]);
  }
});

test("copyrighted edition rows cannot crowd out rights-cleared database evidence", async () => {
  const db = await database();
  const allowedEdition = editions[0];
  const copyrightedEditionId = "rights-regression-copyrighted-edition";
  const phrase = "rightscrowding sentinel";
  const targetId = "rights-regression-allowed-target";
  const distractors = Array.from({ length: 101 }, (_, index) => ({
    id: `rights-regression-copyrighted-${index}`,
    textId: allowedEdition.textId,
    editionId: copyrightedEditionId,
    sequence: 993000 + index,
    reference: `Copyrighted rights regression ${index}`,
    content: Array(20).fill(phrase).join(" "),
    sourceUrl: "https://example.org/copyrighted",
    themes: [],
    contentType: "Primary text",
  }));
  const target = {
    ...candidatePassage(targetId, allowedEdition.textId, allowedEdition.id),
    sequence: 994000,
    reference: "Rights-cleared regression target",
    content: phrase,
    sourceUrl: allowedEdition.sourceUrl,
  };

  try {
    await db.query(
      `INSERT INTO editions(id,text_id,title,translator,language,license,source_url,sha256,public_domain,metadata)
       VALUES($1,$2,'Copyrighted fixture','Fixture','English','Copyrighted edition. All rights reserved.','https://example.org/copyrighted','fixture',false,'{}'::jsonb)`,
      [copyrightedEditionId, allowedEdition.textId],
    );
    await db.query(
      `INSERT INTO passages(id,text_id,edition_id,sequence,reference,translation,translator,copyright_status,public_domain,source_url,content_type,metadata)
       SELECT v->>'id',v->>'textId',v->>'editionId',(v->>'sequence')::int,v->>'reference',v->>'content','Regression fixture','Adversarial passage flag',true,v->>'sourceUrl',v->>'contentType',v
       FROM jsonb_array_elements($1::jsonb) AS v`,
      [JSON.stringify([...distractors, target])],
    );

    const result = await databaseLexicalCandidates(phrase);
    assert.equal(
      result.rows.some((row) => row.metadata.id === targetId),
      true,
    );
    assert.equal(
      result.rows.some(
        (row) => row.metadata.editionId === copyrightedEditionId,
      ),
      false,
    );
  } finally {
    await db.query("DELETE FROM passages WHERE id LIKE 'rights-regression-%'");
    await db.query("DELETE FROM editions WHERE id=$1", [copyrightedEditionId]);
  }
});
