import fs from "node:fs";
import path from "node:path";
import { texts, editions } from "@/packages/shared/catalog";
import { concepts, detectConcepts, tokenize } from "@/packages/ontology";
import type { Passage, SearchHit } from "@/packages/shared/types";
import { passageSeedFiles } from "@/packages/shared/seed-files";
import { protocolDecision } from "@/packages/shared/protocols";
import { passageAiRightsAllowed } from "@/packages/shared/rights";
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

async function yieldForCancellation(signal?: AbortSignal) {
  await new Promise<void>((resolve) => setImmediate(resolve));
  if (signal?.aborted)
    throw signal.reason ?? new DOMException("Operation aborted", "AbortError");
}

async function allPassagesAsync(signal?: AbortSignal) {
  if (cached) return cached;
  const loaded: Passage[] = [];
  for (const filename of passageSeedFiles) {
    if (signal?.aborted)
      throw (
        signal.reason ?? new DOMException("Operation aborted", "AbortError")
      );
    const content = await fs.promises.readFile(
      path.join(process.cwd(), "data/seed", filename),
      { encoding: "utf8", signal },
    );
    loaded.push(...(JSON.parse(content) as Passage[]));
    await yieldForCancellation(signal);
  }
  return (cached ??= loaded);
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

async function getIndexAsync(
  passages: readonly Passage[],
  signal?: AbortSignal,
) {
  if (index) return index;
  const built = new Map<string, Map<number, number>>();
  for (let i = 0; i < passages.length; i += 1) {
    const passage = passages[i];
    const terms = new Set(tokenize(`${passage.content} ${passage.reference}`));
    for (const theme of passage.themes) terms.add(theme);
    if (/\{d\}a-nun-na(?:-ke₄)?/i.test(passage.content)) {
      terms.add("anunnaki");
      terms.add("anunna");
      terms.add("anuna");
      terms.add("anunnaku");
    }
    for (const term of terms) {
      let docs = built.get(term);
      if (!docs) {
        docs = new Map();
        built.set(term, docs);
      }
      docs.set(i, (docs.get(i) ?? 0) + 1);
    }
    if (i % 100 === 99) await yieldForCancellation(signal);
  }
  if (signal?.aborted)
    throw signal.reason ?? new DOMException("Operation aborted", "AbortError");
  return (index ??= built);
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
      if (!passageAiRightsAllowed(p)) return [];
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

/**
 * Abort-aware version of the bundled-corpus search used by streamed research.
 * It yields while loading and indexing so cancelling a request can interrupt a
 * cold search instead of waiting for the whole corpus to be parsed and ranked.
 */
export async function searchCancellable(
  query: string,
  options: SearchOptions = {},
  signal?: AbortSignal,
): Promise<SearchHit[]> {
  await yieldForCancellation(signal);
  const terms = tokenize(query).filter((term) => !stop.has(term));
  if (!terms.length && !options.theme) return [];
  const detected = options.theme ? [options.theme] : detectConcepts(query);
  const expanded = new Set([
    ...terms,
    ...detected.flatMap((theme) => concepts[theme] ?? []),
  ]);
  const passages = await allPassagesAsync(signal);
  const idx = await getIndexAsync(passages, signal);
  const scores = new Map<number, number>();
  let scored = 0;
  for (const term of expanded) {
    const docs = idx.get(term);
    if (!docs) continue;
    const idf = Math.log(1 + passages.length / docs.size);
    const weight = terms.includes(term) ? 1 : 0.3;
    for (const [passageIndex, frequency] of docs) {
      scores.set(
        passageIndex,
        (scores.get(passageIndex) ?? 0) +
          (weight * idf * frequency) / (frequency + 1.2),
      );
      scored += 1;
      if (scored % 500 === 0) await yieldForCancellation(signal);
    }
  }
  const textMap = new Map(texts.map((text) => [text.id, text]));
  const editionMap = new Map(editions.map((edition) => [edition.id, edition]));
  const ranked: SearchHit[] = [];
  let inspected = 0;
  for (const [passageIndex, score] of scores) {
    const passage = passages[passageIndex];
    const text = textMap.get(passage.textId);
    if (!text || !protocolDecision(text.id, "search").allowed) continue;
    if (!passageAiRightsAllowed(passage)) continue;
    if (
      options.contentTypes?.length &&
      !options.contentTypes.includes(passage.contentType)
    )
      continue;
    if (options.textIds?.length && !options.textIds.includes(text.id)) continue;
    if (
      options.editionIds?.length &&
      !options.editionIds.includes(passage.editionId)
    )
      continue;
    if (
      options.traditions?.length &&
      !options.traditions.includes(text.traditionId)
    )
      continue;
    if (options.region && text.region !== options.region) continue;
    if (
      options.before !== undefined &&
      (text.startDate === null || text.startDate > options.before)
    )
      continue;
    if (
      options.after !== undefined &&
      (text.endDate === null || text.endDate < options.after)
    )
      continue;
    if (
      options.exact &&
      !passage.content
        .toLowerCase()
        .includes(query.toLowerCase().replace(/^"|"$/g, ""))
    )
      continue;
    ranked.push({
      ...passage,
      score:
        score +
        detected.filter((key) => passage.themes.includes(key)).length * 0.25 +
        (options.preferPrimary && passage.contentType === "Primary text"
          ? 0.5
          : 0),
      textTitle: text.title,
      tradition: text.tradition,
      translator: editionMap.get(passage.editionId)?.translator ?? "Unknown",
    });
    inspected += 1;
    if (inspected % 500 === 0) await yieldForCancellation(signal);
  }
  if (signal?.aborted)
    throw signal.reason ?? new DOMException("Operation aborted", "AbortError");
  ranked.sort(
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
