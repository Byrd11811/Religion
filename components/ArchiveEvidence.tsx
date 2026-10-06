"use client";
import { useState } from "react";
import Link from "next/link";
import { editions } from "@/packages/shared/catalog";
import {
  workProfile,
  type CoverageStatus,
  type EvidenceStatus,
  type Decipherment,
  type Witness,
  type ArchiveImage,
  type MuseumArtifact,
} from "@/packages/shared/archive";

export function CoverageDepthBadge({ status }: { status: CoverageStatus }) {
  return <span className="badge badge-D">{status}</span>;
}
export function EvidenceStatusBadge({ status }: { status: EvidenceStatus }) {
  return <span className="badge">{status}</span>;
}
export function DeciphermentBadge({ status }: { status: Decipherment }) {
  return (
    <span className={`badge ${status === "Undeciphered" ? "badge-D" : ""}`}>
      {status}
    </span>
  );
}
export function SourceDepth({ id }: { id: string }) {
  const work = workProfile(id);
  if (!work) return null;
  return (
    <details className="evidence-detail">
      <summary>Source depth · {work.coverage}</summary>
      <dl className="metadata">
        {Object.entries(work.sourceDepth).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="small muted">{work.culturalRestrictions}</p>
    </details>
  );
}
export function WitnessCard({ witness }: { witness: Witness }) {
  return (
    <article className="panel">
      <span className="eyebrow">Physical witness · {witness.type}</span>
      <h2>
        <Link href={`/witnesses/${witness.id}`}>{witness.title}</Link>
      </h2>
      <p>{witness.repository}</p>
      <DeciphermentBadge status={witness.decipherment} />
      <p>{witness.description}</p>
    </article>
  );
}
export function ImageAttribution({ image }: { image: ArchiveImage }) {
  return (
    <figcaption className="small muted">
      {image.attribution} ·{" "}
      <a href={image.sourceUrl} target="_blank" rel="noreferrer">
        Institutional source ↗
      </a>
    </figcaption>
  );
}
export function ArtifactCard({ artifact }: { artifact: MuseumArtifact }) {
  return (
    <article className="panel">
      <span className="eyebrow">Museum object</span>
      <h2>
        <Link href={`/artifacts/${artifact.id}`}>{artifact.title}</Link>
      </h2>
      <p>
        {artifact.institution} ·{" "}
        {artifact.inventoryNumber ?? "Inventory unavailable"}
      </p>
      <p>{artifact.description}</p>
      {artifact.sensitivity && (
        <p className="small muted">
          <strong>Review context:</strong> {artifact.sensitivity}.{" "}
          {artifact.protocolReview}
        </p>
      )}
    </article>
  );
}
export function ManuscriptGallery({ images }: { images: ArchiveImage[] }) {
  return images.length ? (
    <div className="two-col">
      {images.map((i) => (
        <figure key={i.id}>
          <a href={i.imageUrl} target="_blank" rel="noreferrer">
            <img
              src={i.thumbnail}
              alt={i.title}
              loading="lazy"
              style={{ width: "100%", maxHeight: 480, objectFit: "contain" }}
            />
          </a>
          <p>{i.caption}</p>
          <ImageAttribution image={i} />
        </figure>
      ))}
    </div>
  ) : (
    <p className="notice">
      No verified image association currently available. Consult the
      institutional digitization link.
    </p>
  );
}
export function KnownClaimedUnknownPanel({
  known,
  claimed,
  unknown,
}: {
  known: string;
  claimed: string;
  unknown: string;
}) {
  return (
    <div className="two-col">
      {[
        ["Known", known],
        ["Claimed", claimed],
        ["Unknown", unknown],
      ].map(([k, v]) => (
        <section className="panel" key={k}>
          <h3>{k}</h3>
          <p>{v}</p>
        </section>
      ))}
    </div>
  );
}
export function PrimaryVsInterpretationTabs({
  primary,
  scholarship,
  alternatives,
  modern,
}: {
  primary: React.ReactNode;
  scholarship?: React.ReactNode;
  alternatives?: React.ReactNode;
  modern?: React.ReactNode;
}) {
  const [tab, setTab] = useState(0);
  const labels = [
    "Primary Sources",
    "Mainstream Scholarship",
    "Alternative Interpretations",
    "Modern / Popular Claims",
  ];
  return (
    <section>
      <div className="chips" role="tablist" aria-label="Source category">
        {labels.map((l, i) => (
          <button
            role="tab"
            aria-selected={tab === i}
            key={l}
            onClick={() => setTab(i)}
          >
            {l}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {[primary, scholarship, alternatives, modern][tab] ?? (
          <p className="notice">
            No verified source currently available in this category.
          </p>
        )}
      </div>
    </section>
  );
}
export function EvidenceLadder({
  workId,
  editionId,
}: {
  workId: string;
  editionId: string;
}) {
  const work = workProfile(workId),
    edition = editions.find((e) => e.id === editionId);
  return (
    <details className="evidence-detail">
      <summary>Why does Atlas say this?</summary>
      <ol>
        <li>
          <strong>Primary source:</strong> verbatim digitized edition segment;
          may include editorial material.
        </li>
        <li>
          <strong>Physical witness:</strong> no verified edition-to-witness
          dependency currently available. Work-level institutional associations,
          where present, appear on the work profile.
        </li>
        <li>
          <strong>Translation:</strong>{" "}
          {edition?.translator ?? "Data unavailable"}. {edition?.note}
        </li>
        <li>
          <strong>Historical context:</strong>{" "}
          {work?.historicalContext ?? "Data unavailable"}
        </li>
        <li>
          <strong>Scholarly source:</strong> independent review not yet
          supplied.
        </li>
        <li>
          <strong>AI synthesis:</strong> this citation panel displays source
          text; any model synthesis is labeled separately.
        </li>
        <li>
          <strong>Confidence:</strong> source-word fidelity does not establish
          historical truth or consensus.
        </li>
        <li>
          <strong>Alternative interpretation:</strong> translation, speaker, and
          genre can change how a passage is read.
        </li>
        <li>
          <strong>Counterargument:</strong> a matching term alone cannot
          establish agreement or historical influence.
        </li>
      </ol>
    </details>
  );
}
