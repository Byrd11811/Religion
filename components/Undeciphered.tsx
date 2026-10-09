"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Empty, Heading } from "./common";
import {
  hypothesesForCorpus,
  unresolvedCorpus,
  unresolvedCorpora,
  unresolvedStatuses,
  undecipheredPolicy,
  type UnresolvedCorpus,
} from "@/packages/shared/undeciphered";

function StatusBadge({ value }: { value: string }) {
  return <span className="badge badge-D">{value}</span>;
}

function CorpusCard({ corpus }: { corpus: UnresolvedCorpus }) {
  return (
    <article className="panel">
      <span className="eyebrow">{corpus.region}</span>
      <h2>
        <Link href={`/undeciphered/${corpus.id}`}>{corpus.title}</Link>
      </h2>
      <StatusBadge value={corpus.status} />
      <p>{corpus.artifact}</p>
      <p className="small muted">{corpus.period} · {corpus.corpusScale}</p>
      <p><strong>Translation:</strong> {corpus.translationState}</p>
    </article>
  );
}

export function UndecipheredCollection() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return unresolvedCorpora.filter((corpus) => {
      const searchable = `${corpus.title} ${corpus.aliases.join(" ")} ${corpus.region} ${corpus.artifact}`.toLocaleLowerCase();
      return (!needle || searchable.includes(needle)) && (!status || corpus.status === status);
    });
  }, [query, status]);
  const representedStatuses = new Set(unresolvedCorpora.map((corpus) => corpus.status));
  return (
    <>
      <Heading
        eyebrow="Evidence-first research lab"
        title="Unresolved writing systems"
        description="Compare what is known about a script, its sign values, its language, and its possible meaning without turning a proposed reading into a translation."
      />
      <p className="notice"><strong>No invented translations.</strong> {undecipheredPolicy}</p>
      <div className="stat-grid">
        <article className="stat"><strong>{unresolvedCorpora.length}</strong><span>reviewed corpora</span></article>
        <article className="stat"><strong>{representedStatuses.size}</strong><span>distinct evidence states</span></article>
        <article className="stat"><strong>{unresolvedCorpora.filter((corpus) => corpus.witnessIds.length).length}</strong><span>linked physical-witness records</span></article>
      </div>
      <div className="filters">
        <label>
          Search unresolved corpora
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Script, artifact, alias, or region" />
        </label>
        <label>
          Evidence state
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All evidence states</option>
            {unresolvedStatuses.filter((item) => representedStatuses.has(item)).map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <p className="small muted" role="status">{filtered.length} matching corpora. A status describes the current evidence boundary; it does not rank cultures or research value.</p>
      <div className="two-col">{filtered.map((corpus) => <CorpusCard key={corpus.id} corpus={corpus} />)}</div>
      {!filtered.length && <Empty>No reviewed unresolved corpus matches these filters.</Empty>}
    </>
  );
}

export function UndecipheredDetail({ id }: { id: string }) {
  const corpus = unresolvedCorpus(id);
  if (!corpus) return <Empty>No reviewed unresolved-corpus record found.</Empty>;
  const hypotheses = hypothesesForCorpus(id);
  return (
    <>
      <Heading eyebrow="Unresolved writing research lab" title={corpus.title} description={`${corpus.region} · ${corpus.period}`} />
      <div className="row wrap"><StatusBadge value={corpus.status} /><span className="badge">{corpus.corpusScale}</span></div>
      <p className="notice"><strong>{corpus.translationState}.</strong> Atlas will not generate a translation, glyph meaning, author, named deity, or religious identification from unresolved signs.</p>

      <section className="panel">
        <h2>Artifact and discovery</h2>
        <dl className="metadata">
          <div><dt>Artifact / corpus</dt><dd>{corpus.artifact}</dd></div>
          <div><dt>Discovery and documentation</dt><dd>{corpus.discovery}</dd></div>
          <div><dt>Sign inventory</dt><dd>{corpus.signInventory}</dd></div>
          <div><dt>Probable language</dt><dd>{corpus.probableLanguage}</dd></div>
        </dl>
      </section>

      <section>
        <h2>Four separate evidence questions</h2>
        <div className="two-col">
          <article className="panel"><h3>1. Script identification</h3><p>{corpus.scriptState}</p></article>
          <article className="panel"><h3>2. Sign values</h3><p>{corpus.signValuesState}</p></article>
          <article className="panel"><h3>3. Language identification</h3><p>{corpus.languageState}</p></article>
          <article className="panel"><h3>4. Semantic translation</h3><p>{corpus.translationState}</p></article>
        </div>
      </section>

      <section className="two-col">
        <article className="panel"><h2>What is known</h2><p>{corpus.known}</p></article>
        <article className="panel"><h2>What remains unknown</h2><p>{corpus.unknown}</p></article>
        <article className="panel"><h2>Strongest working hypothesis</h2><p>{corpus.strongestHypothesis}</p></article>
        <article className="panel"><h2>Strongest objection</h2><p>{corpus.strongestObjection}</p></article>
      </section>

      <section>
        <h2>Decipherment hypotheses</h2>
        {hypotheses.length ? <div className="two-col">{hypotheses.map((hypothesis) => (
          <article className="panel" key={hypothesis.id}>
            <span className="eyebrow">{hypothesis.status} · confidence {hypothesis.confidence}</span>
            <h3>{hypothesis.proponent}</h3>
            <p>{hypothesis.publication}{hypothesis.year ? ` (${hypothesis.year})` : ""}</p>
            <dl className="metadata">
              <div><dt>Proposed language</dt><dd>{hypothesis.proposedLanguage}</dd></div>
              <div><dt>Proposed sign values</dt><dd>{hypothesis.proposedSignValues}</dd></div>
              <div><dt>Method</dt><dd>{hypothesis.method}</dd></div>
              <div><dt>Bilingual anchor</dt><dd>{hypothesis.bilingualAnchor}</dd></div>
              <div><dt>Claimed readings</dt><dd>{hypothesis.claimedReadings}</dd></div>
              <div><dt>Peer review</dt><dd>{hypothesis.peerReviewStatus}</dd></div>
              <div><dt>Independent replication</dt><dd>{hypothesis.independentReplication}</dd></div>
              <div><dt>Criticism</dt><dd>{hypothesis.criticism}</dd></div>
            </dl>
          </article>
        ))}</div> : <p className="notice">No first-class decipherment hypothesis has passed editorial intake for this corpus. Absence here is not acceptance or rejection.</p>}
      </section>

      {corpus.witnessIds.length > 0 && <section><h2>Physical witness</h2>{corpus.witnessIds.map((witnessId) => <p key={witnessId}><Link href={`/witnesses/${witnessId}`}>Open repository-linked witness record →</Link></p>)}</section>}
      <section className="panel">
        <h2>Bibliography and institutional evidence</h2>
        {corpus.sources.map((source) => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a> <span className="small muted">({source.kind})</span></p>)}
      </section>
      <p><Link href="/library/undeciphered">← Return to unresolved writing systems</Link></p>
    </>
  );
}
