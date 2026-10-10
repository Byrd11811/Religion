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
type SearchFilters = {
  type: string;
  region: string;
  language: string;
  canon: string;
  rights: string;
  confidence: string;
};
const emptyFilters: SearchFilters = {
  type: "",
  region: "",
  language: "",
  canon: "",
  rights: "",
  confidence: "",
};

const labels: Record<FederatedSearchHit["type"], string> = {
  work: "Work",
  tradition: "Tradition",
  subtradition: "Branch / context",
  person: "Person",
  entity: "Entity / institution",
  concept: "Concept",
  "unresolved-corpus": "Unresolved corpus",
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
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const [entities, setEntities] = useState<FederatedSearchHit[]>([]);
  const [passages, setPassages] = useState<SearchHit[]>([]);
  const [searched, setSearched] = useState(initialQuery);
  const [busy, setBusy] = useState(Boolean(initialQuery));
  const [error, setError] = useState("");

  const run = useCallback(
    async (
      nextQuery: string,
      nextMode: FederatedSearchMode,
      nextFilters: SearchFilters,
    ) => {
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
        const entityParams = new URLSearchParams({
          q: nextQuery,
          mode: nextMode,
        });
        for (const [key, value] of Object.entries(nextFilters)) {
          if (value) entityParams.set(key, value);
        }
        const [entityResponse, passageResponse] = await Promise.all([
          api<SearchResponse>(
            `/api/federated-search?${entityParams.toString()}`,
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
    if (initialQuery.trim()) void run(initialQuery, "Broad", emptyFilters);
  }, [initialQuery, run]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void run(query, mode, filters);
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
            if (searched) void run(searched, next, filters);
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
      <details className="panel">
        <summary>Metadata filters</summary>
        <div className="filters">
          <label>
            Record type
            <select
              aria-label="Filter record type"
              value={filters.type}
              onChange={(event) =>
                setFilters({ ...filters, type: event.target.value })
              }
            >
              <option value="">All record types</option>
              {Object.entries(labels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Region
            <input
              value={filters.region}
              onChange={(event) =>
                setFilters({ ...filters, region: event.target.value })
              }
              placeholder="For example, Mesopotamia"
            />
          </label>
          <label>
            Language or script
            <input
              value={filters.language}
              onChange={(event) =>
                setFilters({ ...filters, language: event.target.value })
              }
              placeholder="For example, Greek"
            />
          </label>
          <label>
            Canon status contains
            <input
              value={filters.canon}
              onChange={(event) =>
                setFilters({ ...filters, canon: event.target.value })
              }
              placeholder="For example, canonical"
            />
          </label>
          <label>
            Rights / access
            <select
              value={filters.rights}
              onChange={(event) =>
                setFilters({ ...filters, rights: event.target.value })
              }
            >
              <option value="">Any rights state</option>
              <option>Public-domain text</option>
              <option>Public metadata</option>
              <option>Rights review required</option>
            </select>
          </label>
          <label>
            Evidence confidence
            <select
              value={filters.confidence}
              onChange={(event) =>
                setFilters({ ...filters, confidence: event.target.value })
              }
            >
              <option value="">Any confidence</option>
              <option>Reviewed</option>
              <option>Provisional</option>
              <option>Unreviewed</option>
            </select>
          </label>
        </div>
      </details>
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
      {passages.length > 0 && (
        <section>
          <h2>Edition passages</h2>
          <p className="small muted">
            Passage evidence is ranked separately, with primary source material
            first when available, and retains its source type.
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
                    Alternate search titles: {item.aliases.join(", ")}
                  </p>
                )}
                {item.nameAssertions && item.nameAssertions.length > 0 && (
                  <details>
                    <summary className="small">
                      Sourced name forms ({item.nameAssertions.length})
                    </summary>
                    <ul className="small muted">
                      {item.nameAssertions.map((assertion, index) => (
                        <li
                          key={`${assertion.name}-${assertion.assertionType}-${index}`}
                        >
                          <strong>{assertion.name}</strong> —{" "}
                          {assertion.assertionType.replaceAll("-", " ")};{" "}
                          {assertion.language}, {assertion.script}.{" "}
                          {assertion.scope}
                          {` Confidence: ${assertion.confidence}.`}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <Link href={item.href}>
                  Open record <ArrowUpRight size={15} />
                </Link>
              </article>
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
