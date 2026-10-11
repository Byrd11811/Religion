import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { Pool, type PoolClient } from "pg";
import { readFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import {
  texts,
  traditions,
  editions,
  artifacts,
} from "@/packages/shared/catalog";
import { themes } from "@/packages/ontology";
import { syncArchive } from "./archive";
import { syncTaxonomy } from "./taxonomy";
import { syncOntology } from "./ontology";
import { syncRelationships } from "./relationships";
import type { Passage, Collection } from "@/packages/shared/types";
import { passageSeedFiles } from "@/packages/shared/seed-files";
import { aiRightsDecision } from "@/packages/shared/rights";
export interface AtlasDatabase {
  supportsAdvisoryTransactionLocks?: boolean;
  exec(sql: string): Promise<void>;
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
  transaction?<T>(fn: (db: AtlasDatabase) => Promise<T>): Promise<T>;
  queryCancellable?<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] | undefined,
    signal: AbortSignal,
  ): Promise<{ rows: T[] }>;
}

export function databaseQuery<T = Record<string, unknown>>(
  db: AtlasDatabase,
  sql: string,
  params?: unknown[],
  signal?: AbortSignal,
) {
  return signal && db.queryCancellable
    ? db.queryCancellable<T>(sql, params, signal)
    : db.query<T>(sql, params);
}
const state = globalThis as unknown as {
  atlasDatabase?: Promise<AtlasDatabase>;
  atlasClose?: () => Promise<void>;
};

function operationAbort(signal: AbortSignal) {
  return (
    signal.reason ?? new DOMException("Operation aborted", "AbortError")
  );
}

async function acquirePoolClient(pool: Pool, signal: AbortSignal) {
  if (signal.aborted) throw operationAbort(signal);
  return new Promise<PoolClient>((resolve, reject) => {
    let finished = false;
    const onAbort = () => {
      if (finished) return;
      finished = true;
      reject(operationAbort(signal));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    void pool.connect().then(
      (client) => {
        if (finished) {
          client.release();
          return;
        }
        finished = true;
        signal.removeEventListener("abort", onAbort);
        resolve(client);
      },
      (error) => {
        if (finished) return;
        finished = true;
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

// Bump this whenever the seed-to-database adapter or its schema interpretation
// changes. Seed contents alone cannot reveal a changed transformation.
const BUNDLED_SEED_ADAPTER_SCHEMA_REVISION =
  "atlas-local-sync-adapter-schema-v5";

function editionRightsAllowed(editionId: string) {
  const edition = editions.find((item) => item.id === editionId);
  const work = edition && texts.find((item) => item.id === edition.textId);
  return Boolean(
    edition &&
    work &&
    aiRightsDecision(edition.license, work.copyright).allowed,
  );
}

function workHasRightsClearedEdition(textId: string) {
  return editions.some(
    (edition) => edition.textId === textId && editionRightsAllowed(edition.id),
  );
}

function normalizedRepositoryText(filename: string) {
  return readFileSync(filename, "utf8").replace(/\r\n?/g, "\n");
}

function localDatabase(db: PGlite): AtlasDatabase {
  return {
    async exec(sql: string) {
      await db.exec(sql);
    },
    async query<T>(sql: string, params?: unknown[]) {
      const result = await db.query<T>(sql, params);
      return { rows: result.rows };
    },
    async transaction<T>(fn: (transaction: AtlasDatabase) => Promise<T>) {
      return db.transaction(async (tx) =>
        fn({
          async exec(sql: string) {
            await tx.exec(sql);
          },
          async query<Row = Record<string, unknown>>(
            sql: string,
            params?: unknown[],
          ) {
            const result = await tx.query<Row>(sql, params);
            return { rows: result.rows };
          },
        }),
      );
    },
    async queryCancellable<T>(
      sql: string,
      params: unknown[] | undefined,
      signal: AbortSignal,
    ) {
      if (signal.aborted) throw operationAbort(signal);
      const query = db.query<T>(sql, params);
      let onAbort!: () => void;
      const aborted = new Promise<never>((_resolve, reject) => {
        onAbort = () =>
          reject(
            operationAbort(signal),
          );
        signal.addEventListener("abort", onAbort, { once: true });
      });
      const result = await Promise.race([query, aborted]).finally(() =>
        signal.removeEventListener("abort", onAbort),
      );
      return { rows: result.rows };
    },
  };
}

function bundledSeedFingerprint() {
  const hash = createHash("sha256");
  hash.update(BUNDLED_SEED_ADAPTER_SCHEMA_REVISION);
  hash.update("\0");
  hash.update("packages/db/schema.sql");
  hash.update("\0");
  hash.update(
    normalizedRepositoryText(
      path.join(process.cwd(), "packages/db/schema.sql"),
    ),
  );
  hash.update("\0");
  const seedDir = path.join(process.cwd(), "data/seed");
  for (const filename of readdirSync(seedDir)
    .filter((name) => name.endsWith(".json"))
    .sort()) {
    hash.update(filename);
    hash.update("\0");
    hash.update(normalizedRepositoryText(path.join(seedDir, filename)));
    hash.update("\0");
  }
  return hash.digest("hex");
}
export function database(): Promise<AtlasDatabase> {
  return (state.atlasDatabase ??= initialize());
}
export async function closeDatabase() {
  if (state.atlasDatabase) await state.atlasDatabase;
  await state.atlasClose?.();
  delete state.atlasDatabase;
  delete state.atlasClose;
}
async function initialize(): Promise<AtlasDatabase> {
  if (process.env.ATLAS_DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.ATLAS_DATABASE_URL,
      max: 1,
    });
    state.atlasClose = () => pool.end();
    return {
      supportsAdvisoryTransactionLocks: true,
      async exec(sql: string) {
        await pool.query(sql);
      },
      async query<T>(sql: string, params?: unknown[]) {
        const result = await pool.query(sql, params);
        return { rows: result.rows as T[] };
      },
      async transaction<T>(fn: (db: AtlasDatabase) => Promise<T>) {
        const client = await pool.connect();
        const transactionDb: AtlasDatabase = {
          async exec(sql: string) {
            await client.query(sql);
          },
          async query<Row = Record<string, unknown>>(
            sql: string,
            params?: unknown[],
          ) {
            const result = await client.query(sql, params);
            return { rows: result.rows as Row[] };
          },
        };
        try {
          await client.query("BEGIN");
          const result = await fn(transactionDb);
          await client.query("COMMIT");
          return result;
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      },
      async queryCancellable<T>(
        sql: string,
        params: unknown[] | undefined,
        signal: AbortSignal,
      ) {
        if (signal.aborted)
          throw operationAbort(signal);
        const client = await acquirePoolClient(pool, signal);
        if (signal.aborted) {
          client.release();
          throw operationAbort(signal);
        }
        let released = false;
        let onAbort!: () => void;
        const query = client.query(sql, params);
        const aborted = new Promise<never>((_resolve, reject) => {
          onAbort = () => {
            if (!released) {
              released = true;
              // Removing the dedicated connection interrupts the active query
              // and immediately frees the one-connection pool for later work.
              client.release(
                signal.reason instanceof Error
                  ? signal.reason
                  : new DOMException("Operation aborted", "AbortError"),
              );
            }
            reject(
              operationAbort(signal),
            );
          };
          signal.addEventListener("abort", onAbort, { once: true });
        });
        try {
          const result = await Promise.race([query, aborted]);
          return { rows: result.rows as T[] };
        } finally {
          signal.removeEventListener("abort", onAbort);
          if (!released) {
            released = true;
            client.release();
          }
        }
      },
    };
  }
  // User data is runtime state, never part of a deployable source trace.
  const dir = path.resolve(
    /* turbopackIgnore: true */ process.env.ATLAS_DATA_DIR || "data/user",
  );
  mkdirSync(dir, { recursive: true });
  const db = new PGlite(path.join(dir, "postgres"), { extensions: { vector } });
  state.atlasClose = () => db.close();
  await db.waitReady;
  await db.exec(
    readFileSync(path.join(process.cwd(), "packages/db/schema.sql"), "utf8"),
  );
  const seedFingerprint = bundledSeedFingerprint();
  const count = await db.query<{ count: number }>(
    "SELECT count(*)::int AS count FROM texts",
  );
  const isNewDatabase = count.rows[0].count === 0;
  if (!isNewDatabase) {
    const synchronized = await db.query<{ value: string }>(
      "SELECT value FROM atlas_internal_metadata WHERE key='bundled-seed-fingerprint'",
    );
    if (synchronized.rows[0]?.value === seedFingerprint)
      return localDatabase(db);
  }
  if (isNewDatabase) {
    await db.transaction(async (tx) => {
      for (const t of traditions)
        await tx.query(
          "INSERT INTO traditions(id,name,region,description,color_token,metadata) VALUES($1,$2,$3,$4,$5,$6)",
          [t.id, t.name, t.region, t.description, t.color, JSON.stringify(t)],
        );
      for (const t of texts)
        await tx.query(
          "INSERT INTO texts(id,title,tradition_id,category,canon_status,approximate_start_date,approximate_end_date,date_confidence,origin_region,origin_lat,origin_lng,original_language,authorship_summary,description,historical_context,source_status,copyright_status,public_domain_available,primary_source_url,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)",
          [
            t.id,
            t.title,
            t.traditionId,
            t.category,
            t.canonStatus,
            t.startDate,
            t.endDate,
            t.dateConfidence,
            t.region,
            t.lat,
            t.lng,
            t.languages,
            t.author,
            t.description,
            t.historicalContext,
            t.sourceStatus,
            t.copyright,
            workHasRightsClearedEdition(t.id),
            t.sourceUrl,
            JSON.stringify(t),
          ],
        );
      for (const e of editions)
        await tx.query(
          "INSERT INTO editions(id,text_id,title,translator,language,license,source_url,sha256,public_domain,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
          [
            e.id,
            e.textId,
            e.title,
            e.translator,
            e.language,
            e.license,
            e.sourceUrl,
            e.sha256,
            editionRightsAllowed(e.id),
            JSON.stringify(e),
          ],
        );
      const passages = passageSeedFiles.flatMap(
        (filename) =>
          JSON.parse(
            readFileSync(
              path.join(process.cwd(), "data/seed", filename),
              "utf8",
            ),
          ) as Passage[],
      );
      for (let i = 0; i < passages.length; i += 250) {
        const batch = passages.slice(i, i + 250).map((p) => ({
          ...p,
          translator: editions.find((e) => e.id === p.editionId)!.translator,
          publicDomain: editionRightsAllowed(p.editionId),
        }));
        await tx.query(
          `INSERT INTO passages(id,text_id,edition_id,sequence,reference,translation,translator,copyright_status,public_domain,source_url,content_type,metadata) SELECT v->>'id',v->>'textId',v->>'editionId',(v->>'sequence')::int,v->>'reference',v->>'content',v->>'translator',v->>'license',(v->>'publicDomain')::boolean,v->>'sourceUrl',v->>'contentType',v FROM jsonb_array_elements($1::jsonb) AS v`,
          [
            JSON.stringify(
              batch.map((p) => ({
                ...p,
                license: editions.find((e) => e.id === p.editionId)!.license,
              })),
            ),
          ],
        );
      }
      for (const t of themes)
        await tx.query("INSERT INTO themes(id,name) VALUES($1,$1)", [t]);
      await syncRelationships(tx);
      for (const a of artifacts)
        await tx.query(
          "INSERT INTO images(id,caption,source_url,image_url,license,creator,date,museum,public_domain,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,true,$9)",
          [
            a.id,
            a.caption,
            a.sourceUrl,
            a.imageUrl,
            a.license,
            a.creator,
            a.date,
            a.institution,
            JSON.stringify(a),
          ],
        );
      const oldFile = path.join(dir, "collections.json");
      if (existsSync(oldFile)) {
        const collections = JSON.parse(
          readFileSync(oldFile, "utf8"),
        ) as Collection[];
        for (const c of collections)
          await tx.query(
            "INSERT INTO user_collections(id,name,notes,items,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING",
            [
              c.id,
              c.name,
              c.notes,
              JSON.stringify(c.items),
              c.createdAt,
              c.updatedAt,
            ],
          );
      }
    });
  }
  if (!isNewDatabase) {
    // Synchronize navigation groupings before work upserts. Existing local
    // databases may predate a newly added tradition, so relying on the initial
    // empty-database seed would make the texts foreign key reject the upgrade.
    for (const t of traditions)
      await db.query(
        `INSERT INTO traditions(id,name,region,description,color_token,metadata)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,region=EXCLUDED.region,description=EXCLUDED.description,color_token=EXCLUDED.color_token,metadata=EXCLUDED.metadata`,
        [t.id, t.name, t.region, t.description, t.color, JSON.stringify(t)],
      );
    for (let i = 0; i < texts.length; i += 100) {
      const batch = texts.slice(i, i + 100).map((text) => ({
        ...text,
        publicDomainAvailable: workHasRightsClearedEdition(text.id),
      }));
      await db.query(
        `INSERT INTO texts(id,title,tradition_id,category,canon_status,approximate_start_date,approximate_end_date,date_confidence,origin_region,origin_lat,origin_lng,original_language,authorship_summary,description,historical_context,source_status,copyright_status,public_domain_available,primary_source_url,metadata)
       SELECT v->>'id',v->>'title',v->>'traditionId',v->>'category',v->>'canonStatus',NULLIF(v->>'startDate','')::int,NULLIF(v->>'endDate','')::int,v->>'dateConfidence',v->>'region',NULLIF(v->>'lat','')::double precision,NULLIF(v->>'lng','')::double precision,ARRAY(SELECT jsonb_array_elements_text(v->'languages')),v->>'author',v->>'description',v->>'historicalContext',v->>'sourceStatus',v->>'copyright',(v->>'publicDomainAvailable')::boolean,v->>'sourceUrl',v
       FROM jsonb_array_elements($1::jsonb) AS v
       ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,canon_status=EXCLUDED.canon_status,approximate_start_date=EXCLUDED.approximate_start_date,approximate_end_date=EXCLUDED.approximate_end_date,date_confidence=EXCLUDED.date_confidence,origin_region=EXCLUDED.origin_region,origin_lat=EXCLUDED.origin_lat,origin_lng=EXCLUDED.origin_lng,original_language=EXCLUDED.original_language,authorship_summary=EXCLUDED.authorship_summary,description=EXCLUDED.description,historical_context=EXCLUDED.historical_context,source_status=EXCLUDED.source_status,copyright_status=EXCLUDED.copyright_status,public_domain_available=EXCLUDED.public_domain_available,primary_source_url=EXCLUDED.primary_source_url,metadata=EXCLUDED.metadata`,
        [JSON.stringify(batch)],
      );
    }
    for (const e of editions)
      await db.query(
        `INSERT INTO editions(id,text_id,title,translator,language,license,source_url,sha256,public_domain,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT(id) DO UPDATE SET text_id=EXCLUDED.text_id,title=EXCLUDED.title,translator=EXCLUDED.translator,language=EXCLUDED.language,license=EXCLUDED.license,source_url=EXCLUDED.source_url,sha256=EXCLUDED.sha256,public_domain=EXCLUDED.public_domain,metadata=EXCLUDED.metadata`,
        [
          e.id,
          e.textId,
          e.title,
          e.translator,
          e.language,
          e.license,
          e.sourceUrl,
          e.sha256,
          editionRightsAllowed(e.id),
          JSON.stringify(e),
        ],
      );
    const classifiedPassages = passageSeedFiles.flatMap(
      (filename) =>
        JSON.parse(
          readFileSync(path.join(process.cwd(), "data/seed", filename), "utf8"),
        ) as Passage[],
    );
    for (let i = 0; i < classifiedPassages.length; i += 500) {
      const batch = classifiedPassages.slice(i, i + 500).map((p) => {
        const edition = editions.find((e) => e.id === p.editionId)!;
        return {
          ...p,
          translator: edition.translator,
          license: edition.license,
          publicDomain: editionRightsAllowed(p.editionId),
        };
      });
      await db.query(
        `INSERT INTO passages(id,text_id,edition_id,sequence,reference,translation,translator,copyright_status,public_domain,source_url,content_type,metadata)
       SELECT v->>'id',v->>'textId',v->>'editionId',(v->>'sequence')::int,v->>'reference',v->>'content',v->>'translator',v->>'license',(v->>'publicDomain')::boolean,v->>'sourceUrl',v->>'contentType',v
       FROM jsonb_array_elements($1::jsonb) AS v
       ON CONFLICT(id) DO UPDATE SET text_id=EXCLUDED.text_id,edition_id=EXCLUDED.edition_id,sequence=EXCLUDED.sequence,reference=EXCLUDED.reference,translation=EXCLUDED.translation,translator=EXCLUDED.translator,copyright_status=EXCLUDED.copyright_status,public_domain=EXCLUDED.public_domain,source_url=EXCLUDED.source_url,content_type=EXCLUDED.content_type,metadata=EXCLUDED.metadata`,
        [JSON.stringify(batch)],
      );
    }
  }
  await db.transaction(async (tx) => {
    await syncTaxonomy(tx);
    await syncArchive(tx);
    await syncOntology(tx);
    await syncRelationships(tx);
  });
  await db.query(
    `INSERT INTO atlas_internal_metadata(key,value)
     VALUES('bundled-seed-fingerprint',$1)
     ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value`,
    [seedFingerprint],
  );
  return localDatabase(db);
}
