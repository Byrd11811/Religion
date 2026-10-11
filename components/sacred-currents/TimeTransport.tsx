"use client";

import { useEffect, useMemo } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import styles from "./SacredCurrents.module.css";

interface Props {
  years: number[];
  year: number;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  onYearChange: (year: number) => void;
  formatYear: (year: number) => string;
}

const eraStops = [
  { label: "Origins", year: -3000 },
  { label: "Classical", year: -500 },
  { label: "Late antiquity", year: 400 },
  { label: "Medieval", year: 1000 },
  { label: "Early modern", year: 1600 },
  { label: "Now", year: new Date().getUTCFullYear() },
];

function closestIndex(years: number[], target: number) {
  if (!years.length) return 0;
  return years.reduce(
    (best, value, index) =>
      Math.abs(value - target) < Math.abs(years[best] - target) ? index : best,
    0,
  );
}

export function TimeTransport({
  years,
  year,
  playing,
  onPlayingChange,
  onYearChange,
  formatYear,
}: Props) {
  const index = useMemo(() => closestIndex(years, year), [year, years]);

  useEffect(() => {
    if (!playing || !years.length) return;
    if (index >= years.length - 1) {
      onPlayingChange(false);
      return;
    }
    const timer = window.setTimeout(
      () => onYearChange(years[Math.min(index + 1, years.length - 1)]),
      820,
    );
    return () => window.clearTimeout(timer);
  }, [index, onPlayingChange, onYearChange, playing, years]);

  const move = (direction: -1 | 1) => {
    onPlayingChange(false);
    onYearChange(years[Math.max(0, Math.min(years.length - 1, index + direction))]);
  };

  return (
    <section className={styles.transport} aria-labelledby="currents-time-title">
      <div className={styles.transportHeading}>
        <div>
          <span className={styles.kicker}>Time lens</span>
          <h2 id="currents-time-title">{formatYear(year)}</h2>
        </div>
        <p>
          Showing dated records on or before this point; undated records remain
          explicit. Playback moves only through catalog change points.
        </p>
      </div>

      <div className={styles.transportControls}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => {
            onPlayingChange(false);
            onYearChange(years[0]);
          }}
          aria-label="Return to 5000 BCE"
          title="Return to the start of the Atlas timeline"
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => move(-1)}
          disabled={index === 0}
          aria-label="Previous change point"
          title="Previous change point"
        >
          <SkipBack size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.playButton}
          onClick={() => onPlayingChange(!playing)}
          aria-label={playing ? "Pause time playback" : "Play time playback"}
          aria-pressed={playing}
        >
          {playing ? (
            <Pause size={17} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={17} fill="currentColor" aria-hidden="true" />
          )}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => move(1)}
          disabled={index >= years.length - 1}
          aria-label="Next change point"
          title="Next change point"
        >
          <SkipForward size={17} aria-hidden="true" />
        </button>
        <label className={styles.timeSlider}>
          <span className={styles.srOnly}>Historical time cursor</span>
          <input
            type="range"
            min={0}
            max={Math.max(0, years.length - 1)}
            value={index}
            onChange={(event) => {
              onPlayingChange(false);
              onYearChange(years[Number(event.target.value)]);
            }}
            aria-valuetext={formatYear(year)}
          />
        </label>
      </div>

      <div className={styles.eraStops} aria-label="Jump to era">
        {eraStops.map((stop) => {
          const stopIndex = closestIndex(years, stop.year);
          return (
            <button
              type="button"
              key={stop.label}
              onClick={() => {
                onPlayingChange(false);
                onYearChange(years[stopIndex]);
              }}
              aria-label={`Jump to ${stop.label}, ${formatYear(years[stopIndex])}`}
            >
              <span>{stop.label}</span>
              <small>{formatYear(years[stopIndex])}</small>
            </button>
          );
        })}
      </div>
      <p className={styles.srOnly} aria-live="polite">
        Time cursor at {formatYear(year)}.
      </p>
    </section>
  );
}
