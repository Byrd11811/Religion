"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  historicalCaseStudies,
  type HistoricalCaseStudy,
  type HistoricalFeature,
  type HistoricalState,
} from "@/packages/shared/historical-geography";

const layerColors = {
  "political-control": "#52677d",
  "religious-presence": "#a97735",
  "state-religion": "#7d3f67",
  "legal-policy": "#566f4d",
  conflict: "#9a4741",
  community: "#39777a",
  site: "#4e456f",
} as const;

function project(lat: number, lng: number) {
  return { x: ((lng + 180) / 360) * 900, y: ((90 - lat) / 180) * 450 };
}

function StateMap({
  study,
  state,
  zoom,
  center,
  selected,
  onSelect,
}: {
  study: HistoricalCaseStudy;
  state: HistoricalState;
  zoom: number;
  center: { lat: number; lng: number };
  selected: string;
  onSelect: (feature: HistoricalFeature) => void;
}) {
  const features = state.featureIds
    .map((id) => study.features.find((item) => item.id === id)!)
    .filter(Boolean);
  const focus = project(center.lat, center.lng);
  const width = 900 / zoom;
  const height = 450 / zoom;
  const x = Math.max(0, Math.min(900 - width, focus.x - width / 2));
  const y = Math.max(0, Math.min(450 - height, focus.y - height / 2));
  return (
    <section className="historical-map-pane" aria-label={`${state.label} map`}>
      <header>
        <span>{state.label}</span>
        <strong>
          {state.year < 0 ? `${Math.abs(state.year)} BCE` : `${state.year} CE`}
        </strong>
      </header>
      <svg
        viewBox={`${x} ${y} ${width} ${height}`}
        role="img"
        aria-label={`${study.title}: ${state.label}`}
      >
        <rect width="900" height="450" fill="var(--map-water, #dce7e5)" />
        <path
          d="M80 90 L190 55 280 100 250 175 170 205 95 165ZM380 65 L520 55 620 120 585 225 470 250 385 175ZM610 250 L755 235 850 310 805 405 665 390 590 325Z"
          fill="var(--map-land, #ebe3cf)"
          stroke="var(--line)"
          strokeWidth="2"
        />
        {features.map((feature) => {
          const point = project(feature.lat, feature.lng);
          const radius = Math.max(7, feature.radius * 2.2);
          return (
            <g
              key={feature.id}
              className="historical-feature"
              onClick={() => onSelect(feature)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ")
                  onSelect(feature);
              }}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={radius}
                fill={layerColors[feature.layer]}
                fillOpacity={
                  feature.boundaryType === "well-documented" ? 0.78 : 0.42
                }
                stroke={
                  selected === feature.id ? "#111" : layerColors[feature.layer]
                }
                strokeWidth={selected === feature.id ? 4 : 2}
                strokeDasharray={
                  feature.boundaryType === "well-documented" ? undefined : "7 5"
                }
              />
              <text x={point.x} y={point.y - radius - 6} textAnchor="middle">
                {feature.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p>{state.summary}</p>
    </section>
  );
}

function FlowMap({ study }: { study: HistoricalCaseStudy }) {
  return (
    <section className="historical-map-pane" aria-label="Influence flow map">
      <header>
        <span>Mechanism-labeled influence flows</span>
        <strong>{study.scope}</strong>
      </header>
      <svg
        viewBox="250 40 430 330"
        role="img"
        aria-label={`${study.title} influence flows`}
      >
        <defs>
          <marker
            id={`flow-arrow-${study.id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#7d3f67" />
          </marker>
        </defs>
        <rect width="900" height="450" fill="var(--map-water, #dce7e5)" />
        <path
          d="M80 90 L190 55 280 100 250 175 170 205 95 165ZM380 65 L520 55 620 120 585 225 470 250 385 175ZM610 250 L755 235 850 310 805 405 665 390 590 325Z"
          fill="var(--map-land, #ebe3cf)"
          stroke="var(--line)"
          strokeWidth="2"
        />
        {study.flows.map((flow) => {
          const from = project(flow.from.lat, flow.from.lng);
          const to = project(flow.to.lat, flow.to.lng);
          return (
            <g key={flow.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#7d3f67"
                strokeWidth="4"
                strokeDasharray="8 5"
                markerEnd={`url(#flow-arrow-${study.id})`}
              />
              <circle cx={from.x} cy={from.y} r="7" fill="#7d3f67" />
              <circle cx={to.x} cy={to.y} r="7" fill="#7d3f67" />
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 10}
                textAnchor="middle"
              >
                {flow.mechanism}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

export function HistoricalChangeExplorer() {
  const [caseId, setCaseId] = useState(historicalCaseStudies[0].id);
  const study = historicalCaseStudies.find((item) => item.id === caseId)!;
  const [mode, setMode] = useState<"stages" | "compare" | "delta" | "flows">(
    "stages",
  );
  const [stage, setStage] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(2);
  const [zoom, setZoom] = useState(2.4);
  const [center, setCenter] = useState({ lat: 40, lng: 25 });
  const [selectedId, setSelectedId] = useState("");
  const selected =
    study.features.find((item) => item.id === selectedId) ?? null;
  const state = study.states[stage] ?? study.states[0];
  const relevantDeltas = study.deltas.filter(
    (item) =>
      item.fromStateId === study.states[left]?.id &&
      item.toStateId === study.states[right]?.id,
  );
  function chooseCase(next: string) {
    setCaseId(next);
    setStage(0);
    setLeft(0);
    setRight(2);
    setSelectedId("");
    setCenter(
      next === "safavid-shiism" ? { lat: 32, lng: 53 } : { lat: 50, lng: 11 },
    );
  }
  return (
    <section className="historical-change">
      <div className="historical-change-heading">
        <div>
          <span className="eyebrow">
            Place + time + power + religion + evidence
          </span>
          <h2>Show what changed</h2>
          <p>
            Compare independent historical states. Political control, religious
            presence, law, communities, and conflict remain separate layers.
          </p>
        </div>
        <label>
          Case study
          <select
            value={caseId}
            onChange={(event) => chooseCase(event.target.value)}
          >
            {historicalCaseStudies.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="notice">{study.caution}</p>
      <div className="chips" role="tablist" aria-label="Historical map modes">
        {(["stages", "compare", "delta", "flows"] as const).map((item) => (
          <button
            role="tab"
            aria-selected={mode === item}
            className={mode === item ? "selected" : ""}
            key={item}
            onClick={() => setMode(item)}
          >
            {item === "stages"
              ? "Transition stages"
              : item === "compare"
                ? "Side by side"
                : item === "delta"
                  ? "Delta only"
                  : "Influence flows"}
          </button>
        ))}
      </div>
      <div className="historical-map-controls">
        <label>
          Shared zoom
          <input
            type="range"
            min="1"
            max="5"
            step="0.2"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <label>
          Shared east / west
          <input
            aria-label="Shared east west pan"
            type="range"
            min="-120"
            max="120"
            value={center.lng}
            onChange={(event) =>
              setCenter({ ...center, lng: Number(event.target.value) })
            }
          />
        </label>
        <label>
          Shared north / south
          <input
            aria-label="Shared north south pan"
            type="range"
            min="-40"
            max="75"
            value={center.lat}
            onChange={(event) =>
              setCenter({ ...center, lat: Number(event.target.value) })
            }
          />
        </label>
      </div>
      {mode === "stages" && (
        <>
          <div className="historical-stage-strip">
            {study.states.map((item, index) => (
              <button
                key={item.id}
                className={stage === index ? "active" : ""}
                onClick={() => {
                  setStage(index);
                  setSelectedId("");
                }}
              >
                <span>{item.label}</span>
                <strong>{item.year}</strong>
              </button>
            ))}
          </div>
          <StateMap
            study={study}
            state={state}
            zoom={zoom}
            center={center}
            selected={selectedId}
            onSelect={(feature) => setSelectedId(feature.id)}
          />
        </>
      )}
      {(mode === "compare" || mode === "delta") && (
        <>
          <div className="historical-compare-selectors">
            <label>
              Before
              <select
                value={left}
                onChange={(event) => setLeft(Number(event.target.value))}
              >
                {study.states.map((item, index) => (
                  <option key={item.id} value={index}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              After
              <select
                value={right}
                onChange={(event) => setRight(Number(event.target.value))}
              >
                {study.states.map((item, index) => (
                  <option key={item.id} value={index}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {mode === "compare" && (
            <div className="historical-map-grid">
              <StateMap
                study={study}
                state={study.states[left]}
                zoom={zoom}
                center={center}
                selected={selectedId}
                onSelect={(feature) => setSelectedId(feature.id)}
              />
              <StateMap
                study={study}
                state={study.states[right]}
                zoom={zoom}
                center={center}
                selected={selectedId}
                onSelect={(feature) => setSelectedId(feature.id)}
              />
            </div>
          )}
          {mode === "delta" && (
            <div className="two-col">
              {relevantDeltas.length ? (
                relevantDeltas.map((delta) => (
                  <article className="panel" key={delta.id}>
                    <span className="eyebrow">
                      {delta.category} · {delta.confidence}
                    </span>
                    <p>{delta.summary}</p>
                  </article>
                ))
              ) : (
                <article className="panel">
                  <p>
                    No reviewed direct delta connects these two states. Atlas
                    does not interpolate the missing comparison.
                  </p>
                </article>
              )}
            </div>
          )}
        </>
      )}
      {mode === "flows" && (
        <>
          {study.flows.length > 0 && <FlowMap study={study} />}
          <div className="two-col">
            {study.flows.length ? (
              study.flows.map((flow) => (
                <article className="panel" key={flow.id}>
                  <span className="eyebrow">{flow.mechanism}</span>
                  <h3>{flow.label}</h3>
                  <p>
                    {flow.from.label} → {flow.to.label} · {flow.period}
                  </p>
                  <p>{flow.evidence}</p>
                  <p className="small muted">
                    Confidence: {flow.confidence}. The arrow identifies an
                    evidenced mechanism, not a precise journey or population
                    count.
                  </p>
                </article>
              ))
            ) : (
              <article className="panel">
                <h3>No reviewed influence flow</h3>
                <p>
                  The retained case sources support conflict and settlement
                  changes but not a responsibly drawable religious-influence
                  flow. Atlas leaves the layer empty.
                </p>
              </article>
            )}
          </div>
        </>
      )}
      {selected && (
        <aside className="panel historical-inspector">
          <span className="eyebrow">
            {selected.layer} · {selected.boundaryType} · {selected.confidence}
          </span>
          <h3>{selected.label}</h3>
          <p>{selected.summary}</p>
          {selected.sourceIds.map((id) => {
            const source = study.sources.find((item) => item.id === id)!;
            return (
              <p key={id}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title} <ExternalLink size={13} />
                </a>
                <br />
                <span className="small muted">
                  {source.institution} · {source.publication}. Limit:{" "}
                  {source.limitation}
                </span>
              </p>
            );
          })}
        </aside>
      )}
      <details className="panel">
        <summary>Sources and layer limits</summary>
        {study.sources.map((source) => (
          <p key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title} <ExternalLink size={13} />
            </a>
            <br />
            <span className="small muted">
              {source.institution} · {source.publication}. {source.limitation}
            </span>
          </p>
        ))}
      </details>
    </section>
  );
}
