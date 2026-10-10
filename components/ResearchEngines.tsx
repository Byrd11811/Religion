"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ExternalLink, Search } from "lucide-react";
import type {
  ComparisonResponse,
  ComparisonSection,
} from "@/packages/research/comparison";
import type { OppositionResponse } from "@/packages/research/opposition";
import type { TeachingConductResponse } from "@/packages/research/teaching-conduct";
import {
  oppositionPropositions,
  oppositionStances,
  researchSources,
  teachingConductCases,
  type AttributedEvidence,
  type ResearchEngineSource,
  type ScopedEvidence,
} from "@/packages/shared/research-engines";
import { api, Empty, Heading } from "./common";

type SourceResponse = { sources: ResearchEngineSource[] };

function SourceLinks({
  ids,
  sources,
}: {
  ids: string[];
  sources: ResearchEngineSource[];
}) {
  const byId = new Map(sources.map((source) => [source.id, source]));
  return (
    <div className="engine-source-links">
      {ids.map((id) => {
        const source = byId.get(id);
        return source ? (
          <a key={id} href={source.url} target="_blank" rel="noreferrer">
            <strong>{source.label}</strong>
            <span>{source.kind.replaceAll("-", " ")}</span>
            <small>{source.perspective}</small>
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        ) : (
          <span className="small muted" key={id}>{id}</span>
        );
      })}
    </div>
  );
}

function EvidenceMeta({ evidence }: { evidence: ScopedEvidence }) {
  return (
    <div className="evidence-meta">
      <p className="small muted">
        {evidence.confidence} confidence · {evidence.startYear ?? "date unknown"}
        {evidence.endYear !== evidence.startYear
          ? ` to ${evidence.endYear ?? "date unknown"}`
          : ""}
        {evidence.regions.length ? ` · ${evidence.regions.join(", ")}` : ""}
      </p>
      <p className="small"><strong>Inspected span:</strong> {evidence.locator}</p>
      {evidence.canonicalPassageIds?.length ? (
        <p className="small muted">
          Atlas passage {evidence.canonicalPassageIds.join(", ")} · classified as {evidence.contentTypes?.join(", ") ?? "not classified"}
        </p>
      ) : null}
    </div>
  );
}

export function OppositionExplorer({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [tradition, setTradition] = useState("");
  const [data, setData] = useState<(OppositionResponse & SourceResponse) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const oppositionRequest = useRef<AbortController | null>(null);

  async function run(nextQuery = query, propositionId?: string) {
    oppositionRequest.current?.abort();
    const request = new AbortController();
    oppositionRequest.current = request;
    setBusy(true);
    setError("");
    try {
      const result = await api<OppositionResponse & SourceResponse>(
        "/api/opposition",
        {
          method: "POST",
          signal: request.signal,
          body: JSON.stringify({
            query: propositionId ? undefined : nextQuery || undefined,
            propositionId,
            scope: tradition ? { traditionIds: [tradition] } : undefined,
          }),
        },
      );
      if (oppositionRequest.current === request) setData(result);
    } catch (caught) {
      if (oppositionRequest.current === request && !request.signal.aborted)
        setError(caught instanceof Error ? caught.message : "Opposition search failed");
    } finally {
      if (oppositionRequest.current === request) {
        oppositionRequest.current = null;
        setBusy(false);
      }
    }
  }

  useEffect(() => {
    if (initialQuery.trim()) void run(initialQuery);
    return () => oppositionRequest.current?.abort();
    // Initial route state is intentionally loaded once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const traditionIds = useMemo(
    () => [...new Set(oppositionStances.flatMap((stance) => stance.traditionIds))].sort(),
    [],
  );

  return (
    <>
      <Heading
        eyebrow="Attributed positions, not inferred opponents"
        title="Show the Opposition"
        description="Select a reviewed proposition and examine doctrinal, philosophical, heterodox, skeptical, materialist, alternative religious, mystical, adversarial, and secular responses in their own contexts."
      />
      <form
        className="question-form"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <Search size={22} />
        <input
          aria-label="Search reviewed propositions"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setData(null);
            setError("");
          }}
          placeholder="Try enemies, suffering, afterlife, or coercion"
          maxLength={1000}
          disabled={busy}
        />
        <button className="button" disabled={busy}>
          {busy ? "Examining…" : "Find positions"} <ArrowRight size={17} />
        </button>
      </form>
      <div className="chips proposition-chips">
        {oppositionPropositions.map((proposition) => (
          <button
            key={proposition.id}
            disabled={busy}
            onClick={() => {
              setQuery(proposition.title);
              void run(proposition.title, proposition.id);
            }}
          >
            {proposition.title}
          </button>
        ))}
      </div>
      <div className="filters compact-filters">
        <label>
          Scope to an attributed tradition or position
          <select
            value={tradition}
            disabled={busy}
            onChange={(event) => {
              setTradition(event.target.value);
              setData(null);
              setError("");
            }}
          >
            <option value="">All reviewed positions</option>
            {traditionIds.map((id) => (
              <option key={id} value={id}>
                {id.replaceAll("-", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {data && (
        <>
          <p className="notice">{data.policy}</p>
          {data.matches.length ? (
            <div className="engine-results">
              {data.matches.map((match) => (
                <section className="panel" key={match.proposition.id}>
                  <span className="eyebrow">Reviewed proposition · {match.proposition.topic}</span>
                  <h2>{match.proposition.title}</h2>
                  <p className="lead">{match.proposition.proposition}</p>
                  <SourceLinks
                    ids={match.proposition.sourceIds}
                    sources={data.sources}
                  />
                  <div className="chips">
                    {match.categories.map((category) => <span key={category}>{category.replaceAll("-", " ")}</span>)}
                  </div>
                  <div className="stance-grid">
                    {match.stances.map((stance) => (
                      <article className="research-claim" key={stance.id}>
                        <span className="eyebrow">{stance.category.replaceAll("-", " ")} · {stance.relation}</span>
                        <h3>{stance.title}</h3>
                        <p>{stance.summary}</p>
                        <p><strong>Attributed to:</strong> {stance.speakerOrCommunity}</p>
                        <p><strong>Context:</strong> {stance.historicalContext}</p>
                        <EvidenceMeta evidence={stance} />
                        <p className="notice"><strong>Limit:</strong> {stance.uncertainty}</p>
                        <SourceLinks ids={stance.sourceIds} sources={data.sources} />
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <Empty>No reviewed proposition matches this query and scope. A tradition name by itself is never treated as a stance.</Empty>
          )}
        </>
      )}
    </>
  );
}

const conductLanes = [
  ["teachingEvidence", "Teaching evidence"],
  ["conductEvidence", "Historical conduct evidence"],
  ["justificationsAtTheTime", "Contemporary justifications"],
  ["textsUsedToJustify", "Texts used to justify conduct"],
  ["supportingReligiousVoices", "Supporting religious voices"],
  ["opposingReligiousVoices", "Opposing religious voices"],
  ["nonreligiousMotives", "Nonreligious motives"],
  ["laterTheologicalInterpretations", "Later theological interpretations"],
  ["modernScholarlyInterpretations", "Modern scholarly interpretations"],
] as const;

function AttributedEvidenceCard({
  item,
  sources,
}: {
  item: AttributedEvidence;
  sources: ResearchEngineSource[];
}) {
  const isGap = item.recordKind === "documented-gap";
  return (
    <article
      className={`conduct-evidence-card${isGap ? " documented-gap" : ""}`}
      data-record-kind={isGap ? "documented-gap" : "evidence"}
    >
      {isGap && <span className="eyebrow">Documented evidence gap</span>}
      <p>{item.summary}</p>
      {item.attributedTo && <p className="small"><strong>Attributed to:</strong> {item.attributedTo}</p>}
      {item.evidenceStatus && <p className="small"><strong>Evidence status:</strong> {item.evidenceStatus}</p>}
      {item.motiveType && <p className="small"><strong>Motive type:</strong> {item.motiveType}</p>}
      <EvidenceMeta evidence={item} />
      <SourceLinks ids={item.sourceIds} sources={sources} />
    </article>
  );
}

export function TeachingConductExplorer() {
  const [tradition, setTradition] = useState("");
  const [data, setData] = useState<(TeachingConductResponse & SourceResponse) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const conductRequest = useRef<AbortController | null>(null);

  async function run(nextTradition = tradition) {
    conductRequest.current?.abort();
    const request = new AbortController();
    conductRequest.current = request;
    setBusy(true);
    setError("");
    setData(null);
    try {
      const result = await api<TeachingConductResponse & SourceResponse>(
        "/api/teaching-conduct",
        {
          method: "POST",
          signal: request.signal,
          body: JSON.stringify({
            scope: nextTradition ? { traditionIds: [nextTradition] } : undefined,
          }),
        },
      );
      if (conductRequest.current === request) setData(result);
    } catch (caught) {
      if (conductRequest.current === request && !request.signal.aborted)
        setError(caught instanceof Error ? caught.message : "Conduct research failed");
    } finally {
      if (conductRequest.current === request) {
        conductRequest.current = null;
        setBusy(false);
      }
    }
  }

  useEffect(() => {
    void run("");
    return () => conductRequest.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Heading
        eyebrow="Equal evidentiary standards across traditions"
        title="Teaching vs Historical Conduct"
        description="Compare a cited teaching with independently cited conduct, named actors, contemporary support and opposition, mixed motives, later theology, and modern scholarship. Conduct by adherents is not automatically doctrine."
      />
      <div className="filters compact-filters">
        <label>
          Tradition represented in reviewed dossiers
          <select
            value={tradition}
            onChange={(event) => {
              const value = event.target.value;
              setTradition(value);
              void run(value);
            }}
          >
            <option value="">All four dossiers</option>
            {[...new Set(teachingConductCases.map((item) => item.traditionId))].map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <span className="small muted">{busy ? "Loading reviewed dossiers…" : "Each dossier retains all nine review lanes and labels unresolved evidence gaps."}</span>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {data && (
        <>
          <p className="notice">{data.policy}</p>
          {data.cases.length ? data.cases.map((conductCase) => (
            <section className="conduct-case" key={conductCase.id}>
              <div className="answer-overview">
                <span className="eyebrow">{conductCase.traditionId} · {conductCase.dateLabel}</span>
                <h2>{conductCase.title}</h2>
                <p className="notice">
                  <strong>Method:</strong> Conduct by adherents is historical
                  evidence about named actors and institutions; it is not
                  automatically the doctrine of an entire tradition.
                </p>
                <p><strong>Actors and institutions:</strong> {conductCase.actorsAndInstitutions.join(" · ")}</p>
                <p><strong>Locations:</strong> {conductCase.locations.join(" · ")}</p>
                <p><strong>Evidence status:</strong> {conductCase.evidenceStatus}</p>
                <p><strong>Disputes:</strong> {conductCase.disputes}</p>
                <p className="notice">{conductCase.neutralityNote}</p>
              </div>
              <div className="conduct-lanes">
                {conductLanes.map(([key, label]) => (
                  <section className="panel" key={key}>
                    <h3>{label}</h3>
                    {conductCase[key].map((item) => (
                      <AttributedEvidenceCard key={item.id} item={item} sources={data.sources} />
                    ))}
                  </section>
                ))}
              </div>
            </section>
          )) : <Empty>No reviewed dossier remains inside this scope. Atlas does not display a partial teaching/conduct comparison as balanced evidence.</Empty>}
        </>
      )}
    </>
  );
}

function ComparisonItem({
  section,
  item,
  sources,
}: {
  section: ComparisonSection;
  item: ComparisonSection["items"][number];
  sources: ResearchEngineSource[];
}) {
  const evidence = item as ScopedEvidence;
  return (
    <article className="research-claim">
      <span className="eyebrow">{section.kind.replaceAll("-", " ")}</span>
      {section.kind === "propositions" && "proposition" in item && (
        <>
          <h3>{item.proposition}</h3>
          <p><strong>Speaker:</strong> {item.speaker}</p>
          <p><strong>Context:</strong> {item.context}</p>
        </>
      )}
      {section.kind === "contradictions" && "speakerContext" in item && (
        <>
          <h3>{item.summary}</h3>
          <p><strong>Speaker and proposition context:</strong> {item.speakerContext}</p>
          <p><strong>Possible harmonization:</strong> {item.harmonization}</p>
          <p><strong>Counter-reading:</strong> {item.counterReading}</p>
        </>
      )}
      {section.kind === "similarities" && "dimension" in item && (
        <>
          <h3>{item.dimension} similarity</h3>
          <p>{item.summary}</p>
          <p className="notice">Similarity does not establish influence. {item.influenceRelationshipId ? `A separate relationship is cited: ${item.influenceRelationshipId}.` : "No influence relationship is asserted."}</p>
        </>
      )}
      {section.kind === "chronology" && "earlierSubject" in item && (
        <>
          <h3>{item.earlierSubject} → {item.laterSubject}</h3>
          <p>{item.summary}</p>
          <p><strong>Earlier:</strong> {item.earlierDate.label} ({item.earlierDate.confidence})</p>
          <p><strong>Later:</strong> {item.laterDate.label} ({item.laterDate.confidence})</p>
          <p className="notice"><strong>Survival-bias warning:</strong> {item.survivalBiasWarning}</p>
        </>
      )}
      {section.kind === "influence" && "relationshipType" in item && (
        <>
          <h3>{item.relationshipType.replaceAll("-", " ")}</h3>
          <p>{item.summary}</p>
          <p><strong>Documented relationship:</strong> yes, within the cited scope.</p>
        </>
      )}
      {section.kind === "alternative-interpretations" && "interpretationSource" in item && (
        <>
          <h3>{item.interpretationSource}</h3>
          <p>{item.summary}</p>
        </>
      )}
      {section.kind === "synthesis" && <><h3>Source-bounded synthesis</h3><p>{item.summary}</p></>}
      <EvidenceMeta evidence={evidence} />
      <SourceLinks ids={evidence.sourceIds} sources={sources} />
    </article>
  );
}

export function ComparisonEngineResults({
  response,
  sources,
}: {
  response: ComparisonResponse;
  sources: ResearchEngineSource[];
}) {
  return (
    <section
      className="comparison-engine-results"
      data-engine-mode={response.mode}
    >
      <div className="answer-overview">
        <span className="eyebrow">Distinct backend engine · {response.mode.replaceAll("-", " ")}</span>
        <h2>Reviewed comparison analysis</h2>
        <p>{response.policy}</p>
        {(response.mode === "earlier-parallels" || response.mode === "later-echoes") && (
          <p className="notice">{response.chronologyPolicy}</p>
        )}
      </div>
      {response.cases.length ? response.cases.map((comparison) => (
        <section className="panel" key={comparison.caseId}>
          <span className="eyebrow">{comparison.topic}</span>
          <h2>{comparison.title}</h2>
          <p className="small muted">{comparison.scopeNote}</p>
          {comparison.sections.map((section) => (
            <div className="comparison-engine-section" key={section.kind}>
              <h3>{section.kind.replaceAll("-", " ")}</h3>
              <div className="research-claim-grid">
                {section.items.map((item) => (
                  <ComparisonItem key={item.id} section={section} item={item} sources={sources} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )) : <Empty>{response.noApplicableAnalysis ?? "No reviewed comparison case is available in this scope."}</Empty>}
    </section>
  );
}

export const allResearchSources = researchSources;
