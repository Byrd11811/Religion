import fs from "node:fs";
import path from "node:path";
import { texts, editions } from "@/packages/shared/catalog";
import { concepts, detectConcepts, tokenize } from "@/packages/ontology";
import type { Passage, SearchHit } from "@/packages/shared/types";
import { passageSeedFiles } from "@/packages/shared/seed-files";
import { protocolDecision } from "@/packages/shared/protocols";
let cached: Passage[] | undefined;
let index: Map<string, Map<number, number>> | undefined;
const stop = new Set(
  "what who why how when where is are do does did the a an and or of to in for on with about would could should have has i we they it be say says different traditions religions".split(
    " ",
  ),
);
export function allPassages() {
  return (cached ??= passageSeedFiles.flatMap(
    (filename) =>
      JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), "data/seed", filename),
          "utf8",
        ),
      ) as Passage[],
  ));
}
function getIndex() {
  if (index) return index;
  index = new Map();
  allPassages().forEach((p, i) => {
    const terms = new Set(tokenize(`${p.content} ${p.reference}`));
    for (const theme of p.themes) terms.add(theme);
    if (/\{d\}a-nun-na(?:-ke₄)?/i.test(p.content)) {
      terms.add("anunnaki");
      terms.add("anunna");
      terms.add("anuna");
      terms.add("anunnaku");
    }
    for (const term of terms) {
      let docs = index!.get(term);
      if (!docs) {
        docs = new Map();
        index!.set(term, docs);
      }
      docs.set(i, (docs.get(i) ?? 0) + 1);
    }
  });
  return index;
}
export interface SearchOptions {
  editionIds?: string[];
  textIds?: string[];
  traditions?: string[];
  region?: string;
  before?: number;
  after?: number;
  limit?: number;
  diverse?: boolean;
  exact?: boolean;
  theme?: string;
  contentTypes?: Passage["contentType"][];
  preferPrimary?: boolean;
}
export function search(
  query: string,
  options: SearchOptions = {},
): SearchHit[] {
  const terms = tokenize(query).filter((t) => !stop.has(t));
  if (!terms.length && !options.theme) return [];
  const detected = options.theme ? [options.theme] : detectConcepts(query);
  const expanded = new Set([
    ...terms,
    ...detected.flatMap((t) => concepts[t] ?? []),
  ]);
  const passages = allPassages();
  const idx = getIndex();
  const scores = new Map<number, number>();
  for (const term of expanded) {
    const docs = idx.get(term);
    if (!docs) continue;
    const idf = Math.log(1 + passages.length / docs.size);
    const weight = terms.includes(term) ? 1 : 0.3;
    for (const [i, tf] of docs) {
      scores.set(i, (scores.get(i) ?? 0) + (weight * idf * tf) / (tf + 1.2));
    }
  }
  const textMap = new Map(texts.map((t) => [t.id, t]));
  const editionMap = new Map(editions.map((e) => [e.id, e]));
  const ranked = [...scores]
    .flatMap(([i, score]) => {
      const p = passages[i],
        t = textMap.get(p.textId);
      if (!t) return [];
      if (!protocolDecision(t.id, "search").allowed) return [];
      if (
        options.contentTypes?.length &&
        !options.contentTypes.includes(p.contentType)
      )
        return [];
      if (options.textIds?.length && !options.textIds.includes(t.id)) return [];
      if (
        options.editionIds?.length &&
        !options.editionIds.includes(p.editionId)
      )
        return [];
      if (
        options.traditions?.length &&
        !options.traditions.includes(t.traditionId)
      )
        return [];
      if (options.region && t.region !== options.region) return [];
      if (
        options.before !== undefined &&
        (t.startDate === null || t.startDate > options.before)
      )
        return [];
      if (
        options.after !== undefined &&
        (t.endDate === null || t.endDate < options.after)
      )
        return [];
      if (
        options.exact &&
        !p.content
          .toLowerCase()
          .includes(query.toLowerCase().replace(/^"|"$/g, ""))
      )
        return [];
      return [
        {
          ...p,
          score:
            score +
            detected.filter((k) => p.themes.includes(k)).length * 0.25 +
            (options.preferPrimary && p.contentType === "Primary text"
              ? 0.5
              : 0),
          textTitle: t.title,
          tradition: t.tradition,
          translator: editionMap.get(p.editionId)?.translator ?? "Unknown",
        },
      ];
    })
    .sort(
      (a, b) =>
        (options.preferPrimary
          ? Number(b.contentType === "Primary text") -
            Number(a.contentType === "Primary text")
          : 0) || b.score - a.score,
    );
  if (!options.diverse) return ranked.slice(0, options.limit ?? 24);
  const counts = new Map<string, number>();
  const unique = new Set<string>();
  const result: SearchHit[] = [];
  for (const hit of ranked) {
    if ((counts.get(hit.tradition) ?? 0) >= 2 || unique.has(hit.textId))
      continue;
    result.push(hit);
    unique.add(hit.textId);
    counts.set(hit.tradition, (counts.get(hit.tradition) ?? 0) + 1);
    if (result.length >= (options.limit ?? 12)) break;
  }
  return result;
}
