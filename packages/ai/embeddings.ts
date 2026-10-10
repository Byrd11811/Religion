import { database, databaseQuery } from "@/packages/db/client";
import type { Passage } from "@/packages/shared/types";
import type { SearchOptions } from "@/packages/search";
import {
  filterSearchProtocolCandidates,
  passageScopeSql,
  type RankedPassageCandidate,
} from "@/packages/search/scope";
import { abortable, throwIfAborted } from "@/packages/search/abort";

export const EMBEDDING_CANDIDATE_SQL = `SELECT p.id,p.translation
  FROM passages p
  JOIN texts t ON t.id=p.text_id
  JOIN editions e ON e.id=p.edition_id AND e.text_id=p.text_id
  WHERE p.public_domain=true
    AND t.public_domain_available=true
    AND e.public_domain=true
    AND p.content_type <> 'Unknown'
    AND NOT (p.text_id = ANY($2::text[]))
    AND (p.embedding IS NULL OR p.embedding_model IS DISTINCT FROM $1)
  ORDER BY p.id`;

export const CLEAR_INELIGIBLE_EMBEDDINGS_SQL = `UPDATE passages p
  SET embedding=NULL,embedding_model=NULL
  FROM texts t,editions e
  WHERE t.id=p.text_id
    AND e.id=p.edition_id
    AND e.text_id=p.text_id
    AND p.embedding IS NOT NULL
    AND (
      p.content_type = 'Unknown'
      OR p.public_domain=false
      OR t.public_domain_available=false
      OR e.public_domain=false
      OR p.text_id = ANY($1::text[])
    )`;

export const MAX_EMBEDDING_INPUT_CHARS = 6_000;
export const MAX_EMBEDDING_BATCH_CHARS = 96_000;

/** Deterministic, lossless chunks that keep provider requests bounded. */
export function embeddingChunks(
  text: string,
  maxChars = MAX_EMBEDDING_INPUT_CHARS,
) {
  if (!Number.isInteger(maxChars) || maxChars < 1)
    throw new Error("Embedding chunk size must be a positive integer");
  const chunks: string[] = [];
  for (let offset = 0; offset < text.length; offset += maxChars)
    chunks.push(text.slice(offset, offset + maxChars));
  return chunks;
}

/** Reduce chunk embeddings to one passage vector without losing any chunk. */
export function meanEmbeddings(vectors: readonly number[][]) {
  if (!vectors.length) throw new Error("No embedding vectors to average");
  const dimensions = vectors[0].length;
  if (
    dimensions < 1 ||
    vectors.some(
      (vector) =>
        vector.length !== dimensions || !vector.every(Number.isFinite),
    )
  )
    throw new Error("Embedding vectors must be finite and equally sized");
  return Array.from({ length: dimensions }, (_, dimension) =>
    vectors.reduce((sum, vector) => sum + vector[dimension], 0) /
    vectors.length,
  );
}

export async function semanticCandidates(
  query: string,
  options: SearchOptions = {},
  signal?: AbortSignal,
): Promise<{ metadata: Passage; rank: number }[]> {
  const key = process.env.ATLAS_EMBEDDING_API_KEY,
    base = process.env.ATLAS_EMBEDDING_BASE_URL,
    model = process.env.ATLAS_EMBEDDING_MODEL;
  if (!key || !base || !model) return [];
  throwIfAborted(signal);
  const db = await abortable(database(), signal);
  const ready = await abortable(
    databaseQuery<{ ready: boolean }>(
      db,
      "SELECT EXISTS(SELECT 1 FROM passages WHERE embedding IS NOT NULL AND embedding_model=$1) AS ready",
      [model],
      signal,
    ),
    signal,
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
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
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
    const params: unknown[] = [
      JSON.stringify(embedding),
      model,
      embedding.length,
    ];
    const scope = passageScopeSql(options, params);
    const result = await abortable(
      databaseQuery<RankedPassageCandidate>(
        db,
        `SELECT p.metadata,p.text_id AS "textId",1-(p.embedding <=> $1::vector) AS rank
         FROM passages p
         JOIN texts t ON t.id=p.text_id
         JOIN editions e ON e.id=p.edition_id AND e.text_id=p.text_id
         WHERE p.embedding IS NOT NULL
           AND p.embedding_model=$2
           AND vector_dims(p.embedding)=$3
           AND ${scope}
         ORDER BY p.embedding <=> $1::vector,p.id
         LIMIT 100`,
        params,
        signal,
      ),
      signal,
    );
    throwIfAborted(signal);
    return filterSearchProtocolCandidates(result.rows);
  } catch (error) {
    if (
      signal?.aborted ||
      (error instanceof Error && error.name === "AbortError")
    )
      throw signal?.reason ?? error;
    return [];
  }
}
