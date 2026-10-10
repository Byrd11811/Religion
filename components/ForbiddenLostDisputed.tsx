"use client";

import { useState } from "react";
import Link from "next/link";
import { Empty, Heading } from "./common";
import {
  forbiddenLostDisputedPolicy as phase14Policy,
  forbiddenLostDisputedDefinitions as phase14Definitions,
  forbiddenLostDisputedSources as phase14Sources,
  suppressionEvents,
  lostWorks,
  hypotheticalSources,
  disputedWorks,
} from "@/packages/shared/forbidden-lost-disputed";

export type Phase14Section = "forbidden" | "lost" | "disputed";

type LooseRecord = Record<string, unknown>;

const routeTabs = [
  {
    id: "forbidden",
    label: "Forbidden & restricted",
    href: "/library/forbidden",
  },
  { id: "lost", label: "Lost & hypothetical", href: "/library/lost" },
  { id: "disputed", label: "Disputed & forged", href: "/library/disputed" },
] as const;

function records(value: unknown): LooseRecord[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is LooseRecord => Boolean(item) && typeof item === "object",
    );
  }
  if (value && typeof value === "object") {
    return Object.values(value).filter(
      (item): item is LooseRecord => Boolean(item) && typeof item === "object",
    );
  }
  return [];
}

function field(record: LooseRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
  }
  return "";
}

function flag(record: LooseRecord, key: string) {
  return record[key] === true;
}

function list(record: LooseRecord, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

function stringList(record: LooseRecord, key: string) {
  return list(record, key).filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

function displayItem(item: unknown) {
  if (typeof item === "string") {
    const source = sourceRecords.find(
      (candidate) => field(candidate, "id") === item,
    );
    return source
      ? `${field(source, "label", "title", "sourceTitle") || item} (${item})`
      : item;
  }
  if (typeof item === "number") return String(item);
  if (!item || typeof item !== "object") return "";
  const record = item as LooseRecord;
  const sourceId = field(record, "sourceId");
  const source = sourceRecords.find(
    (candidate) => field(candidate, "id") === sourceId,
  );
  const citedSources = stringList(record, "sourceIds")
    .map((id) => {
      const cited = sourceRecords.find(
        (candidate) => field(candidate, "id") === id,
      );
      return cited ? field(cited, "label", "title", "sourceTitle") || id : id;
    })
    .filter(Boolean);
  const parts = [
    field(record, "stage", "role", "relationship"),
    (source && field(source, "label", "title", "sourceTitle")) ||
      field(record, "label", "title", "sourceTitle", "sourceId"),
    field(record, "claim", "note", "description"),
    citedSources.length ? `Sources: ${citedSources.join("; ")}` : "",
  ].filter(Boolean);
  return parts.join(" — ");
}

function searchText(record: LooseRecord) {
  return normalizeSearch(JSON.stringify(record));
}

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase().replace(/[‘’]/g, "'");
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}

const sourceRecords = records(phase14Sources);

function sourcesFor(record: LooseRecord) {
  return stringList(record, "sourceIds")
    .map((id) => sourceRecords.find((source) => field(source, "id") === id))
    .filter((source): source is LooseRecord => Boolean(source));
}

function SourceLinks({ record }: { record: LooseRecord }) {
  const sources = sourcesFor(record);
  if (!sources.length) {
    return (
      <p className="small muted">
        No public source link is attached to this reviewed record.
      </p>
    );
  }
  return (
    <div aria-label="Sources">
      {sources.map((source) => {
        const url = field(source, "url", "sourceUrl");
        const label =
          field(source, "label", "title", "sourceTitle") || field(source, "id");
        const kind = field(source, "perspective", "kind", "sourceType");
        return (
          <p key={field(source, "id") || url}>
            {url ? (
              <a href={url} target="_blank" rel="noreferrer">
                {label} ↗
              </a>
            ) : (
              label
            )}{" "}
            {kind && <span className="small muted">({kind})</span>}
          </p>
        );
      })}
    </div>
  );
}

function AccessBoundary({ record }: { record: LooseRecord }) {
  const culturalRestrictions = stringList(record, "culturalRestrictions");
  const safetyNotes = stringList(record, "safetyNotes");
  return (
    <div>
      <p>
        <strong>Access / rights:</strong>{" "}
        {field(record, "rightsStatus") || "Metadata and source links only"}
      </p>
      {culturalRestrictions.length > 0 && (
        <p>
          <strong>Cultural restrictions:</strong>{" "}
          {culturalRestrictions.join("; ")}
        </p>
      )}
      {safetyNotes.length > 0 && (
        <p className="small muted">
          <strong>Safety note:</strong> {safetyNotes.join("; ")}
        </p>
      )}
    </div>
  );
}

function RecordList({ items }: { items: unknown[] }) {
  const rendered = items.map(displayItem).filter(Boolean);
  if (!rendered.length) return <p>None identified in this record.</p>;
  return (
    <ul>
      {rendered.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function restrictionLabel(record: LooseRecord) {
  const title = field(record, "title");
  if (/shepherd of hermas/i.test(title)) return "Canon boundary / not banned";
  if (/hagigah|chagigah/i.test(title))
    return "Audience-restricted teaching / not a book ban";
  return (
    stringList(record, "restrictionTypes").join(" · ") ||
    field(record, "restrictionType", "recordKind") ||
    "Restriction record"
  );
}

function restrictionDate(record: LooseRecord) {
  const supplied = field(record, "dateLabel");
  if (supplied) return supplied;
  const start = field(record, "restrictionStart");
  const end = field(record, "restrictionEnd");
  if (start && end && start !== end) return `${start}–${end}`;
  return start || end || "Not stated";
}

function ForbiddenCard({ record }: { record: LooseRecord }) {
  return (
    <article className="panel">
      <span className="eyebrow">{restrictionLabel(record)}</span>
      <h2>{field(record, "title")}</h2>
      <div className="row wrap">
        <span className="badge">{field(record, "statusLabel")}</span>
        <span className="badge">{field(record, "confidence")}</span>
      </div>
      <p>{field(record, "summary")}</p>
      <dl className="metadata">
        <div>
          <dt>Authority</dt>
          <dd>{field(record, "authority") || "Not identified"}</dd>
        </div>
        <div>
          <dt>Jurisdiction / place</dt>
          <dd>
            {field(record, "jurisdiction") ||
              stringList(record, "regions").join(", ") ||
              stringList(record, "geography").join(", ") ||
              "Not identified"}
          </dd>
        </div>
        <div>
          <dt>Date / period</dt>
          <dd>{restrictionDate(record)}</dd>
        </div>
        <div>
          <dt>Reason as stated</dt>
          <dd>
            {field(record, "reasonAsStated") || "Not stated by the source"}
          </dd>
        </div>
        <div>
          <dt>Current status</dt>
          <dd>
            {field(record, "currentStatus") ||
              "Requires jurisdiction-specific review"}
          </dd>
        </div>
      </dl>
      <p>
        <strong>Canon boundary:</strong>{" "}
        {flag(record, "isCanonExcluded")
          ? "Excluded or disputed in the named canon context"
          : "No canon-exclusion claim is made by this record"}
      </p>
      <p>
        <strong>Legal or institutional prohibition:</strong>{" "}
        {flag(record, "isLegallyOrInstitutionallyProhibited") ||
        flag(record, "isBanned")
          ? "Documented for the named authority, place, and period"
          : "No book prohibition is claimed by this record"}
      </p>
      <AccessBoundary record={record} />
      <SourceLinks record={record} />
    </article>
  );
}

function LostCard({ record }: { record: LooseRecord }) {
  const chain = list(record, "sourceChain");
  const chainText = field(record, "sourceChain");
  return (
    <article className="panel">
      <span className="eyebrow">
        {field(record, "recordKind", "attestationType")}
      </span>
      <h2>{field(record, "title")}</h2>
      <div className="row wrap">
        <span className="badge">{field(record, "statusLabel")}</span>
        <span className="badge">Confidence: {field(record, "confidence")}</span>
      </div>
      <p>{field(record, "summary")}</p>
      <dl className="metadata">
        <div>
          <dt>Attestation type</dt>
          <dd>{field(record, "attestationType") || "Not stated"}</dd>
        </div>
        <div>
          <dt>Earliest attestation</dt>
          <dd>{field(record, "earliestAttestation") || "Not established"}</dd>
        </div>
        <div>
          <dt>Surviving material</dt>
          <dd>
            {field(record, "survivingMaterial") ||
              "No surviving text identified"}
          </dd>
        </div>
        <div>
          <dt>Reconstruction level</dt>
          <dd>{field(record, "reconstructionLevel") || "No reconstruction"}</dd>
        </div>
      </dl>
      <h3>Attesting sources</h3>
      <RecordList
        items={
          list(record, "attestingSources").length
            ? list(record, "attestingSources")
            : list(record, "attestingSourceIds")
        }
      />
      <h3>Source derivation</h3>
      {chain.length > 0 ? (
        <RecordList items={chain} />
      ) : (
        <p>
          {chainText ||
            "No derivation chain is asserted beyond the named attestations."}
        </p>
      )}
      <p className="notice">
        <strong>Survival boundary:</strong> Atlas records attestations and
        surviving fragments. It does not fill gaps or present a reconstruction
        as the lost original.
      </p>
      <p>
        <strong>Translation access:</strong>{" "}
        {flag(record, "mayTranslate")
          ? "Only identified surviving material may be translated under its source and rights limits."
          : "No translation action is available because no source text is present."}
      </p>
      <AccessBoundary record={record} />
      <SourceLinks record={record} />
    </article>
  );
}

function HypotheticalCard({ record }: { record: LooseRecord }) {
  return (
    <article className="panel">
      <p className="notice">
        <strong>No physical witness</strong> — this is a scholarly hypothesis,
        not a recovered manuscript or readable text.
      </p>
      <span className="eyebrow">
        {field(record, "hypothesisType", "recordKind")}
      </span>
      <h2>{field(record, "title")}</h2>
      <p>{field(record, "summary")}</p>
      <dl className="metadata">
        <div>
          <dt>Proposed entity</dt>
          <dd>{field(record, "proposedEntity") || "Hypothetical source"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{field(record, "statusLabel")}</dd>
        </div>
        <div>
          <dt>Physical witness</dt>
          <dd>None</dd>
        </div>
        <div>
          <dt>Quotation policy</dt>
          <dd>None — no reconstructed quotations are presented</dd>
        </div>
      </dl>
      <div className="two-col">
        <div>
          <h3>Arguments for</h3>
          <RecordList items={list(record, "argumentsFor")} />
        </div>
        <div>
          <h3>Arguments against</h3>
          <RecordList items={list(record, "argumentsAgainst")} />
        </div>
      </div>
      <p className="notice">
        <strong>Research boundary:</strong> The hypothesis can be compared as an
        explanation of surviving evidence. Atlas supplies no reader, quotation,
        or translation action for a source that has no physical witness.
      </p>
      <AccessBoundary record={record} />
      <SourceLinks record={record} />
    </article>
  );
}

function DisputedCard({ record }: { record: LooseRecord }) {
  const historiography =
    record.historiography && typeof record.historiography === "object"
      ? (record.historiography as LooseRecord)
      : null;
  const legalDisposition =
    record.legalDisposition && typeof record.legalDisposition === "object"
      ? (record.legalDisposition as LooseRecord)
      : null;
  return (
    <article className="panel">
      <p className="notice">
        <strong>
          Authenticity status:{" "}
          {field(record, "authenticityStatus", "statusLabel")}
        </strong>
      </p>
      <span className="eyebrow">{field(record, "recordKind")}</span>
      <h2>{field(record, "title")}</h2>
      <p>{field(record, "summary")}</p>
      <div className="two-col">
        <div>
          <h3>Claimed provenance</h3>
          <dl className="metadata">
            <div>
              <dt>Claimed date</dt>
              <dd>{field(record, "claimedDate") || "Not stated"}</dd>
            </div>
            <div>
              <dt>Claimed authorship</dt>
              <dd>{field(record, "claimedAuthorship") || "Not stated"}</dd>
            </div>
            <div>
              <dt>Claimed source history</dt>
              <dd>{field(record, "claimedProvenance") || "Not stated"}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3>Physical and documented provenance</h3>
          <dl className="metadata">
            <div>
              <dt>Physical date</dt>
              <dd>{field(record, "physicalDate") || "Not established"}</dd>
            </div>
            <div>
              <dt>Material</dt>
              <dd>{field(record, "materialDescription") || "Not stated"}</dd>
            </div>
            <div>
              <dt>Find / ownership history</dt>
              <dd>
                {field(record, "findProvenance") || "Incomplete or unknown"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="two-col">
        <div>
          <h3>Evidence cited in support of authenticity</h3>
          {list(record, "evidenceFor").length ? (
            <RecordList items={list(record, "evidenceFor")} />
          ) : (
            <p>No credible supporting evidence identified.</p>
          )}
        </div>
        <div>
          <h3>Evidence against authenticity</h3>
          <RecordList items={list(record, "evidenceAgainst")} />
        </div>
      </div>
      {list(record, "receptionHistory").length > 0 && (
        <>
          <h3>Reception or belief — not authenticity evidence</h3>
          <RecordList items={list(record, "receptionHistory")} />
        </>
      )}
      {legalDisposition && (
        <>
          <h3>Legal disposition — not an authenticity finding</h3>
          <RecordList items={[legalDisposition]} />
        </>
      )}
      <h3>Current assessment</h3>
      <p>{field(record, "currentAssessment")}</p>
      <dl className="metadata">
        <div>
          <dt>Current majority view</dt>
          <dd>
            {field(record, "majorityView") || "No stable majority identified"}
          </dd>
        </div>
        <div>
          <dt>Minority view</dt>
          <dd>{field(record, "minorityView") || "None recorded"}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{field(record, "confidence")}</dd>
        </div>
      </dl>
      {historiography && (
        <>
          <h3>Historiography</h3>
          <dl className="metadata">
            <div>
              <dt>Older view</dt>
              <dd>{field(historiography, "olderView") || "Not recorded"}</dd>
            </div>
            <div>
              <dt>Later challenge</dt>
              <dd>
                {field(historiography, "laterChallenge") || "Not recorded"}
              </dd>
            </div>
            <div>
              <dt>Current majority</dt>
              <dd>
                {field(historiography, "currentMajority") || "Not recorded"}
              </dd>
            </div>
            <div>
              <dt>Minority position</dt>
              <dd>
                {field(historiography, "minorityPosition") || "Not recorded"}
              </dd>
            </div>
            <div>
              <dt>Last reviewed</dt>
              <dd>
                {field(historiography, "lastReviewed") ||
                  field(record, "reviewedAt")}
              </dd>
            </div>
          </dl>
          {(list(historiography, "supersededClaims").length > 0 ||
            list(historiography, "evidenceCausingChange").length > 0) && (
            <div className="two-col">
              {list(historiography, "supersededClaims").length > 0 && (
                <div>
                  <h3>Superseded claims</h3>
                  <RecordList
                    items={list(historiography, "supersededClaims")}
                  />
                </div>
              )}
              {list(historiography, "evidenceCausingChange").length > 0 && (
                <div>
                  <h3>Evidence causing change</h3>
                  <RecordList
                    items={list(historiography, "evidenceCausingChange")}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
      <AccessBoundary record={record} />
      <SourceLinks record={record} />
    </article>
  );
}

const forbiddenRecords = records(suppressionEvents);
const lostRecords = records(lostWorks);
const hypotheticalRecords = records(hypotheticalSources);
const disputedRecords = records(disputedWorks);

function definitionText(needles: string[], fallback: string) {
  if (phase14Definitions && typeof phase14Definitions === "object") {
    const object = phase14Definitions as unknown as LooseRecord;
    for (const [key, value] of Object.entries(object)) {
      if (needles.some((needle) => key.toLocaleLowerCase().includes(needle))) {
        if (typeof value === "string") return value;
        if (value && typeof value === "object") {
          const text = field(
            value as LooseRecord,
            "definition",
            "summary",
            "description",
          );
          if (text) return text;
        }
      }
    }
  }
  for (const definition of records(phase14Definitions)) {
    const label = field(
      definition,
      "id",
      "key",
      "label",
      "title",
    ).toLocaleLowerCase();
    if (needles.some((needle) => label.includes(needle))) {
      return (
        field(definition, "definition", "summary", "description") || fallback
      );
    }
  }
  return fallback;
}

function ResearchBoundaries() {
  const questions = [
    {
      title: "Restriction / canon",
      text: definitionText(
        ["restriction", "canon"],
        "Who limited a work, where, when, and why is separate from whether a community includes it in a canon.",
      ),
    },
    {
      title: "Survival",
      text: definitionText(
        ["survival", "lost"],
        "Attestation, fragments, quotations, and a complete surviving text are different evidence states.",
      ),
    },
    {
      title: "Authenticity",
      text: definitionText(
        ["authenticity", "disputed"],
        "Physical age and provenance remain separate from claimed date, author, or origin.",
      ),
    },
    {
      title: "Access",
      text: definitionText(
        ["access", "rights"],
        "Rights, cultural protocols, and safety restrictions govern what Atlas may display.",
      ),
    },
  ];
  return (
    <div className="stat-grid" aria-label="Four separate evidence questions">
      {questions.map((question) => (
        <div className="stat" key={question.title}>
          <strong>{question.title}</strong>
          <span>{question.text}</span>
        </div>
      ))}
    </div>
  );
}

function PhaseTabs({ section }: { section: Phase14Section }) {
  return (
    <nav
      className="tabs"
      aria-label="Forbidden, lost, and disputed collections"
    >
      {routeTabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          aria-current={section === tab.id ? "page" : undefined}
          className={section === tab.id ? "active" : ""}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

function ForbiddenCollection() {
  const [query, setQuery] = useState("");
  const [restriction, setRestriction] = useState("");
  const restrictions = unique(
    forbiddenRecords.flatMap((record) =>
      stringList(record, "restrictionTypes").length
        ? stringList(record, "restrictionTypes")
        : [field(record, "restrictionType")],
    ),
  );
  const needle = normalizeSearch(query.trim());
  const filtered = forbiddenRecords.filter(
    (record) =>
      (!needle || searchText(record).includes(needle)) &&
      (!restriction ||
        stringList(record, "restrictionTypes").includes(restriction) ||
        field(record, "restrictionType") === restriction),
  );
  return (
    <>
      <div className="filters">
        <label>
          Search restriction records
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, authority, place, or reason"
          />
        </label>
        <label>
          Restriction type
          <select
            value={restriction}
            onChange={(event) => setRestriction(event.target.value)}
          >
            <option value="">All restriction types</option>
            {restrictions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="small muted" role="status">
        {filtered.length} matching records. Canon exclusion, audience limits,
        and legal prohibition remain separate.
      </p>
      <div className="two-col">
        {filtered.map((record) => (
          <ForbiddenCard key={field(record, "id")} record={record} />
        ))}
      </div>
      {!filtered.length && (
        <Empty>No reviewed restriction record matches these filters.</Empty>
      )}
    </>
  );
}

function LostCollection() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [confidence, setConfidence] = useState("");
  const combined = [
    ...lostRecords.map((record) => ({
      record,
      kind: "Lost or fragmentary work",
    })),
    ...hypotheticalRecords.map((record) => ({
      record,
      kind: "Hypothetical source",
    })),
  ];
  const confidences = unique(
    combined.map(({ record }) => field(record, "confidence")),
  );
  const needle = normalizeSearch(query.trim());
  const filtered = combined.filter(
    (item) =>
      (!needle || searchText(item.record).includes(needle)) &&
      (!kind || item.kind === kind) &&
      (!confidence || field(item.record, "confidence") === confidence),
  );
  return (
    <>
      <div className="filters">
        <label>
          Search lost and hypothetical records
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, attestation, fragment, or hypothesis"
          />
        </label>
        <label>
          Record kind
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="">All record kinds</option>
            <option>Lost or fragmentary work</option>
            <option>Hypothetical source</option>
          </select>
        </label>
        <label>
          Confidence
          <select
            value={confidence}
            onChange={(event) => setConfidence(event.target.value)}
          >
            <option value="">All confidence levels</option>
            {confidences.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="small muted" role="status">
        {filtered.length} matching records. Missing text is never silently
        reconstructed.
      </p>
      <div className="two-col">
        {filtered.map(({ record, kind: recordKind }) =>
          recordKind === "Hypothetical source" ? (
            <HypotheticalCard key={field(record, "id")} record={record} />
          ) : (
            <LostCard key={field(record, "id")} record={record} />
          ),
        )}
      </div>
      {!filtered.length && (
        <Empty>
          No reviewed lost or hypothetical record matches these filters.
        </Empty>
      )}
    </>
  );
}

function DisputedCollection() {
  const [query, setQuery] = useState("");
  const [authenticity, setAuthenticity] = useState("");
  const statuses = unique(
    disputedRecords.map((record) => field(record, "authenticityStatus")),
  );
  const needle = normalizeSearch(query.trim());
  const filtered = disputedRecords.filter(
    (record) =>
      (!needle || searchText(record).includes(needle)) &&
      (!authenticity || field(record, "authenticityStatus") === authenticity),
  );
  return (
    <>
      <div className="filters">
        <label>
          Search disputed records
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, provenance, evidence, or assessment"
          />
        </label>
        <label>
          Authenticity status
          <select
            value={authenticity}
            onChange={(event) => setAuthenticity(event.target.value)}
          >
            <option value="">All authenticity states</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="small muted" role="status">
        {filtered.length} matching records. Physical evidence and claimed
        authorship remain separate.
      </p>
      <div className="two-col">
        {filtered.map((record) => (
          <DisputedCard key={field(record, "id")} record={record} />
        ))}
      </div>
      {!filtered.length && (
        <Empty>No reviewed disputed record matches these filters.</Empty>
      )}
    </>
  );
}

const headings: Record<Phase14Section, { title: string; description: string }> =
  {
    forbidden: {
      title: "Forbidden, restricted & canon-excluded texts",
      description:
        "Identify who restricted what, where, when, and why without treating non-canonical status as a ban.",
    },
    lost: {
      title: "Lost, fragmentary & hypothetical sources",
      description:
        "Trace attestations and surviving material without inventing a missing text, quotation, manuscript, or translation.",
    },
    disputed: {
      title: "Disputed, forged & hoax-associated works",
      description:
        "Compare claims with physical provenance and evidence for and against authenticity.",
    },
  };

export function ForbiddenLostDisputedCollection({
  section,
}: {
  section: Phase14Section;
}) {
  const heading = headings[section];
  const policy =
    typeof phase14Policy === "string"
      ? phase14Policy
      : field(
          phase14Policy as unknown as LooseRecord,
          "summary",
          "policy",
          "description",
        );
  return (
    <>
      <Heading
        eyebrow="Phase 14 · evidence-state research"
        title={heading.title}
        description={heading.description}
      />
      <p className="notice">
        <strong>Evidence and access policy:</strong> {policy}
      </p>
      <ResearchBoundaries />
      <PhaseTabs section={section} />
      <section aria-label={heading.title}>
        {section === "forbidden" ? (
          <ForbiddenCollection />
        ) : section === "lost" ? (
          <LostCollection />
        ) : (
          <DisputedCollection />
        )}
      </section>
    </>
  );
}
