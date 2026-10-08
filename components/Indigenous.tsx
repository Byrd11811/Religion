"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import data from "@/data/seed/indigenous-collections.json";
import additions from "@/data/seed/indigenous-additions.json";
import { texts } from "@/packages/shared/catalog";
import { culturalProtocols } from "@/packages/shared/protocols";
import { Heading } from "./common";

const regions = ["All regions", ...new Set(culturalProtocols.map((item) => item.region))];

export function IndigenousCollection() {
  const [region, setRegion] = useState(regions[0]);
  const protocols = useMemo(
    () => region === regions[0] ? culturalProtocols : culturalProtocols.filter((item) => item.region === region),
    [region],
  );
  return <>
    <Heading eyebrow="Map-first, protocol-first collection" title="Global Indigenous traditions" description="Navigate community-specific records by region while recorder context, cultural authority and access limits remain visible." />
    <p className="notice">“Indigenous” is a cross-regional discovery path, not one religion. Atlas does not create a generic Native American, African, Oceanic or Australian theology. Every record remains attached to a named community or an explicit unresolved attribution.</p>
    <div className="stat-grid">
      <article className="stat"><strong>{data.collectionWorkIds.length + additions.collectionWorkIds.length}</strong><span>community-scoped catalog records</span></article>
      <article className="stat"><strong>{regions.length - 1}</strong><span>regional discovery areas</span></article>
      <article className="stat"><strong>{culturalProtocols.length}</strong><span>propagating protocol records</span></article>
      <article className="stat"><strong>0</strong><span>restricted narratives reproduced</span></article>
    </div>
    <label className="field">Map region
      <select value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select>
    </label>
    <p className="small muted">Records without defensible coordinates remain region-discoverable without invented map points.</p>
    <div className="text-grid">{protocols.map((protocol) => {
      const work = texts.find((item) => item.id === protocol.workId)!;
      return <article className="panel" key={protocol.id}>
        <span className="eyebrow">{protocol.region} · metadata only</span>
        <h2><Link href={`/works/${work.id}`}>{work.title}</Link></h2>
        <p><strong>Community authority:</strong> {protocol.communityAuthority}</p>
        <p><strong>Recorder / context:</strong> {protocol.recorderContext}</p>
        <p className="small muted">Display: {protocol.displayPolicy} · Search: {protocol.searchPolicy} · Export: {protocol.exportPolicy} · AI: {protocol.aiPolicy}</p>
        <p>{protocol.reviewNote}</p>
        <a className="text-button" href={protocol.sourceUrl} target="_blank" rel="noreferrer">Protocol or community source ↗</a>
      </article>;
    })}</div>
  </>;
}
