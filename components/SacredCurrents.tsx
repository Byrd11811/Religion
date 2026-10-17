"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  Compass,
  GitCompareArrows,
  Map as MapIcon,
  Route,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  buildSacredCurrentsTimeYears,
  buildSacredCurrentsScene,
  formatSacredRange,
  formatSacredYear,
  type SacredCurrentsFilters,
  type SacredCurrentsEvidenceState,
} from "@/packages/shared/sacred-currents";
import {
  sacredCurrentsCatalog,
  sacredCurrentsConnections,
  sacredCurrentsCoverage,
  sacredCurrentsRecords,
} from "@/packages/shared/sacred-currents-catalog";
import { CoveragePanel } from "./sacred-currents/CoveragePanel";
import { EvidenceDrawer } from "./sacred-currents/EvidenceDrawer";
import { JourneyPlayer } from "./sacred-currents/JourneyPlayer";
import { LayerMenu, type GeographyScope } from "./sacred-currents/LayerMenu";
import { RecordDirectory } from "./sacred-currents/RecordDirectory";
import { RiverTimeline } from "./sacred-currents/RiverTimeline";
import { SacredMap } from "./sacred-currents/SacredMap";
import { TimeTransport } from "./sacred-currents/TimeTransport";
import { HistoricalChangeExplorer } from "./HistoricalChangeExplorer";
import styles from "./sacred-currents/SacredCurrents.module.css";
import type {
  CurrentsLayer,
  GuidedChapter,
  SacredCurrentsMode,
  SacredCurrentsView,
} from "./sacred-currents/types";

export interface SacredCurrentsProps {
  initialView?: "map" | "timeline";
  initialQuery?: string;
}

const modeOptions: {
  id: SacredCurrentsMode;
  label: string;
  description: string;
  icon: typeof Compass;
}[] = [
  {
    id: "explore",
    label: "Explore",
    description: "Move freely through place and time",
    icon: Compass,
  },
  {
    id: "trace",
    label: "Trace",
    description: "Inspect sourced relationships",
    icon: Route,
  },
  {
    id: "compare",
    label: "Compare",
    description: "Place two records side by side",
    icon: GitCompareArrows,
  },
  {
    id: "guided",
    label: "Guided",
    description: "Follow an evidence-led story",
    icon: Sparkles,
  },
  {
    id: "change",
    label: "Change",
    description: "Compare sourced historical states",
    icon: Clock3,
  },
];

const guideDefinitions = [
  {
    id: "flood-genesis",
    eyebrow: "Chapter 1 · Comparison",
    title: "Flood stories without a fictional route",
    description:
      "Place surviving Mesopotamian and Genesis records in chronological context, then inspect what the evidence can and cannot establish.",
  },
  {
    id: "amenemope-proverbs-influence",
    eyebrow: "Chapter 2 · Literary contact",
    title: "Wisdom across Egypt and the Levant",
    description:
      "Explore a strong, delimited influence claim while keeping the unpreserved intermediary and broader differences visible.",
  },
  {
    id: "enoch-jude-quotation",
    eyebrow: "Chapter 3 · Direct reception",
    title: "When a quotation changes the evidence",
    description:
      "A direct textual quotation supports a stronger relationship than visual resemblance, proximity, or shared themes alone.",
  },
  {
    id: "lotus-profound-meaning-commentary",
    eyebrow: "Chapter 4 · Commentary",
    title: "A scripture and its later interpreter",
    description:
      "Separate the earlier work from a later exegetical tradition instead of treating commentary as another witness to the same wording.",
  },
];

function buildGuides(): GuidedChapter[] {
  const used = new Set<string>();
  const result: GuidedChapter[] = [];
  for (const definition of guideDefinitions) {
    const connection = sacredCurrentsConnections.find(
      ({ id }) => id === definition.id,
    );
    if (!connection) continue;
    used.add(connection.id);
    result.push({
      ...definition,
      relationshipId: connection.id,
      recordIds: [
        connection.source.recordId,
        connection.target.recordId,
      ].filter((id): id is string => id !== null),
      note: "Anchors are shown independently. The Atlas does not reconstruct a journey from this relationship.",
    });
  }
  for (const connection of sacredCurrentsConnections) {
    if (result.length >= 4 || used.has(connection.id)) continue;
    const recordIds = [
      connection.source.recordId,
      connection.target.recordId,
    ].filter((id): id is string => id !== null);
    if (!recordIds.length) continue;
    result.push({
      id: connection.id,
      eyebrow: `Chapter ${result.length + 1} · Evidence`,
      title: `${connection.source.label} and ${connection.target.label}`,
      description: connection.summary,
      relationshipId: connection.id,
      recordIds,
      note: "This relationship is evidence to inspect, not a mapped travel or transmission route.",
    });
  }
  return result;
}

const guidedChapters = buildGuides();
const timeYears = buildSacredCurrentsTimeYears(
  sacredCurrentsCatalog.changePointYears,
);

function connectionMatchesQuery(
  connection: (typeof sacredCurrentsConnections)[number],
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;
  return [
    connection.source.label,
    connection.target.label,
    connection.summary,
    connection.relationshipType,
  ]
    .join(" ")
    .toLocaleLowerCase()
    .includes(normalizedQuery);
}

export default function SacredCurrents({
  initialView = "map",
  initialQuery = "",
}: SacredCurrentsProps) {
  const [mode, setMode] = useState<SacredCurrentsMode>("explore");
  const [view, setView] = useState<SacredCurrentsView>(initialView);
  const [query, setQuery] = useState(initialQuery);
  const [layers, setLayers] = useState<Set<CurrentsLayer>>(
    () => new Set<CurrentsLayer>(["work", "witness"]),
  );
  const [geography, setGeography] = useState<GeographyScope>("all");
  const [includeUndated, setIncludeUndated] = useState(true);
  const [traditionId, setTraditionId] = useState("");
  const [region, setRegion] = useState("");
  const [evidenceState, setEvidenceState] = useState<
    SacredCurrentsEvidenceState | ""
  >("");
  const [withTextOnly, setWithTextOnly] = useState(false);
  const [withImagesOnly, setWithImagesOnly] = useState(false);
  const [year, setYear] = useState(timeYears[timeYears.length - 1]);
  const [playing, setPlaying] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [guideIndex, setGuideIndex] = useState(0);

  const commonFilters = useMemo<SacredCurrentsFilters>(
    () => ({
      query,
      kinds: [...layers],
      includeUndated,
      geography,
      traditionIds: traditionId ? [traditionId] : undefined,
      regions: region ? [region] : undefined,
      evidenceStates: evidenceState ? [evidenceState] : undefined,
      withTextOnly,
      withImagesOnly,
    }),
    [
      evidenceState,
      geography,
      includeUndated,
      layers,
      query,
      region,
      traditionId,
      withImagesOnly,
      withTextOnly,
    ],
  );
  const fullScene = useMemo(
    () => buildSacredCurrentsScene(sacredCurrentsCatalog, commonFilters),
    [commonFilters],
  );
  const scene = useMemo(
    () =>
      buildSacredCurrentsScene(sacredCurrentsCatalog, {
        ...commonFilters,
        year,
      }),
    [commonFilters, year],
  );
  const recordById = useMemo(
    () => new Map(sacredCurrentsRecords.map((record) => [record.id, record])),
    [],
  );
  const selectedRecords = selectedIds
    .map((id) => recordById.get(id))
    .filter((record) => record !== undefined);
  const compareRecords = compareIds
    .map((id) => recordById.get(id))
    .filter((record) => record !== undefined);
  const selectedConnection =
    sacredCurrentsConnections.find(({ id }) => id === connectionId) ?? null;

  const applyRecordSelection = useCallback(
    (ids: string[]) => {
      const available = ids.filter((id) => recordById.has(id));
      setPlaying(false);
      if (mode === "compare") {
        const id = available[0];
        if (!id) return;
        setCompareIds((current) => {
          if (current.includes(id))
            return current.filter((item) => item !== id);
          return current.length >= 2 ? [current[1], id] : [...current, id];
        });
        setSelectedIds([id]);
        setConnectionId(null);
        return;
      }
      setSelectedIds(available);
      if (mode !== "trace") setConnectionId(null);
      if (mode === "trace") {
        const connection = sacredCurrentsConnections.find(
          ({ source, target }) =>
            (source.recordId && available.includes(source.recordId)) ||
            (target.recordId && available.includes(target.recordId)),
        );
        setConnectionId(connection?.id ?? null);
      }
    },
    [mode, recordById],
  );

  const selectConnection = useCallback((id: string) => {
    const connection = sacredCurrentsConnections.find(
      (candidate) => candidate.id === id,
    );
    if (!connection) return;
    setPlaying(false);
    setConnectionId(connection.id);
    setSelectedIds(
      [connection.source.recordId, connection.target.recordId].filter(
        (recordId): recordId is string => recordId !== null,
      ),
    );
  }, []);

  const selectGuide = useCallback(
    (index: number) => {
      const next = guidedChapters[index];
      if (!next) return;
      setGuideIndex(index);
      setPlaying(false);
      setSelectedIds(next.recordIds);
      setConnectionId(next.relationshipId);
      const dates = next.recordIds
        .map((id) => recordById.get(id)?.startYear)
        .filter(
          (value): value is number => value !== null && value !== undefined,
        );
      if (dates.length) {
        const latest = Math.max(...dates);
        const nextYear =
          timeYears.find((value) => value >= latest) ?? timeYears.at(-1)!;
        setYear(nextYear);
      }
    },
    [recordById],
  );

  const changeMode = (nextMode: SacredCurrentsMode) => {
    setMode(nextMode);
    setPlaying(false);
    if (nextMode === "guided") selectGuide(guideIndex);
    if (nextMode === "trace") {
      const matchingConnections = sacredCurrentsConnections.filter(
        (connection) => connectionMatchesQuery(connection, query),
      );
      const nextConnection =
        selectedConnection &&
        matchingConnections.some(({ id }) => id === selectedConnection.id)
          ? selectedConnection
          : (matchingConnections[0] ?? null);
      if (nextConnection) selectConnection(nextConnection.id);
      else {
        setConnectionId(null);
        setSelectedIds([]);
      }
    }
    if (nextMode === "compare") {
      setConnectionId(null);
      setCompareIds((current) =>
        current.length ? current : selectedIds.slice(0, 2),
      );
    }
  };

  const toggleLayer = (layer: CurrentsLayer) => {
    setLayers((current) => {
      const next = new Set(current);
      if (next.has(layer)) {
        if (next.size > 1) next.delete(layer);
      } else next.add(layer);
      return next;
    });
  };

  const layerCounts: Record<CurrentsLayer, number> = {
    work: sacredCurrentsRecords.filter(({ kind }) => kind === "work").length,
    witness: sacredCurrentsRecords.filter(({ kind }) => kind === "witness")
      .length,
    artifact: sacredCurrentsRecords.filter(({ kind }) => kind === "artifact")
      .length,
    tradition: sacredCurrentsRecords.filter(({ kind }) => kind === "tradition")
      .length,
  };
  const unlocated = fullScene.records.filter(
    ({ geography }) => !geography,
  ).length;
  const traceConnections = [...sacredCurrentsConnections]
    .filter((connection) => connectionMatchesQuery(connection, query))
    .sort((a, b) => {
      const priority = (level: string) =>
        ({
          documented: 0,
          strong: 1,
          qualified: 2,
          exploratory: 3,
          disputed: 4,
        })[level] ?? 5;
      return priority(a.evidenceLevel) - priority(b.evidenceLevel);
    });
  const traditionOptions = [
    ...new Map(
      sacredCurrentsRecords
        .filter((record) => record.traditionId)
        .map((record) => [
          record.traditionId!,
          { id: record.traditionId!, label: record.traditionName },
        ]),
    ).values(),
  ].sort((a, b) => a.label.localeCompare(b.label));
  const regionOptions = [
    ...new Set(sacredCurrentsRecords.map(({ region }) => region)),
  ]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ id: value, label: value }));

  return (
    <div
      className={styles.currents}
      data-mode={mode}
      data-view={view}
      data-testid="sacred-currents"
    >
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>
            A living atlas of texts and evidence
          </span>
          <h1>Sacred Currents</h1>
          <p>
            Move through place and time, follow sourced relationships, and see
            where the surviving evidence falls silent.
          </p>
        </div>
        <div
          className={styles.heroStats}
          aria-label="Sacred Currents coverage summary"
        >
          <div>
            <strong>{sacredCurrentsCoverage.totals.datedWorks}</strong>
            <span>dated works</span>
          </div>
          <div>
            <strong>{sacredCurrentsCoverage.totals.mappedWorks}</strong>
            <span>mapped works</span>
          </div>
          <div>
            <strong>{sacredCurrentsCoverage.totals.relationships}</strong>
            <span>sourced links</span>
          </div>
        </div>
      </header>

      <nav className={styles.modeSwitcher} aria-label="Sacred Currents mode">
        {modeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => changeMode(option.id)}
              className={mode === option.id ? styles.modeActive : undefined}
              aria-current={mode === option.id ? "page" : undefined}
            >
              <Icon size={17} aria-hidden="true" />
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </button>
          );
        })}
      </nav>

      {mode === "change" ? (
        <HistoricalChangeExplorer />
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={17} aria-hidden="true" />
              <label>
                <span className={styles.srOnly}>Search Sacred Currents</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find a text, witness, region or tradition…"
                />
              </label>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}
              {query.trim() && (
                <div
                  className={styles.searchResults}
                  role="listbox"
                  aria-label="Search results"
                >
                  <div>
                    <span>{fullScene.records.length} matching records</span>
                    <small>through all dates</small>
                  </div>
                  {fullScene.records.slice(0, 8).map((record) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedIds.includes(record.id)}
                      key={record.id}
                      onClick={() => applyRecordSelection([record.id])}
                    >
                      <i
                        style={{ background: record.traditionColor }}
                        aria-hidden="true"
                      />
                      <span>
                        <strong>{record.title}</strong>
                        <small>
                          {record.traditionName} · {record.dateLabel}
                        </small>
                      </span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  ))}
                  {!fullScene.records.length && (
                    <p>No catalog records match this search.</p>
                  )}
                </div>
              )}
            </div>
            <div
              className={styles.viewToggle}
              aria-label="Primary visualization"
            >
              <button
                type="button"
                className={view === "map" ? styles.viewActive : undefined}
                onClick={() => setView("map")}
                aria-pressed={view === "map"}
              >
                <MapIcon size={15} aria-hidden="true" /> Map
              </button>
              <button
                type="button"
                className={view === "timeline" ? styles.viewActive : undefined}
                onClick={() => setView("timeline")}
                aria-pressed={view === "timeline"}
              >
                <Clock3 size={15} aria-hidden="true" /> Timeline
              </button>
            </div>
            <LayerMenu
              layers={layers}
              counts={layerCounts}
              geography={geography}
              includeUndated={includeUndated}
              traditionId={traditionId}
              region={region}
              evidenceState={evidenceState}
              withTextOnly={withTextOnly}
              withImagesOnly={withImagesOnly}
              traditionOptions={traditionOptions}
              regionOptions={regionOptions}
              onToggleLayer={toggleLayer}
              onGeographyChange={setGeography}
              onIncludeUndatedChange={setIncludeUndated}
              onTraditionChange={setTraditionId}
              onRegionChange={setRegion}
              onEvidenceStateChange={setEvidenceState}
              onWithTextOnlyChange={setWithTextOnly}
              onWithImagesOnlyChange={setWithImagesOnly}
            />
            <CoveragePanel
              total={sacredCurrentsRecords.length}
              visible={scene.counts.records}
              dated={fullScene.counts.dated}
              mapped={fullScene.counts.mapped}
              unlocated={unlocated}
              undated={fullScene.counts.undated}
              byKind={layerCounts}
            />
          </div>

          {mode === "guided" && guidedChapters.length > 0 && (
            <JourneyPlayer
              chapters={guidedChapters}
              index={guideIndex}
              onChange={selectGuide}
            />
          )}
          {mode === "compare" && (
            <div className={styles.modeNotice} role="status">
              <GitCompareArrows size={17} aria-hidden="true" />
              <span>
                Select two anchors or river records. {compareIds.length}/2
                selected. Dates and place claims remain separate from thematic
                resemblance.
              </span>
              {compareIds.length > 0 && (
                <button type="button" onClick={() => setCompareIds([])}>
                  Clear
                </button>
              )}
            </div>
          )}
          {mode === "trace" && (
            <section
              className={styles.traceShelf}
              aria-labelledby="trace-shelf-title"
            >
              <div className={styles.traceShelfHeading}>
                <div>
                  <span className={styles.kicker}>
                    Evidence-backed connections
                  </span>
                  <h2 id="trace-shelf-title">
                    Choose a relationship to inspect
                  </h2>
                </div>
                <p>Lines of evidence are never rendered as routes.</p>
              </div>
              <div className={styles.traceCards}>
                {traceConnections.map((connection) => (
                  <button
                    type="button"
                    key={connection.id}
                    onClick={() => selectConnection(connection.id)}
                    className={
                      connectionId === connection.id
                        ? styles.traceCardActive
                        : undefined
                    }
                    aria-pressed={connectionId === connection.id}
                  >
                    <span>
                      {connection.relationshipType.replaceAll("-", " ")}
                    </span>
                    <strong>
                      {connection.source.label}{" "}
                      <ArrowRight size={13} aria-hidden="true" />{" "}
                      {connection.target.label}
                    </strong>
                    <small data-level={connection.evidenceLevel}>
                      {connection.evidenceLevel} · {connection.citations.length}{" "}
                      source{connection.citations.length === 1 ? "" : "s"}
                    </small>
                  </button>
                ))}
              </div>
            </section>
          )}

          <TimeTransport
            years={timeYears}
            year={year}
            playing={playing}
            onPlayingChange={setPlaying}
            onYearChange={setYear}
            formatYear={formatSacredYear}
          />

          <div className={styles.workspace}>
            <div className={styles.visualStage}>
              <SacredMap
                anchors={scene.anchors}
                records={scene.records}
                selectedIds={mode === "compare" ? compareIds : selectedIds}
                onSelectRecords={applyRecordSelection}
              />
              <RiverTimeline
                records={fullScene.records}
                streams={fullScene.streams}
                years={timeYears}
                year={year}
                selectedIds={mode === "compare" ? compareIds : selectedIds}
                onYearChange={(nextYear) => {
                  setPlaying(false);
                  setYear(nextYear);
                }}
                onSelectRecord={(id) => applyRecordSelection([id])}
                formatYear={formatSacredYear}
              />
            </div>
            <EvidenceDrawer
              mode={mode}
              records={selectedRecords}
              connection={selectedConnection}
              compareRecords={compareRecords}
              formatRange={formatSacredRange}
              onClear={() => {
                setSelectedIds([]);
                setConnectionId(null);
                if (mode === "compare") setCompareIds([]);
              }}
              onSelectRecord={(id) => {
                setSelectedIds([id]);
                setConnectionId(null);
              }}
            />
          </div>

          <RecordDirectory
            records={scene.records}
            selectedIds={mode === "compare" ? compareIds : selectedIds}
            onSelectRecord={(id) => applyRecordSelection([id])}
          />

          <footer className={styles.currentsFooter}>
            <div>
              <span>{scene.counts.mapped}</span> mapped at{" "}
              {formatSacredYear(year)}
            </div>
            <div>
              <span>{scene.counts.records}</span> visible records
            </div>
            <div>
              <span>{scene.counts.undated}</span> undated records kept explicit
            </div>
            <p>
              Modern geography is context only. Marker size reflects catalog
              records, not adherents or influence.
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
