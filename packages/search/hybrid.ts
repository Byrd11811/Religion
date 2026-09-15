import { database } from "@/packages/db/client";
import { search, type SearchOptions } from "./index";
import { texts, editions } from "@/packages/shared/catalog";
import type { Passage, SearchHit } from "@/packages/shared/types";
import { semanticCandidates } from "@/packages/ai/embeddings";
export async function hybridSearch(
  query: string,
  options: SearchOptions = {},
): Promise<SearchHit[]> {
  const lexical = search(query, { ...options, limit: 100, diverse: false });
  if (options.exact) return lexical.slice(0, options.limit ?? 24);
  const db = await database();
  const result = await db.query<{ metadata: Passage; rank: number }>(
    `SELECT metadata,ts_rank_cd(search_document,websearch_to_tsquery('english',$1)) AS rank FROM passages WHERE search_document @@ websearch_to_tsquery('english',$1) ORDER BY rank DESC LIMIT 100`,
    [query],
  );
  const candidates = new Map<string, SearchHit>(lexical.map((h) => [h.id, h]));
  for (const row of [...result.rows, ...(await semanticCandidates(query))]) {
    const p = row.metadata,
      t = texts.find((t) => t.id === p.textId);
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
        editions.find((e) => e.id === p.editionId)?.translator ?? "Unknown",
      score:
        (prev?.score ?? 0) +
        Number(row.rank) +
        (options.preferPrimary && p.contentType === "Primary text" ? 0.5 : 0),
    });
  }
  const all = [...candidates.values()].sort((a, b) => b.score - a.score);
  if (!options.diverse) return all.slice(0, options.limit ?? 24);
  const byGroup = new Map<string, number>(),
    seen = new Set<string>();
  return all
    .filter((p) => {
      if (seen.has(p.textId) || (byGroup.get(p.tradition) ?? 0) >= 2)
        return false;
      seen.add(p.textId);
      byGroup.set(p.tradition, (byGroup.get(p.tradition) ?? 0) + 1);
      return true;
    })
    .slice(0, options.limit ?? 12);
}
