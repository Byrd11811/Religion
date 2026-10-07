"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { editions, texts } from "@/packages/shared/catalog";
import { witnesses } from "@/packages/shared/archive";
import { CoverageDepthBadge, WitnessCard } from "./ArchiveEvidence";
import { Heading } from "./common";
import { workProfile } from "@/packages/shared/archive";

const chineseWorks = texts.filter((work) => work.traditionId === "china");
const chineseIds = new Set(chineseWorks.map((work) => work.id));
const chineseEditions = editions.filter((edition) => chineseIds.has(edition.textId));
const chineseWitnesses = witnesses.filter((witness) => witness.workIds.some((id) => chineseIds.has(id)));
const groups = ["All schools", "Confucian / Ru", "Daoist", "Chinese Buddhism", "Mohist", "Legalist", "School of Names", "Folk religion", "Chinese Manichaeism", "Jingjiao", "Chinese Islam", "Syncretic traditions"];

export function ChinaCollection() {
  const [group, setGroup] = useState(groups[0]);
  const [view, setView] = useState<"Works" | "Sources" | "Witnesses">("Works");
  const filtered = useMemo(() => group === groups[0] ? chineseWorks : chineseWorks.filter((work) => work.subcollection === group), [group]);
  return <>
    <Heading eyebrow="Multi-tradition source collection" title="Chinese Texts & Traditions" description="Native titles, pinyin, public-domain Chinese transcriptions and physical witnesses are kept distinct across intellectual and religious communities." />
    <div className="stat-grid">
      <article className="stat"><strong>{chineseWorks.length}</strong><span>school-specific records</span></article>
      <article className="stat"><strong>{new Set(chineseEditions.map((edition) => edition.textId)).size}</strong><span>searchable works</span></article>
      <article className="stat"><strong>{chineseEditions.reduce((sum, edition) => sum + edition.passageCount, 0)}</strong><span>Chinese source blocks</span></article>
      <article className="stat"><strong>{chineseWitnesses.length}</strong><span>physical witness records</span></article>
    </div>
    <p className="notice">“China” is a geographic navigation layer here. It does not merge Confucian, Daoist, Buddhist, Mohist, Legalist, School of Names, popular-religious, Manichaean, Jingjiao, Islamic or syncretic records into one tradition. Project Gutenberg transcriptions are not witness-level diplomatic editions or modern translations.</p>
    <div className="chips" role="tablist" aria-label="Chinese collection content">
      {(["Works","Sources","Witnesses"] as const).map((item) => <button key={item} role="tab" aria-selected={view===item} className={view===item?"selected":""} onClick={()=>setView(item)}>{item}</button>)}
    </div>
    {view === "Works" && <>
      <label className="filter-label">School or community<select value={group} onChange={(event)=>setGroup(event.target.value)}>{groups.map((item)=><option key={item}>{item}</option>)}</select></label>
      <p className="small muted">{filtered.length} records in this view</p>
      <div className="two-col">{filtered.map((work) => <article className="panel" key={work.id}>
        <span className="eyebrow">{work.subcollection}</span>
        <h2><Link href={`/works/${work.id}`}>{work.title}</Link></h2>
        <p lang="zh-Hant" className="native-title"><strong>{work.nativeTitle}</strong> · {work.pinyin}</p>
        <CoverageDepthBadge status={workProfile(work.id)!.coverage} />
        <p>{work.description}</p>
        <a href={work.sourceUrl ?? work.metadataSources[0]} target="_blank" rel="noreferrer">Open source record ↗</a>
      </article>)}</div>
    </>}
    {view === "Sources" && <div className="two-col">{chineseEditions.map((edition) => { const work = texts.find((item)=>item.id===edition.textId)!; return <article className="panel" key={edition.id}>
      <span className="eyebrow">{work.subcollection} · {edition.language}</span><h2><Link href={`/works/${work.id}`}>{work.title}</Link></h2><p lang="zh-Hant"><strong>{work.nativeTitle}</strong> · {work.pinyin}</p><p>{edition.note}</p><p>{edition.passageCount} source blocks</p><a href={edition.sourceUrl} target="_blank" rel="noreferrer">Project Gutenberg edition ↗</a>
    </article>;})}</div>}
    {view === "Witnesses" && <><p className="notice">Institutional witness associations do not assert that the bundled Project Gutenberg transcription was made from these objects.</p><div className="two-col">{chineseWitnesses.map((witness)=><WitnessCard key={witness.id} witness={witness}/>)}</div></>}
  </>;
}
