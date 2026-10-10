"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Plus,
  Download,
  Trash2,
  Bookmark,
} from "lucide-react";
import {
  texts,
  traditions,
  editions,
  dateLabel,
} from "@/packages/shared/catalog";
import { questions, themes } from "@/packages/ontology";
import type {
  Collection,
  QueryAnswer,
  SearchHit,
  TextRecord,
  Relationship,
} from "@/packages/shared/types";
import { api, Heading, PassageCard, Empty, Dialog, Badge } from "./common";
import {
  exportCsv,
  exportMarkdown,
  exportableCollection,
} from "@/packages/citation";
import type { Actions } from "./Library";
import type { ComparisonResponse } from "@/packages/research/comparison";
import type { ResearchEngineSource } from "@/packages/shared/research-engines";
import { comparisonProvenanceSnapshot } from "@/packages/shared/research-provenance";
import { ComparisonEngineResults } from "./ResearchEngines";
import { orderTextsByCompositionDate } from "@/packages/research/chronology-order";
export function QuestionExplorer({
  initialQuery = "",
  initialText = "",
  opposition = false,
  ...actions
}: Actions & {
  initialQuery?: string;
  initialText?: string;
  opposition?: boolean;
}) {
  const [q, setQ] = useState(initialQuery),
    [answer, setAnswer] = useState<QueryAnswer | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [tradition, setTradition] = useState(""),
    [after, setAfter] = useState(""),
    [before, setBefore] = useState("");
  async function ask(question = q) {
    if (question.trim().length < 3) return;
    setQ(question);
    setBusy(true);
    setError("");
    try {
      setAnswer(
        await api<QueryAnswer>("/api/query", {
          method: "POST",
          body: JSON.stringify({
            question,
            textIds: initialText ? [initialText] : undefined,
            traditions: tradition
              ? [tradition]
              : opposition
                ? traditions
                    .filter((t) =>
                      /Skeptical|Adversarial|Greek|Roman/.test(t.name),
                    )
                    .map((t) => t.id)
                : undefined,
            after: after ? Number(after) : undefined,
            before: before ? Number(before) : undefined,
          }),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow={
          opposition ? "Challenge an assumption" : "Follow your curiosity"
        }
        title={opposition ? "Show the Opposition" : "Question Explorer"}
        description={
          opposition
            ? "Explore critiques, competing accounts, and reinterpretations. These voices do not form a single opposing tradition."
            : "Ask a question. Examine how different texts approach it, with every passage open to inspection."
        }
      />
      {initialText && (
        <p className="notice">
          Searching within {texts.find((t) => t.id === initialText)?.title}.{" "}
          <Link href="/questions">Search all texts</Link>
        </p>
      )}
      <form
        className="question-form"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <Search size={22} />
        <input
          aria-label="Your research question"
          placeholder={
            opposition
              ? "What do texts say about obedience?"
              : "What happens after death?"
          }
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={1000}
        />
        <button className="button" disabled={busy || q.trim().length < 3}>
          {busy ? "Exploring…" : "Explore"}
          <ArrowRight size={17} />
        </button>
      </form>
      <div className="chips">
        {questions.slice(0, 4).map((question) => (
          <button key={question} onClick={() => ask(question)} disabled={busy}>
            {question}
          </button>
        ))}
      </div>
      <details className="query-filters">
        <summary>Refine scope</summary>
        <div className="filters">
          <label>
            Tradition
            <select
              value={tradition}
              onChange={(e) => setTradition(e.target.value)}
            >
              <option value="">
                {opposition
                  ? "Critical / philosophical groupings"
                  : "All groupings"}
              </option>
              {traditions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            From year
            <input
              type="number"
              placeholder="e.g. -500"
              value={after}
              onChange={(e) => setAfter(e.target.value)}
            />
          </label>
          <label>
            Through year
            <input
              type="number"
              value={before}
              onChange={(e) => setBefore(e.target.value)}
            />
          </label>
        </div>
      </details>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {busy && (
        <div className="loading" role="status">
          Finding relevant passages across the corpus…
        </div>
      )}
      {answer ? (
        <>
          <section className="answer-overview">
            <div className="row between">
              <span className="eyebrow">{answer.mode}</span>
              <button
                className="text-button"
                onClick={() =>
                  actions.onSave({
                    id: `query-${Date.now()}`,
                    kind: "query",
                    title: answer.question,
                    content: JSON.stringify(answer, null, 2),
                    createdAt: new Date().toISOString(),
                  })
                }
              >
                <Bookmark size={16} />
                Save research
              </button>
            </div>
            <h2>{answer.question}</h2>
            <p>{answer.summary}</p>
            {answer.synthesis && (
              <div className="model-output">
                <Badge level="E">
                  Model synthesis · inspect cited evidence
                </Badge>
                <p>{answer.synthesis}</p>
              </div>
            )}
            <div className="row wrap">
              <Link
                className="text-button"
                href={`/opposition?q=${encodeURIComponent(q)}`}
              >
                Show the Opposition →
              </Link>
              <Link className="text-button" href="/compare">
                Compare texts →
              </Link>
            </div>
          </section>
          {answer.guide && (
            <section className="panel">
              <Badge level="D">
                Editorial reading guide · provisional interpretation
              </Badge>
              <h2>{answer.guide.title}</h2>
              <p>{answer.guide.summary}</p>
              <div className="two-col">
                {answer.guide.perspectives.map((p) => (
                  <article key={p.textId}>
                    <h3>{p.label}</h3>
                    <p>{p.interpretation}</p>
                    {p.passageIds.map((id) => {
                      const source = answer.passages.find((s) => s.id === id);
                      return source ? (
                        <PassageCard key={id} passage={source} {...actions} />
                      ) : null;
                    })}
                  </article>
                ))}
              </div>
              <h3>Shared concerns</h3>
              <p>{answer.guide.agreements}</p>
              <h3>Differences</h3>
              <p>{answer.guide.differences}</p>
              <p className="small muted">{answer.guide.scope}</p>
            </section>
          )}
          <div className="two-col">
            {[
              ["Areas of agreement", answer.agreements.join(" ")],
              ["Areas of disagreement", answer.disagreements.join(" ")],
              ["Historical development", answer.history],
              ["Potential influence", answer.influence],
              ["Independent development", answer.independent],
              ["Alternative perspectives", answer.alternatives],
            ].map(([label, value]) => (
              <details className="evidence-detail" key={label}>
                <summary>{label}</summary>
                <p>{value}</p>
              </details>
            ))}
          </div>
          <h2>Representative edition passages</h2>
          {answer.passages.length ? (
            <div className="two-col">
              {answer.passages.map((p) => (
                <PassageCard key={p.id} passage={p} {...actions} />
              ))}
            </div>
          ) : (
            <Empty>
              No matching source passages. Try “soul,” “death,” or “suffering.”
            </Empty>
          )}
          <section className="panel">
            <h3>Confidence & uncertainty</h3>
            <ul>
              {answer.uncertainty.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <div className="question-intro">
          <div className="eyebrow">A starting point, not a verdict</div>
          <h2>
            One question.
            <br />
            Many ways of seeing.
          </h2>
          <p>
            Search complete historical editions from South Asia, China, the
            Mediterranean, and other contexts. Read the surrounding text before
            drawing a conclusion.
          </p>
          <span className="small muted">
            Local evidence retrieval is available now. Optional model synthesis
            requires provider configuration.
          </span>
        </div>
      )}
    </>
  );
}
type Comparison = {
  cases: {
    id: string;
    title: string;
    tension: string;
    alternative: string;
    confidence: "D";
    passages: SearchHit[];
  }[];
  texts: TextRecord[];
  passages: { textId: string; passages: SearchHit[] }[];
  relationships: Relationship[];
  engineAnalysis: ComparisonResponse;
  researchSources: ResearchEngineSource[];
  note: string;
};
const comparisonModeApi = {
  Synthesize: "synthesize",
  "Show Contradictions": "contradictions",
  "Show Similarities": "similarities",
  "Show Earlier Parallels": "earlier-parallels",
  "Show Later Echoes": "later-echoes",
  "Show Alternative Interpretations": "alternative-interpretations",
} as const;
export function Compare({
  initialText = "",
  ...actions
}: Actions & { initialText?: string }) {
  const [ids, setIds] = useState<string[]>(
      initialText
        ? [initialText, "dhammapada"].filter((v, i, a) => a.indexOf(v) === i)
        : [
            "analects",
            "dhammapada",
            "gospel-of-matthew",
            "tao-te-ching",
            "the-satanic-bible",
          ],
    ),
    [q, setQ] = useState(initialText ? "soul" : "injury"),
    [search, setSearch] = useState(""),
    [data, setData] = useState<Comparison | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [mode, setMode] = useState("Synthesize");
  const comparisonRequest = useRef<AbortController | null>(null);

  function invalidateComparison() {
    comparisonRequest.current?.abort();
    comparisonRequest.current = null;
    setBusy(false);
    setData(null);
  }

  async function run(nextMode = "Synthesize") {
    comparisonRequest.current?.abort();
    const request = new AbortController();
    comparisonRequest.current = request;
    setMode(nextMode);
    setBusy(true);
    setError("");
    setData(null);
    try {
      const result = await api<Comparison>("/api/compare", {
        method: "POST",
        signal: request.signal,
        body: JSON.stringify({
          textIds: ids,
          theme: q,
          mode: comparisonModeApi[nextMode as keyof typeof comparisonModeApi],
        }),
      });
      if (comparisonRequest.current === request) setData(result);
    } catch (e) {
      if (comparisonRequest.current === request && !request.signal.aborted)
        setError((e as Error).message);
    } finally {
      if (comparisonRequest.current === request) {
        comparisonRequest.current = null;
        setBusy(false);
      }
    }
  }
  useEffect(() => () => comparisonRequest.current?.abort(), []);
  const selected = texts.filter((t) => ids.includes(t.id));
  const fields: [string, (t: TextRecord) => string][] = [
    ["Tradition", (t) => t.tradition],
    ["Approximate date", (t) => dateLabel(t.startDate, t.endDate)],
    ["Region", (t) => t.region],
    ["Language", (t) => t.languages.join(", ") || "Data unavailable"],
    ["Canon status", (t) => t.canonStatus],
    ["Core context", (t) => t.description],
    ["Historical context", (t) => t.historicalContext],
    ["Confidence", (t) => t.dateConfidence],
  ];
  const analysis =
    mode === "Show Contradictions"
      ? "A shared word is not enough to establish a contradiction. Compare each passage’s proposition, speaker and context. No automatic doctrinal contradiction is asserted."
      : mode === "Show Similarities"
        ? `Shared catalog themes: ${themes.filter((th) => selected.filter((t) => t.themes.includes(th)).length >= 2).join(", ") || "none classified"}. Theme overlap is not evidence of borrowing.`
        : mode === "Show Earlier Parallels" || mode === "Show Later Echoes"
          ? "The texts below are ordered by provisional composition dates. Earlier surviving evidence does not prove where an idea originated."
          : mode === "Show Alternative Interpretations"
            ? "Read the edition introductions, the translation attribution, and the surrounding passage. A translation choice or a commentator’s voice can change an apparent comparison."
            : `This reading set contains ${selected.length} works across ${new Set(selected.map((t) => t.tradition)).size} catalog groupings. Compare the retrieved passages to evaluate their approaches to ${q}. This local summary describes the reading set; it does not infer agreement.`;
  return (
    <>
      <Heading
        eyebrow="Ideas in conversation"
        title="Compare Texts"
        description="Bring 2–12 works together. Keep their contexts, editions, and differences in view."
      />
      <div className="panel">
        <div className="chips selected-chips">
          {selected.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setIds(ids.filter((id) => id !== t.id));
                invalidateComparison();
              }}
              aria-label={`Remove ${t.title}`}
            >
              {t.title} ×
            </button>
          ))}
        </div>
        <div className="filters">
          <label>
            Add a text
            <input
              value={search}
              placeholder="Find a text to add…"
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Theme or concept
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                invalidateComparison();
              }}
            />
          </label>
          <button
            className="button"
            disabled={ids.length < 2 || busy || !q.trim()}
            onClick={() => run()}
          >
            {busy ? "Comparing…" : "Compare passages"}
          </button>
          <span className="small muted">{ids.length} / 12 selected</span>
        </div>
        {search && (
          <div className="picker-results">
            {texts
              .filter(
                (t) =>
                  !ids.includes(t.id) &&
                  t.title.toLowerCase().includes(search.toLowerCase()),
              )
              .slice(0, 12)
              .map((t) => (
                <button
                  key={t.id}
                  disabled={ids.length >= 12}
                  onClick={() => {
                    setIds([...ids, t.id]);
                    setSearch("");
                    invalidateComparison();
                  }}
                >
                  <Plus size={15} />
                  {t.title}
                  <small>
                    {t.editionId
                      ? editions.some((e) => e.textId === t.id && e.complete)
                        ? "Full edition"
                        : "Source selections"
                      : "Metadata only"}
                  </small>
                </button>
              ))}
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="table-scroll compare-table">
        <table>
          <thead>
            <tr>
              <th>Context</th>
              {selected.map((t) => (
                <th key={t.id}>
                  <Link href={`/texts/${t.id}`}>{t.title}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(([name, get]) => (
              <tr key={name}>
                <th>{name}</th>
                {selected.map((t) => (
                  <td key={t.id}>{get(t)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && (
        <>
          <div className="chips">
            {[
              "Synthesize",
              "Show Contradictions",
              "Show Similarities",
              "Show Earlier Parallels",
              "Show Later Echoes",
              "Show Alternative Interpretations",
            ].map((m) => (
              <button
                className={mode === m ? "selected" : ""}
                key={m}
                disabled={busy}
                onClick={() => void run(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="notice">
            <strong>{mode}</strong>
            <p>{analysis}</p>
            {mode.includes("Earlier") || mode.includes("Later") ? (
              <ol>
                {orderTextsByCompositionDate(
                  selected,
                  mode.includes("Earlier") ? "earlier" : "later",
                )
                  .map((t) => (
                    <li key={t.id}>
                      {t.title} · {dateLabel(t.startDate, t.endDate)}
                    </li>
                  ))}
              </ol>
            ) : null}
          </div>
          <ComparisonEngineResults
            response={data.engineAnalysis}
            sources={data.researchSources}
          />
          {(mode === "Show Contradictions" ||
            mode === "Show Alternative Interpretations") &&
            (data.cases.length ? (
              data.cases.map((c) => (
                <section className="panel" key={c.id}>
                  <Badge level={c.confidence}>
                    D · Editorial textual tension
                  </Badge>
                  <h2>{c.title}</h2>
                  <p>{c.tension}</p>
                  <h3>Alternative reading</h3>
                  <p>{c.alternative}</p>
                  <div className="two-col">
                    {c.passages.map((p) => (
                      <PassageCard key={p.id} passage={p} {...actions} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p className="notice">
                No curated textual tension matches this selection and theme. Try
                Tao Te Ching with Analects on “injury,” or Ecclesiastes with
                Gospel of John on “death.”
              </p>
            ))}
          <div className="comparison-passages">
            {data.passages.map((row) => (
              <section key={row.textId}>
                <h2>{texts.find((t) => t.id === row.textId)?.title}</h2>
                {row.passages.length ? (
                  row.passages.map((p) => (
                    <PassageCard key={p.id} passage={p} {...actions} />
                  ))
                ) : (
                  <Empty>No relevant bundled passage for this selection.</Empty>
                )}
              </section>
            ))}
          </div>
          <button
            className="button secondary"
            onClick={() => {
              const createdAt = new Date().toISOString();
              actions.onSave({
                id: `compare-${Date.now()}`,
                kind: "comparison",
                title: `Comparison: ${q}`,
                content: JSON.stringify(
                  comparisonProvenanceSnapshot(
                    data,
                    {
                      textIds: ids,
                      theme: q,
                      mode: data.engineAnalysis.mode,
                    },
                    createdAt,
                  ),
                  null,
                  2,
                ),
                createdAt,
              });
            }}
          >
            Save comparison
          </button>
        </>
      )}
    </>
  );
}
export function Workspace() {
  const [collections, setCollections] = useState<Collection[]>([]),
    [active, setActive] = useState(""),
    [name, setName] = useState(""),
    [notes, setNotes] = useState(""),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [remove, setRemove] = useState(false),
    [creating, setCreating] = useState(false);
  const current = collections.find((c) => c.id === active);
  const printableSnapshot = current
    ? exportableCollection({ ...current, notes })
    : undefined;
  async function refresh() {
    try {
      setCollections(await api<Collection[]>("/api/collections"));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  async function create() {
    try {
      const c = await api<Collection>("/api/collections", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setCollections([...collections, c]);
      setActive(c.id);
      setNotes("");
      setName("");
      setCreating(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function update(body: unknown) {
    try {
      const c = await api<Collection>(`/api/collections/${active}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setCollections(collections.map((x) => (x.id === c.id ? c : x)));
      setStatus("Saved");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function download(format: string) {
    if (!current) return;
    const snapshot = { ...current, notes };
    const content =
      format === "json"
        ? JSON.stringify(exportableCollection(snapshot), null, 2)
        : format === "csv"
          ? exportCsv(snapshot)
          : exportMarkdown(snapshot);
    const url = URL.createObjectURL(
      new Blob([content], {
        type:
          format === "json"
            ? "application/json"
            : format === "csv"
              ? "text/csv"
              : "text/markdown",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${snapshot.name.replace(/[^a-z0-9]/gi, "-")}.${format === "markdown" ? "md" : format}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <Heading
        eyebrow="Keep a thread of thought"
        title="Research Workspace"
        description="Collect passages, keep notes, and export the evidence behind your research."
      >
        <button className="button" onClick={() => setCreating(true)}>
          <Plus size={18} />
          New collection
        </button>
      </Heading>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="workspace">
        <aside className="collection-list">
          {collections.map((c) => (
            <button
              key={c.id}
              className={active === c.id ? "active" : ""}
              onClick={() => {
                setActive(c.id);
                setNotes(c.notes);
                setStatus("");
              }}
            >
              <Bookmark size={17} />
              <span>
                {c.name}
                <small>{c.items.length} findings</small>
              </span>
            </button>
          ))}
          {!collections.length && (
            <p className="muted">
              Create a collection or save a text to begin.
            </p>
          )}
        </aside>
        {current ? (
          <section className="collection-content">
            <div className="row between">
              <h2>{printableSnapshot?.name}</h2>
              <button
                className="icon-button"
                aria-label="Delete collection"
                onClick={() => setRemove(true)}
              >
                <Trash2 size={18} />
              </button>
            </div>
            <label>
              Research notes
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setStatus("Unsaved changes");
                }}
                placeholder="What connects these findings? What still needs evidence?"
              />
            </label>
            <div className="row">
              <button
                className="button secondary"
                onClick={() => update({ notes })}
              >
                Save notes
              </button>
              <span className="small" role="status">
                {status}
              </span>
            </div>
            <div className="export-bar">
              <span className="small muted">Export research</span>
              {["markdown", "csv", "json"].map((f) => (
                <button
                  key={f}
                  className="text-button"
                  onClick={() => download(f)}
                >
                  <Download size={15} />
                  {f.toUpperCase()}
                </button>
              ))}
              <button className="text-button" onClick={() => window.print()}>
                <Download size={15} />
                PDF / Print
              </button>
            </div>
            <div className="print-notes">{printableSnapshot?.notes}</div>
            {(printableSnapshot?.items ?? []).map((item) => (
              <article className="panel saved-item" key={item.id}>
                <div className="row between">
                  <span className="eyebrow">{item.kind}</span>
                  <button
                    className="icon-button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => update({ remove: item.id })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3>{item.title}</h3>
                <details>
                  <summary>Read saved finding</summary>
                  <pre>{item.content}</pre>
                </details>
                {item.sourceUrl && (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    Source ↗
                  </a>
                )}
              </article>
            ))}
          </section>
        ) : (
          <Empty>Select a collection to open your research.</Empty>
        )}
      </div>
      {creating && (
        <Dialog title="Create a collection" onClose={() => setCreating(false)}>
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              placeholder="e.g. The soul across traditions"
            />
          </label>
          <button className="button" onClick={create} disabled={!name.trim()}>
            Create collection
          </button>
        </Dialog>
      )}
      {remove && current && (
        <Dialog
          title="Delete this collection?"
          onClose={() => setRemove(false)}
        >
          <p>
            This removes “{current.name}” and its saved findings from this
            computer. Export it first if you need a copy.
          </p>
          <button
            className="button danger"
            onClick={async () => {
              try {
                await api(`/api/collections/${active}`, { method: "DELETE" });
                setActive("");
                setRemove(false);
                refresh();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Delete collection
          </button>
        </Dialog>
      )}
    </>
  );
}
