import type { AtlasDatabase } from "./client";
import { texts } from "@/packages/shared/catalog";
import {
  workProfile,
  witnesses,
  museumArtifacts,
  archiveImages,
  validateImage,
} from "@/packages/shared/archive";
export async function syncArchive(db: Pick<AtlasDatabase, "query">) {
  const legacy = await db.query<{ id: string }>("SELECT id FROM texts");
  const present = new Set(legacy.rows.map((row) => row.id));
  for (const t of texts) {
    if (!present.has(t.id)) continue;
    const w = workProfile(t.id)!;
    await db.query(
      "INSERT INTO works(id,legacy_text_id,title,coverage_status,evidence_status,decipherment,access,metadata) VALUES($1,$1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,metadata=EXCLUDED.metadata,coverage_status=EXCLUDED.coverage_status",
      [
        w.id,
        w.title,
        w.coverage,
        w.evidence,
        w.decipherment,
        w.access,
        JSON.stringify(w),
      ],
    );
  }
  for (const w of witnesses)
    await db.query(
      "INSERT INTO witnesses(id,title,witness_type,inventory_number,repository,access,metadata) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET metadata=EXCLUDED.metadata",
      [
        w.id,
        w.title,
        w.type,
        w.inventoryNumber,
        w.repository,
        w.access,
        JSON.stringify(w),
      ],
    );
  for (const a of museumArtifacts)
    await db.query(
      "INSERT INTO artifacts(id,title,witness_id,source_url,metadata) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET metadata=EXCLUDED.metadata",
      [a.id, a.title, a.witnessId, a.sourceUrl, JSON.stringify(a)],
    );
  for (const w of witnesses)
    for (const workId of w.workIds)
      if (present.has(workId))
        await db.query(
          "INSERT INTO witness_works(witness_id,work_id,source_url) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
          [w.id, workId, w.sources[0]],
        );
  for (const i of archiveImages) {
    validateImage(i);
    await db.query(
      "INSERT INTO archive_images(id,artifact_id,witness_id,image_url,source_url,rights,metadata) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET metadata=EXCLUDED.metadata",
      [
        i.id,
        i.artifactId,
        i.witnessId,
        i.imageUrl,
        i.sourceUrl,
        i.rights,
        JSON.stringify(i),
      ],
    );
    for (const workId of i.workIds)
      if (present.has(workId))
        await db.query(
          "INSERT INTO work_images(work_id,image_id,association_notes,source_url) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING",
          [
            workId,
            i.id,
            "Institutional catalog explicitly identifies the work; no edition dependency inferred",
            i.sourceUrl,
          ],
        );
  }
}
