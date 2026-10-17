"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Empty, Heading } from "./common";
import {
  researchKinds,
  researchRecord,
  researchRecords,
} from "@/packages/shared/research-records";

export function ResearchRecords({ id }: { id?: string }) {
  const [kind, setKind] = useState("");
  const [query, setQuery] = useState("");
  if (id) {
    const record = researchRecord(id);
    if (!record)
      return (
        <Empty>
          Research record not found.{" "}
          <Link href="/research">Browse linked research records</Link>.
        </Empty>
      );
    return (
      <>
        <Link className="text-button" href="/research">
          ← All research records
        </Link>
        <Heading
          eyebrow={`${record.kind} research view`}
          title={record.title}
          description={record.subtitle}
        />
        <div className="two-col">
          <section className="panel">
            <h2>Reviewed record</h2>
            <p>{record.summary}</p>
            <h3>Evidence boundary</h3>
            <p>{record.evidence}</p>
            {record.canonicalHref && (
              <Link className="button secondary" href={record.canonicalHref}>
                Open canonical Atlas view
              </Link>
            )}
          </section>
          <section className="panel">
            <h2>Provenance</h2>
            {record.sourceUrls.map((url) => (
              <p key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  Inspect source <ExternalLink size={13} />
                </a>
              </p>
            ))}
            <h3>Linked records</h3>
            {record.related.length ? (
              record.related.map((related) => {
                const target = researchRecord(related);
                return target ? (
                  <p key={related}>
                    <Link href={`/research/${related}`}>
                      {target.kind}: {target.title}
                    </Link>
                  </p>
                ) : null;
              })
            ) : (
              <p>No first-class related record is attached.</p>
            )}
          </section>
        </div>
      </>
    );
  }
  const filtered = researchRecords.filter(
    (item) =>
      (!kind || item.kind === kind) &&
      (!query ||
        `${item.title} ${item.subtitle} ${item.summary}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  return (
    <>
      <Heading
        eyebrow="Linked evidence architecture"
        title="Research records"
        description="Events, polities, communities, sites, practices, entities, organizations, and objects retain their own identity and provenance."
      />
      <p className="notice">
        A link connects evidence; it does not merge record types or turn
        geographic proximity, a shared theme, or an image resemblance into
        historical influence.
      </p>
      <div className="filters">
        <label>
          Record type
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="">All record types</option>
            {researchKinds.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, period, region, evidence…"
          />
        </label>
      </div>
      <div className="stats-row">
        {researchKinds.map((item) => (
          <article className="stat" key={item}>
            <strong>
              {researchRecords.filter((record) => record.kind === item).length}
            </strong>
            <span>{item}</span>
          </article>
        ))}
      </div>
      <div className="text-grid">
        {filtered.map((record) => (
          <article className="panel" key={record.id}>
            <span className="eyebrow">{record.kind}</span>
            <h2>
              <Link href={`/research/${record.id}`}>{record.title}</Link>
            </h2>
            <p>{record.subtitle}</p>
            <p>{record.summary}</p>
            <small>{record.evidence}</small>
          </article>
        ))}
      </div>
    </>
  );
}
