import { database, type AtlasDatabase } from "./client";
import type { Collection } from "@/packages/shared/types";
import {
  assertPayloadProtocols,
  payloadProtocolAllowed,
} from "@/packages/shared/protocols";
import { findingRightsAllowed } from "@/packages/citation";
let queue: Promise<unknown> = Promise.resolve();
async function readCollections(db: AtlasDatabase): Promise<Collection[]> {
  const result = await db.query<{
    id: string;
    name: string;
    notes: string;
    items: Collection["items"];
    created_at: Date | string;
    updated_at: Date | string;
  }>("SELECT * FROM user_collections ORDER BY created_at");
  return result.rows.map((r) => ({
    id: r.id,
    name: payloadProtocolAllowed(r.name, "cache")
      ? r.name
      : "Restricted collection",
    notes: payloadProtocolAllowed(r.notes, "cache") ? r.notes : "",
    items: r.items.filter(
      (item) =>
        payloadProtocolAllowed(item, "cache") && findingRightsAllowed(item),
    ),
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function getCollections(): Promise<Collection[]> {
  return readCollections(await database());
}

async function applyMutation(
  db: AtlasDatabase,
  fn: (all: Collection[]) => Collection[],
) {
  const all = await readCollections(db);
  const result = fn(all);
  for (const collection of result)
    assertPayloadProtocols(collection, "cache");
  for (const c of result)
    await db.query(
      "INSERT INTO user_collections(id,name,notes,items,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,notes=EXCLUDED.notes,items=EXCLUDED.items,updated_at=EXCLUDED.updated_at",
      [
        c.id,
        c.name,
        c.notes,
        JSON.stringify(c.items),
        c.createdAt,
        c.updatedAt,
      ],
    );
  for (const c of all)
    if (!result.some((x) => x.id === c.id))
      await db.query("DELETE FROM user_collections WHERE id=$1", [c.id]);
  return result;
}

export async function mutateCollections(
  fn: (all: Collection[]) => Collection[],
) {
  const next = queue.then(async () => {
    const db = await database();
    if (db.transaction)
      return db.transaction(async (transaction) => {
        // Serialize the read/modify/write cycle across application processes.
        // The in-process queue provides the equivalent guarantee for PGlite.
        if (db.supportsAdvisoryTransactionLocks)
          await transaction.query(
            "SELECT pg_advisory_xact_lock(hashtext($1))",
            ["atlas:user-collections"],
          );
        return applyMutation(transaction, fn);
      });
    await db.query("BEGIN");
    try {
      const result = await applyMutation(db, fn);
      await db.query("COMMIT");
      return result;
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    }
  });
  queue = next.catch(() => {});
  return next;
}
