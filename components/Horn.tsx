"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import horn from "@/data/seed/horn-additions.json";
import { editions, texts } from "@/packages/shared/catalog";
import { witnesses } from "@/packages/shared/archive";
import type { TextRecord } from "@/packages/shared/types";
import { CoverageDepthBadge, WitnessCard } from "./ArchiveEvidence";
import { Heading } from "./common";
import { workProfile } from "@/packages/shared/archive";

const workIds = new Set(horn.collectionWorkIds);
const works = texts.filter((work) => workIds.has(work.id));
const groups = ["All communities", ...new Set(works.map((work) => work.subcollection).filter(Boolean))] as string[];
const hornWitnesses = witnesses.filter((witness) =>
  witness.id.startsWith("hmml-") || witness.id === "bl-or-818-kebra-nagast" || witness.id === "bm-ea71298-old-nubian-nt",
);

type CanonMembership = (typeof horn.canonMemberships)[number];
type Community = (typeof horn.communities)[number];

function WorkCard({ work }: { work: TextRecord }) {
  const profile = workProfile(work.id)!;
  return (
    <article className="panel">
      <span className="eyebrow">{work.subcollection ?? work.tradition}</span>
      <h2><Link href={`/works/${work.id}`}>{work.title}</Link></h2>
      <p>{work.description}</p>
      <CoverageDepthBadge status={profile.coverage} />
      <p className="small muted">{work.canonStatus}</p>
      {work.sourceUrl && <a className="text-button" href={work.sourceUrl} target="_blank" rel="noreferrer">Inspect source ↗</a>}
    </article>
  );
}

export function HornCollection() {
  const [view, setView] = useState<"Works" | "Communities" | "Canon" | "Manuscripts">("Works");
  const [group, setGroup] = useState(groups[0]);
  const filtered = useMemo(
    () => group === groups[0] ? works : works.filter((work) => work.subcollection === group),
    [group],
  );
  const searchable = editions.filter((edition) => workIds.has(edition.textId));
  return <>
    <Heading
      eyebrow="Regional discovery collection"
      title="Ethiopia, Eritrea & the Horn"
      description="Community-specific canons, Geʽez transmission, Islamic scholarship, Coptic corpora and Old Nubian witnesses are connected without collapsing them into one regional religion."
    />
    <div className="stat-grid">
      <article className="stat"><strong>{works.length}</strong><span>curated work and corpus records</span></article>
      <article className="stat"><strong>{searchable.length}</strong><span>rights-cleared searchable editions</span></article>
      <article className="stat"><strong>{horn.canonMemberships.length}</strong><span>community-specific canon assertions</span></article>
      <article className="stat"><strong>{hornWitnesses.length}</strong><span>physical witness records</span></article>
    </div>
    <p className="notice">Ethiopian Orthodox Tewahedo and Eritrean Orthodox Tewahedo are independent community records linked through shared Geʽez heritage. Ethiopian Meqabyan records remain distinct from Greek Maccabees. Metadata-only coverage never implies that Atlas holds or may reproduce a text.</p>
    <div className="chips" role="tablist" aria-label="Horn collection content">
      {(["Works", "Communities", "Canon", "Manuscripts"] as const).map((item) =>
        <button key={item} role="tab" aria-selected={view === item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{item}</button>)}
    </div>
    {view === "Works" && <>
      <label className="field">Community or corpus
        <select value={group} onChange={(event) => setGroup(event.target.value)}>
          {groups.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <p className="small muted">{filtered.length} records in this view</p>
      <div className="text-grid">{filtered.map((work) => <WorkCard key={work.id} work={work} />)}</div>
    </>}
    {view === "Communities" && <div className="text-grid">
      {(horn.communities as Community[]).map((community) => <article className="panel" key={community.id}>
        <span className="eyebrow">Community record</span><h2>{community.name}</h2>
        <p>{community.relationship}</p><p className="small muted">{community.sharedHeritage}</p>
        <a className="text-button" href={community.sourceUrl} target="_blank" rel="noreferrer">Community or institutional source ↗</a>
      </article>)}
    </div>}
    {view === "Canon" && <>
      <p className="notice">These assertions are attached to a named community and cited source. An Ethiopian enumeration is not copied to the Eritrean church, Beta Israel, Coptic communities, or any other community without independent evidence.</p>
      <div className="text-grid">{(horn.canonMemberships as CanonMembership[]).map((membership) => {
        const work = texts.find((item) => item.id === membership.workId);
        return <article className="panel" key={membership.id}>
          <span className="eyebrow">{membership.community}</span>
          <h2>{work ? <Link href={`/works/${work.id}`}>{work.title}</Link> : membership.workId}</h2>
          <p><strong>{membership.status}</strong></p><p>{membership.enumerationNotes}</p>
          <a className="text-button" href={membership.sourceUrl} target="_blank" rel="noreferrer">Inspect community source ↗</a>
        </article>;
      })}</div>
    </>}
    {view === "Manuscripts" && <>
      <p className="notice">A repository record, physical manuscript, literary work, recension, transcription and translation are separate evidence layers. Empty work associations are deliberate when the collection notice does not identify contents.</p>
      <div className="text-grid">{hornWitnesses.map((witness) => <WitnessCard key={witness.id} witness={witness} />)}</div>
    </>}
  </>;
}
