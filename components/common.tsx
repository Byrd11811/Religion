"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dateLabel, texts, editions } from "@/packages/shared/catalog";
import type {
  Confidence,
  TextRecord,
  SearchHit,
  Finding,
  Collection,
} from "@/packages/shared/types";
import { cite } from "@/packages/citation";
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Request failed");
  return body as T;
}
export function Badge({
  level = "Unreviewed",
  children,
}: {
  level?: Confidence;
  children?: React.ReactNode;
}) {
  return (
    <span className={`badge badge-${level}`}>
      {children ??
        {
          A: "A · Source text",
          B: "B · Strong consensus",
          C: "C · Majority view",
          D: "D · Provisional / disputed",
          E: "E · Exploratory",
          Unreviewed: "Metadata unreviewed",
        }[level]}
    </span>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function TextCard({
  text,
  onSave,
}: {
  text: TextRecord;
  onSave?: (f: Finding) => void;
}) {
  return (
    <article className="text-card">
      <div className="card-top">
        <span className="eyebrow">{text.tradition.split(" / ")[0]}</span>
        <BookOpen size={18} />
      </div>
      <Link href={`/texts/${text.id}`}>
        <h3>{text.title}</h3>
      </Link>
      <p className="small muted">{dateLabel(text.startDate, text.endDate)}</p>
      <p className="card-description">
        {text.editionId
          ? text.canonStatus
          : "Catalog record · detailed metadata awaiting review"}
      </p>
      <div className="card-bottom">
        <span className={`status ${text.editionId ? "available" : ""}`}>
          {text.editionId
            ? editions.find((e) => e.id === text.editionId)?.complete
              ? "Read full edition"
              : "Read source selections"
            : "Metadata only"}
        </span>
        {onSave ? (
          <button
            className="icon-button"
            aria-label={`Save ${text.title}`}
            onClick={() => onSave(textFinding(text))}
          >
            <Bookmark size={17} />
          </button>
        ) : (
          <Link aria-label={`Open ${text.title}`} href={`/texts/${text.id}`}>
            <ArrowUpRight size={18} />
          </Link>
        )}
      </div>
    </article>
  );
}
export function textFinding(t: TextRecord): Finding {
  return {
    id: t.id,
    kind: "text",
    title: t.title,
    content: `${t.description}\n${t.canonStatus}\n${dateLabel(t.startDate, t.endDate)} — ${t.dateConfidence}`,
    sourceUrl: t.sourceUrl ?? undefined,
    createdAt: new Date().toISOString(),
  };
}
export function PassageCard({
  passage,
  onOpen,
  onSave,
}: {
  passage: SearchHit;
  onOpen: (p: SearchHit) => void;
  onSave: (f: Finding) => void;
}) {
  return (
    <article className="passage-card">
      <div className="row between">
        <Link href={`/texts/${passage.textId}`}>
          <h3>{passage.textTitle}</h3>
        </Link>
        <Badge level="A">Edition excerpt</Badge>
      </div>
      <p className="small muted">
        {passage.tradition} · {passage.reference}
      </p>
      <blockquote>
        {passage.content.length > 650
          ? passage.content.slice(0, 650) + "…"
          : passage.content}
      </blockquote>
      <p className="small muted">
        {passage.translator} · English edition; may include commentary
      </p>
      <div className="row">
        <button className="text-button" onClick={() => onOpen(passage)}>
          Open citation <ArrowUpRight size={15} />
        </button>
        <button
          className="icon-button"
          aria-label={`Pin ${passage.reference}`}
          onClick={() =>
            onSave({
              id: passage.id,
              kind: "passage",
              title: `${passage.textTitle} · ${passage.reference}`,
              content: passage.content + "\n\n" + cite(passage),
              sourceUrl: passage.sourceUrl,
              createdAt: new Date().toISOString(),
            })
          }
        >
          <Bookmark size={17} />
        </button>
      </div>
    </article>
  );
}
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const el = ref.current;
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function CitationDrawer({
  passage,
  onClose,
}: {
  passage: SearchHit;
  onClose: () => void;
}) {
  const ed = editions.find((e) => e.id === passage.editionId);
  const [copied, setCopied] = useState(false);
  return (
    <Dialog title="Source & citation" onClose={onClose}>
      <Badge level="A">Verbatim edition segment</Badge>
      <h3>{passage.textTitle}</h3>
      <blockquote className="full-passage">{passage.content}</blockquote>
      <dl className="metadata">
        <dt>Location</dt>
        <dd>
          {passage.reference} · {passage.id}
        </dd>
        <dt>Edition</dt>
        <dd>{ed?.title}</dd>
        <dt>Translator</dt>
        <dd>{passage.translator}</dd>
        <dt>Language</dt>
        <dd>English translation / edition</dd>
        <dt>Rights</dt>
        <dd>{ed?.license}</dd>
      </dl>
      <p className="notice">{ed?.note}</p>
      <div className="row">
        <a
          className="button"
          href={passage.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Original source <ExternalLink size={16} />
        </a>
        <button
          className="button secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(cite(passage));
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied
            </>
          ) : (
            "Copy citation"
          )}
        </button>
      </div>
    </Dialog>
  );
}
export function SaveDialog({
  finding,
  onClose,
  onSaved,
}: {
  finding: Finding;
  onClose: () => void;
  onSaved: (s: string) => void;
}) {
  const [collections, setCollections] = useState<Collection[]>([]),
    [selected, setSelected] = useState(""),
    [name, setName] = useState("My research"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api<Collection[]>("/api/collections")
      .then((c) => {
        setCollections(c);
        if (c.length) setSelected(c[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);
  async function save() {
    setBusy(true);
    try {
      const collection = selected
        ? collections.find((c) => c.id === selected)!
        : await api<Collection>("/api/collections", {
            method: "POST",
            body: JSON.stringify({ name }),
          });
      await api(`/api/collections/${collection.id}`, {
        method: "PATCH",
        body: JSON.stringify({ add: finding }),
      });
      onSaved(`Saved to ${collection.name}`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog title="Save to a collection" onClose={onClose}>
      <p>{finding.title}</p>
      <label>
        Collection
        <select
          aria-label="Collection"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Create a new collection</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {!selected && (
        <label>
          Collection name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button
        className="button"
        disabled={busy || (!selected && !name.trim())}
        onClick={save}
      >
        {busy ? "Saving…" : "Save finding"}
      </button>
      <p className="small muted">
        Stored on this computer in the project’s research data folder.
      </p>
    </Dialog>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="empty">
      <BookOpen size={32} />
      <p>{children}</p>
    </div>
  );
}
export function relatedTitle(id: string) {
  return texts.find((t) => t.id === id)?.title ?? id;
}
