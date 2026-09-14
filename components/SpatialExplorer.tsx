"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { dateLabel, traditions } from "@/packages/shared/catalog";
import { explorationRecords } from "@/packages/shared/exploration-catalog";
import {
  currentAtlasYear,
  earliestAtlasYear,
  explorationScope,
  selectedHistoricalYear,
  timelinePosition,
  timelineTicks,
  type ExplorationFilters,
  type ExplorationRecord,
} from "@/packages/shared/exploration";
import { leafletProvider } from "@/packages/maps/leaflet";
import type { MapHandle, MapProvider } from "@/packages/maps/provider";
import { Empty, Heading } from "./common";

const defaults = (): ExplorationFilters => ({
  kind: "work",
  year: currentAtlasYear(),
  traditionId: "",
  region: "",
  includeUndated: true,
  fullText: false,
  images: false,
  geography: "all",
});
const kindLabels = {
  work: "Work composition",
  witness: "Physical witness",
  artifact: "Museum object",
  tradition: "Catalog grouping",
};

function Filters({
  mode,
  filters,
  setFilters,
}: {
  mode: "Map" | "Timeline";
  filters: ExplorationFilters;
  setFilters: (next: ExplorationFilters) => void;
}) {
  const regions = [
    ...new Set(
      explorationRecords
        .filter((r) => filters.kind === "all" || r.kind === filters.kind)
        .map((r) => r.region),
    ),
  ].sort();
  return (
    <div className="panel spatial-filters">
      <label>
        Dated records through {dateLabel(filters.year)}
        <input
          aria-label={`${mode} year`}
          type="range"
          min={earliestAtlasYear}
          max={currentAtlasYear()}
          value={filters.year}
          onChange={(e) =>
            setFilters({
              ...filters,
              year: selectedHistoricalYear(e.target.value, filters.year),
            })
          }
        />
      </label>
      <div className="filters">
        <label>
          Geographic evidence
          <select
            aria-label={`${mode} geographic evidence`}
            value={filters.geography}
            onChange={(e) =>
              setFilters({
                ...filters,
                geography: e.target.value as ExplorationFilters["geography"],
              })
            }
          >
            <option value="all">All evidence states</option>
            <option value="approximate">Approximate editorial anchors</option>
            <option value="unlocated">Coordinates unavailable</option>
          </select>
        </label>
        <label>
          Record layer
          <select
            aria-label={`${mode} layer`}
            value={filters.kind}
            onChange={(e) =>
              setFilters({
                ...filters,
                kind: e.target.value as ExplorationFilters["kind"],
                region: "",
              })
            }
          >
            <option value="all">All available record types</option>
            <option value="work">Works</option>
            <option value="witness">Witnesses</option>
            <option value="artifact">Artifacts</option>
            <option value="tradition">Tradition groupings</option>
          </select>
        </label>
        <label>
          Community / grouping
          <select
            aria-label={`${mode} tradition`}
            value={filters.traditionId}
            onChange={(e) =>
              setFilters({ ...filters, traditionId: e.target.value })
            }
          >
            <option value="">All groupings</option>
            {traditions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Region / repository
          <select
            aria-label={`${mode} region`}
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          >
            <option value="">All regions / repositories</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="filters">
        <label>
          <input
            type="checkbox"
            checked={filters.includeUndated}
            onChange={(e) =>
              setFilters({ ...filters, includeUndated: e.target.checked })
            }
          />{" "}
          Include records with unknown dates
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.fullText}
            onChange={(e) =>
              setFilters({ ...filters, fullText: e.target.checked })
            }
          />{" "}
          Source edition available
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.images}
            onChange={(e) =>
              setFilters({ ...filters, images: e.target.checked })
            }
          />{" "}
          Image association available
        </label>
      </div>
    </div>
  );
}

function RecordLinks({ records }: { records: ExplorationRecord[] }) {
  return (
    <ul className="spatial-records">
      {records.map((r) => (
        <li key={r.id}>
          <Link href={r.href}>{r.title}</Link>
          <span>
            {kindLabels[r.kind]} · {r.region} ·{" "}
            {dateLabel(r.startDate, r.endDate)}
          </span>
          <span>
            {r.locationType}: {r.precision}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Timeline() {
  const [filters, setFilters] = useState(defaults);
  const [orientation, setOrientation] = useState("horizontal");
  const scope = useMemo(
    () => explorationScope(explorationRecords, filters),
    [filters],
  );
  const endYear = currentAtlasYear();
  return (
    <>
      <Heading
        eyebrow="Ideas and surviving objects across time"
        title="Timeline"
        description="Compare work composition dates with physical witness dates. A surviving object’s age does not establish when its text was composed."
      />
      <Filters mode="Timeline" filters={filters} setFilters={setFilters} />
      <div className="filters">
        <button
          className="button secondary"
          onClick={() =>
            setOrientation(
              orientation === "horizontal" ? "vertical" : "horizontal",
            )
          }
        >
          {orientation === "horizontal" ? "Vertical view" : "Horizontal view"}
        </button>
        <p
          className="small muted"
          role="status"
          data-testid="timeline-coverage"
        >
          {scope.dated.length} dated records · {scope.undated.length} undated
          records{" "}
          {filters.includeUndated
            ? "available below"
            : "excluded by your filter"}{" "}
          · {scope.afterYear.length} dated after the selected year
        </p>
      </div>
      <p className="notice">
        Work dates are provisional editorial estimates. Witness dates describe
        physical objects and retain their institutional source notes. Unknown
        dates are never assigned a position. The scale runs from 5000 BCE to{" "}
        {endYear} CE; marks have a minimum visible width, not an implied
        duration. Historical policy, conflict, translation and canon events
        await sourced datasets.
      </p>
      {orientation === "horizontal" ? (
        <div className="timeline">
          <div className="timeline-axis">
            {timelineTicks(endYear).map((y) => (
              <span
                key={y}
                style={{ left: `${timelinePosition(y, endYear)}%` }}
              >
                {dateLabel(y)}
              </span>
            ))}
          </div>
          {scope.dated.map((r) => {
            const left = timelinePosition(r.startDate!, endYear);
            const right = timelinePosition(r.endDate ?? r.startDate!, endYear);
            return (
              <div className="timeline-row" key={r.id} data-record-id={r.id}>
                <Link
                  href={r.href}
                  title={`${r.title} · ${kindLabels[r.kind]}`}
                >
                  {r.title}
                </Link>
                <div className="timeline-track">
                  <Link
                    aria-label={`${r.title}: ${dateLabel(r.startDate, r.endDate)}; ${kindLabels[r.kind]}`}
                    title={`${dateLabel(r.startDate, r.endDate)} · ${r.dateNotes}${r.startDate! < earliestAtlasYear ? " · Begins before the displayed range" : ""}`}
                    href={r.href}
                    className="timeline-bar"
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(0, right - left)}%`,
                    }}
                  />
                  <span style={{ left: `${Math.min(84, left + 2)}%` }}>
                    {dateLabel(r.startDate)}
                    {r.kind === "witness" ? " · witness" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="vertical-timeline">
          {scope.dated.map((r) => (
            <Link key={r.id} href={r.href}>
              <span>
                {dateLabel(r.startDate, r.endDate)} · {kindLabels[r.kind]}
              </span>
              <h3>{r.title}</h3>
              <p>{r.dateNotes}</p>
            </Link>
          ))}
        </div>
      )}
      {!scope.dated.length && (
        <Empty>
          No reviewed or provisional dates match this period. Records with
          unknown dates remain listed separately when included.
        </Empty>
      )}
      {filters.includeUndated && (
        <details className="panel spatial-details">
          <summary>Records with unknown dates ({scope.undated.length})</summary>
          <p>
            No chronological position is inferred. The count follows the
            selected layer, grouping, region and availability filters.
          </p>
          <RecordLinks records={scope.undated} />
        </details>
      )}
    </>
  );
}

export function MapCanvas({
  records,
  onSelect,
  provider = leafletProvider,
}: {
  records: ExplorationRecord[];
  onSelect: (records: ExplorationRecord[]) => void;
  provider?: MapProvider;
}) {
  const element = useRef<HTMLDivElement>(null);
  const handle = useRef<MapHandle | null>(null);
  const currentRecords = useRef(records);
  const callback = useRef(onSelect);
  const [error, setError] = useState("");
  useEffect(() => {
    callback.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    currentRecords.current = records;
    handle.current?.update(records);
  }, [records]);
  useEffect(() => {
    let stopped = false;
    const controller = new AbortController();
    let owned: MapHandle | null = null;
    if (element.current)
      provider
        .create(
          element.current,
          (rows) => callback.current(rows),
          (message) => {
            if (!stopped) setError(message);
          },
          controller.signal,
        )
        .then((map) => {
          if (stopped) {
            map.destroy();
            return;
          }
          owned = map;
          handle.current = map;
          map.update(currentRecords.current);
        })
        .catch(() => {
          if (!stopped)
            setError(
              "Map unavailable. All records remain accessible in the lists below.",
            );
        });
    return () => {
      stopped = true;
      controller.abort();
      owned?.destroy();
      handle.current = null;
    };
  }, [provider]);
  return (
    <>
      {error && (
        <p className="notice" role="status">
          {error}
        </p>
      )}
      <div
        className="map-canvas"
        ref={element}
        aria-label="Interactive map of approximate text origins"
      />
    </>
  );
}

export function WorldMap() {
  const [filters, setFilters] = useState(defaults);
  const [selection, setSelection] = useState<string[]>([]);
  const scope = useMemo(
    () => explorationScope(explorationRecords, filters),
    [filters],
  );
  const selected = scope.inPeriod.filter((r) => selection.includes(r.id));
  return (
    <>
      <Heading
        eyebrow="Place, time and evidence"
        title="World Map"
        description="Explore available origin and repository records. Geographic precision, missing dates and coverage remain visible."
      />
      <Filters mode="Map" filters={filters} setFilters={setFilters} />
      <p className="notice" data-testid="map-coverage" role="status">
        {scope.mapped.length} mapped records with approximate editorial
        geography · {scope.unlocated.length} records without defensible
        coordinates · {scope.undated.length} unknown-date records{" "}
        {filters.includeUndated ? "included" : "excluded"} ·{" "}
        {scope.afterYear.length} records dated after the selected year. Counts
        follow your filters; record layers are not additive work totals.
      </p>
      <MapCanvas
        records={scope.mapped}
        onSelect={(rows) => setSelection(rows.map((r) => r.id))}
      />
      <p className="small muted">
        OpenStreetMap shows modern base geography, not historical borders.
        Coincident records share one marker at the original anchor; no
        coordinates are displaced. Marker size indicates the number of records,
        not religious population. Unknown-date records remain explicitly
        undated. Political control, state religion and religious influence are
        separate concepts; historical layers and before/after conflict states
        await sourced data.
      </p>
      {selected.length > 0 && (
        <section
          className="panel spatial-selection"
          aria-label="Selected location evidence"
        >
          <h2>
            {selected.length > 1
              ? `${selected.length} records at this anchor`
              : selected[0].title}
          </h2>
          {selected.map((r) => (
            <article key={r.id}>
              {selected.length > 1 && <h3>{r.title}</h3>}
              <p>
                {kindLabels[r.kind]} · {r.region} ·{" "}
                {dateLabel(r.startDate, r.endDate)}
              </p>
              <p>
                {r.locationType} · {r.precision}
              </p>
              <p>{r.dateNotes}</p>
              <p>{r.context}</p>
              <p>
                Individual beliefs varied. Neither political rule nor this
                catalog location establishes what every person practiced.
              </p>
              <h3>Source context</h3>
              <ul>
                {r.sources.length ? (
                  r.sources.map((source, i) => (
                    <li key={i}>
                      {/^https?:\/\//.test(source) ? (
                        <a href={source} target="_blank" rel="noreferrer">
                          {source}
                        </a>
                      ) : (
                        source
                      )}
                    </li>
                  ))
                ) : (
                  <li>No reviewed geographic bibliography is available.</li>
                )}
              </ul>
              <Link className="text-button" href={r.href}>
                {r.kind === "work" ? "Open text profile" : "Open source record"}{" "}
                →
              </Link>
            </article>
          ))}
        </section>
      )}
      <h2>Mapped records</h2>
      <p className="small muted">
        This keyboard-accessible list includes every mapped record, regardless
        of map pan or zoom.
      </p>
      <div className="map-list">
        {scope.mapped.map((r) => (
          <button key={r.id} onClick={() => setSelection([r.id])}>
            <strong>{r.title}</strong>
            <span>
              {r.region} · {dateLabel(r.startDate)}
            </span>
            <span>{r.precision}</span>
          </button>
        ))}
      </div>
      {!scope.mapped.length && (
        <Empty>
          No defensible coordinates match this selection. Named places remain
          discoverable below without invented map positions.
        </Empty>
      )}
      <details className="panel spatial-details">
        <summary>
          Records without defensible coordinates ({scope.unlocated.length})
        </summary>
        <p>A region or repository name does not supply reviewed coordinates.</p>
        <RecordLinks records={scope.unlocated} />
      </details>
    </>
  );
}
