"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { TaxonomyNode, TaxonomyEdge } from "@/packages/shared/taxonomy";
import { Heading, Empty } from "./common";

export function Taxonomy({
  id,
  standalone = false,
}: {
  id?: string;
  standalone?: boolean;
}) {
  const [data, setData] = useState<{
    nodes: TaxonomyNode[];
    edges: TaxonomyEdge[];
  } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/taxonomy", { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Taxonomy unavailable");
        return res.json();
      })
      .then(setData)
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, []);
  if (error)
    return (
      <p className="notice">
        The source-backed hierarchy is unavailable. Existing catalog groupings
        remain accessible.
      </p>
    );
  if (!data)
    return <p role="status">Loading source-backed tradition branches…</p>;
  const selected = data.nodes.find((n) => n.id === id);
  if (standalone && !selected) return <Empty>Tradition not found.</Empty>;
  const outgoing = data.edges.filter((e) => e.parentId === id);
  const displayed = id
    ? data.nodes.filter((n) => outgoing.some((e) => e.childId === n.id))
    : data.nodes.filter((n) => n.kind !== "navigation-group");
  const parents = data.edges.filter((e) => e.childId === id);
  return (
    <section
      className="taxonomy-section"
      aria-label="Source-backed tradition hierarchy"
    >
      {standalone && selected ? (
        <>
          <Heading
            eyebrow={selected.kind.replaceAll("-", " ")}
            title={selected.name}
            description={selected.description}
          />
          <p className="notice">
            {selected.reviewStatus}. These are introductory source summaries,
            not complete community histories or canon classifications.
          </p>
          <h2>Contexts and relationships</h2>
          <ul>
            {parents.map((e) => (
              <li key={`${e.parentId}/${e.relationship}`}>
                <Link href={`/traditions/${e.parentId}`}>
                  {data.nodes.find((n) => n.id === e.parentId)?.name}
                </Link>{" "}
                · {e.relationship}
                <p>{e.notes}</p>
                <a href={e.sourceUrl} target="_blank" rel="noreferrer">
                  Relationship source
                </a>
              </li>
            ))}
          </ul>
          <h2>Sources</h2>
          <ul>
            {selected.sourceRefs.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>{" "}
                · {s.publisher} · checked {s.accessedAt}
              </li>
            ))}
          </ul>
          <p>
            No work assignments for this branch have been reviewed yet. Texts in
            a wider grouping are not automatically assigned to every branch.
          </p>
        </>
      ) : (
        <>
          <h2>Source-backed branches and movements</h2>
          <p>
            These relationships supplement the wider catalog groupings. They are
            not exclusive membership boundaries or a complete taxonomy.
          </p>
        </>
      )}
      {displayed.length ? (
        <div className="tradition-grid">
          {displayed.map((n) => (
            <Link
              className="tradition-card"
              key={n.id}
              href={`/traditions/${n.id}`}
            >
              <span className="small">{n.kind.replaceAll("-", " ")}</span>
              <h3>{n.name}</h3>
              <p>{n.description}</p>
              <span className="small">
                {n.sourceRefs.length} cited source · introductory coverage →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="small muted">
          No further branch records have been reviewed in this grouping yet.
        </p>
      )}
    </section>
  );
}
