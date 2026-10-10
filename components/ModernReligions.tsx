"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heading, Empty } from "./common";
import {
  modernPolicy,
  modernProfiles,
  modernWorks,
  scientologyWorks,
  modernEvidenceRecords,
  modernBibliography,
  modernOriginClaims,
} from "@/packages/shared/modern-religions";

const views = [
  "Overview",
  "Official Teaching",
  "Historical / Academic Analysis",
  "Legal / Government Records",
  "Criticism / Controversy",
  "Church Responses",
  "Bibliography",
  "Other modern traditions",
] as const;

type View = (typeof views)[number];
type LooseRecord = Record<string, unknown>;
type SourceLink = { label: string; url: string; kind?: string };

function viewId(view: View) {
  return view.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function records(value: unknown): LooseRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is LooseRecord =>
          Boolean(item) && typeof item === "object",
      )
    : [];
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

function stringList(record: LooseRecord, key: string) {
  const value = record[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function formatYear(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return value < 0 ? `${Math.abs(value)} BCE` : `${value} CE`;
}

function workDate(work: LooseRecord) {
  const start = work.startDate;
  const end = work.endDate;
  if (typeof start !== "number")
    return (
      field(work, "publicationDate", "date", "documentedDate") || "Not stated"
    );
  if (typeof end !== "number" || end === start) return formatYear(start);
  return `${formatYear(start)}–${formatYear(end)}`;
}

function sourceLinks(record: LooseRecord): SourceLink[] {
  const candidates = [
    record.sources,
    record.sourceUrls,
    record.additionalSourceUrls,
    record.metadataSources,
  ];
  const links: SourceLink[] = [];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    for (const item of candidate) {
      if (typeof item === "string" && /^https:\/\//.test(item)) {
        links.push({ label: "Open source", url: item });
      } else if (item && typeof item === "object") {
        const source = item as LooseRecord;
        const url = field(source, "url", "href", "sourceUrl");
        if (url)
          links.push({
            label: field(source, "label", "title", "name") || "Open source",
            url,
            kind: field(source, "perspective", "kind", "type"),
          });
      }
    }
  }
  const single = field(record, "sourceUrl", "url");
  if (single)
    links.push({
      label: field(record, "sourceTitle", "sourceLabel") || "Open source",
      url: single,
      kind: field(record, "sourceType"),
    });
  return links.filter(
    (link, index) =>
      links.findIndex((other) => other.url === link.url) === index,
  );
}

function isScientology(record: LooseRecord) {
  return /scientolog/i.test(
    `${field(record, "tradition", "profileId", "title", "name")} ${field(record, "organization")}`,
  );
}

function isHeavensGate(record: LooseRecord) {
  return /heaven(?:'|’)?s gate/i.test(
    `${field(record, "tradition", "title", "name")} ${field(record, "id")}`,
  );
}

function normalizeSection(record: LooseRecord) {
  return field(
    record,
    "section",
    "category",
    "recordType",
    "perspective",
  ).toLocaleLowerCase();
}

function sectionMatches(record: LooseRecord, view: View) {
  const section = normalizeSection(record);
  const sections: Record<
    Exclude<View, "Overview" | "Bibliography" | "Other modern traditions">,
    string
  > = {
    "Official Teaching": "official teaching",
    "Historical / Academic Analysis": "historical / academic analysis",
    "Legal / Government Records": "legal / government records",
    "Criticism / Controversy": "criticism / controversy",
    "Church Responses": "church responses",
  };
  if (
    view === "Overview" ||
    view === "Bibliography" ||
    view === "Other modern traditions"
  )
    return false;
  return section === sections[view];
}

function Sources({ record }: { record: LooseRecord }) {
  const sources = sourceLinks(record);
  if (!sources.length)
    return (
      <p className="small muted">
        No public source link is attached to this record.
      </p>
    );
  return (
    <div className="source-list" aria-label="Sources">
      {sources.map((source) => (
        <p key={source.url}>
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.label} ↗
          </a>
          {source.kind && <span className="small muted"> ({source.kind})</span>}
        </p>
      ))}
    </div>
  );
}

function EvidenceCard({ record }: { record: LooseRecord }) {
  const title = field(record, "title", "sourceTitle", "category", "name");
  const traceability = [
    stringList(record, "derivedFromIds").length
      ? `Derived from: ${stringList(record, "derivedFromIds").join(", ")}`
      : "",
    stringList(record, "responseToIds").length
      ? `Responds to: ${stringList(record, "responseToIds").join(", ")}`
      : "",
  ].filter(Boolean);
  const legalMetadata = [
    ["Jurisdiction", field(record, "jurisdiction")],
    ["Docket / reference", field(record, "docketReference")],
    ["Decision date", field(record, "decisionDate")],
    ["Disposition", field(record, "disposition")],
  ].filter((item) => item[1]);
  return (
    <article className="panel">
      <span className="eyebrow">
        {field(record, "section", "perspective", "category") ||
          "Documented perspective"}
      </span>
      <h2>{title}</h2>
      <p className="small muted">
        {field(record, "category")}
        {field(record, "subjectType") &&
          ` · ${field(record, "subjectType")}: ${field(record, "subjectId")}`}
      </p>
      <div className="row wrap">
        {field(record, "category") && (
          <span className="badge">{field(record, "category")}</span>
        )}
        <span className="badge">
          {field(record, "status", "evidenceStatus") || "Source-linked record"}
        </span>
        {field(record, "date", "documentedDate", "publicationDate") && (
          <span className="badge">
            {field(record, "date", "documentedDate", "publicationDate")}
          </span>
        )}
      </div>
      <p>{field(record, "summary", "description")}</p>
      <dl className="metadata">
        <div>
          <dt>Perspective</dt>
          <dd>
            {field(record, "perspective", "sourceType") ||
              "Identified by section and source"}
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            {field(record, "status", "evidenceStatus") || "Documentary record"}
          </dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>
            {field(record, "date", "documentedDate", "publicationDate") ||
              "Not stated"}
          </dd>
        </div>
        <div>
          <dt>Rights / access</dt>
          <dd>
            {field(record, "rights", "rightsStatus", "access") ||
              "Metadata and source link only"}
          </dd>
        </div>
      </dl>
      {legalMetadata.length > 0 && (
        <dl className="metadata">
          {legalMetadata.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="notice">
        <strong>Evidentiary limit:</strong>{" "}
        {field(record, "evidentiaryLimit", "evidenceLimit", "limit") ||
          "This source establishes only the claim or event it directly documents."}
      </p>
      {traceability.length > 0 && (
        <p className="small muted">{traceability.join(" · ")}</p>
      )}
      <Sources record={record} />
    </article>
  );
}

function WorkCard({ work }: { work: LooseRecord }) {
  const id = field(work, "id");
  const title = field(work, "title", "name");
  const rights =
    field(work, "rights", "rightsStatus", "copyright", "copyrightStatus") ||
    "Metadata-only unless a licensed edition is identified";
  const date = workDate(work);
  const heaven = isHeavensGate(work);
  return (
    <article className="panel">
      <span className="eyebrow">
        {field(work, "perspective", "tradition", "category") ||
          "Modern religious work"}
      </span>
      <h2>{id ? <Link href={`/works/${id}`}>{title}</Link> : title}</h2>
      <div className="row wrap">
        <span className="badge">
          {field(work, "status", "sourceStatus", "accessStatus") ||
            "Bibliographic record"}
        </span>
        {date !== "Not stated" && <span className="badge">{date}</span>}
      </div>
      {heaven ? (
        <p className="notice">
          <strong>Sensitive subject:</strong> This record discusses group
          history and deaths in non-graphic, prevention-oriented terms. Method
          details are omitted.
        </p>
      ) : (
        <p>{field(work, "description", "summary")}</p>
      )}
      <dl className="metadata">
        <div>
          <dt>Perspective</dt>
          <dd>
            {field(work, "perspective") || "Work or publisher self-description"}
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            {field(work, "status", "sourceStatus", "accessStatus") ||
              "Metadata record"}
          </dd>
        </div>
        <div>
          <dt>Documented date</dt>
          <dd>{date}</dd>
        </div>
        <div>
          <dt>Rights / access</dt>
          <dd>{rights}</dd>
        </div>
      </dl>
      <p className="notice">
        <strong>Evidentiary limit:</strong>{" "}
        {field(work, "evidentiaryLimit", "evidenceLimit", "limit") ||
          "Cataloging a work documents its publication and stated teaching; it does not independently verify its religious or historical claims."}
      </p>
      <Sources record={work} />
    </article>
  );
}

function OriginCard({ claim }: { claim: LooseRecord }) {
  const workId = field(claim, "workId");
  const linkedWork = workRecords.find((work) => field(work, "id") === workId);
  return (
    <article className="panel">
      <span className="eyebrow">Origin claim and documentary chronology</span>
      <h2>
        {field(claim, "tradition", "title", "name") ||
          (linkedWork ? field(linkedWork, "title") : workId)}
      </h2>
      <dl className="metadata">
        <div>
          <dt>Perspective</dt>
          <dd>Community origin claim and documentary chronology</dd>
        </div>
        <div>
          <dt>Claimed origin</dt>
          <dd>
            {field(claim, "claimedOrigin", "claim", "originClaim") ||
              "No origin claim recorded"}
          </dd>
        </div>
        <div>
          <dt>Documented modern date</dt>
          <dd>
            {field(claim, "documentedDate", "modernDate", "date") ||
              "Not established in this record"}
          </dd>
        </div>
        <div>
          <dt>Evidence status</dt>
          <dd>
            {field(claim, "status", "evidenceStatus") ||
              "Claim and documentary evidence kept separate"}
          </dd>
        </div>
        <div>
          <dt>Rights / access</dt>
          <dd>
            {field(claim, "rights", "rightsStatus") ||
              "Metadata and source links"}
          </dd>
        </div>
      </dl>
      <p>
        {field(
          claim,
          "datingExplanation",
          "evidence",
          "summary",
          "description",
        )}
      </p>
      <p className="notice">
        <strong>Evidentiary limit:</strong>{" "}
        {field(claim, "evidentiaryLimit", "evidenceLimit", "limit") ||
          "A community’s origin claim is recorded as a claim. The documented date reflects the earliest source identified here."}
      </p>
      <Sources record={claim} />
    </article>
  );
}

const profileRecords = records(modernProfiles);
const workRecords = records(modernWorks);
const scientologyWorkRecords = records(scientologyWorks);
const evidenceRecords = records(modernEvidenceRecords);
const bibliographyRecords = records(modernBibliography);
const originClaimRecords = records(modernOriginClaims);

export function ModernReligionsCollection() {
  const [view, setView] = useState<View>("Overview");
  const [query, setQuery] = useState("");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedEvidence = useMemo(
    () => evidenceRecords.filter((record) => sectionMatches(record, view)),
    [view],
  );
  const otherProfiles = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return profileRecords.filter(
      (profile) =>
        !isScientology(profile) &&
        (!needle ||
          `${field(profile, "name", "title")} ${stringList(profile, "aliases").join(" ")} ${field(profile, "region")} ${field(profile, "summary", "description")}`
            .toLocaleLowerCase()
            .includes(needle)),
    );
  }, [query]);
  const otherWorkIds = useMemo(
    () =>
      new Set(
        otherProfiles.flatMap((profile) => stringList(profile, "workIds")),
      ),
    [otherProfiles],
  );
  const otherWorks = useMemo(
    () => workRecords.filter((work) => otherWorkIds.has(field(work, "id"))),
    [otherWorkIds],
  );

  return (
    <>
      <Heading
        eyebrow="Phase 13 · modern religious movements"
        title="Modern religions & new religious movements"
        description="Compare community self-description, scholarship, public records, criticism, and responses without collapsing distinct kinds of evidence."
      />
      <p className="notice">
        <strong>Copyright and access:</strong> This collection provides catalog
        metadata, brief original summaries, and links for in-copyright works.
        Full text appears only when a verified public-domain or licensed edition
        permits it.
      </p>
      <p className="notice">
        <strong>Evidence policy:</strong>{" "}
        {typeof modernPolicy === "string"
          ? modernPolicy
          : field(
              modernPolicy as unknown as LooseRecord,
              "summary",
              "policy",
              "description",
            )}
      </p>
      <div className="stat-grid">
        <article className="stat">
          <strong>{profileRecords.length}</strong>
          <span>modern tradition profiles</span>
        </article>
        <article className="stat">
          <strong>{workRecords.length}</strong>
          <span>copyright-aware work records</span>
        </article>
        <article className="stat">
          <strong>{evidenceRecords.length}</strong>
          <span>perspective-labeled evidence records</span>
        </article>
        <article className="stat">
          <strong>{originClaimRecords.length}</strong>
          <span>origin claims with documented dates</span>
        </article>
      </div>
      <div
        className="tabs"
        role="tablist"
        aria-label="Modern religions collection section"
      >
        {views.map((item, index) => (
          <button
            key={item}
            id={`modern-tab-${viewId(item)}`}
            type="button"
            role="tab"
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            aria-selected={view === item}
            aria-controls={`modern-panel-${viewId(item)}`}
            tabIndex={view === item ? 0 : -1}
            className={view === item ? "selected" : ""}
            onClick={() => setView(item)}
            onKeyDown={(event) => {
              let nextIndex = index;
              if (event.key === "ArrowRight")
                nextIndex = (index + 1) % views.length;
              else if (event.key === "ArrowLeft")
                nextIndex = (index - 1 + views.length) % views.length;
              else if (event.key === "Home") nextIndex = 0;
              else if (event.key === "End") nextIndex = views.length - 1;
              else return;
              event.preventDefault();
              const nextView = views[nextIndex];
              setView(nextView);
              tabRefs.current[nextIndex]?.focus();
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        id={`modern-panel-${viewId(view)}`}
        role="tabpanel"
        aria-labelledby={`modern-tab-${viewId(view)}`}
        tabIndex={0}
      >
        {view === "Overview" ? (
          <>
            <section>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Chronology discipline</span>
                  <h2>Claimed origins and documented dates</h2>
                </div>
              </div>
              <p className="notice">
                A claimed ancient, revealed, extraterrestrial, or timeless
                origin is part of a tradition’s self-description. It does not
                replace the documented modern publication, organization, or
                public-emergence date.
              </p>
              <div className="two-col">
                {originClaimRecords.map((claim, index) => (
                  <OriginCard
                    key={
                      field(claim, "id") ||
                      `${field(claim, "tradition", "title")}-${index}`
                    }
                    claim={claim}
                  />
                ))}
              </div>
              {!originClaimRecords.length && (
                <Empty>No reviewed origin-claim records are available.</Empty>
              )}
            </section>
            <section>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Scientology research guide</span>
                  <h2>Separate perspectives before comparing claims</h2>
                </div>
              </div>
              <p>
                Use the tabs to distinguish official teaching, historical and
                academic interpretation, government or court records, criticism,
                and documented Church responses. A source’s presence shows
                relevance, not Atlas endorsement.
              </p>
            </section>
          </>
        ) : view === "Official Teaching" ? (
          <>
            <p className="notice">
              These records describe teachings through official or affiliated
              publications. Their classification identifies their perspective;
              it does not treat self-description as independent historical
              verification.
            </p>
            <div className="two-col">
              {scientologyWorkRecords.map((work, index) => (
                <WorkCard
                  key={field(work, "id") || `scientology-work-${index}`}
                  work={work}
                />
              ))}
              {selectedEvidence.map((record, index) => (
                <EvidenceCard
                  key={field(record, "id") || `official-${index}`}
                  record={record}
                />
              ))}
            </div>
            {!scientologyWorkRecords.length && !selectedEvidence.length && (
              <Empty>
                No reviewed official-teaching records are available.
              </Empty>
            )}
          </>
        ) : view === "Bibliography" ? (
          <>
            <p className="notice">
              Bibliography entries identify the author or institution and
              perspective so official, academic, journalistic, legal, critical,
              and responsive sources remain distinguishable.
            </p>
            <div className="two-col">
              {bibliographyRecords.map((entry, index) => (
                <article
                  className="panel"
                  key={field(entry, "id") || `bibliography-${index}`}
                >
                  <span className="eyebrow">
                    {field(entry, "perspective", "category") || "Bibliography"}
                  </span>
                  <h2>{field(entry, "title")}</h2>
                  <p>{field(entry, "author")}</p>
                  <dl className="metadata">
                    <div>
                      <dt>Perspective</dt>
                      <dd>
                        {field(entry, "perspective") ||
                          "Author or publisher identified in this citation"}
                      </dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>Bibliographic record</dd>
                    </div>
                    <div>
                      <dt>Date</dt>
                      <dd>
                        {field(entry, "published") || "See source record"}
                      </dd>
                    </div>
                    <div>
                      <dt>Rights / access</dt>
                      <dd>
                        {field(entry, "rights") ||
                          "Bibliographic metadata and link"}
                      </dd>
                    </div>
                    <div>
                      <dt>Evidence limit</dt>
                      <dd>
                        {field(entry, "scope") ||
                          "Use within the source’s stated scope."}
                      </dd>
                    </div>
                  </dl>
                  <Sources record={entry} />
                </article>
              ))}
            </div>
            {!bibliographyRecords.length && (
              <Empty>No reviewed bibliography records are available.</Empty>
            )}
          </>
        ) : view === "Other modern traditions" ? (
          <>
            <p className="notice">
              These profiles are distinct traditions and movements. Similar
              dates, vocabulary, or social settings do not establish a shared
              lineage, doctrine, or organization.
            </p>
            <div className="filters">
              <label>
                Search modern traditions
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tradition, region, or description"
                />
              </label>
            </div>
            <div className="two-col">
              {otherProfiles.map((profile, index) => {
                const heaven = isHeavensGate(profile);
                const sensitiveNote = field(profile, "sensitiveNote");
                const profileId = field(profile, "id");
                const profileWorkIds = new Set(stringList(profile, "workIds"));
                const relatedWorks = workRecords.filter((work) =>
                  profileWorkIds.has(field(work, "id")),
                );
                return (
                  <article
                    className="panel"
                    key={profileId || `profile-${index}`}
                  >
                    <span className="eyebrow">
                      {field(profile, "status", "evidenceStatus") ||
                        "Modern tradition profile"}
                    </span>
                    <h2>{field(profile, "name", "title")}</h2>
                    {stringList(profile, "aliases").length > 0 && (
                      <p className="small muted">
                        Also known as:{" "}
                        {stringList(profile, "aliases").join(", ")}
                      </p>
                    )}
                    <p>{field(profile, "summary", "description")}</p>
                    {sensitiveNote || heaven ? (
                      <p className="notice">
                        <strong>Sensitive subject:</strong>{" "}
                        {sensitiveNote ||
                          "This profile discusses group history and deaths in non-graphic, prevention-oriented terms. Method details are omitted."}
                      </p>
                    ) : null}
                    <dl className="metadata">
                      <div>
                        <dt>Perspective</dt>
                        <dd>Source-attributed profile synthesis</dd>
                      </div>
                      <div>
                        <dt>Documented emergence</dt>
                        <dd>
                          {field(profile, "originStart") || "Not stated"}
                          {field(profile, "originEnd") &&
                          field(profile, "originEnd") !==
                            field(profile, "originStart")
                            ? `–${field(profile, "originEnd")}`
                            : ""}
                        </dd>
                      </div>
                      <div>
                        <dt>Region</dt>
                        <dd>
                          {field(profile, "region", "place") || "Not stated"}
                        </dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>Reviewed metadata profile</dd>
                      </div>
                      <div>
                        <dt>Rights / access</dt>
                        <dd>Metadata, original summary, and source links</dd>
                      </div>
                      <div>
                        <dt>Central authority</dt>
                        <dd>
                          {field(profile, "centralAuthority") ||
                            "No single authority recorded"}
                        </dd>
                      </div>
                      <div>
                        <dt>Canon / corpus</dt>
                        <dd>
                          {field(profile, "canonNote") ||
                            "Varies by community and source"}
                        </dd>
                      </div>
                    </dl>
                    <p className="notice">
                      <strong>Evidentiary limit:</strong>{" "}
                      {field(profile, "classificationBoundary") ||
                        "This profile documents a distinct public tradition without inferring shared authority from related vocabulary."}
                    </p>
                    <Sources record={profile} />
                    {relatedWorks.length > 0 && (
                      <p className="small muted">
                        {relatedWorks.length} related work{" "}
                        {relatedWorks.length === 1 ? "record" : "records"} in
                        the Atlas catalog.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
            {!otherProfiles.length && (
              <Empty>No modern tradition matches this search.</Empty>
            )}
            {otherWorks.length > 0 && (
              <section>
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Copyright-aware catalog</span>
                    <h2>Works associated with these profiles</h2>
                  </div>
                </div>
                <div className="two-col">
                  {otherWorks.map((work, index) => (
                    <WorkCard
                      key={field(work, "id") || `modern-work-${index}`}
                      work={work}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            <p className="notice">
              Records in this section retain their source perspective,
              documentary status, date, rights boundary, and evidentiary limit.
              Conflicting accounts may coexist when each is clearly attributed.
            </p>
            <div className="two-col">
              {selectedEvidence.map((record, index) => (
                <EvidenceCard
                  key={field(record, "id") || `evidence-${index}`}
                  record={record}
                />
              ))}
            </div>
            {!selectedEvidence.length && (
              <Empty>
                No reviewed evidence records are available for this section.
              </Empty>
            )}
          </>
        )}
      </div>
    </>
  );
}
