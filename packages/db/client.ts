import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { Pool } from "pg";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import {
  texts,
  traditions,
  editions,
  relationships,
  artifacts,
} from "@/packages/shared/catalog";
import { themes } from "@/packages/ontology";
import { syncArchive } from "./archive";
import { syncTaxonomy } from "./taxonomy";
import type { Passage, Collection } from "@/packages/shared/types";
import { passageSeedFiles } from "@/packages/shared/seed-files";
export interface AtlasDatabase {
  exec(sql: string): Promise<void>;
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
}
const state = globalThis as unknown as {
  atlasDatabase?: Promise<AtlasDatabase>;
  atlasClose?: () => Promise<void>;
};
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
      async exec(sql: string) {
        await pool.query(sql);
      },
      async query<T>(sql: string, params?: unknown[]) {
        const result = await pool.query(sql, params);
        return { rows: result.rows as T[] };
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
  const count = await db.query<{ count: number }>(
    "SELECT count(*)::int AS count FROM texts",
  );
  if (count.rows[0].count === 0) {
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
            !!t.editionId,
            t.sourceUrl,
            JSON.stringify(t),
          ],
        );
      for (const e of editions)
        await tx.query(
          "INSERT INTO editions(id,text_id,title,translator,language,license,source_url,sha256,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
          [
            e.id,
            e.textId,
            e.title,
            e.translator,
            e.language,
            e.license,
            e.sourceUrl,
            e.sha256,
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
        }));
        await tx.query(
          `INSERT INTO passages(id,text_id,edition_id,sequence,reference,translation,translator,copyright_status,public_domain,source_url,content_type,metadata) SELECT v->>'id',v->>'textId',v->>'editionId',(v->>'sequence')::int,v->>'reference',v->>'content',v->>'translator',v->>'license',true,v->>'sourceUrl',v->>'contentType',v FROM jsonb_array_elements($1::jsonb) AS v`,
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
      for (const r of relationships)
        await tx.query(
          "INSERT INTO relationships(id,source_text_id,target_text_id,relationship_type,evidence_level,confidence,citation,metadata) VALUES($1,$2,$3,$4,$5,$5,$6,$7)",
          [
            r.id,
            r.source,
            r.target,
            r.type,
            r.confidence,
            r.sourceUrl,
            JSON.stringify(r),
          ],
        );
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
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100);
    await db.query(
      `INSERT INTO texts(id,title,tradition_id,category,canon_status,approximate_start_date,approximate_end_date,date_confidence,origin_region,origin_lat,origin_lng,original_language,authorship_summary,description,historical_context,source_status,copyright_status,public_domain_available,primary_source_url,metadata)
       SELECT v->>'id',v->>'title',v->>'traditionId',v->>'category',v->>'canonStatus',NULLIF(v->>'startDate','')::int,NULLIF(v->>'endDate','')::int,v->>'dateConfidence',v->>'region',NULLIF(v->>'lat','')::double precision,NULLIF(v->>'lng','')::double precision,ARRAY(SELECT jsonb_array_elements_text(v->'languages')),v->>'author',v->>'description',v->>'historicalContext',v->>'sourceStatus',v->>'copyright',(v->>'editionId') IS NOT NULL,v->>'sourceUrl',v
       FROM jsonb_array_elements($1::jsonb) AS v
       ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,canon_status=EXCLUDED.canon_status,approximate_start_date=EXCLUDED.approximate_start_date,approximate_end_date=EXCLUDED.approximate_end_date,date_confidence=EXCLUDED.date_confidence,origin_region=EXCLUDED.origin_region,origin_lat=EXCLUDED.origin_lat,origin_lng=EXCLUDED.origin_lng,original_language=EXCLUDED.original_language,authorship_summary=EXCLUDED.authorship_summary,description=EXCLUDED.description,historical_context=EXCLUDED.historical_context,source_status=EXCLUDED.source_status,copyright_status=EXCLUDED.copyright_status,public_domain_available=EXCLUDED.public_domain_available,primary_source_url=EXCLUDED.primary_source_url,metadata=EXCLUDED.metadata`,
      [JSON.stringify(batch)],
    );
  }
  for (const e of editions)
    await db.query(
      `INSERT INTO editions(id,text_id,title,translator,language,license,source_url,sha256,metadata)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT(id) DO UPDATE SET text_id=EXCLUDED.text_id,title=EXCLUDED.title,translator=EXCLUDED.translator,language=EXCLUDED.language,license=EXCLUDED.license,source_url=EXCLUDED.source_url,sha256=EXCLUDED.sha256,metadata=EXCLUDED.metadata`,
      [
        e.id,
        e.textId,
        e.title,
        e.translator,
        e.language,
        e.license,
        e.sourceUrl,
        e.sha256,
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
      return { ...p, translator: edition.translator, license: edition.license };
    });
    await db.query(
      `INSERT INTO passages(id,text_id,edition_id,sequence,reference,translation,translator,copyright_status,public_domain,source_url,content_type,metadata)
       SELECT v->>'id',v->>'textId',v->>'editionId',(v->>'sequence')::int,v->>'reference',v->>'content',v->>'translator',v->>'license',true,v->>'sourceUrl',v->>'contentType',v
       FROM jsonb_array_elements($1::jsonb) AS v
       ON CONFLICT(id) DO UPDATE SET text_id=EXCLUDED.text_id,edition_id=EXCLUDED.edition_id,sequence=EXCLUDED.sequence,reference=EXCLUDED.reference,translation=EXCLUDED.translation,translator=EXCLUDED.translator,copyright_status=EXCLUDED.copyright_status,public_domain=EXCLUDED.public_domain,source_url=EXCLUDED.source_url,content_type=EXCLUDED.content_type,metadata=EXCLUDED.metadata`,
      [JSON.stringify(batch)],
    );
  }
  await db.transaction(async (tx) => {
    await syncTaxonomy(tx);
    await syncArchive(tx);
  });
  return {
    async exec(sql: string) {
      await db.exec(sql);
    },
    async query<T>(sql: string, params?: unknown[]) {
      const result = await db.query<T>(sql, params);
      return { rows: result.rows };
    },
  };
}
