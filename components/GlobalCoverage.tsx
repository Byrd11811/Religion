"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import regional from "@/data/seed/regional-coverage.json";
import { texts } from "@/packages/shared/catalog";
import { workProfile } from "@/packages/shared/archive";
import { CoverageDepthBadge } from "./ArchiveEvidence";
import { Heading } from "./common";

type Batch = (typeof regional.batches)[number];

export function GlobalCoverageCollection() {
  const [selected, setSelected] = useState(regional.batches[0].id);
  const batch = regional.batches.find((item) => item.id === selected) as Batch;
  const works = useMemo(
    () => batch.workIds.map((id) => texts.find((work) => work.id === id)).filter(Boolean),
    [batch],
  );
  return <>
    <Heading
      eyebrow="Phase 9A regional research release"
      title="Global religious coverage"
      description="Source-backed starter records expose regional breadth without treating a country, language family, or modern umbrella as one religion."
    />
    <div className="stat-grid">
      <article className="stat"><strong>{regional.batches.length}</strong><span>tracked regional batches</span></article>
      <article className="stat"><strong>{regional.records.length}</strong><span>new reviewed research records</span></article>
      <article className="stat"><strong>{regional.overrides.length}</strong><span>legacy records given reviewed sources</span></article>
      <article className="stat"><strong>0</strong><span>dates or locations inferred from umbrella sources</span></article>
    </div>
    <p className="notice">A reviewed metadata source establishes discoverability, not permission to publish a text and not proof of every historical claim. Composition, recension, witness, translation, ritual use, and modern community authority remain separate evidence layers.</p>
    <label className="field">Regional intake batch
      <select value={selected} onChange={(event) => setSelected(event.target.value)}>
        {regional.batches.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
    </label>
    <article className="panel">
      <span className="eyebrow">Evidence boundary</span>
      <h2>{batch.title}</h2>
      <p>{batch.limit}</p>
      <a className="text-button" href={batch.source} target="_blank" rel="noreferrer">Inspect representative source ↗</a>
    </article>
    <div className="text-grid">{works.map((work) => {
      if (!work) return null;
      const profile = workProfile(work.id)!;
      return <article className="panel" key={work.id}>
        <span className="eyebrow">{work.subcollection ?? work.tradition} · {work.sourceStatus}</span>
        <h2><Link href={`/works/${work.id}`}>{work.title}</Link></h2>
        <p>{work.description}</p>
        <CoverageDepthBadge status={profile.coverage} />
        <p className="small muted">{work.dateConfidence}</p>
        {work.sourceUrl && <a className="text-button" href={work.sourceUrl} target="_blank" rel="noreferrer">Inspect reviewed source ↗</a>}
      </article>;
    })}</div>
  </>;
}
