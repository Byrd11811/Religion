"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { api, Badge, Empty, Heading, PassageCard } from "./common";
import type {
  FederatedSearchHit,
  FederatedSearchMode,
  Finding,
  SearchHit,
} from "@/packages/shared/types";
import { federatedSearchModes } from "@/packages/shared/types";

type SearchResponse = {
  items: FederatedSearchHit[];
  total: number;
  counts: Record<string, number>;
};

const labels: Record<FederatedSearchHit["type"], string> = {
  work: "Work",
  tradition: "Tradition",
  subtradition: "Branch / context",
  person: "Person",
  concept: "Concept",
  witness: "Physical witness",
  artifact: "Artifact",
};

export function FederatedSearchPage({
  initialQuery,
  onSave,
  onOpen,
}: {
  initialQuery: string;
  onSave: (finding: Finding) => void;
  onOpen: (passage: SearchHit) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<FederatedSearchMode>("Broad");
  const [entities, setEntities] = useState<FederatedSearchHit[]>([]);
  const [passages, setPassages] = useState<SearchHit[]>([]);
  const [searched, setSearched] = useState(initialQuery);
  const [busy, setBusy] = useState(Boolean(initialQuery));
  const [error, setError] = useState("");

  const run = useCallback(
    async (nextQuery: string, nextMode: FederatedSearchMode) => {
      if (!nextQuery.trim()) return;
      setBusy(true);
      setError("");
      try {
        const passageMode = ["Broad", "Scholarly", "Opposition"].includes(
          nextMode,
        );
        const opposition =
          nextMode === "Opposition"
            ? "&tradition=skeptical-atheistic-materialist-critical"
            : "";
        const [entityResponse, passageResponse] = await Promise.all([
          api<SearchResponse>(
            `/api/federated-search?q=${encodeURIComponent(nextQuery)}&mode=${encodeURIComponent(nextMode)}`,
          ),
          passageMode
            ? api<SearchHit[]>(
                `/api/search?q=${encodeURIComponent(nextQuery)}&preferPrimary=true&limit=12${opposition}`,
              )
            : Promise.resolve([]),
        ]);
        setEntities(entityResponse.items);
        setPassages(passageResponse);
        setSearched(nextQuery);
      } catch (caught) {
        setError((caught as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (initialQuery.trim()) void run(initialQuery, "Broad");
  }, [initialQuery, run]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void run(query, mode);
  }

  return (
    <>
      <Heading
        eyebrow="Federated discovery"
        title="Search the Atlas"
        description="Find catalog works, communities, concepts, people, physical witnesses, artifacts, and source passages. Metadata results remain separate from quoted evidence."
      />
      <form className="search-toolbar" onSubmit={submit}>
        <div className="input-icon">
          <Search size={20} />
          <input
            aria-label="Search all Atlas records"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, alias, manuscript ID, place, author, or concept…"
          />
        </div>
        <select
          aria-label="Search mode"
          value={mode}
          onChange={(event) => {
            const next = event.target.value as FederatedSearchMode;
            setMode(next);
            if (searched) void run(searched, next);
          }}
        >
          {federatedSearchModes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button className="button secondary" disabled={!query.trim() || busy}>
          {busy ? "Searching…" : "Search"}
        </button>
      </form>
      <p className="notice">
        Modes change scope before result limits are applied. “Opposition”
        searches the critical and skeptical collection; “Deep Archive” searches
        works and material records; “Manuscripts” searches verified witness
        metadata.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!busy && searched && (
        <p className="small muted" role="status">
          {entities.length} catalog results · {passages.length} passage results
          for “{searched}”
        </p>
      )}
      {entities.length > 0 && (
        <section>
          <h2>Catalog and archive</h2>
          <div className="two-col">
            {entities.map((item) => (
              <article className="panel" key={`${item.type}-${item.id}`}>
                <div className="card-top">
                  <Badge level="Unreviewed">{labels[item.type]}</Badge>
                  <span className="small muted">{item.availability}</span>
                </div>
                <Link href={item.href}>
                  <h3>{item.title}</h3>
                </Link>
                <p className="small muted">{item.subtitle}</p>
                <p>{item.description}</p>
                {item.aliases.length > 0 && (
                  <p className="small muted">
                    Search aliases: {item.aliases.join(", ")}
                  </p>
                )}
                <Link href={item.href}>
                  Open record <ArrowUpRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      {passages.length > 0 && (
        <section>
          <h2>Edition passages</h2>
          <p className="small muted">
            Passage evidence is ranked separately and retains its source type.
          </p>
          <div className="two-col">
            {passages.map((passage) => (
              <PassageCard
                key={passage.id}
                passage={passage}
                onSave={onSave}
                onOpen={onOpen}
              />
            ))}
          </div>
        </section>
      )}
      {!busy && searched && !entities.length && !passages.length && (
        <Empty>No verified catalog, archive, or edition result matched.</Empty>
      )}
    </>
  );
}
