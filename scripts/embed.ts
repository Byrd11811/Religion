import { database, closeDatabase } from "../packages/db/client";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function main() {
  const {
    ATLAS_EMBEDDING_API_KEY,
    ATLAS_EMBEDDING_BASE_URL,
    ATLAS_EMBEDDING_MODEL,
  } = process.env;
  if (
    !ATLAS_EMBEDDING_API_KEY ||
    !ATLAS_EMBEDDING_BASE_URL ||
    !ATLAS_EMBEDDING_MODEL
  )
    throw new Error(
      "Configure ATLAS_EMBEDDING_API_KEY, ATLAS_EMBEDDING_BASE_URL and ATLAS_EMBEDDING_MODEL. No paid requests were made.",
    );
  const pool = await database();
  try {
    const result = await pool.query<{ id: string; translation: string }>(
      "SELECT id,translation FROM passages WHERE embedding IS NULL OR embedding_model IS DISTINCT FROM $1 ORDER BY id",
      [ATLAS_EMBEDDING_MODEL],
    );
    for (let i = 0; i < result.rows.length; i += 16) {
      const batch = result.rows.slice(i, i + 16);
      const response = await fetch(
        `${ATLAS_EMBEDDING_BASE_URL.replace(/\/$/, "")}/embeddings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ATLAS_EMBEDDING_API_KEY}`,
          },
          body: JSON.stringify({
            model: ATLAS_EMBEDDING_MODEL,
            input: batch.map((p) => p.translation),
          }),
          signal: AbortSignal.timeout(60000),
        },
      );
      if (!response.ok)
        throw new Error(`Embedding provider returned ${response.status}`);
      const data = (await response.json()) as {
        data: { index: number; embedding: number[] }[];
      };
      if (data.data.length !== batch.length)
        throw new Error("Embedding count mismatch");
      for (const row of data.data) {
        if (
          !Array.isArray(row.embedding) ||
          !row.embedding.every(Number.isFinite) ||
          !batch[row.index]
        )
          throw new Error("Invalid embedding response");
        await pool.query(
          "UPDATE passages SET embedding=$1::vector,embedding_model=$3 WHERE id=$2",
          [
            JSON.stringify(row.embedding),
            batch[row.index].id,
            ATLAS_EMBEDDING_MODEL,
          ],
        );
      }
      console.log(
        `Embedded ${Math.min(i + 16, result.rows.length)} / ${result.rows.length}`,
      );
    }
  } finally {
    await closeDatabase();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
