import { database, databaseQuery } from "@/packages/db/client";
import { searchCancellable, type SearchOptions } from "./index";
import { texts, editions } from "@/packages/shared/catalog";
import type { SearchHit } from "@/packages/shared/types";
import { semanticCandidates } from "@/packages/ai/embeddings";
import {
  filterSearchProtocolCandidates,
  passageScopeSql,
  searchProtocolAllowsText,
  type RankedPassageCandidate,
} from "./scope";
import { abortable, throwIfAborted } from "./abort";
import { passageAiRightsAllowed } from "@/packages/shared/rights";

export async function databaseLexicalCandidates(
  query: string,
  options: SearchOptions = {},
  signal?: AbortSignal,
) {
  throwIfAborted(signal);
  const db = await abortable(database(), signal);
  const params: unknown[] = [query];
  const scope = passageScopeSql(options, params);
  const result = await abortable(
    databaseQuery<RankedPassageCandidate>(
      db,
      `SELECT p.metadata,p.text_id AS "textId",ts_rank_cd(p.search_document,websearch_to_tsquery('english',$1)) AS rank
       FROM passages p
       JOIN texts t ON t.id=p.text_id
       JOIN editions e ON e.id=p.edition_id AND e.text_id=p.text_id
       WHERE p.search_document @@ websearch_to_tsquery('english',$1) AND ${scope}
       ORDER BY rank DESC,p.id
       LIMIT 100`,
      params,
      signal,
    ),
    signal,
  );
  return {
    ...result,
    rows: filterSearchProtocolCandidates(result.rows),
  };
}

export function mergeHybridCandidates(
  lexical: readonly SearchHit[],
  databaseRows: readonly RankedPassageCandidate[],
  semanticRows: readonly RankedPassageCandidate[],
  options: SearchOptions = {},
): SearchHit[] {
  const candidates = new Map<string, SearchHit>(
    lexical
      .filter(
        (hit) =>
          searchProtocolAllowsText(hit.textId) && passageAiRightsAllowed(hit),
      )
      .map((hit) => [hit.id, hit]),
  );
  for (const row of filterSearchProtocolCandidates([
    ...databaseRows,
    ...semanticRows,
  ])) {
    const p = row.metadata,
      t = texts.find((text) => text.id === p.textId);
    if (!t) continue;
    if (
      options.contentTypes?.length &&
      !options.contentTypes.includes(p.contentType)
    )
      continue;
    if (options.textIds?.length && !options.textIds.includes(t.id)) continue;
    if (options.editionIds?.length && !options.editionIds.includes(p.editionId))
      continue;
    if (
      options.traditions?.length &&
      !options.traditions.includes(t.traditionId)
    )
      continue;
    if (options.region && options.region !== t.region) continue;
    if (
      options.before !== undefined &&
      (t.startDate === null || t.startDate > options.before)
    )
      continue;
    if (
      options.after !== undefined &&
      (t.endDate === null || t.endDate < options.after)
    )
      continue;
    const prev = candidates.get(p.id);
    candidates.set(p.id, {
      ...p,
      textTitle: t.title,
      tradition: t.tradition,
      translator:
        editions.find((edition) => edition.id === p.editionId)?.translator ??
        "Unknown",
      score:
        (prev?.score ?? 0) +
        Number(row.rank) +
        (options.preferPrimary && p.contentType === "Primary text" ? 0.5 : 0),
    });
  }
  const all = [...candidates.values()].sort(
    (a, b) =>
      (options.preferPrimary
        ? Number(b.contentType === "Primary text") -
          Number(a.contentType === "Primary text")
        : 0) || b.score - a.score,
  );
  if (!options.diverse) return all.slice(0, options.limit ?? 24);
  const byGroup = new Map<string, number>(),
    seen = new Set<string>();
  return all
    .filter((passage) => {
      if (
        seen.has(passage.textId) ||
        (byGroup.get(passage.tradition) ?? 0) >= 2
      )
        return false;
      seen.add(passage.textId);
      byGroup.set(passage.tradition, (byGroup.get(passage.tradition) ?? 0) + 1);
      return true;
    })
    .slice(0, options.limit ?? 12);
}

export async function hybridSearch(
  query: string,
  options: SearchOptions = {},
  signal?: AbortSignal,
): Promise<SearchHit[]> {
  throwIfAborted(signal);
  const lexical = await searchCancellable(
    query,
    { ...options, limit: 100, diverse: false },
    signal,
  );
  throwIfAborted(signal);
  if (options.exact) return lexical.slice(0, options.limit ?? 24);
  // The bundled corpus is already indexed in memory. Initializing the local
  // PGlite persistence database only to repeat that same lexical lookup can
  // take more than a minute on a cold start. Query a database here only when
  // the deployment has explicitly configured an external corpus database;
  // direct database retrieval remains available for migration and regression
  // checks through databaseLexicalCandidates().
  const databaseCandidates = process.env.ATLAS_DATABASE_URL
    ? databaseLexicalCandidates(query, options, signal)
    : Promise.resolve({ rows: [] as RankedPassageCandidate[] });
  const [result, semantic] = await Promise.all([
    databaseCandidates,
    semanticCandidates(query, options, signal),
  ]);
  throwIfAborted(signal);
  return mergeHybridCandidates(lexical, result.rows, semantic, options);
}
