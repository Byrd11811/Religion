import { readFileSync } from "node:fs";
import { database, closeDatabase } from "../packages/db/client";
import {
  texts,
  traditions,
  editions,
  relationships,
  artifacts,
} from "../packages/shared/catalog";
import { allPassages } from "../packages/search";
import { themes, concepts } from "../packages/ontology";
import { syncArchive } from "../packages/db/archive";
import { syncOntology } from "../packages/db/ontology";
import { syncTaxonomy } from "../packages/db/taxonomy";
import { loadEnvConfig } from "@next/env";
import { aiRightsDecision } from "../packages/shared/rights";
loadEnvConfig(process.cwd());
const editionRightsAllowed = (editionId: string) => {
  const edition = editions.find((item) => item.id === editionId);
  const work = edition && texts.find((item) => item.id === edition.textId);
  return Boolean(
    edition &&
    work &&
    aiRightsDecision(edition.license, work.copyright).allowed,
  );
};
const workHasRightsClearedEdition = (textId: string) =>
  editions.some(
    (edition) => edition.textId === textId && editionRightsAllowed(edition.id),
  );
async function main() {
  const client = await database();
  try {
    if (process.argv[2] === "migrate") {
      await client.exec(readFileSync("packages/db/schema.sql", "utf8"));
      await syncTaxonomy(client);
      await syncArchive(client);
      await syncOntology(client);
      console.log("PostgreSQL schema and pgvector extension are ready.");
      return;
    }
    if (process.argv[2] !== "seed") throw new Error("Use migrate or seed");
    await client.query("BEGIN");
    for (const t of traditions)
      await client.query(
        "INSERT INTO traditions(id,name,region,description,color_token,metadata) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO UPDATE SET metadata=EXCLUDED.metadata",
        [t.id, t.name, t.region, t.description, t.color, JSON.stringify(t)],
      );
    for (const t of texts)
      await client.query(
        "INSERT INTO texts(id,title,tradition_id,category,canon_status,approximate_start_date,approximate_end_date,date_confidence,origin_region,origin_lat,origin_lng,original_language,authorship_summary,description,historical_context,manuscript_history,source_status,copyright_status,public_domain_available,primary_source_url,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,canon_status=EXCLUDED.canon_status,approximate_start_date=EXCLUDED.approximate_start_date,approximate_end_date=EXCLUDED.approximate_end_date,copyright_status=EXCLUDED.copyright_status,public_domain_available=EXCLUDED.public_domain_available,metadata=EXCLUDED.metadata",
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
          t.manuscripts,
          t.sourceStatus,
          t.copyright,
          workHasRightsClearedEdition(t.id),
          t.sourceUrl,
          JSON.stringify(t),
        ],
      );
    for (const e of editions)
      await client.query(
        "INSERT INTO editions(id,text_id,title,translator,language,license,source_url,sha256,public_domain,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(id) DO UPDATE SET text_id=EXCLUDED.text_id,title=EXCLUDED.title,translator=EXCLUDED.translator,language=EXCLUDED.language,license=EXCLUDED.license,source_url=EXCLUDED.source_url,sha256=EXCLUDED.sha256,public_domain=EXCLUDED.public_domain,metadata=EXCLUDED.metadata",
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
    for (const t of themes)
      await client.query(
        "INSERT INTO themes(id,name) VALUES($1,$1) ON CONFLICT DO NOTHING",
        [t],
      );
    for (const [id, words] of Object.entries(concepts))
      await client.query(
        "INSERT INTO concepts(id,name,definition) VALUES($1,$1,$2) ON CONFLICT DO NOTHING",
        [id, `English retrieval terms: ${words.join(", ")}`],
      );
    for (const p of allPassages()) {
      const e = editions.find((e) => e.id === p.editionId)!;
      await client.query(
        "INSERT INTO passages(id,text_id,edition_id,sequence,reference,translation,translator,copyright_status,public_domain,source_url,content_type,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT(id) DO UPDATE SET text_id=EXCLUDED.text_id,edition_id=EXCLUDED.edition_id,sequence=EXCLUDED.sequence,reference=EXCLUDED.reference,translation=EXCLUDED.translation,translator=EXCLUDED.translator,copyright_status=EXCLUDED.copyright_status,public_domain=EXCLUDED.public_domain,source_url=EXCLUDED.source_url,content_type=EXCLUDED.content_type,metadata=EXCLUDED.metadata",
        [
          p.id,
          p.textId,
          p.editionId,
          p.sequence,
          p.reference,
          p.content,
          e.translator,
          e.license,
          editionRightsAllowed(p.editionId),
          p.sourceUrl,
          p.contentType,
          JSON.stringify(p),
        ],
      );
      for (const tag of p.themes)
        if (themes.includes(tag))
          await client.query(
            "INSERT INTO passage_themes(passage_id,theme_id,relevance_score,classification_method,confidence) VALUES($1,$2,1,$3,$4) ON CONFLICT DO NOTHING",
            [p.id, tag, "Explicit keyword taxonomy", "E"],
          );
    }
    for (const r of relationships)
      await client.query(
        "INSERT INTO relationships(id,source_text_id,target_text_id,relationship_type,evidence_level,scholar_summary,confidence,citation,metadata) VALUES($1,$2,$3,$4,$5,$6,$5,$7,$8) ON CONFLICT(id) DO UPDATE SET metadata=EXCLUDED.metadata",
        [
          r.id,
          r.source,
          r.target,
          r.type,
          r.confidence,
          r.summary,
          r.sourceUrl,
          JSON.stringify(r),
        ],
      );
    for (const a of artifacts)
      await client.query(
        "INSERT INTO images(id,caption,source_url,image_url,license,creator,date,museum,public_domain,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8,true,$9) ON CONFLICT(id) DO UPDATE SET metadata=EXCLUDED.metadata",
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
    await syncTaxonomy(client);
    await syncArchive(client);
    await syncOntology(client);
    await client.query("COMMIT");
    console.log(
      `Seeded ${texts.length} texts, ${editions.length} editions and ${allPassages().length} passages.`,
    );
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await closeDatabase();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
