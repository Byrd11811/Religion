import { database, closeDatabase } from "../packages/db/client";
import { loadEnvConfig } from "@next/env";
import {
  culturalProtocols,
  protocolDecision,
} from "../packages/shared/protocols";
import {
  CLEAR_INELIGIBLE_EMBEDDINGS_SQL,
  EMBEDDING_CANDIDATE_SQL,
  MAX_EMBEDDING_BATCH_CHARS,
  embeddingChunks,
  meanEmbeddings,
} from "../packages/ai/embeddings";
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
    const blockedWorkIds = culturalProtocols
      .map(({ workId }) => workId)
      .filter(
        (workId) =>
          !protocolDecision(workId, "ai").allowed ||
          !protocolDecision(workId, "export").allowed,
      );
    await pool.query(CLEAR_INELIGIBLE_EMBEDDINGS_SQL, [blockedWorkIds]);
    const result = await pool.query<{ id: string; translation: string }>(
      EMBEDDING_CANDIDATE_SQL,
      [ATLAS_EMBEDDING_MODEL, blockedWorkIds],
    );
    for (let i = 0; i < result.rows.length; i += 16) {
      const batch = result.rows.slice(i, i + 16);
      const chunkRows = batch.flatMap((passage) => {
        const chunks = embeddingChunks(passage.translation);
        if (!chunks.length)
          throw new Error(`Passage ${passage.id} has no embedding input`);
        return chunks.map((text) => ({ passageId: passage.id, text }));
      });
      const passageVectors = new Map<string, number[][]>(
        batch.map(({ id }) => [id, []]),
      );
      for (let chunkIndex = 0; chunkIndex < chunkRows.length; chunkIndex += 16) {
        const providerBatch = chunkRows.slice(chunkIndex, chunkIndex + 16);
        if (
          providerBatch.reduce((sum, row) => sum + row.text.length, 0) >
          MAX_EMBEDDING_BATCH_CHARS
        )
          throw new Error("Embedding request exceeds the configured size cap");
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
              input: providerBatch.map((row) => row.text),
            }),
            signal: AbortSignal.timeout(60000),
          },
        );
        if (!response.ok)
          throw new Error(`Embedding provider returned ${response.status}`);
        const data = (await response.json()) as {
          data: { index: number; embedding: number[] }[];
        };
        if (data.data.length !== providerBatch.length)
          throw new Error("Embedding count mismatch");
        const returnedIndexes = new Set<number>();
        for (const row of data.data) {
          const chunk = providerBatch[row.index];
          if (
            !Number.isInteger(row.index) ||
            returnedIndexes.has(row.index) ||
            !chunk ||
            !Array.isArray(row.embedding) ||
            !row.embedding.length ||
            !row.embedding.every(Number.isFinite)
          )
            throw new Error("Invalid embedding response");
          returnedIndexes.add(row.index);
          passageVectors.get(chunk.passageId)!.push(row.embedding);
        }
      }
      for (const passage of batch) {
        const embedding = meanEmbeddings(passageVectors.get(passage.id) ?? []);
        await pool.query(
          "UPDATE passages SET embedding=$1::vector,embedding_model=$3 WHERE id=$2",
          [
            JSON.stringify(embedding),
            passage.id,
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
