"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, Search, Square } from "lucide-react";
import { questions } from "@/packages/ontology";
import { traditions, texts } from "@/packages/shared/catalog";
import {
  researchSectionIds,
  type CanonicalResearchSource,
  type QuestionEngineResult,
  type QuestionStreamEvent,
  type ResearchClaim,
  type ResearchSectionId,
} from "@/packages/shared/research";
import {
  questionProvenanceSnapshot,
  type QuestionProvenanceScope,
} from "@/packages/shared/research-provenance";
import type { Passage } from "@/packages/shared/types";
import type { Actions } from "./Library";
import { Badge, Empty, Heading } from "./common";

const sectionTitles: Record<ResearchSectionId, string> = {
  shortAnswer: "Short answer",
  primaryEvidence: "Primary evidence",
  oldestSurvivingEvidence:
    "Earliest surviving evidence currently represented in Atlas",
  crossCulturalSimilarities: "Cross-cultural similarities",
  importantDifferences: "Important differences",
  historicalDevelopment: "Historical development",
  documentedInfluence: "Documented influence",
  possibleInfluence: "Possible influence",
  independentDevelopment: "Independent development",
  oppositionCompetingViews: "Opposition and competing views",
  modernReinterpretations: "Modern reinterpretations",
  scholarlyConsensus: "Scholarly consensus where justified",
  disputedIssues: "Disputed issues",
  imagesArtifacts: "Images and artifacts",
  uncertainty: "Uncertainty and evidence limits",
};

type StreamedEvidence = Omit<CanonicalResearchSource, "text"> & {
  excerpt: string;
};

function ClaimCard({ claim }: { claim: ResearchClaim }) {
  return (
    <article className="research-claim">
      <div className="row wrap">
        <Badge level={claim.confidence}>{claim.confidence}</Badge>
        <span className={`claim-status status-${claim.status}`}>
          {claim.status.replaceAll("-", " ")}
        </span>
        <span className="small muted">
          {claim.claimType.replaceAll("-", " ")}
        </span>
      </div>
      <h3>{claim.statement}</h3>
      <p>{claim.reasoning}</p>
      {claim.alternatives.length > 0 && (
        <div className="claim-alternatives">
          <strong>Alternatives and counter-readings</strong>
          <ul>
            {claim.alternatives.map((alternative) => (
              <li key={alternative}>{alternative}</li>
            ))}
          </ul>
        </div>
      )}
      {claim.citations.length > 0 && (
        <div className="claim-citations">
          {claim.citations.map((citation) => (
            <a
              key={citation.id}
              href={citation.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="eyebrow">
                {citation.sourceRole.replaceAll("-", " ")} ·{" "}
                {citation.evidenceType.replaceAll("-", " ")}
              </span>
              <strong>{citation.title}</strong>
              <span>{citation.locator}</span>
              {citation.compositionDateLabel && (
                <span>
                  Composition range: {citation.compositionDateLabel}
                  {citation.compositionDateConfidence
                    ? ` · ${citation.compositionDateConfidence}`
                    : ""}
                </span>
              )}
              {citation.witnessDateLabel && (
                <>
                  <span>Surviving witness: {citation.witnessDateLabel}</span>
                  {citation.witnessDateConfidence && (
                    <span>
                      Date assessment: {citation.witnessDateConfidence}
                    </span>
                  )}
                </>
              )}
              {citation.survivalBiasNote && (
                <span>Survival-bias limit: {citation.survivalBiasNote}</span>
              )}
              <q>{citation.excerpt}</q>
            </a>
          ))}
        </div>
      )}
      {claim.evidenceLadder.length > 0 && (
        <details className="evidence-detail">
          <summary>Claim evidence ladder</summary>
          <ol>
            {claim.evidenceLadder.map((step) => (
              <li key={step.citationId}>
                <strong>{step.contribution}</strong>
                <span>{step.limitation}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </article>
  );
}

export function StructuredQuestionExplorer({
  initialQuery = "",
  initialText = "",
  ...actions
}: Actions & { initialQuery?: string; initialText?: string }) {
  const [question, setQuestion] = useState(initialQuery);
  const [result, setResult] = useState<QuestionEngineResult | null>(null);
  const [resultScope, setResultScope] =
    useState<QuestionProvenanceScope | null>(null);
  const [evidence, setEvidence] = useState<StreamedEvidence[]>([]);
  const [progress, setProgress] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");
  const [tradition, setTradition] = useState("");
  const [region, setRegion] = useState("");
  const [after, setAfter] = useState("");
  const [before, setBefore] = useState("");
  const [contentType, setContentType] = useState<Passage["contentType"] | "">(
    "",
  );
  const controller = useRef<AbortController | null>(null);
  const streamReader = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null,
  );
  const requestGeneration = useRef(0);

  useEffect(
    () => () => {
      requestGeneration.current += 1;
      const currentController = controller.current;
      const currentReader = streamReader.current;
      controller.current = null;
      streamReader.current = null;
      currentController?.abort();
      void currentReader?.cancel().catch(() => {
        // The abort may close the reader before cancel() settles.
      });
    },
    [],
  );

  function invalidateResearch(showCancelled: boolean) {
    // Commit the user-visible state before touching the stream. Some browser
    // stream implementations can synchronously reject cancellation while a
    // read is pending; that must never leave the interface stuck in busy mode.
    requestGeneration.current += 1;
    const currentController = controller.current;
    const currentReader = streamReader.current;
    controller.current = null;
    streamReader.current = null;
    setCancelled(showCancelled);
    setBusy(false);
    setResult(null);
    setResultScope(null);
    setEvidence([]);
    setProgress([]);
    setError("");
    currentController?.abort(
      new DOMException("Research cancelled", "AbortError"),
    );
    void currentReader?.cancel("Research cancelled").catch(() => {
      // Aborting the fetch can close the reader before cancel() settles.
    });
  }

  function cancelResearch() {
    invalidateResearch(true);
  }

  async function ask(nextQuestion = question) {
    const value = nextQuestion.trim();
    if (value.length < 3) return;
    const requestId = ++requestGeneration.current;
    const previousController = controller.current;
    const previousReader = streamReader.current;
    previousController?.abort();
    void previousReader?.cancel().catch(() => {
      // A superseded fetch may have already closed its reader.
    });
    const nextController = new AbortController();
    controller.current = nextController;
    streamReader.current = null;
    const isLatestRequest = () =>
      requestGeneration.current === requestId &&
      controller.current === nextController;
    const canCommit = () => isLatestRequest() && !nextController.signal.aborted;
    setQuestion(value);
    setResult(null);
    setResultScope(null);
    setEvidence([]);
    setProgress([]);
    setCancelled(false);
    setError("");
    setBusy(true);
    const submittedScope: QuestionProvenanceScope = {
      textIds: initialText ? [initialText] : undefined,
      traditions: tradition ? [tradition] : undefined,
      region: region || undefined,
      after: after ? Number(after) : undefined,
      before: before ? Number(before) : undefined,
      contentTypes: contentType ? [contentType] : undefined,
    };
    let requestReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    try {
      const response = await fetch("/api/query/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: value,
          ...submittedScope,
        }),
        signal: nextController.signal,
      });
      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? "The research stream could not start");
      }
      const reader = response.body.getReader();
      requestReader = reader;
      if (!canCommit()) {
        void reader.cancel().catch(() => {
          // A superseding request already owns the visible state.
        });
        return;
      }
      streamReader.current = reader;
      const decoder = new TextDecoder();
      let pending = "";
      while (true) {
        const chunk = await reader.read();
        if (!canCommit()) return;
        if (chunk.done) break;
        pending += decoder.decode(chunk.value, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as QuestionStreamEvent;
          if (event.type === "status")
            setProgress((current) =>
              canCommit() ? [...current, event.message] : current,
            );
          else if (event.type === "evidence")
            setEvidence((current) =>
              !canCommit() ||
              current.some((item) => item.sourceId === event.source.sourceId)
                ? current
                : [...current, event.source],
            );
          else if (canCommit()) {
            setResult(event.result);
            setResultScope(submittedScope);
          }
        }
      }
      if (pending.trim() && canCommit()) {
        const event = JSON.parse(pending) as QuestionStreamEvent;
        if (event.type === "complete") {
          setResult(event.result);
          setResultScope(submittedScope);
        }
      }
    } catch (caught) {
      if (!isLatestRequest()) return;
      if (nextController.signal.aborted) setCancelled(true);
      else {
        setError(caught instanceof Error ? caught.message : "Question failed");
      }
    } finally {
      if (isLatestRequest()) {
        controller.current = null;
        setBusy(false);
      }
      if (streamReader.current === requestReader) streamReader.current = null;
    }
  }

  function saveResult() {
    if (!result) return;
    const createdAt = new Date().toISOString();
    const snapshot = questionProvenanceSnapshot(
      result,
      resultScope ?? {},
      createdAt,
    );
    actions.onSave({
      id: `query-${Date.now()}`,
      kind: "query",
      title: result.answer.question,
      content: JSON.stringify(snapshot, null, 2),
      createdAt,
    });
  }

  const availableRegions = [...new Set(texts.map((text) => text.region))]
    .filter(Boolean)
    .sort();

  return (
    <>
      <Heading
        eyebrow="Evidence before synthesis"
        title="Question Explorer"
        description="Ask a question, inspect verified sources as they arrive, and read a claim-by-claim answer only after citation and neutrality checks."
      />
      {initialText && (
        <p className="notice">
          Searching within{" "}
          {texts.find((text) => text.id === initialText)?.title}.{" "}
          <Link href="/questions">Search all texts</Link>
        </p>
      )}
      <form
        className="question-form"
        onSubmit={(event) => {
          event.preventDefault();
          void ask();
        }}
      >
        <Search size={22} />
        <input
          aria-label="Your research question"
          placeholder="What happens after death?"
          value={question}
          onChange={(event) => {
            invalidateResearch(false);
            setQuestion(event.target.value);
          }}
          maxLength={1000}
        />
        {busy ? (
          <button
            key="cancel-research"
            type="button"
            className="button secondary"
            onClick={cancelResearch}
          >
            <Square size={14} /> Cancel
          </button>
        ) : (
          <button
            key="start-research"
            type="submit"
            className="button"
            disabled={question.trim().length < 3}
          >
            Explore <ArrowRight size={17} />
          </button>
        )}
      </form>
      <div className="chips">
        {questions.slice(0, 4).map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => void ask(suggestion)}
            disabled={busy}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <details className="query-filters">
        <summary>Refine source scope</summary>
        <div className="filters">
          <label>
            Tradition grouping
            <select
              value={tradition}
              onChange={(event) => {
                invalidateResearch(false);
                setTradition(event.target.value);
              }}
            >
              <option value="">All groupings</option>
              {traditions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Region
            <select
              value={region}
              onChange={(event) => {
                invalidateResearch(false);
                setRegion(event.target.value);
              }}
            >
              <option value="">All regions</option>
              {availableRegions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Source type
            <select
              value={contentType}
              onChange={(event) => {
                invalidateResearch(false);
                setContentType(
                  event.target.value as Passage["contentType"] | "",
                );
              }}
            >
              <option value="">All source types</option>
              {[
                "Primary text",
                "Translator note",
                "Editorial introduction",
                "Scholarly commentary",
                "Footnote",
                "Appendix",
                "Unknown",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            From year
            <input
              type="number"
              value={after}
              onChange={(event) => {
                invalidateResearch(false);
                setAfter(event.target.value);
              }}
              placeholder="e.g. -500"
            />
          </label>
          <label>
            Through year
            <input
              type="number"
              value={before}
              onChange={(event) => {
                invalidateResearch(false);
                setBefore(event.target.value);
              }}
            />
          </label>
        </div>
      </details>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {cancelled && (
        <p className="notice" role="status">
          Research cancelled. No unaudited synthesis was displayed.
        </p>
      )}
      {(busy || progress.length > 0) && (
        <section className="stream-status" aria-live="polite">
          <span className="eyebrow">Research status</span>
          <ol>
            {progress.map((message, index) => (
              <li key={`${index}-${message}`}>{message}</li>
            ))}
          </ol>
        </section>
      )}
      {evidence.length > 0 && !result && (
        <section className="panel">
          <span className="eyebrow">Verified evidence arriving first</span>
          <div className="stream-evidence-grid">
            {evidence.map((source) => (
              <a
                key={source.sourceId}
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <strong>{source.title}</strong>
                <span>{source.locator}</span>
                <q>{source.excerpt}</q>
              </a>
            ))}
          </div>
        </section>
      )}

      {result ? (
        <>
          <section className="answer-overview">
            <div className="row between wrap">
              <div>
                <span className="eyebrow">
                  {result.mode.replaceAll("-", " ")}
                </span>
                <h2>{result.answer.question}</h2>
              </div>
              <button className="text-button" onClick={saveResult}>
                <Bookmark size={16} />{" "}
                {result.synthesisAudited
                  ? "Save audited provenance"
                  : "Save evidence provenance"}
              </button>
            </div>
            <p>
              {result.synthesisAudited
                ? `Every displayed synthesis claim passed citation validation and two neutrality checks in ${result.attempts} attempt${result.attempts === 1 ? "" : "s"}.`
                : "Evidence-only mode is active. Empty sections stay empty rather than being filled with unaudited claims."}
            </p>
            {result.notices.map((notice) => (
              <p className="small muted" key={notice}>
                {notice}
              </p>
            ))}
            <div className="row wrap">
              <Link
                className="text-button"
                href={`/opposition?q=${encodeURIComponent(result.answer.question)}`}
              >
                Show the Opposition →
              </Link>
              <Link className="text-button" href="/compare">
                Compare texts →
              </Link>
            </div>
          </section>

          <div className="research-sections">
            {researchSectionIds.map((section) => (
              <section
                className="research-section"
                id={`answer-${section}`}
                key={section}
              >
                <div className="section-heading compact">
                  <h2>{sectionTitles[section]}</h2>
                  <span>
                    {result.answer[section].length} claim
                    {result.answer[section].length === 1 ? "" : "s"}
                  </span>
                </div>
                {result.answer[section].length ? (
                  <div className="research-claim-grid">
                    {result.answer[section].map((claim) => (
                      <ClaimCard key={claim.id} claim={claim} />
                    ))}
                  </div>
                ) : (
                  <Empty>
                    No audited claim is available for this section in the
                    selected scope.
                  </Empty>
                )}
              </section>
            ))}
          </div>

          <section className="panel">
            <h2>Sources</h2>
            {result.answer.sources.length ? (
              <div className="source-index">
                {result.answer.sources.map((source) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <strong>{source.title}</strong>
                    <span>
                      {source.locator} ·{" "}
                      {source.sourceRole.replaceAll("-", " ")} ·{" "}
                      {source.evidenceType.replaceAll("-", " ")}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="muted">
                No inspectable source span is available for this answer.
              </p>
            )}
          </section>
          <details className="panel neutrality-audit">
            <summary>Neutrality audit details</summary>
            <ul>
              {result.deterministicAudit.items.map((item) => (
                <li key={item.id}>
                  <strong>
                    {item.passed ? "Passed" : "Flagged"}:{" "}
                    {item.id.replaceAll("-", " ")}
                  </strong>
                  <span>{item.explanation}</span>
                </li>
              ))}
            </ul>
            {result.providerAudit ? (
              <>
                <h3>Independent provider audit</h3>
                <p className="small muted">
                  {result.providerAudit.provider} reviewed every substantive
                  claim for entailment, scope, source role, and confidence.
                </p>
                <ul>
                  {result.providerAudit.claimAudits.map((item) => (
                    <li key={item.claimId}>
                      <strong>
                        {item.passed ? "Passed" : "Rejected"}: {item.claimId}
                      </strong>
                      <span>{item.explanation}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="small muted">
                No provider claim audit was run in evidence-only mode.
              </p>
            )}
          </details>
        </>
      ) : !busy && !cancelled ? (
        <div className="question-intro">
          <div className="eyebrow">A starting point, not a verdict</div>
          <h2>
            One question.
            <br />
            Many source-bound views.
          </h2>
          <p>
            Every substantive synthesis claim must name its evidence,
            confidence, reasoning, limits, and alternatives. Missing evidence
            remains visible.
          </p>
        </div>
      ) : null}
    </>
  );
}
