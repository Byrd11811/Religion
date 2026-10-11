"use client";

import { useMemo } from "react";
import { Waves } from "lucide-react";
import type {
  SacredCurrentsRecord,
  SacredCurrentsStream,
} from "@/packages/shared/sacred-currents";
import styles from "./SacredCurrents.module.css";

interface Props {
  records: SacredCurrentsRecord[];
  streams: SacredCurrentsStream[];
  years: number[];
  year: number;
  selectedIds: string[];
  onYearChange: (year: number) => void;
  onSelectRecord: (id: string) => void;
  formatYear: (year: number) => string;
}

const viewWidth = 1200;
const labelWidth = 220;
const plotWidth = viewWidth - labelWidth - 26;
const laneHeight = 40;

function yearOrdinal(year: number) {
  return year > 0 ? year - 1 : year;
}

function closestYear(years: number[], target: number) {
  return years.reduce(
    (best, value) =>
      Math.abs(yearOrdinal(value) - yearOrdinal(target)) <
      Math.abs(yearOrdinal(best) - yearOrdinal(target))
        ? value
        : best,
    years[0],
  );
}

function areaPath(values: number[], centerY: number, maxThickness: number) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => ({
    x: labelWidth + (index / (values.length - 1)) * plotWidth,
    half: value === 0 ? 0 : 2 + (value / max) * maxThickness,
  }));
  const upper = points
    .map(
      (point, index) =>
        `${index ? "L" : "M"}${point.x.toFixed(1)},${(centerY - point.half).toFixed(1)}`,
    )
    .join(" ");
  const lower = [...points]
    .reverse()
    .map(
      (point) => `L${point.x.toFixed(1)},${(centerY + point.half).toFixed(1)}`,
    )
    .join(" ");
  return `${upper} ${lower} Z`;
}

export function RiverTimeline({
  records,
  streams,
  years,
  year,
  selectedIds,
  onYearChange,
  onSelectRecord,
  formatYear,
}: Props) {
  const recordById = useMemo(
    () => new Map(records.map((record) => [record.id, record])),
    [records],
  );
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const domainStart = years[0];
  const domainEnd = years[years.length - 1];
  const startOrdinal = yearOrdinal(domainStart);
  const span = Math.max(1, yearOrdinal(domainEnd) - startOrdinal);
  const xForYear = (value: number) =>
    labelWidth + ((yearOrdinal(value) - startOrdinal) / span) * plotWidth;

  const orderedStreams = useMemo(
    () =>
      [...streams].sort(
        (a, b) =>
          b.recordIds.length - a.recordIds.length ||
          a.startYear - b.startYear ||
          a.label.localeCompare(b.label),
      ),
    [streams],
  );
  const height = 72 + orderedStreams.length * laneHeight;
  const binCount = 42;
  const streamShapes = orderedStreams.map((stream, lane) => {
    const values = Array.from({ length: binCount }, () => 0);
    const datedRecordIds = stream.recordIds.filter(
      (recordId) => typeof recordById.get(recordId)?.startYear === "number",
    );
    for (const recordId of datedRecordIds) {
      const record = recordById.get(recordId);
      if (!record?.startYear) continue;
      const raw =
        ((yearOrdinal(record.startYear) - startOrdinal) / span) *
        (binCount - 1);
      const bin = Math.max(0, Math.min(binCount - 1, Math.round(raw)));
      values[bin] += 1;
      if (bin > 0) values[bin - 1] += 0.42;
      if (bin < binCount - 1) values[bin + 1] += 0.42;
    }
    return {
      stream,
      datedRecordIds,
      centerY: 58 + lane * laneHeight,
      path: areaPath(values, 58 + lane * laneHeight, 11),
    };
  });
  const nearby = records
    .filter((record) => record.startYear !== null)
    .sort(
      (a, b) =>
        Math.abs(yearOrdinal(a.startYear!) - yearOrdinal(year)) -
          Math.abs(yearOrdinal(b.startYear!) - yearOrdinal(year)) ||
        a.title.localeCompare(b.title),
    )
    .slice(0, 6);

  const jumpFromPointer = (clientX: number, element: SVGSVGElement) => {
    const bounds = element.getBoundingClientRect();
    const svgX = ((clientX - bounds.left) / bounds.width) * viewWidth;
    const ratio = Math.max(0, Math.min(1, (svgX - labelWidth) / plotWidth));
    const ordinal = startOrdinal + ratio * span;
    const target = ordinal >= 0 ? Math.round(ordinal) + 1 : Math.round(ordinal);
    onYearChange(closestYear(years, target === 0 ? 1 : target));
  };

  return (
    <section
      className={styles.riverPanel}
      aria-labelledby="currents-river-title"
    >
      <header className={styles.panelHeader}>
        <div>
          <span className={styles.kicker}>Chronological lens</span>
          <h2 id="currents-river-title">River of surviving records</h2>
        </div>
        <div className={styles.riverKey}>
          <Waves size={16} aria-hidden="true" />
          All {streamShapes.length} streams · width reflects dated records, not
          population
        </div>
      </header>
      <p className={styles.riverIntro}>
        All {streamShapes.length} catalog streams are shown. Currents swell
        where this catalog has dated works or witnesses and narrow to zero
        across gaps. They do not claim uninterrupted practice.
      </p>
      <p id="currents-river-description" className={styles.srOnly}>
        Interactive density timeline containing all {streamShapes.length}
        catalog-derived tradition streams. Stream width reflects only dated
        Atlas records, not population, influence or continuous practice. Each
        plotted dated record is keyboard focusable. The six shortcuts after the
        chart are only the records nearest the selected year.
      </p>
      <div className={styles.riverScroll}>
        <svg
          className={styles.riverSvg}
          viewBox={`0 0 ${viewWidth} ${height}`}
          role="group"
          aria-labelledby="currents-river-title"
          aria-describedby="currents-river-description"
          onClick={(event) => {
            if (event.target === event.currentTarget)
              jumpFromPointer(event.clientX, event.currentTarget);
          }}
        >
          <defs>
            <linearGradient id="river-fade" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".7" />
              <stop offset=".5" stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity=".72" />
            </linearGradient>
          </defs>
          <rect
            x={labelWidth}
            y={28}
            width={plotWidth}
            height={height - 36}
            fill="transparent"
            onClick={(event) => {
              event.stopPropagation();
              jumpFromPointer(
                event.clientX,
                event.currentTarget.ownerSVGElement!,
              );
            }}
          />
          {[-3000, -1000, 1, 1000, 1600, domainEnd]
            .filter((tick) => tick >= domainStart && tick <= domainEnd)
            .map((tick) => (
              <g key={tick} className={styles.riverTick} aria-hidden="true">
                <line
                  x1={xForYear(tick)}
                  x2={xForYear(tick)}
                  y1={30}
                  y2={height - 13}
                />
                <text x={xForYear(tick)} y={21} textAnchor="middle">
                  {formatYear(tick)}
                </text>
              </g>
            ))}
          {streamShapes.map(({ stream, datedRecordIds, centerY, path }) => (
            <g
              key={stream.id}
              role="group"
              aria-label={`${stream.label}: ${datedRecordIds.length} plotted dated records; ${stream.recordIds.length} total catalog records`}
            >
              <text
                className={styles.riverLabel}
                x={10}
                y={centerY + 4}
                aria-hidden="true"
              >
                {stream.label.length > 29
                  ? `${stream.label.slice(0, 28)}…`
                  : stream.label}
              </text>
              <path
                className={styles.riverPath}
                d={path}
                fill={stream.color}
                opacity=".82"
                aria-hidden="true"
              >
                <title>
                  {stream.label}: {datedRecordIds.length} plotted dated records;{" "}
                  {stream.recordIds.length} total catalog records
                </title>
              </path>
              {datedRecordIds.map((recordId, recordIndex) => {
                const record = recordById.get(recordId);
                if (!record?.startYear) return null;
                const active = selected.has(record.id);
                return (
                  <circle
                    key={record.id}
                    className={
                      active ? styles.riverPointActive : styles.riverPoint
                    }
                    cx={xForYear(record.startYear)}
                    cy={centerY + ((recordIndex % 3) - 1) * 5}
                    r={active ? 6 : 3.5}
                    fill={stream.color}
                    role="button"
                    tabIndex={0}
                    aria-label={`${record.title}, ${record.dateLabel}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectRecord(record.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectRecord(record.id);
                      }
                    }}
                  >
                    <title>
                      {record.title} · {record.dateLabel}
                    </title>
                  </circle>
                );
              })}
            </g>
          ))}
          <g
            className={styles.timeCursor}
            transform={`translate(${xForYear(year)}, 0)`}
            aria-hidden="true"
          >
            <line y1={28} y2={height - 8} />
            <circle cy={29} r={5} />
          </g>
        </svg>
      </div>
      <div className={styles.nearbyRecords}>
        <span>Nearest dated records</span>
        <div>
          {nearby.map((record) => (
            <button
              type="button"
              key={record.id}
              onClick={() => onSelectRecord(record.id)}
              aria-pressed={selected.has(record.id)}
            >
              <i
                style={{ background: record.traditionColor }}
                aria-hidden="true"
              />
              <span>{record.title}</span>
              <small>{record.dateLabel}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
