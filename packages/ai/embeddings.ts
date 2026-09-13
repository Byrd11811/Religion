import { database } from "@/packages/db/client";
import type { Passage } from "@/packages/shared/types";
export async function semanticCandidates(
  query: string,
): Promise<{ metadata: Passage; rank: number }[]> {
  const key = process.env.ATLAS_EMBEDDING_API_KEY,
    base = process.env.ATLAS_EMBEDDING_BASE_URL,
    model = process.env.ATLAS_EMBEDDING_MODEL;
  if (!key || !base || !model) return [];
  const db = await database();
  const ready = await db.query<{ ready: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM passages WHERE embedding IS NOT NULL AND embedding_model=$1) AS ready",
    [model],
  );
  if (!ready.rows[0].ready) return [];
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model, input: query }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const body = await res.json();
    const embedding = body.data?.[0]?.embedding;
    if (
      !Array.isArray(embedding) ||
      !embedding.length ||
      !embedding.every(Number.isFinite)
    )
      return [];
    const result = await db.query<{ metadata: Passage; rank: number }>(
      "SELECT metadata,1-(embedding <=> $1::vector) AS rank FROM passages WHERE embedding IS NOT NULL AND embedding_model=$2 AND vector_dims(embedding)=$3 ORDER BY embedding <=> $1::vector LIMIT 100",
      [JSON.stringify(embedding), model, embedding.length],
    );
    return result.rows;
  } catch {
    return [];
  }
}
