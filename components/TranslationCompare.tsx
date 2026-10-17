"use client";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { api, Empty } from "./common";
import type { TranslationAlignment } from "@/packages/shared/types";
import type { Actions } from "./Library";

type AlignmentResponse = {
  items: TranslationAlignment[];
  coverage: { language: string; status: string; note: string }[];
};

function Rendering({ label, rendering }: { label: string; rendering: TranslationAlignment["original"] | null }) {
  return (
    <section className="alignment-cell">
      <span className="alignment-label">{label}</span>
      {rendering ? (
        <>
          <blockquote lang={rendering.language === "Classical Chinese" ? "lzh-Hant" : "en"}>{rendering.text}</blockquote>
          <p className="small muted">
            {rendering.source.attribution} · {rendering.language} · {rendering.script}
            {rendering.machineGenerated ? " · AI generated" : " · Human/source edition"}
          </p>
          <a href={rendering.source.url} target="_blank" rel="noreferrer">Inspect source <ExternalLink size={13} /></a>
        </>
      ) : <p className="alignment-unavailable">Not available in the reviewed corpus.</p>}
    </section>
  );
}

export function TranslationCompare({ textId }: Actions & { textId: string }) {
  const [data, setData] = useState<AlignmentResponse | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    api<AlignmentResponse>(`/api/alignments/${encodeURIComponent(textId)}`, { signal: controller.signal })
      .then((next) => { setData(next); setSelectedId(next.items[0]?.id ?? ""); })
      .catch((reason) => { if (reason.name !== "AbortError") setError(reason.message); });
    return () => controller.abort();
  }, [textId]);
  const selected = useMemo(() => data?.items.find((item) => item.id === selectedId), [data, selectedId]);
  if (error) return <p className="error" role="alert">{error}</p>;
  if (!data) return <p role="status">Loading aligned references…</p>;
  if (!data.items.length) return (
    <>
      <Empty>No reviewed shared-reference alignment is bundled for this work. Atlas does not pair independent keyword results or generate a translation to fill the gap.</Empty>
      <details className="panel language-coverage">
        <summary>Priority-language coverage</summary>
        <ul>{data.coverage.map((item) => <li key={item.language}><strong>{item.language}</strong> · {item.status}<span>{item.note}</span></li>)}</ul>
      </details>
    </>
  );
  return (
    <div className="alignment-view">
      <p className="notice">These rows share a real canonical reference. Every rendering names its source and generation status; unavailable layers stay empty.</p>
      <label className="alignment-picker">Shared reference
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          {data.items.map((item) => <option key={item.id} value={item.id}>{item.sharedReference}</option>)}
        </select>
      </label>
      {selected && (
        <article className="alignment-record">
          <header><span>Reference-level alignment</span><h2>{selected.sharedReference}</h2></header>
          <div className="alignment-grid">
            <Rendering label="Original script" rendering={selected.original} />
            <Rendering label="Transliteration" rendering={selected.transliteration} />
            <Rendering label="Literal rendering" rendering={selected.literalRendering} />
            {selected.translations.map((translation, index) => <Rendering key={`${translation.source.editionId}-${index}`} label={`Translation ${String.fromCharCode(65 + index)}`} rendering={translation} />)}
          </div>
          <div className="alignment-notes">
            <section><h3>Lexical variation</h3>{selected.lexicalNotes.map((note) => <p key={note}>{note}</p>)}</section>
            <section><h3>Translator notes</h3>{selected.translatorNotes.map((note) => <p key={note}>{note}</p>)}</section>
            <section><h3>Manuscript variants</h3>{selected.manuscriptVariants.length ? selected.manuscriptVariants.map((variant) => <p key={variant.witnessId}>{variant.note}</p>) : <p>No reviewed witness-level variant is attached to this reference.</p>}</section>
          </div>
          <p className="small muted"><strong>Scope limit:</strong> {selected.limitation}</p>
        </article>
      )}
    </div>
  );
}
