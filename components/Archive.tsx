"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { texts } from "@/packages/shared/catalog";
import { IIIFViewer } from "./IIIFViewer";
import { api, Heading, Empty } from "./common";
import {
  witnesses,
  museumArtifacts,
  archiveImages,
  coverageStatuses,
  type WorkProfile,
} from "@/packages/shared/archive";
import {
  WitnessCard,
  ArtifactCard,
  ManuscriptGallery,
  CoverageDepthBadge,
  EvidenceStatusBadge,
  DeciphermentBadge,
  KnownClaimedUnknownPanel,
  PrimaryVsInterpretationTabs,
} from "./ArchiveEvidence";

export function DeepArchive({
  collection = "deep-archive",
}: {
  collection?: string;
}) {
  const [q, setQ] = useState(""),
    [coverage, setCoverage] = useState(""),
    [page, setPage] = useState(0),
    [data, setData] = useState<{ items: WorkProfile[]; total: number } | null>(
      null,
    ),
    [error, setError] = useState("");
  const manuscriptOnly = ["manuscripts", "undeciphered"].includes(collection);
  useEffect(() => {
    if (manuscriptOnly) return;
    const abort = new AbortController();
    setError("");
    setData(null);
    api<{ items: WorkProfile[]; total: number }>(
      `/api/works?q=${encodeURIComponent(q)}&coverage=${encodeURIComponent(coverage)}&page=${page}`,
      { signal: abort.signal },
    )
      .then(setData)
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      });
    return () => abort.abort();
  }, [q, coverage, page, manuscriptOnly]);
  const matchedWitnesses = witnesses.filter(
    (w) =>
      w.access !== "Restricted" &&
      (collection !== "undeciphered" || w.decipherment === "Undeciphered") &&
      `${w.title} ${w.repository} ${w.inventoryNumber} ${w.scripts.join(" ")}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="Follow the evidence"
        title={
          collection === "undeciphered"
            ? "Undeciphered Manuscripts"
            : manuscriptOnly
              ? "Manuscript Explorer"
              : "Deep Archive"
        }
        description="Explore works and physical witnesses separately. Missing evidence stays visible; a catalog entry does not imply a complete translation."
      />
      <div className="chips">
        <Link href="/library/deep-archive">Works</Link>
        <Link href="/library/manuscripts">Physical witnesses</Link>
        <Link href="/library/undeciphered">Undeciphered</Link>
      </div>
      <div className="filters">
        <label>
          Search archive
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Title, repository, or manuscript ID"
          />
        </label>
        {!manuscriptOnly && (
          <label>
            Source coverage
            <select
              value={coverage}
              onChange={(e) => {
                setCoverage(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All coverage</option>
              {coverageStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {manuscriptOnly ? (
        <div className="two-col">
          {matchedWitnesses.map((w) => (
            <WitnessCard key={w.id} witness={w} />
          ))}
          {!matchedWitnesses.length && (
            <Empty>No matching verified witness.</Empty>
          )}
        </div>
      ) : data ? (
        <>
          <p className="small muted">
            {data.total} works · page {page + 1}
          </p>
          <div className="two-col">
            {data.items.map((w) => (
              <article className="panel" key={w.id}>
                <span className="eyebrow">{w.tradition}</span>
                <h2>
                  <Link href={`/works/${w.id}`}>{w.title}</Link>
                </h2>
                <CoverageDepthBadge status={w.coverage} />
                <p>{w.description}</p>
                <EvidenceStatusBadge status={w.evidence} />
              </article>
            ))}
          </div>
          {!data.total && (
            <Empty>
              No reviewed records match this coverage status. Absence is not
              evidence that such works never existed.
            </Empty>
          )}
          <div className="row">
            <button
              className="button secondary"
              disabled={!page}
              onClick={() => setPage(page - 1)}
            >
              Previous page
            </button>
            <button
              className="button secondary"
              disabled={(page + 1) * 24 >= data.total}
              onClick={() => setPage(page + 1)}
            >
              Next page
            </button>
          </div>
        </>
      ) : (
        <p role="status">Loading archive…</p>
      )}
    </>
  );
}
export function WitnessDetail({ id }: { id: string }) {
  const w = witnesses.find((w) => w.id === id && w.access !== "Restricted");
  if (!w) return <Empty>No verified witness record found.</Empty>;
  return (
    <>
      <Heading
        eyebrow={`Physical witness · ${w.type}`}
        title={w.title}
        description={w.description}
      />
      <div className="row wrap">
        <EvidenceStatusBadge status={w.evidence} />
        <DeciphermentBadge status={w.decipherment} />
      </div>
      {w.decipherment === "Undeciphered" && (
        <p className="notice">
          <strong>No accepted translation exists.</strong> Atlas provides no
          generated translation of this witness.
        </p>
      )}
      <PrimaryVsInterpretationTabs
        primary={
          <section className="panel">
            <dl className="metadata">
              {[
                ["Repository", w.repository],
                ["Inventory", w.inventoryNumber],
                ["Date notes", w.dateNotes],
                ["Material", w.material],
                ["Language", w.languages.join(", ")],
                ["Script", w.scripts.join(", ")],
                ["Condition", w.condition],
                ["Completeness", w.completeness],
                ["Provenance", w.provenance],
                ["Rights", w.rights],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v || "Data unavailable"}</dd>
                </div>
              ))}
            </dl>
            <p>
              No English edition dependency has been inferred from this object.
            </p>
            {w.workIds.map((workId) => (
              <p key={workId}>
                <Link href={`/works/${workId}`}>
                  Institutionally identified work:{" "}
                  {texts.find((t) => t.id === workId)?.title}
                </Link>
              </p>
            ))}
            {w.sources.map((s) => (
              <p key={s}>
                <a href={s} target="_blank" rel="noreferrer">
                  Institutional record ↗
                </a>
              </p>
            ))}
          </section>
        }
      />
      <KnownClaimedUnknownPanel
        known={w.description}
        claimed="No separately sourced claim record has been added. Popular legends are not primary evidence."
        unknown="Detailed scholarly bibliography and recension links remain to be added. Image availability and rights are recorded separately below."
      />
      <ManuscriptGallery
        images={archiveImages.filter((i) => i.witnessId === id)}
      />
    </>
  );
}
export function ArtifactDetail({ id }: { id: string }) {
  const a = museumArtifacts.find((a) => a.id === id);
  return a ? (
    <>
      <ArtifactCard artifact={a} />
      {a.witnessId && (
        <p>
          <Link href={`/witnesses/${a.witnessId}`}>
            Open physical witness record →
          </Link>
        </p>
      )}
      <IIIFViewer artifactId={id} />
      <ManuscriptGallery
        images={archiveImages.filter((i) => i.artifactId === id)}
      />
    </>
  ) : (
    <Empty>No verified artifact record found.</Empty>
  );
}

export function EgyptCollection() {
  const [period, setPeriod] = useState("");
  const objects = museumArtifacts.filter((a) => a.collection === "egypt");
  const works = texts.filter((t) => t.region === "Egypt");
  return (
    <>
      <Heading
        eyebrow="Regional collection · developing coverage"
        title="Ancient Egypt"
        description="Read funerary sources alongside surviving papyri. Object dates and source editions remain distinct."
      />
      <p className="notice">
        {works.length} existing catalog works · {objects.length} verified museum
        objects ·{" "}
        {
          archiveImages.filter((i) =>
            objects.some((a) => a.id === i.artifactId),
          ).length
        }{" "}
        verified images. Most works still need reviewed translations and
        historical metadata.
      </p>
      <h2>Text collection</h2>
      <div className="chips">
        {works.map((t) => (
          <Link href={`/works/${t.id}`} key={t.id}>
            {t.title}
          </Link>
        ))}
      </div>
      <h2>Surviving papyri</h2>
      <label>
        Object period
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="">All represented periods</option>
          {[...new Set(objects.map((a) => a.period).filter(Boolean))].map(
            (p) => (
              <option key={p}>{p}</option>
            ),
          )}
        </select>
      </label>
      <div className="two-col">
        {objects
          .filter((a) => !period || a.period === period)
          .map((a) => (
            <section key={a.id}>
              <ArtifactCard artifact={a} />
              <ManuscriptGallery
                images={archiveImages
                  .filter((i) => i.artifactId === a.id)
                  .slice(0, 1)}
              />
            </section>
          ))}
      </div>
    </>
  );
}

export function WorkWitnesses({ id }: { id: string }) {
  const matches = witnesses.filter((w) => w.workIds.includes(id));
  return matches.length ? (
    <section>
      <h2>Physical witnesses</h2>
      <p>
        Institutional catalog associations. No dependency of the bundled
        translation on these witnesses is asserted.
      </p>
      <div className="two-col">
        {matches.map((w) => (
          <WitnessCard key={w.id} witness={w} />
        ))}
      </div>
    </section>
  ) : null;
}
