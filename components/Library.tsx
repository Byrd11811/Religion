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
export type Actions = {
  onSave: (f: Finding) => void;
  onOpen: (p: SearchHit) => void;
};
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
          `/api/search?q=${encodeURIComponent(query)}${query.startsWith('"') ? "&exact=true" : ""}`,
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
        <button
          className="button"
          onClick={() => actions.onSave(textFinding(text))}
        >
          <Bookmark size={17} />
          Save text
        </button>
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
      <div className="tabs">
        {[
          "Overview",
          "Read edition",
          "Compare translations",
          "History & evidence",
          "Related texts",
        ].map((t) => (
          <button
            key={t}
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
              Original-language transcription and transliteration are not
              bundled. English is explicitly presented as an edition, not the
              original text.
            </p>
          </section>
        </div>
      )}
      {tab === "Read edition" && (
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
      {tab === "History & evidence" && (
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
      {tab === "Compare translations" && (
        <TranslationCompare textId={id} {...actions} />
      )}
      {tab === "Related texts" && (
        <>
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
          <h2>Documented comparison records</h2>
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
                  <button
                    className="text-button"
                    onClick={() => actions.onSave(textFinding(t))}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
