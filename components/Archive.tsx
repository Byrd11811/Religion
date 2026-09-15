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
  const [tab, setTab] = useState("Overview");
  const objects = museumArtifacts.filter((a) => a.collection === "egypt");
  const works = texts.filter((t) => t.traditionId === "ancient-egypt");
  const egyptWorkIds = new Set(works.map((work) => work.id));
  const egyptWitnesses = witnesses.filter((witness) =>
    witness.workIds.some((id) => egyptWorkIds.has(id)),
  );
  const images = archiveImages.filter((image) =>
    objects.some((artifact) => artifact.id === image.artifactId),
  );
  const tabs = [
    "Overview",
    "Funerary",
    "Wisdom",
    "Stories",
    "Gods",
    "Creation",
    "Afterlife",
    "Magic",
    "Temples & Tombs",
    "Manuscripts",
    "Images",
    "Timeline",
    "Compare",
  ];
  const selectedWorks = works.filter((work) => {
    const value =
      `${work.title} ${work.category} ${work.description} ${work.themes.join(" ")}`.toLowerCase();
    if (tab === "Funerary" || tab === "Afterlife")
      return /funerary|afterlife|dead|amduat|gates|caverns|litany/.test(value);
    if (tab === "Wisdom") return /instruction|wisdom/.test(value);
    if (tab === "Stories")
      return /tale|story|narrative|contendings|sinuhe|westcar/.test(value);
    if (tab === "Creation") return /creation|memphite/.test(value);
    if (tab === "Magic") return /magic/.test(value);
    return false;
  });
  return (
    <>
      <Heading
        eyebrow="Regional collection · developing coverage"
        title="Ancient Egypt"
        description="Read funerary sources alongside surviving papyri. Object dates and source editions remain distinct."
      />
      <p className="notice">
        {works.length} existing catalog works · {objects.length} verified museum
        objects · {images.length} verified images. Most works still need
        reviewed translations and historical metadata.
      </p>
      <div className="chips" role="tablist" aria-label="Egypt collection">
        {tabs.map((name) => (
          <button
            role="tab"
            aria-selected={tab === name}
            className={tab === name ? "selected" : ""}
            onClick={() => setTab(name)}
            key={name}
          >
            {name}
          </button>
        ))}
      </div>
      {(tab === "Overview" || selectedWorks.length > 0) && (
        <section>
          <h2>{tab === "Overview" ? "Text collection" : tab}</h2>
          <div className="chips">
            {(tab === "Overview" ? works : selectedWorks).map((work) => (
              <Link href={`/works/${work.id}`} key={work.id}>
                {work.title}
              </Link>
            ))}
          </div>
        </section>
      )}
      {tab === "Gods" && (
        <Empty>
          A reviewed Egyptian deity/entity dataset has not been added. Names in
          work descriptions are not promoted to entity records.
        </Empty>
      )}
      {tab === "Afterlife" && (
        <section className="panel">
          <h2>Evolution of the Egyptian Afterlife</h2>
          <p>
            This reading path follows changes in surviving funerary corpora; it
            does not assume a single linear theology or uniform access across
            Egyptian society.
          </p>
          <ol>
            <li>
              <Link href="/works/pyramid-texts">Pyramid Texts</Link> — late Old
              Kingdom formulae first preserved in royal pyramid interiors.
            </li>
            <li>
              <Link href="/works/coffin-texts">Coffin Texts</Link> — diverse
              Middle Kingdom compositions on coffins and burial chambers, with
              both reused and new material.
            </li>
            <li>
              <Link href="/works/book-of-the-dead">Book of the Dead</Link> — a
              later manuscript repertoire drawing partly on earlier funerary
              compositions and varying by witness.
            </li>
          </ol>
          <p className="small muted">
            Inspect each record for its academic metadata source and limits.
          </p>
        </section>
      )}
      {(tab === "Overview" || tab === "Temples & Tombs") && (
        <section>
          <h2>Surviving objects</h2>
          <label>
            Object period
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="">All represented periods</option>
              {[...new Set(objects.map((a) => a.period).filter(Boolean))].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
          </label>
          <div className="two-col">
            {objects
              .filter((artifact) => !period || artifact.period === period)
              .map((artifact) => (
                <section key={artifact.id}>
                  <ArtifactCard artifact={artifact} />
                  <ManuscriptGallery
                    images={images
                      .filter((image) => image.artifactId === artifact.id)
                      .slice(0, 1)}
                  />
                </section>
              ))}
          </div>
        </section>
      )}
      {tab === "Manuscripts" && (
        <div className="two-col">
          {egyptWitnesses.map((witness) => (
            <WitnessCard witness={witness} key={witness.id} />
          ))}
        </div>
      )}
      {tab === "Images" && <ManuscriptGallery images={images} />}
      {tab === "Timeline" && (
        <div className="two-col">
          {works
            .filter((work) => work.startDate !== null)
            .sort((a, b) => (a.startDate ?? 0) - (b.startDate ?? 0))
            .map((work) => (
              <article className="panel" key={work.id}>
                <h3>{work.title}</h3>
                <p>{work.dateConfidence}</p>
                <Link href={`/works/${work.id}`}>Inspect date evidence →</Link>
              </article>
            ))}
        </div>
      )}
      {tab === "Compare" && (
        <section className="panel">
          <h2>Compare Egyptian sources</h2>
          <p>
            Comparison uses only bundled passages. Metadata-only works remain
            visible but cannot supply quotations.
          </p>
          <Link href="/compare?text=book-of-the-dead">
            Open the comparison workspace →
          </Link>
        </section>
      )}
      {[
        "Funerary",
        "Wisdom",
        "Stories",
        "Creation",
        "Afterlife",
        "Magic",
      ].includes(tab) &&
        selectedWorks.length === 0 && (
          <Empty>No reviewed work record is available for this view yet.</Empty>
        )}
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
