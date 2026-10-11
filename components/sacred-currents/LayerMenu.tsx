"use client";

import { Check, Layers3, LockKeyhole, MapPinned } from "lucide-react";
import styles from "./SacredCurrents.module.css";
import { layerLabels, type CurrentsLayer } from "./types";
import type { SacredCurrentsEvidenceState } from "@/packages/shared/sacred-currents";

export type GeographyScope = "all" | "mapped" | "unlocated";

interface FilterOption {
  id: string;
  label: string;
}

interface Props {
  layers: Set<CurrentsLayer>;
  counts: Record<CurrentsLayer, number>;
  geography: GeographyScope;
  includeUndated: boolean;
  traditionId: string;
  region: string;
  evidenceState: SacredCurrentsEvidenceState | "";
  withTextOnly: boolean;
  withImagesOnly: boolean;
  traditionOptions: FilterOption[];
  regionOptions: FilterOption[];
  onToggleLayer: (layer: CurrentsLayer) => void;
  onGeographyChange: (value: GeographyScope) => void;
  onIncludeUndatedChange: (value: boolean) => void;
  onTraditionChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onEvidenceStateChange: (value: SacredCurrentsEvidenceState | "") => void;
  onWithTextOnlyChange: (value: boolean) => void;
  onWithImagesOnlyChange: (value: boolean) => void;
}

const layerOrder: CurrentsLayer[] = ["work", "witness", "artifact", "tradition"];
const evidenceOptions: { id: SacredCurrentsEvidenceState; label: string }[] = [
  { id: "documented", label: "Documented" },
  { id: "strong", label: "Strong" },
  { id: "qualified", label: "Qualified" },
  { id: "provisional", label: "Provisional" },
  { id: "unreviewed", label: "Unreviewed" },
  { id: "unavailable", label: "Unavailable" },
];

export function LayerMenu({
  layers,
  counts,
  geography,
  includeUndated,
  traditionId,
  region,
  evidenceState,
  withTextOnly,
  withImagesOnly,
  traditionOptions,
  regionOptions,
  onToggleLayer,
  onGeographyChange,
  onIncludeUndatedChange,
  onTraditionChange,
  onRegionChange,
  onEvidenceStateChange,
  onWithTextOnlyChange,
  onWithImagesOnlyChange,
}: Props) {
  return (
    <details className={styles.layerMenu} data-testid="currents-layers">
      <summary>
        <Layers3 size={16} aria-hidden="true" />
        Layers
        <span>{layers.size} active</span>
      </summary>
      <div className={styles.layerPopover}>
        <div className={styles.layerHeader}>
          <div>
            <span className={styles.kicker}>Evidence layers</span>
            <h3>Choose what appears</h3>
          </div>
          <MapPinned size={20} aria-hidden="true" />
        </div>
        <div className={styles.layerChoices}>
          {layerOrder.map((layer) => {
            const active = layers.has(layer);
            return (
              <button
                type="button"
                key={layer}
                className={active ? styles.layerActive : undefined}
                onClick={() => onToggleLayer(layer)}
                aria-pressed={active}
              >
                <span className={styles.layerCheck} aria-hidden="true">
                  {active && <Check size={13} />}
                </span>
                <span>
                  <strong>{layerLabels[layer]}</strong>
                  <small>{counts[layer].toLocaleString()} catalog records</small>
                </span>
              </button>
            );
          })}
        </div>
        <div className={styles.layerFilters}>
          <label>
            <span>Community / grouping</span>
            <select
              aria-label="Sacred Currents tradition"
              value={traditionId}
              onChange={(event) => onTraditionChange(event.target.value)}
            >
              <option value="">All groupings</option>
              {traditionOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Region / repository</span>
            <select
              aria-label="Sacred Currents region"
              value={region}
              onChange={(event) => onRegionChange(event.target.value)}
            >
              <option value="">All regions / repositories</option>
              {regionOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Geographic evidence</span>
            <select
              aria-label="Sacred Currents geographic evidence"
              value={geography}
              onChange={(event) => onGeographyChange(event.target.value as GeographyScope)}
            >
              <option value="all">All evidence states</option>
              <option value="mapped">Approximate editorial anchors</option>
              <option value="unlocated">Coordinates unavailable</option>
            </select>
          </label>
          <label>
            <span>Date evidence</span>
            <select
              aria-label="Sacred Currents date evidence"
              value={evidenceState}
              onChange={(event) =>
                onEvidenceStateChange(event.target.value as SacredCurrentsEvidenceState | "")
              }
            >
              <option value="">All evidence states</option>
              {evidenceOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.layerToggles}>
          <label>
            <input
              type="checkbox"
              checked={includeUndated}
              onChange={(event) =>
                onIncludeUndatedChange(event.target.checked)
              }
            />
            <span>
              <strong>Include undated records</strong>
              <small>Keep them visible without putting them on the river</small>
            </span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={withTextOnly}
              onChange={(event) => onWithTextOnlyChange(event.target.checked)}
            />
            <span>
              <strong>Source edition available</strong>
              <small>Show records with searchable source coverage</small>
            </span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={withImagesOnly}
              onChange={(event) => onWithImagesOnlyChange(event.target.checked)}
            />
            <span>
              <strong>Image association available</strong>
              <small>Show records linked to reviewed image metadata</small>
            </span>
          </label>
        </div>
        <div className={styles.unavailableLayers}>
          <span className={styles.kicker}>Awaiting reviewed data</span>
          <button type="button" disabled title="No reviewed border dataset">
            <LockKeyhole size={14} aria-hidden="true" /> Historical borders
          </button>
          <button type="button" disabled title="No reviewed route dataset">
            <LockKeyhole size={14} aria-hidden="true" /> Transmission routes
          </button>
          <button
            type="button"
            disabled
            title="Repository place names have not been geocoded"
          >
            <LockKeyhole size={14} aria-hidden="true" /> Repository points
          </button>
        </div>
      </div>
    </details>
  );
}
