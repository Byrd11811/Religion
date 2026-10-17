"use client";
import { Taxonomy } from "./Taxonomy";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Columns3,
  ExternalLink,
} from "lucide-react";
import {
  texts,
  traditions,
  editions,
  dateLabel,
  relationships,
} from "@/packages/shared/catalog";
import { themes } from "@/packages/ontology";
import { TranslationCompare } from "./TranslationCompare";
import {
  api,
  Badge,
  Empty,
  Heading,
  PassageCard,
  TextCard,
  textFinding,
} from "./common";
import type { Finding, Passage, SearchHit } from "@/packages/shared/types";
import { protocolDecision } from "@/packages/shared/protocols";
import {
  archiveImageDisplayAllowed,
  archiveImages,
  museumArtifacts,
  witnesses,
  workProfile,
} from "@/packages/shared/archive";
import {
  relationshipNodes,
  relationshipsForNode,
} from "@/packages/shared/relationships";
import { sacredCurrentsRecord } from "@/packages/shared/sacred-currents-catalog";
import { ManuscriptGallery, WitnessCard } from "./ArchiveEvidence";
export type Actions = {
  onSave: (f: Finding) => void;
  onOpen: (p: SearchHit) => void;
};

const workTabs = [
  "Overview",
  "Read",
  "Original Language",
  "Translation Compare",
  "Witnesses",
  "Images",
  "History",
  "Canon",
  "Themes",
  "People",
  "Relationships",
  "Timeline",
  "Map",
  "Scholarship",
  "Evidence",
] as const;

function WorkReliability({ id }: { id: string }) {
  const profile = workProfile(id);
  if (!profile) return null;
  const linkedWitnesses = witnesses.filter((item) => item.workIds.includes(id));
  const datedWitnesses = linkedWitnesses
    .filter((item) => item.dateStart !== null)
    .sort((a, b) => a.dateStart! - b.dateStart!);
  const earliest = datedWitnesses[0] ?? null;
  const linkedEditions = editions.filter((item) => item.textId === id);
  const bibliography = [
    ...profile.sources,
    ...linkedEditions.map((item) => item.sourceUrl),
    ...linkedWitnesses.flatMap((item) => item.sources),
  ].filter(
    (value, index, all) =>
      value.startsWith("https://") && all.indexOf(value) === index,
  );
  const recensions = [
    ...new Set(
      linkedWitnesses
        .map((item) => item.recensionId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  return (
    <div className="two-col source-reliability">
      <section className="panel">
        <span className="eyebrow">How certain are we?</span>
        <h2>Source reliability</h2>
        <dl className="metadata">
          <div>
            <dt>Earliest linked witness</dt>
            <dd>
              {earliest
                ? `${earliest.title} · ${dateLabel(earliest.dateStart, earliest.dateEnd)} · ${earliest.evidence}`
                : "No dated physical witness is linked in Atlas."}
            </dd>
          </div>
          <div>
            <dt>Authorship</dt>
            <dd>
              {profile.authorship} · {profile.authorshipConfidence}
            </dd>
          </div>
          <div>
            <dt>Dating</dt>
            <dd>
              {dateLabel(profile.compositionStart, profile.compositionEnd)} ·{" "}
              {profile.compositionNotes}
            </dd>
          </div>
          <div>
            <dt>Completeness</dt>
            <dd>
              {linkedWitnesses.length
                ? linkedWitnesses
                    .map(
                      (item) =>
                        `${item.title}: ${item.completeness ?? "not cataloged"}`,
                    )
                    .join("; ")
                : "No witness-level completeness assessment is linked."}
            </dd>
          </div>
          <div>
            <dt>Corpus depth</dt>
            <dd>
              {profile.coverage} · {profile.sourceQuality}
            </dd>
          </div>
          <div>
            <dt>Scholarly review</dt>
            <dd>{profile.scholarlyReview}</dd>
          </div>
        </dl>
      </section>
      <section className="panel">
        <h2>Provenance and limits</h2>
        <p>
          <strong>Transmission:</strong> {profile.transmission}
        </p>
        <p>
          <strong>Witness provenance:</strong>{" "}
          {linkedWitnesses.length
            ? linkedWitnesses
                .map((item) => `${item.title}: ${item.provenance}`)
                .join(" ")
            : "No physical-witness provenance is attached."}
        </p>
        <p>
          <strong>Recension families:</strong>{" "}
          {recensions.length
            ? recensions.join(", ")
            : "No reviewed recension-family link is attached."}
        </p>
        <p>
          <strong>Model versus curator:</strong> This profile is assembled from
          committed catalog, edition, witness, and relationship records. It
          contains no model-generated reconstruction. AI answers elsewhere in
          Atlas are labeled and audited separately.
        </p>
        <p>
          <strong>Current source gap:</strong>{" "}
          {earliest
            ? "The linked witness does not by itself prove original composition date, authorship, or completeness."
            : "Atlas lacks a dated linked witness, so it cannot make an earliest-survival claim for this work."}
        </p>
      </section>
      <section className="panel span-two">
        <h2>Independent edition and witness links</h2>
        {bibliography.length ? (
          <ul>
            {bibliography.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {url} <ExternalLink size={13} />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No independent HTTPS bibliography is attached.</p>
        )}
        <p className="small muted">
          A link records provenance or access. It does not imply that Atlas
          independently verified every claim on the linked page.
        </p>
      </section>
    </div>
  );
}
export function Library({
  initialQuery = "",
  initialTradition = "",
  ...actions
}: Actions & { initialQuery?: string; initialTradition?: string }) {
  const [query, setQuery] = useState(initialQuery),
    [tradition, setTradition] = useState(initialTradition),
    [theme, setTheme] = useState(""),
    [full, setFull] = useState(false),
    [category, setCategory] = useState(""),
    [sourceType, setSourceType] = useState(""),
    [before, setBefore] = useState(""),
    [after, setAfter] = useState(""),
    [advanced, setAdvanced] = useState(false),
    [page, setPage] = useState(0),
    [hits, setHits] = useState<SearchHit[]>([]),
    [error, setError] = useState(""),
    [searching, setSearching] = useState(false);
  const filtered = texts.filter(
    (t) =>
      (!query ||
        `${t.title} ${t.tradition} ${t.region} ${t.author} ${t.languages} ${t.themes}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!tradition || t.traditionId === tradition) &&
      (!theme || t.themes.includes(theme)) &&
      (!full || editions.some((e) => e.textId === t.id && e.complete)) &&
      (!category || t.category === category) &&
      (!before || (t.startDate !== null && t.startDate <= Number(before))) &&
      (!after || (t.endDate !== null && t.endDate >= Number(after))),
  );
  function reset() {
    setPage(0);
    setHits([]);
  }
  async function findPassages() {
    setSearching(true);
    setError("");
    try {
      setHits(
        await api<SearchHit[]>(
          `/api/search?q=${encodeURIComponent(query)}${query.startsWith('"') ? "&exact=true" : ""}${sourceType ? `&contentType=${encodeURIComponent(sourceType)}` : ""}`,
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="The reading room"
        title="Text Library"
        description="Primary texts, philosophical works, and living traditions. Begin with a text; follow a question."
      />
      <div className="search-toolbar">
        <div className="input-icon">
          <Search size={20} />
          <input
            aria-label="Search text library"
            placeholder="Search a title, tradition, place, or theme…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              reset();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) findPassages();
            }}
          />
        </div>
        <button
          className="button secondary"
          disabled={!query.trim() || searching}
          onClick={findPassages}
        >
          {searching ? "Searching…" : "Search passages"}
        </button>
        <button
          className="icon-button outlined"
          onClick={() => setAdvanced(!advanced)}
          aria-label="Advanced filters"
          aria-expanded={advanced}
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>
      <div className="filters">
        <select
          aria-label="Filter tradition"
          value={tradition}
          onChange={(e) => {
            setTradition(e.target.value);
            reset();
          }}
        >
          <option value="">All traditions</option>
          {traditions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter theme"
          value={theme}
          onChange={(e) => {
            setTheme(e.target.value);
            reset();
          }}
        >
          <option value="">All themes</option>
          {themes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={full}
            onChange={(e) => {
              setFull(e.target.checked);
              reset();
            }}
          />
          Full editions only
        </label>
        <span className="small muted">{filtered.length} texts</span>
      </div>
      {advanced && (
        <div className="filters panel">
          <label>
            Category
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                reset();
              }}
            >
              <option value="">All categories</option>
              {[...new Set(texts.map((t) => t.category))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            From year (negative = BCE)
            <input
              type="number"
              value={after}
              onChange={(e) => {
                setAfter(e.target.value);
                reset();
              }}
            />
          </label>
          <label>
            Through year
            <input
              type="number"
              value={before}
              onChange={(e) => {
                setBefore(e.target.value);
                reset();
              }}
            />
          </label>
          <label>
            Passage source type
            <select
              aria-label="Filter passage source type"
              value={sourceType}
              onChange={(e) => {
                setSourceType(e.target.value);
                setHits([]);
              }}
            >
              <option value="">All source types</option>
              <option>Primary text</option>
              <option>Translator note</option>
              <option>Editorial introduction</option>
              <option>Scholarly commentary</option>
              <option>Footnote</option>
              <option>Appendix</option>
              <option>Unknown</option>
            </select>
          </label>
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {hits.length > 0 && (
        <section>
          <h2>Matching edition passages</h2>
          <div className="two-col">
            {hits.map((p) => (
              <PassageCard key={p.id} passage={p} {...actions} />
            ))}
          </div>
        </section>
      )}
      <div className="text-grid">
        {filtered.slice(page * 18, (page + 1) * 18).map((t) => (
          <TextCard key={t.id} text={t} onSave={actions.onSave} />
        ))}
      </div>
      {!filtered.length && (
        <Empty>
          No metadata matches these filters. Try a broader search or use Search
          passages.
        </Empty>
      )}
      <div className="pagination">
        <button
          className="button secondary"
          disabled={!page}
          onClick={() => setPage(page - 1)}
        >
          <ArrowLeft size={16} />
          Previous
        </button>
        <span>
          Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / 18))}
        </span>
        <button
          className="button secondary"
          disabled={(page + 1) * 18 >= filtered.length}
          onClick={() => setPage(page + 1)}
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
export function TextDetail({ id, ...actions }: Actions & { id: string }) {
  const text = texts.find((t) => t.id === id);
  const available = editions.filter((e) => e.textId === id);
  const [edition, setEdition] = useState(available[0]?.id ?? ""),
    [page, setPage] = useState(0),
    [passages, setPassages] = useState<Passage[]>([]),
    [total, setTotal] = useState(0),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [tab, setTab] = useState("Overview");
  useEffect(() => {
    if (!edition) return;
    const controller = new AbortController();
    setLoading(true);
    api<{ total: number; passages: Passage[] }>(
      `/api/passages?edition=${edition}&page=${page}`,
      { signal: controller.signal },
    )
      .then((d) => {
        setPassages(d.passages);
        setTotal(d.total);
        setError("");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [edition, page]);
  if (!text)
    return (
      <Empty>
        Text not found. <Link href="/library">Return to the library</Link>.
      </Empty>
    );
  const selectedEdition = available.find((e) => e.id === edition);
  const profile = workProfile(id);
  const linkedWitnesses = witnesses.filter((item) => item.workIds.includes(id));
  const linkedImages = archiveImages.filter(
    (item) => item.workIds.includes(id) && archiveImageDisplayAllowed(item),
  );
  const linkedArtifacts = museumArtifacts.filter((artifact) =>
    linkedImages.some((image) => image.artifactId === artifact.id),
  );
  const graphRelationships = relationshipsForNode(id);
  const relatedPeople = relationshipNodes.filter(
    (node) =>
      node.type === "person" &&
      graphRelationships.some(
        (relationship) =>
          relationship.source === node.id || relationship.target === node.id,
      ),
  );
  const currentRecord = sacredCurrentsRecord(id);
  const originalEditions = available.filter(
    (item) =>
      !/^english$/iu.test(item.language) ||
      /transliteration|transcription|original/iu.test(item.language),
  );
  return (
    <>
      <Link className="text-button" href="/library">
        <ArrowLeft size={15} />
        Back to the library
      </Link>
      <Heading
        eyebrow={text.tradition}
        title={text.title}
        description={text.canonStatus}
      />
      <div className="row wrap">
        {protocolDecision(text.id, "cache").allowed && (
          <button
            className="button"
            onClick={() => actions.onSave(textFinding(text))}
          >
            <Bookmark size={17} />
            Save text
          </button>
        )}
        <Link className="button secondary" href={`/compare?text=${id}`}>
          <Columns3 size={17} />
          Compare
        </Link>
        <Link className="button secondary" href={`/questions?text=${id}`}>
          Ask about this text
        </Link>
        {text.sourceUrl && (
          <a
            className="text-button"
            href={text.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Source edition
            <ExternalLink size={16} />
          </a>
        )}
      </div>
      <div className="profile-strip">
        <div>
          <span>Composition / publication</span>
          <strong>{dateLabel(text.startDate, text.endDate)}</strong>
          <small>{text.dateConfidence}</small>
        </div>
        <div>
          <span>Context region</span>
          <strong>{text.region}</strong>
        </div>
        <div>
          <span>Original language</span>
          <strong>{text.languages.join(", ") || "Data unavailable"}</strong>
        </div>
        <div>
          <span>Availability</span>
          <strong>{text.sourceStatus}</strong>
          <Badge level={text.confidence} />
        </div>
      </div>
      <div
        className="tabs work-research-tabs"
        role="tablist"
        aria-label="Work research views"
      >
        {workTabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="two-col">
          <section className="panel">
            <h2>About the work</h2>
            <p>{text.description}</p>
            <h3>Authorship</h3>
            <p>{text.author}</p>
            <h3>Canon & community</h3>
            <p>{text.canonStatus}</p>
            <p className="small muted">
              Canon status describes a community’s use of a work. It is not a
              measure of historical truth.
            </p>
          </section>
          <section className="panel">
            <h2>Themes to follow</h2>
            <div className="chips">
              {text.themes.length ? (
                text.themes.map((t) => (
                  <Link key={t} href={`/questions?q=${t}&text=${id}`}>
                    {t}
                  </Link>
                ))
              ) : (
                <p>Theme classification unavailable.</p>
              )}
            </div>
            <h3>Edition & rights</h3>
            <p>{text.copyright}</p>
            {available.map((e) => (
              <p key={e.id}>
                {e.translator} · {e.language} ·{" "}
                {e.passageCount.toLocaleString()} segments
              </p>
            ))}
            <p className="notice">
              {available.some((e) =>
                e.language.toLowerCase().includes("transliteration"),
              )
                ? "The bundled original-language material is a scholarly composite transliteration, not an English translation or a diplomatic transcription of one witness."
                : "Original-language transcription and transliteration are not bundled. English is explicitly presented as an edition, not the original text."}
            </p>
          </section>
        </div>
      )}
      {tab === "Read" && (
        <>
          <div className="reader-controls">
            <label>
              Translation / edition
              <select
                value={edition}
                onChange={(e) => {
                  setEdition(e.target.value);
                  setPage(0);
                }}
                disabled={!available.length}
              >
                {available.length ? (
                  available.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.translator} · {e.id}
                    </option>
                  ))
                ) : (
                  <option>No edition bundled</option>
                )}
              </select>
            </label>
            {available.length > 0 && (
              <label>
                Go to segment
                <input
                  aria-label="Go to segment"
                  type="number"
                  min={1}
                  max={total}
                  defaultValue={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setPage(
                        Math.floor(
                          (Math.max(
                            1,
                            Math.min(total, Number(e.currentTarget.value)),
                          ) -
                            1) /
                            20,
                        ),
                      );
                  }}
                />
              </label>
            )}
          </div>
          {!edition ? (
            <Empty>
              This is a metadata record. No licensed full edition has been
              ingested.
            </Empty>
          ) : (
            <>
              <p className="notice">{selectedEdition?.note}</p>
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
              {loading ? (
                <p role="status">Loading edition…</p>
              ) : (
                <div className="reading-column">
                  {passages.map((p) => (
                    <PassageCard
                      key={p.id}
                      passage={{
                        ...p,
                        score: 0,
                        textTitle: text.title,
                        tradition: text.tradition,
                        translator: selectedEdition?.translator ?? "",
                      }}
                      {...actions}
                    />
                  ))}
                </div>
              )}
              <div className="pagination">
                <button
                  className="button secondary"
                  disabled={!page}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span>
                  {page * 20 + 1}–{Math.min((page + 1) * 20, total)} of {total}
                </span>
                <button
                  className="button secondary"
                  disabled={(page + 1) * 20 >= total}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
      {tab === "History" && (
        <div className="two-col">
          <section className="panel">
            <h2>What do we know?</h2>
            <Badge level={text.confidence} />
            <p>{text.historicalContext}</p>
            <h3>Manuscript evidence</h3>
            <p>{text.manuscripts}</p>
            <h3>Metadata provenance</h3>
            {text.metadataSources.map((s) => (
              <p key={s}>
                {s.startsWith("https://") ? (
                  <a href={s} target="_blank" rel="noreferrer">
                    Edition source <ExternalLink size={14} />
                  </a>
                ) : (
                  s
                )}
              </p>
            ))}
          </section>
          <section className="panel">
            <h2>Myth, history, or both?</h2>
            <p>Genre: {text.category}.</p>
            <p>
              A work’s religious meaning and the historical evidence for its
              events are separate research questions.
            </p>
            <p>
              Archaeological corroboration: data unavailable in this record.
            </p>
            <p>
              External historical references: data unavailable in this record.
            </p>
            <Link href="/methodology" className="text-button">
              Read the source policy →
            </Link>
          </section>
        </div>
      )}
      {tab === "Original Language" && (
        <div className="two-col">
          <section className="panel">
            <h2>Original-language access</h2>
            <p>
              <strong>Cataloged language:</strong>{" "}
              {text.languages.join(", ") || "Data unavailable"}
            </p>
            {originalEditions.length ? (
              originalEditions.map((item) => (
                <article key={item.id} className="evidence-detail">
                  <h3>{item.language}</h3>
                  <p>
                    {item.translator} · {item.passageCount.toLocaleString()}{" "}
                    segments
                  </p>
                  <p>{item.note}</p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setEdition(item.id);
                      setPage(0);
                      setTab("Read");
                    }}
                  >
                    Read this edition
                  </button>
                </article>
              ))
            ) : (
              <p className="notice">
                No reviewed original-language transcription or transliteration
                is bundled. Atlas does not reconstruct missing wording.
              </p>
            )}
          </section>
          <section className="panel">
            <h2>Alignment status</h2>
            <p>
              Reference alignment is kept separate from the reading edition so
              unrelated passages are never placed side by side as equivalents.
            </p>
            <button
              className="button secondary"
              onClick={() => setTab("Translation Compare")}
            >
              Inspect shared references
            </button>
          </section>
        </div>
      )}
      {tab === "Translation Compare" && (
        <TranslationCompare textId={id} {...actions} />
      )}
      {tab === "Witnesses" &&
        (linkedWitnesses.length ? (
          <>
            <p className="notice">
              These are reviewed work-to-witness associations. Atlas does not
              claim that a bundled translation was made directly from a linked
              witness unless an edition record says so.
            </p>
            <div className="two-col">
              {linkedWitnesses.map((item) => (
                <WitnessCard key={item.id} witness={item} />
              ))}
            </div>
          </>
        ) : (
          <Empty>
            No physical witness is currently linked to this work. Composition
            dates and surviving-witness dates therefore remain separate.
          </Empty>
        ))}
      {tab === "Images" && (
        <>
          {linkedArtifacts.length > 0 && (
            <p className="notice">
              {linkedArtifacts.length} institutional object record
              {linkedArtifacts.length === 1 ? "" : "s"} explicitly link to this
              work. Image appearance is not used to infer hidden intent,
              authorship, or historical truth.
            </p>
          )}
          <ManuscriptGallery images={linkedImages} />
        </>
      )}
      {tab === "Canon" && (
        <div className="two-col">
          <section className="panel">
            <h2>Community status</h2>
            <p>{text.canonStatus}</p>
            <p className="small muted">
              Canon status describes reception and use within communities; it is
              not a historical-truth score.
            </p>
          </section>
          <section className="panel">
            <h2>Catalog context</h2>
            <p>
              <strong>Tradition grouping:</strong> {text.tradition}
            </p>
            <p>
              <strong>Work type:</strong> {text.category}
            </p>
            <Link href={`/traditions/${text.traditionId}`}>
              Explore this tradition grouping →
            </Link>
          </section>
        </div>
      )}
      {tab === "Themes" && (
        <>
          <p className="notice">
            Themes are discovery labels. A shared label does not establish
            borrowing, contact, or doctrinal agreement.
          </p>
          <div className="chips">
            {text.themes.length ? (
              text.themes.map((theme) => (
                <Link
                  key={theme}
                  href={`/questions?q=${encodeURIComponent(theme)}&text=${id}`}
                >
                  {theme}
                </Link>
              ))
            ) : (
              <span>No reviewed themes are attached.</span>
            )}
          </div>
          <div className="text-grid">
            {texts
              .filter(
                (item) =>
                  item.id !== id &&
                  item.themes.some((theme) => text.themes.includes(theme)),
              )
              .slice(0, 9)
              .map((item) => (
                <TextCard key={item.id} text={item} onSave={actions.onSave} />
              ))}
          </div>
        </>
      )}
      {tab === "People" && (
        <div className="two-col">
          <section className="panel">
            <h2>Attributed author or compiler</h2>
            <p>{text.author}</p>
            <p className="small muted">
              This field preserves the catalog attribution and its current
              limits; it is not converted into a verified identity claim.
            </p>
          </section>
          <section className="panel">
            <h2>Sourced graph people</h2>
            {relatedPeople.length ? (
              relatedPeople.map((person) => (
                <article key={person.id}>
                  <h3>{person.label}</h3>
                  <p>{person.description}</p>
                  {person.sourceUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      Source <ExternalLink size={13} />
                    </a>
                  ))}
                </article>
              ))
            ) : (
              <p>
                No person node is connected by a reviewed relationship record.
              </p>
            )}
          </section>
        </div>
      )}
      {tab === "Relationships" && (
        <>
          <h2>Reviewed relationship records</h2>
          {graphRelationships.length ? (
            graphRelationships.map((relationship) => {
              const otherId =
                relationship.source === id
                  ? relationship.target
                  : relationship.source;
              const other = relationshipNodes.find(
                (node) => node.id === otherId,
              );
              return (
                <article className="panel" key={relationship.id}>
                  <span className="eyebrow">
                    {relationship.relationshipType} ·{" "}
                    {relationship.evidenceLevel}
                  </span>
                  <h3>{other?.label ?? otherId}</h3>
                  <p>{relationship.summary}</p>
                  <p>
                    <strong>Chronology:</strong> {relationship.chronology}
                  </p>
                  <p>
                    <strong>Contact:</strong> {relationship.contact}
                  </p>
                  <p>
                    <strong>Difference:</strong> {relationship.difference}
                  </p>
                  <div className="row wrap">
                    {relationship.citations.map((citation) => (
                      <a
                        key={citation.id}
                        href={citation.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {citation.label}
                        {citation.locator ? ` · ${citation.locator}` : ""}{" "}
                        <ExternalLink size={13} />
                      </a>
                    ))}
                  </div>
                </article>
              );
            })
          ) : (
            <p className="notice">
              No reviewed heterogeneous-graph relationship is attached to this
              work.
            </p>
          )}
          <h2>Shared themes · not claims of influence</h2>
          <div className="text-grid">
            {texts
              .filter(
                (t) =>
                  t.id !== id &&
                  t.themes.some((th) => text.themes.includes(th)),
              )
              .slice(0, 9)
              .map((t) => (
                <TextCard key={t.id} text={t} onSave={actions.onSave} />
              ))}
          </div>
          <h2>Legacy comparison records</h2>
          {relationships
            .filter((r) => r.source === id || r.target === id)
            .map((r) => (
              <div className="panel" key={r.id}>
                <Badge level={r.confidence} />
                <p>{r.summary}</p>
                <a href={r.sourceUrl} target="_blank" rel="noreferrer">
                  Read supporting source
                </a>
              </div>
            ))}
        </>
      )}
      {tab === "Timeline" && (
        <div className="two-col">
          <section className="panel">
            <h2>Work chronology</h2>
            <p>
              <strong>Composition or publication range:</strong>{" "}
              {dateLabel(text.startDate, text.endDate)}
            </p>
            <p>{text.dateConfidence}</p>
            <p>
              <strong>Linked witness dates:</strong>{" "}
              {linkedWitnesses.length
                ? linkedWitnesses
                    .map(
                      (item) =>
                        `${item.title}: ${dateLabel(item.dateStart, item.dateEnd)}`,
                    )
                    .join("; ")
                : "No linked witness chronology."}
            </p>
          </section>
          <section className="panel">
            <h2>Synchronized timeline</h2>
            <p>
              {currentRecord
                ? `${currentRecord.dateLabel} · ${currentRecord.dateEvidence}. ${currentRecord.dateNote}`
                : "This work has no Sacred Currents chronology record."}
            </p>
            <Link
              className="button secondary"
              href={`/timeline?q=${encodeURIComponent(text.title)}`}
            >
              Open in Sacred Currents timeline
            </Link>
          </section>
        </div>
      )}
      {tab === "Map" && (
        <div className="two-col">
          <section className="panel">
            <h2>Geographic evidence</h2>
            {currentRecord?.geography ? (
              <>
                <p>
                  <strong>{currentRecord.geography.label}</strong> ·{" "}
                  {currentRecord.geography.lat.toFixed(3)},{" "}
                  {currentRecord.geography.lng.toFixed(3)}
                </p>
                <p>{currentRecord.geography.note}</p>
              </>
            ) : (
              <p>
                No reviewed coordinate is attached to this work. Atlas does not
                infer one from a tradition or modern repository.
              </p>
            )}
          </section>
          <section className="panel">
            <h2>Map context</h2>
            <p>
              Political borders, population extent, historical routes, and
              influence flows require independent sourced layers; a catalog
              point cannot substitute for them.
            </p>
            <Link
              className="button secondary"
              href={`/map?q=${encodeURIComponent(text.title)}`}
            >
              Open in Sacred Currents map
            </Link>
          </section>
        </div>
      )}
      {tab === "Scholarship" && (
        <div className="two-col">
          <section className="panel">
            <h2>Review state</h2>
            <p>
              {profile?.scholarlyReview ??
                "No scholarly review state is available."}
            </p>
            <p>
              <strong>Source quality:</strong>{" "}
              {profile?.sourceQuality ?? "Data unavailable"}
            </p>
            <p>
              <strong>Historical context:</strong> {text.historicalContext}
            </p>
          </section>
          <section className="panel">
            <h2>Bibliography and edition responsibility</h2>
            {available.map((item) => (
              <p key={item.id}>
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  {item.translator} · {item.language} <ExternalLink size={13} />
                </a>
                <br />
                <span className="small muted">{item.note}</span>
              </p>
            ))}
            {text.metadataSources.map((source) =>
              source.startsWith("https://") ? (
                <p key={source}>
                  <a href={source} target="_blank" rel="noreferrer">
                    Metadata source <ExternalLink size={13} />
                  </a>
                </p>
              ) : (
                <p key={source}>{source}</p>
              ),
            )}
          </section>
        </div>
      )}
      {tab === "Evidence" && <WorkReliability id={id} />}
    </>
  );
}
export function TraditionsView({ id, ...actions }: Actions & { id?: string }) {
  const t = traditions.find((t) => t.id === id);
  if (id && !t) return <Taxonomy id={id} standalone />;
  return (
    <>
      <Heading
        eyebrow="Communities & contexts"
        title={t?.name ?? "Traditions"}
        description={
          t?.description ??
          "Explore catalog groupings without treating cultures or communities as uniform."
        }
      />
      <Taxonomy id={id} />
      {t ? (
        <>
          <div className="notice">
            Region: {t.region}. Origins, major branches, rituals and schisms
            need tradition-specific editorial research; they are not inferred
            from this broad grouping.
          </div>
          <div className="text-grid">
            {texts
              .filter((tx) => tx.traditionId === t.id)
              .map((tx) => (
                <TextCard key={tx.id} text={tx} onSave={actions.onSave} />
              ))}
          </div>
        </>
      ) : (
        <div className="tradition-grid">
          {traditions.map((t, i) => (
            <Link
              href={`/traditions/${t.id}`}
              key={t.id}
              className="tradition-card"
            >
              <span className="ordinal">{String(i + 1).padStart(2, "0")}</span>
              <h3>{t.name}</h3>
              <p>{t.region}</p>
              <span className="small">
                {texts.filter((tx) => tx.traditionId === t.id).length} catalog
                entries →
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
export function CanonView(actions: Actions) {
  const [group, setGroup] = useState("");
  const filtered = texts.filter((t) => !group || t.traditionId === group);
  return (
    <>
      <Heading
        eyebrow="Authority & belonging"
        title="Canon / Non-Canon"
        description="Accepted by whom, and when? Canon belongs to particular communities and changes through history."
      />
      <div className="notice">
        “Not canonical” does not mean “false,” and “canonical” does not mean
        historically verified. Unreviewed entries are not automatically
        classified as excluded texts.
      </div>
      <label className="filter-label">
        Community grouping
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">All groupings</option>
          {traditions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Text</th>
              <th>Community / context</th>
              <th>Canon status</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link href={`/texts/${t.id}`}>{t.title}</Link>
                </td>
                <td>{t.tradition}</td>
                <td>{t.canonStatus}</td>
                <td>
                  {protocolDecision(t.id, "cache").allowed ? (
                    <button
                      className="text-button"
                      onClick={() => actions.onSave(textFinding(t))}
                    >
                      Save
                    </button>
                  ) : (
                    <span className="small muted">Restricted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
