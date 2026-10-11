"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  CircleHelp,
  GitCompareArrows,
  Link2,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import styles from "./SacredCurrents.module.css";
import type {
  CurrentsConnection,
  CurrentsRecord,
  SacredCurrentsMode,
} from "./types";

interface Props {
  mode: SacredCurrentsMode;
  records: CurrentsRecord[];
  connection: CurrentsConnection | null;
  compareRecords: CurrentsRecord[];
  formatRange: (start: number | null, end: number | null) => string;
  onClear: () => void;
  onSelectRecord: (id: string) => void;
}

function hostLabel(source: string) {
  try {
    return new URL(source).hostname.replace(/^www\./, "");
  } catch {
    return source;
  }
}

function RecordSummary({
  record,
  formatRange,
  compact = false,
}: {
  record: CurrentsRecord;
  formatRange: Props["formatRange"];
  compact?: boolean;
}) {
  return (
    <article className={compact ? styles.compareRecord : styles.recordEvidence}>
      <div className={styles.recordIdentity}>
        <span
          className={styles.recordSwatch}
          style={{ background: record.traditionColor }}
          aria-hidden="true"
        />
        <div>
          <span className={styles.kicker}>{record.kind}</span>
          <h3>{record.title}</h3>
          <p>{record.traditionName}</p>
        </div>
      </div>
      <dl className={styles.recordFacts}>
        <div>
          <dt>Date</dt>
          <dd>{formatRange(record.startYear, record.endYear)}</dd>
        </div>
        <div>
          <dt>Place evidence</dt>
          <dd>{record.region}</dd>
        </div>
        <div>
          <dt>Precision</dt>
          <dd>
            {record.geography
              ? "Approximate editorial anchor"
              : "Coordinates unavailable"}
          </dd>
        </div>
      </dl>
      {!compact && (
        <>
          <p>{record.description}</p>
          <div className={styles.evidenceNote}>
            <CircleHelp size={16} aria-hidden="true" />
            <p>{record.dateNote}</p>
          </div>
          <h4>Sources &amp; context</h4>
          <ul className={styles.sourceList}>
            {record.sourceUrls.length || record.sourceNotes.length ? (
              [...record.sourceUrls, ...record.sourceNotes].map((source, index) => (
                <li key={`${source}-${index}`}>
                  {/^https?:\/\//.test(source) ? (
                    <a href={source} target="_blank" rel="noreferrer">
                      <span>{hostLabel(source)}</span>
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  ) : (
                    <span>{source}</span>
                  )}
                </li>
              ))
            ) : (
              <li>No reviewed source URL is attached to this catalog record.</li>
            )}
          </ul>
        </>
      )}
      <Link className={styles.openRecord} href={record.href}>
        <BookOpenText size={15} aria-hidden="true" /> Open record
        <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </article>
  );
}

export function EvidenceDrawer({
  mode,
  records,
  connection,
  compareRecords,
  formatRange,
  onClear,
  onSelectRecord,
}: Props) {
  const relationship = connection;
  const primary = records[0] ?? null;
  return (
    <aside
      className={styles.evidenceDrawer}
      aria-label="Evidence drawer"
      data-testid="currents-evidence-drawer"
    >
      <header className={styles.drawerHeader}>
        <div>
          <span className={styles.kicker}>Evidence drawer</span>
          <h2>
            {relationship
              ? "Inspect the connection"
              : mode === "compare"
                ? "Compare records"
                : primary
                  ? "Inspect the record"
                  : "Select an anchor"}
          </h2>
        </div>
        {(records.length > 0 || connection) && (
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClear}
            aria-label="Clear evidence selection"
            title="Clear selection"
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </header>

      <div className={styles.drawerScroll}>
        {mode === "compare" && compareRecords.length > 0 ? (
          <div className={styles.compareEvidence}>
            <div className={styles.compareHeading}>
              <GitCompareArrows size={18} aria-hidden="true" />
              <p>
                Dates, locations and catalog descriptions are aligned here.
                Similarity is not treated as influence.
              </p>
            </div>
            {compareRecords.map((record) => (
              <RecordSummary
                key={record.id}
                record={record}
                formatRange={formatRange}
                compact
              />
            ))}
            {compareRecords.length < 2 && (
              <p className={styles.emptyEvidence}>
                Select one more map anchor or river record to compare.
              </p>
            )}
          </div>
        ) : relationship ? (
          <div className={styles.connectionEvidence}>
            <div className={styles.connectionBadge}>
              <Link2 size={15} aria-hidden="true" />
              <span>{relationship.relationshipType.replaceAll("-", " ")}</span>
              <b data-level={relationship.evidenceLevel}>
                {relationship.evidenceLevel}
              </b>
            </div>
            <h3>
              {relationship.source.label} → {relationship.target.label}
            </h3>
            <p>{relationship.summary}</p>
            <div className={styles.connectionEndpoints}>
              {records.map((record) => (
                <button
                  type="button"
                  key={record.id}
                  onClick={() => onSelectRecord(record.id)}
                >
                  <span>
                    {record.id === relationship.source.recordId
                      ? "Source"
                      : record.id === relationship.target.recordId
                        ? "Target"
                        : "Related record"}
                  </span>
                  <strong>{record.title}</strong>
                  <small>{formatRange(record.startYear, record.endYear)}</small>
                </button>
              ))}
            </div>
            <dl className={styles.claimGrid}>
              <div><dt>Evidence</dt><dd>{relationship.evidenceLevel}</dd></div>
              <div><dt>Confidence</dt><dd>{relationship.confidence}</dd></div>
              <div><dt>Geographic meaning</dt><dd>Relationship evidence, not a route</dd></div>
            </dl>
            <div className={styles.noRoute}>
              <MapPin size={16} aria-hidden="true" />
              <p>
                The map shows each supported anchor independently. This
                connection is not drawn as a travel or transmission route.
              </p>
            </div>
            <h4>Evidence chain</h4>
            <ol className={styles.citationList}>
              {relationship.citations.map((citation) => (
                <li key={citation.id}>
                  <span>Evidence source</span>
                  <a href={citation.url} target="_blank" rel="noreferrer">
                    {citation.label}
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                  {citation.locator && <small>{citation.locator}</small>}
                </li>
              ))}
            </ol>
            {relationship.counterarguments.length > 0 && (
              <div className={styles.counterEvidence}>
                <h4>Limits &amp; counterevidence</h4>
                {relationship.counterarguments.map((counter) => (
                  <p key={counter}>{counter}</p>
                ))}
              </div>
            )}
          </div>
        ) : primary ? (
          <>
            {records.length > 1 && (
              <section className={styles.anchorRecordChooser} aria-labelledby="anchor-records-title">
                <div>
                  <span className={styles.kicker}>Shared map anchor</span>
                  <h3 id="anchor-records-title">
                    {records.length} records at this coordinate
                  </h3>
                  <p>Choose a record; the shared marker does not merge their evidence.</p>
                </div>
                <div>
                  {records.map((record) => (
                    <button
                      type="button"
                      key={record.id}
                      onClick={() => onSelectRecord(record.id)}
                      aria-pressed={record.id === primary.id}
                    >
                      <strong>{record.title}</strong>
                      <small>{record.dateLabel}</small>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <RecordSummary record={primary} formatRange={formatRange} />
          </>
        ) : (
          <div className={styles.drawerEmpty}>
            <div className={styles.drawerCompass} aria-hidden="true">
              <span />
              <i />
            </div>
            <h3>Every mark opens its evidence</h3>
            <p>
              Choose a map anchor, river current or catalog result. Dates,
              place precision, source links and known limitations stay beside
              the visual.
            </p>
            <div>
              <ShieldCheck size={17} aria-hidden="true" />
              <span>No coordinates, borders or routes are invented.</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
