import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

process.env.ATLAS_DATA_DIR = mkdtempSync(
  path.join(tmpdir(), "atlas-collection-protocol-"),
);

import { GET, PATCH, POST } from "../app/api/[...path]/route";
import { closeDatabase, database } from "../packages/db/client";
import {
  getCollections,
  mutateCollections,
} from "../packages/db/collections";

after(closeDatabase);

const context = (path: string[]) => ({ params: Promise.resolve({ path }) });

test("collection save rejects culturally blocked work IDs nested in serialized findings", async () => {
  const created = await POST(
    new NextRequest("http://127.0.0.1:3000/api/collections", {
      method: "POST",
      headers: {
        host: "127.0.0.1:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: "Protocol regression" }),
    }),
    context(["collections"]),
  );
  assert.equal(created.status, 201);
  const collection = (await created.json()) as { id: string };

  const saved = await PATCH(
    new NextRequest(`http://127.0.0.1:3000/api/collections/${collection.id}`, {
      method: "PATCH",
      headers: {
        host: "127.0.0.1:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        add: {
          id: "nested-comparison",
          kind: "comparison",
          title: "Nested comparison",
          content: JSON.stringify({
            response: { texts: [{ textId: "popol-vuh" }] },
          }),
          createdAt: "2026-10-10T00:00:00.000Z",
        },
      }),
    }),
    context(["collections", collection.id]),
  );
  assert.equal(saved.status, 400);

  const removal = await PATCH(
    new NextRequest(`http://127.0.0.1:3000/api/collections/${collection.id}`, {
      method: "PATCH",
      headers: {
        host: "127.0.0.1:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify({ remove: "popol-vuh" }),
    }),
    context(["collections", collection.id]),
  );
  assert.equal(removal.status, 200);

  const fetched = await GET(
    new NextRequest(`http://127.0.0.1:3000/api/collections/${collection.id}`),
    context(["collections", collection.id]),
  );
  assert.equal(fetched.status, 200);
  assert.deepEqual((await fetched.json()).items, []);
});

test("concurrent collection reads never observe a partially committed rewrite", async () => {
  const db = await database();
  const count = 240;
  const fixtures = Array.from({ length: count }, (_, index) => ({
    id: `10000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    name: `Snapshot fixture ${index}`,
  }));
  await db.query(
    `INSERT INTO user_collections(id,name,notes,items,created_at,updated_at)
     SELECT item.id::uuid,item.name,'old-snapshot','[]'::jsonb,now(),now()
     FROM jsonb_to_recordset($1::jsonb) AS item(id text,name text)`,
    [JSON.stringify(fixtures)],
  );

  let mutationStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    mutationStarted = resolve;
  });
  const mutation = mutateCollections((all) => {
    mutationStarted();
    return all.map((collection) => ({
      ...collection,
      notes: "new-snapshot",
    }));
  });
  await started;
  const observed = await getCollections();
  await mutation;

  const fixtureIds = new Set(fixtures.map(({ id }) => id));
  const observedNotes = new Set(
    observed
      .filter(({ id }) => fixtureIds.has(id))
      .map(({ notes }) => notes),
  );
  assert.equal(observedNotes.size, 1);
  assert.ok(
    observedNotes.has("old-snapshot") || observedNotes.has("new-snapshot"),
  );

  const final = (await getCollections()).filter(({ id }) => fixtureIds.has(id));
  assert.equal(final.length, count);
  assert.ok(final.every(({ notes }) => notes === "new-snapshot"));
});
