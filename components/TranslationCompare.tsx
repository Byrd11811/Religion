"use client";
import { useState } from "react";
import { editions } from "@/packages/shared/catalog";
import { api, Empty, PassageCard } from "./common";
import type { SearchHit } from "@/packages/shared/types";
import type { Actions } from "./Library";
export function TranslationCompare({
  textId,
  ...actions
}: Actions & { textId: string }) {
  const available = editions.filter((e) => e.textId === textId);
  const [query, setQuery] = useState("mercy"),
    [hits, setHits] = useState<SearchHit[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function run() {
    setBusy(true);
    setError("");
    try {
      const results = await Promise.all(
        available.map((e) =>
          api<SearchHit[]>(
            `/api/search?q=${encodeURIComponent(query)}&text=${textId}&edition=${e.id}&limit=3`,
          ),
        ),
      );
      setHits(results.flat());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (available.length < 2)
    return (
      <Empty>
        Only one English edition is bundled for this work. No original-language
        text or alternate translation is substituted.
      </Empty>
    );
  return (
    <>
      <div className="notice">
        Compare translation vocabulary around a shared concept. These segments
        are retrieved independently and are not aligned verse for verse. Check
        the original reference inside each passage.
      </div>
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <label>
          Concept or phrase
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={200}
          />
        </label>
        <button className="button" disabled={!query.trim() || busy}>
          {busy ? "Searching editions…" : "Compare translations"}
        </button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="two-col">
        {available.map((e) => (
          <section key={e.id}>
            <h2>{e.translator}</h2>
            <p className="small muted">{e.title}</p>
            {hits
              .filter((p) => p.editionId === e.id)
              .map((p) => (
                <PassageCard key={p.id} passage={p} {...actions} />
              ))}
          </section>
        ))}
      </div>
    </>
  );
}
