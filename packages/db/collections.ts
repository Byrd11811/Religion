import { database } from "./client";
import type { Collection } from "@/packages/shared/types";
let queue: Promise<unknown> = Promise.resolve();
export async function getCollections(): Promise<Collection[]> {
  const db = await database();
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
    name: r.name,
    notes: r.notes,
    items: r.items,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}
export async function mutateCollections(
  fn: (all: Collection[]) => Collection[],
) {
  const next = queue.then(async () => {
    const db = await database();
    const all = await getCollections();
    const result = fn(all);
    await db.query("BEGIN");
    try {
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
