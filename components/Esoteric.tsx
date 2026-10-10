"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heading, Empty } from "./common";
import { WitnessCard } from "./ArchiveEvidence";
import {
  esotericPolicy,
  esotericWorks,
  esotericWitnesses,
  ritualPractices,
  sacrificeEvidence,
  esotericOrganizations,
} from "@/packages/shared/esoteric";

const views = ["All works", "Grimoires & ritual texts", "Hermetic & alchemical", "Demonology & polemic", "Religious literature", "Practices", "Sacrifice evidence", "Organizations", "Physical witnesses"] as const;

function bucket(category: string, subcollection?: string) {
  if (subcollection === "Religious literature") return "Religious literature";
  if (/hermetic|alchemical|occult philosophy/i.test(category)) return "Hermetic & alchemical";
  if (/demonology|witch-trial/i.test(category)) return "Demonology & polemic";
  return "Grimoires & ritual texts";
}

export function EsotericCollection() {
  const [view, setView] = useState<(typeof views)[number]>("All works");
  const [query, setQuery] = useState("");
  const works = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return esotericWorks.filter((work) => {
      const matchesView = view === "All works" || ["Practices", "Sacrifice evidence", "Organizations", "Physical witnesses"].includes(view) || bucket(work.category, work.subcollection) === view;
      const searchable = `${work.title} ${work.alternateTitles?.join(" ") ?? ""} ${work.author} ${work.category}`.toLocaleLowerCase();
      return matchesView && (!needle || searchable.includes(needle));
    });
  }, [query, view]);
  return <>
    <Heading eyebrow="Phase 12 · historical literature" title="Esoteric, occult & religious literature" description="Study grimoires, Hermetic works, demonological polemics, and religiously influential literature with explicit source and genre boundaries." />
    <p className="notice"><strong>Historical evidence, not an operating manual.</strong> {esotericPolicy}</p>
    <div className="stat-grid">
      <article className="stat"><strong>{esotericWorks.length}</strong><span>source-linked work records</span></article>
      <article className="stat"><strong>{esotericWorks.filter((work) => work.editionId).length}</strong><span>bundled literary editions</span></article>
      <article className="stat"><strong>{esotericWitnesses.length}</strong><span>repository-linked witnesses</span></article>
      <article className="stat"><strong>{ritualPractices.length}</strong><span>differentiated practices</span></article>
      <article className="stat"><strong>{sacrificeEvidence.length}</strong><span>sacrifice evidence classes</span></article>
      <article className="stat"><strong>{esotericOrganizations.length}</strong><span>documented organizations</span></article>
    </div>
    <div className="tabs" role="tablist" aria-label="Collection section">
      {views.map((item) => <button key={item} role="tab" aria-selected={view === item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{item}</button>)}
    </div>
    {view === "Practices" ? <>
      <p className="notice">Practice labels are community- and source-specific. Ancestor rites, mediumship, oracle consultation, theurgy, necromancy and demonology are not interchangeable.</p>
      <div className="two-col">{ritualPractices.map((practice) => <article className="panel" key={practice.id}>
        <span className="eyebrow">{practice.practiceType}</span><h2>{practice.title}</h2>
        <p>{practice.description}</p><p><strong>Evidence boundary:</strong> {practice.evidenceSummary}</p>
        <p><strong>Distinction:</strong> {practice.distinction}</p><p className="small muted">{practice.community} · {practice.period}</p>
        <p className="notice"><strong>Research-only:</strong> {practice.operationalBoundary}</p>
        {practice.sources.map((source) => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a> <span className="small muted">({source.kind})</span></p>)}
      </article>)}</div>
    </> : view === "Sacrifice evidence" ? <>
      <p className="notice"><strong>Evidence categories are not interchangeable.</strong> Archaeology, textual reports, hostile accusations, colonial accounts, later legends, modern interpretations and conspiracy claims retain separate status. Graphic material is excluded.</p>
      <div className="two-col">{sacrificeEvidence.map((item) => <article className="panel" key={item.id}>
        <span className="eyebrow">{item.classification}</span><h2>{item.title}</h2><p>{item.caseSummary}</p>
        <p><strong>Evidence:</strong> {item.evidence}</p><p><strong>Source limits:</strong> {item.sourceBias}</p>
        <p><strong>Disagreement:</strong> {item.disagreement}</p><span className="badge">{item.confidence}</span>
        {item.sourceUrls.map((url) => <p key={url}><a href={url} target="_blank" rel="noreferrer">Open evidence source ↗</a></p>)}
      </article>)}</div>
    </> : view === "Organizations" ? <>
      <p className="notice">Documented organizations, later namesakes, claimed successors and conspiracy traditions remain separate. No membership is inferred from a gesture, image, symbol, family connection or repeated internet claim.</p>
      <div className="two-col">{esotericOrganizations.map((organization) => <article className="panel" key={organization.id}>
        <span className="eyebrow">{organization.evidenceStatus}</span><h2>{organization.title}</h2>
        <p>{organization.context}</p><dl className="metadata"><div><dt>Formation</dt><dd>{organization.founding}</dd></div><div><dt>Purpose</dt><dd>{organization.purpose}</dd></div><div><dt>Structure</dt><dd>{organization.structure}</dd></div><div><dt>Historical boundary</dt><dd>{organization.historicalBoundary}</dd></div><div><dt>Later legends</dt><dd>{organization.legendBoundary}</dd></div></dl>
        {organization.sources.map((source) => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a> <span className="small muted">({source.kind})</span></p>)}
      </article>)}</div>
    </> : view === "Physical witnesses" ? <>
      <p className="notice">A physical object is linked only where an institutional catalog identifies the work. It is kept separate from modern transcriptions and translations.</p>
      <div className="two-col">{esotericWitnesses.map((witness) => <WitnessCard key={witness.id} witness={witness} />)}</div>
    </> : <>
      <div className="filters"><label>Search this collection<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, alternate title, author, or genre" /></label></div>
      <p className="small muted" role="status">{works.length} matching works. Categories describe historical genres; they do not validate supernatural claims.</p>
      <div className="two-col">{works.map((work) => <article className="panel" key={work.id}>
        <span className="eyebrow">{bucket(work.category, work.subcollection)}</span>
        <h2><Link href={`/works/${work.id}`}>{work.title}</Link></h2>
        <div className="row wrap"><span className="badge">{work.category}</span>{work.subcollection === "Religious literature" && <span className="badge badge-A">NON-SCRIPTURAL</span>}</div>
        <p>{work.description}</p>
        <p className="small muted">{work.author} · {work.region}</p>
        <p><strong>Access:</strong> {work.sourceStatus}</p>
        <p><a href={work.sourceUrl ?? work.metadataSources[0]} target="_blank" rel="noreferrer">Open source record ↗</a></p>
      </article>)}</div>
      {!works.length && <Empty>No source-linked work matches these filters.</Empty>}
    </>}
  </>;
}

