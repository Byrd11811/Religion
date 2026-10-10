"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenCheck,
  Database,
  Download,
  ExternalLink,
  FileWarning,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Empty, Heading } from "./common";
import {
  comparisonPackCoverage,
  comparisonPackDisplayComparisons,
  comparisonPackProvenanceSnapshot,
  comparisonPacks,
  formatComparisonTerm,
  getComparisonPack,
  resolveComparisonSlot,
  type ComparisonPackStatus,
} from "@/packages/shared/comparison-packs";

const statusCopy: Record<
  ComparisonPackStatus,
  { label: string; explanation: string }
> = {
  "evidence-ready": {
    label: "Evidence ready",
    explanation: "Contains a bounded passage or reviewed research reference.",
  },
  "unclassified-selection": {
    label: "Unclassified selection",
    explanation:
      "A bounded source selection exists, but its source role is still unreviewed and it cannot support a comparison finding.",
  },
  "metadata-only": {
    label: "Metadata only",
    explanation:
      "The title or object is discoverable but cannot support a textual claim.",
  },
  "missing-source": {
    label: "Missing source",
    explanation: "The requested range still needs a bounded source record.",
  },
  "culturally-restricted": {
    label: "Culturally restricted",
    explanation:
      "Only public protocol metadata is shown pending community authority.",
  },
};

function PackIndex() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return comparisonPacks;
    return comparisonPacks.filter((pack) =>
      [
        pack.title,
        pack.subtitle,
        ...pack.slots.flatMap((slot) => [
          slot.label,
          slot.requestedRange,
          slot.sourceCategory,
          slot.community,
        ]),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(term),
    );
  }, [query]);
  const totals = comparisonPacks.reduce(
    (sum, pack) => {
      const coverage = comparisonPackCoverage(pack);
      sum.slots += coverage.total;
      sum.evidence += coverage.evidenceReady;
      sum.gaps +=
        coverage.metadataOnly +
        coverage.unclassifiedSelection +
        coverage.missingSource +
        coverage.culturallyRestricted;
      return sum;
    },
    { slots: 0, evidence: 0, gaps: 0 },
  );
  return (
    <>
      <Heading
        eyebrow="Phase 16 · source-bounded presets"
        title="Curated comparison packs"
        description="Seven required research presets connect real Atlas records while preserving edition limits, metadata gaps, modern/ancient boundaries, and community protocols."
      />
      <div className="ontology-stats" aria-label="Comparison pack coverage">
        <div>
          <strong>{comparisonPacks.length}</strong>
          <span>required packs</span>
        </div>
        <div>
          <strong>{totals.slots}</strong>
          <span>requested source slots</span>
        </div>
        <div>
          <strong>{totals.evidence}</strong>
          <span>evidence-ready slots</span>
        </div>
        <div>
          <strong>{totals.gaps}</strong>
          <span>visible limits</span>
        </div>
      </div>
      <p className="notice">
        Metadata-only titles never count as evidence. Similarity never proves
        influence, restricted cultural content is excluded, and modern claims
        remain separate from ancient sources.
      </p>
      <label className="input-icon">
        <Search size={18} aria-hidden="true" />
        <input
          aria-label="Search comparison packs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pack, source range, community, or evidence category…"
        />
      </label>
      <p className="small muted" role="status">
        {filtered.length} matching comparison packs.
      </p>
      <div className="two-col" aria-label="Available comparison packs">
        {filtered.map((pack) => {
          const coverage = comparisonPackCoverage(pack);
          return (
            <article className="panel" data-pack-id={pack.id} key={pack.id}>
              <div className="card-top">
                <span className="eyebrow">Curated preset</span>
                {coverage.complete ? (
                  <BookOpenCheck
                    size={19}
                    aria-label="All slots evidence ready"
                  />
                ) : (
                  <FileWarning size={19} aria-label="Visible evidence gaps" />
                )}
              </div>
              <h2>
                <Link href={pack.route}>{pack.title}</Link>
              </h2>
              <p>{pack.subtitle}</p>
              <p className="small muted">
                {coverage.evidenceReady} evidence ready ·{" "}
                {coverage.metadataOnly} metadata only ·{" "}
                {coverage.unclassifiedSelection} unclassified ·{" "}
                {coverage.missingSource} missing ·{" "}
                {coverage.culturallyRestricted} protocol restricted
              </p>
              <p className="small">{pack.completionNote}</p>
              <Link className="text-button" href={pack.route}>
                Open comparison pack{" "}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
      {!filtered.length && (
        <Empty>No comparison pack matches this search.</Empty>
      )}
    </>
  );
}

function PackDetail({ packId }: { packId: string }) {
  const pack = getComparisonPack(packId);
  const [exportStatus, setExportStatus] = useState("");
  if (!pack)
    return (
      <Empty>
        This comparison pack does not exist.{" "}
        <Link href="/compare/packs">Browse all seven packs</Link>.
      </Empty>
    );
  const coverage = comparisonPackCoverage(pack);
  const slots = pack.slots.map(resolveComparisonSlot);
  const comparisons = comparisonPackDisplayComparisons(pack);
  const slotById = new Map(slots.map((item) => [item.id, item]));

  function exportSnapshot() {
    const snapshot = comparisonPackProvenanceSnapshot(pack!.id);
    if (!snapshot) return;
    const blob = new Blob([JSON.stringify(snapshot, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `atlas-comparison-${pack!.id}-provenance.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setExportStatus(
      snapshot.omittedRestrictedSlotCount
        ? `Provenance snapshot exported with ${snapshot.omittedRestrictedSlotCount} protocol-blocked slot${snapshot.omittedRestrictedSlotCount === 1 ? "" : "s"} and ${snapshot.omittedRestrictedComparisonCount} related comparison finding${snapshot.omittedRestrictedComparisonCount === 1 ? "" : "s"} omitted.`
        : "Provenance snapshot exported.",
    );
  }

  return (
    <>
      <Link href="/compare/packs" className="ontology-back-link">
        <ArrowLeft size={15} aria-hidden="true" /> Browse all comparison packs
      </Link>
      <Heading
        eyebrow="Curated comparison pack"
        title={pack.title}
        description={pack.subtitle}
      >
        <button className="button secondary" onClick={exportSnapshot}>
          <Download size={16} aria-hidden="true" /> Export provenance JSON
        </button>
      </Heading>
      <p className="small muted" role="status" aria-live="polite">
        {exportStatus}
      </p>
      <div
        className="ontology-stats"
        aria-label={`${pack.title} pack coverage`}
      >
        <div>
          <strong>{coverage.total}</strong>
          <span>requested slots</span>
        </div>
        <div>
          <strong>{coverage.evidenceReady}</strong>
          <span>evidence ready</span>
        </div>
        <div>
          <strong>
            {coverage.metadataOnly +
              coverage.unclassifiedSelection +
              coverage.missingSource}
          </strong>
          <span>source gaps</span>
        </div>
        <div>
          <strong>{coverage.culturallyRestricted}</strong>
          <span>protocol restricted</span>
        </div>
      </div>
      <p className="notice">{pack.completionNote}</p>
      <nav className="row" aria-label={`${pack.title} related topics`}>
        {pack.topicRoutes.map((route) => (
          <Link className="button secondary" href={route.href} key={route.href}>
            {route.label} <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <section className="panel" aria-labelledby="pack-source-coverage">
        <h2 id="pack-source-coverage">Source and evidence coverage</h2>
        <p>
          Every requested range remains visible. A title, witness, or community
          protocol without a bounded passage is labeled as a gap rather than
          promoted to evidence.
        </p>
        <div className="entity-occurrence-list">
          {slots.map((slot) => (
            <article
              key={slot.id}
              data-slot-id={slot.id}
              data-evidence-status={slot.status}
            >
              <div className="card-top">
                <span className="eyebrow">{slot.requestedRange}</span>
                <strong
                  className={`status ${slot.status === "evidence-ready" ? "available" : ""}`}
                >
                  {statusCopy[slot.status].label}
                </strong>
              </div>
              <h3>{slot.label}</h3>
              <p className="small muted">
                {formatComparisonTerm(slot.sourceCategory)} ·{" "}
                {statusCopy[slot.status].explanation}
              </p>
              {slot.community && (
                <p>
                  <ShieldCheck size={15} aria-hidden="true" />{" "}
                  <strong>Community authority:</strong> {slot.community}
                </p>
              )}
              <p>{slot.evidenceNote}</p>
              {slot.gap && (
                <p className="notice">
                  <strong>Visible gap:</strong> {slot.gap}
                </p>
              )}
              {slot.references.length > 0 && (
                <details>
                  <summary>
                    <Database size={15} aria-hidden="true" />{" "}
                    {slot.references.length} resolved provenance references
                  </summary>
                  <ul>
                    {slot.references.map((reference, index) => (
                      <li key={`${reference.kind}:${reference.id}:${index}`}>
                        <strong>{formatComparisonTerm(reference.kind)}:</strong>{" "}
                        {reference.href ? (
                          <Link href={reference.href}>{reference.label}</Link>
                        ) : (
                          reference.label
                        )}{" "}
                        <span className="small muted">
                          ({reference.category})
                        </span>{" "}
                        {reference.sourceUrl && (
                          <a
                            href={reference.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open source for ${reference.label}`}
                          >
                            <ExternalLink size={14} aria-hidden="true" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="pack-findings">
        <h2 id="pack-findings">Reviewed pack outputs</h2>
        <p>
          Evidence-backed findings are separated from coverage and protocol
          notes. Unclassified, metadata-only, and restricted slots never count
          as evidence.
        </p>
        <div className="entity-relationship-list">
          {comparisons.map((output) => (
            <article
              key={output.id}
              data-comparison-mode={output.mode}
              data-influence-assessment={output.influenceAssessment}
            >
              <span className="eyebrow">
                {output.kind === "comparison-finding"
                  ? formatComparisonTerm(output.mode)
                  : "Coverage / protocol note"}
              </span>
              <h3>{output.title}</h3>
              <p>{output.summary}</p>
              {output.evidenceSlotIds.length > 0 && (
                <p className="small muted">
                  <strong>Evidence-ready slots:</strong>{" "}
                  {output.evidenceSlotIds
                    .map((id) => slotById.get(id)?.label ?? id)
                    .join(" · ")}
                </p>
              )}
              {output.contextSlotIds.length > 0 && (
                <p className="small muted">
                  <strong>Context only — not evidence:</strong>{" "}
                  {output.contextSlotIds
                    .map((id) => slotById.get(id)?.label ?? id)
                    .join(" · ")}
                </p>
              )}
              <p className="small muted">
                <strong>Source categories:</strong>{" "}
                {output.sourceCategories.map(formatComparisonTerm).join(" · ")}
              </p>
              <p>
                <strong>Influence assessment:</strong>{" "}
                {formatComparisonTerm(output.influenceAssessment)}
              </p>
              <p className="notice">
                <strong>Limit:</strong> {output.caution}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Provenance snapshot</h2>
        <p>
          The exported JSON is serializable and stable. It records IDs,
          locators, source categories, URLs, gaps, and comparison boundaries
          without copying passage text. Protocol-blocked slots are omitted
          entirely from the export.
        </p>
        <button className="button" onClick={exportSnapshot}>
          <Download size={16} aria-hidden="true" /> Export {pack.title}{" "}
          provenance
        </button>
      </section>
    </>
  );
}

export function ComparisonPacks({ packId }: { packId?: string }) {
  return !packId || packId === "packs" ? (
    <PackIndex />
  ) : (
    <PackDetail packId={packId} />
  );
}
