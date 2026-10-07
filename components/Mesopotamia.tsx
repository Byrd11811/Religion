"use client";

import { useState } from "react";
import Link from "next/link";
import { editions, texts } from "@/packages/shared/catalog";
import { witnesses } from "@/packages/shared/archive";
import researchData from "@/data/research/anunnaki-evidence.json";
import { Empty, Heading } from "./common";
import {
  CoverageDepthBadge,
  PrimaryVsInterpretationTabs,
  WitnessCard,
} from "./ArchiveEvidence";
import { workProfile } from "@/packages/shared/archive";

const TRADITION_ID = "ancient-mesopotamia-sumer-akkad-babylon-assyria";

type Research = {
  aliases: string[];
  primarySources: {
    id: string;
    workId: string;
    qId: string;
    line: string;
    transliteration: string;
    sourceUrl: string;
    note: string;
  }[];
  scholarship: {
    id: string;
    title: string;
    author: string;
    summary: string;
    sourceUrl: string;
    evidence: string;
  }[];
  alternatives: {
    id: string;
    title: string;
    summary: string;
    sourceUrl: string;
    evidence: string;
  }[];
  modernClaims: {
    id: string;
    title: string;
    claimant: string;
    publication: string;
    year: number;
    summary: string;
    sourceUrl: string;
    evidence: string;
  }[];
  comparisons: {
    id: string;
    modernClaimId: string;
    ancientEvidenceIds: string[];
    ancientRecord: string;
    finding: string;
    limitation: string;
  }[];
};

const research = researchData as Research;
const mesopotamianWorks = texts.filter(
  (text) => text.traditionId === TRADITION_ID,
);
const mesopotamianIds = new Set(mesopotamianWorks.map((work) => work.id));
const sourceEditions = editions.filter(
  (edition) =>
    mesopotamianIds.has(edition.textId) &&
    edition.id.startsWith("oracc-epsd2-"),
);
const physicalWitnesses = witnesses.filter((witness) =>
  witness.workIds.some((id) => mesopotamianIds.has(id)),
);

export function MesopotamiaCollection() {
  const tabs = ["Overview", "Works", "Primary Sources", "Physical Witnesses"];
  const [tab, setTab] = useState(tabs[0]);
  return (
    <>
      <Heading
        eyebrow="Dedicated source collection"
        title="Ancient Mesopotamia"
        description="Sumerian and Akkadian compositions, scholarly composite transliterations, Q-catalog records, and physical tablets remain distinct evidence layers."
      >
        <Link className="button" href="/explore/anunnaki">
          Open Anunna / Anunnaki research guide
        </Link>
      </Heading>
      <div className="stat-grid">
        <article className="stat"><strong>{mesopotamianWorks.length}</strong><span>reviewed work and corpus records</span></article>
        <article className="stat"><strong>{sourceEditions.length}</strong><span>searchable ORACC composite transliterations</span></article>
        <article className="stat"><strong>{sourceEditions.reduce((sum, item) => sum + item.passageCount, 0)}</strong><span>source passage blocks</span></article>
        <article className="stat"><strong>{physicalWitnesses.length}</strong><span>separate physical witness records</span></article>
      </div>
      <p className="notice">
        ORACC Q identifiers name scholarly composite texts. CDLI P identifiers and museum inventory numbers name physical objects. A work-level association does not prove that every composite line survives on every linked tablet.
      </p>
      <div className="chips" role="tablist" aria-label="Mesopotamia collection views">
        {tabs.map((label) => (
          <button key={label} role="tab" aria-selected={tab === label} className={tab === label ? "selected" : ""} onClick={() => setTab(label)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="two-col">
          <section className="panel">
            <h2>What is searchable</h2>
            <p>The retained ePSD2 selection supplies exact Sumerian line labels and lexical forms under CC0. Atlas does not translate those forms and does not present a composite as a diplomatic edition of one tablet.</p>
            <Link href="/search?q=Anunnaki">Search the normalized Anunnaki alias</Link>
          </section>
          <section className="panel">
            <h2>What remains metadata</h2>
            <p>Akkadian epics, omen series, rituals, god lists, royal inscriptions, and other records remain discoverable when no reviewed reproducible text is bundled. Their Q identifiers and scope are retained without manufacturing passages.</p>
            <Link href="/methodology">Read source methodology</Link>
          </section>
        </div>
      )}
      {tab === "Works" && (
        <div className="two-col">
          {mesopotamianWorks.map((work) => {
            const profile = workProfile(work.id)!;
            return (
              <article className="panel" key={work.id}>
                <span className="eyebrow">{work.category}</span>
                <h2><Link href={`/works/${work.id}`}>{work.title}</Link></h2>
                <CoverageDepthBadge status={profile.coverage} />
                <p>{work.description}</p>
                <p className="small muted">{work.sourceStatus}</p>
              </article>
            );
          })}
        </div>
      )}
      {tab === "Primary Sources" && (
        <div className="two-col">
          {sourceEditions.map((edition) => (
            <article className="panel" key={edition.id}>
              <span className="eyebrow">{edition.language}</span>
              <h2><Link href={`/works/${edition.textId}`}>{texts.find((work) => work.id === edition.textId)?.title}</Link></h2>
              <p>{edition.note}</p>
              <p>{edition.passageCount} source blocks · <a href={edition.sourceUrl} target="_blank" rel="noreferrer">ORACC composition ↗</a></p>
            </article>
          ))}
        </div>
      )}
      {tab === "Physical Witnesses" && (
        physicalWitnesses.length ? <div className="two-col">{physicalWitnesses.map((witness) => <WitnessCard key={witness.id} witness={witness} />)}</div> : <Empty>No reviewed physical witnesses.</Empty>
      )}
    </>
  );
}

function SourceCards({ items }: { items: (Research["scholarship"][number] | Research["alternatives"][number])[] }) {
  return <div className="two-col">{items.map((item) => <article className="panel" key={item.id}><span className="eyebrow">{item.evidence}</span><h2>{item.title}</h2>{"author" in item && <p className="small muted">{item.author}</p>}<p>{item.summary}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">Open scholarly source ↗</a></article>)}</div>;
}

export function AnunnakiResearch() {
  const relevantWitnesses = physicalWitnesses.filter((witness) =>
    research.primarySources.some((source) => witness.workIds.includes(source.workId)),
  );
  return (
    <>
      <Heading eyebrow="Evidence-separated research guide" title="Anunna / Anunnaki" description="Ancient attestations come first. Scholarly interpretation, alternative readings, and modern popular claims are displayed in separate source-traceable layers." />
      <div className="chips" aria-label="Known aliases">{research.aliases.map((alias) => <span key={alias}>{alias}</span>)}</div>
      <p className="notice"><strong>Identifier guide:</strong> Q numbers identify ORACC scholarly composites; P numbers identify cataloged physical objects. The source passages below are untranslated composite transliterations. Modern publications are evidence for modern claims only.</p>
      <PrimaryVsInterpretationTabs
        primary={<>
          <div className="two-col">
            {research.primarySources.map((source) => (
              <article className="panel" key={source.id}>
                <span className="eyebrow">Primary attestation · {source.qId} · line {source.line}</span>
                <h2><Link href={`/works/${source.workId}`}>{texts.find((work) => work.id === source.workId)?.title}</Link></h2>
                <blockquote lang="sux-Latn">{source.transliteration}</blockquote>
                <p className="small muted">{source.note}</p>
                <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open ORACC composite ↗</a>
              </article>
            ))}
          </div>
          <h2>Associated physical witnesses</h2>
          <p className="small muted">These witnesses are associated with a cited composition at catalog level; Atlas does not claim that each object preserves the displayed line.</p>
          <div className="two-col">{relevantWitnesses.map((witness) => <WitnessCard key={witness.id} witness={witness} />)}</div>
        </>}
        scholarship={<SourceCards items={research.scholarship} />}
        alternatives={<SourceCards items={research.alternatives} />}
        modern={<div className="two-col">{research.modernClaims.map((claim) => <article className="panel" key={claim.id}><span className="eyebrow">{claim.evidence}</span><h2>{claim.title}</h2><p className="small muted">{claim.claimant} · <cite>{claim.publication}</cite> · {claim.year}</p><p>{claim.summary}</p><p className="notice">This record traces who made the modern claim. It is not ancient evidence or Atlas endorsement.</p><a href={claim.sourceUrl} target="_blank" rel="noreferrer">Open claimant publication record ↗</a></article>)}</div>}
        comparison={<div className="two-col">{research.comparisons.map((comparison) => { const claim = research.modernClaims.find((item) => item.id === comparison.modernClaimId); return <article className="panel" key={comparison.id}><span className="eyebrow">Ancient text vs modern claim</span><h2>{claim?.title}</h2><h3>Ancient record</h3><p>{comparison.ancientRecord}</p><h3>Evidence finding</h3><p>{comparison.finding}</p><p className="small muted"><strong>Limitation:</strong> {comparison.limitation}</p><p>{comparison.ancientEvidenceIds.map((id) => research.primarySources.find((item) => item.id === id)?.qId).filter(Boolean).join(" · ")}</p></article>; })}</div>}
      />
    </>
  );
}
