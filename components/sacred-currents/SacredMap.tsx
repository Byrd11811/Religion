"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, Map as MapIcon, MapPinOff } from "lucide-react";
import { leafletProvider } from "@/packages/maps/leaflet";
import type { MapHandle, MapProvider } from "@/packages/maps/provider";
import type { ExplorationRecord } from "@/packages/shared/exploration";
import type {
  SacredCurrentsAnchor,
  SacredCurrentsRecord,
} from "@/packages/shared/sacred-currents";
import styles from "./SacredCurrents.module.css";

interface Props {
  anchors: SacredCurrentsAnchor[];
  records: SacredCurrentsRecord[];
  selectedIds: string[];
  onSelectRecords: (ids: string[]) => void;
  provider?: MapProvider;
}

export function SacredMap({
  anchors,
  records,
  selectedIds,
  onSelectRecords,
  provider = leafletProvider,
}: Props) {
  const element = useRef<HTMLDivElement>(null);
  const handleRef = useRef<MapHandle | null>(null);
  const callbackRef = useRef(onSelectRecords);
  const currentRecordsRef = useRef<ExplorationRecord[]>([]);
  const [mapError, setMapError] = useState("");
  const [mapGeneration, setMapGeneration] = useState(0);
  const mapRecords = useMemo<ExplorationRecord[]>(
    () =>
      records.flatMap((record) => {
        if (!record.geography) return [];
        return [
          {
            id: record.id,
            kind: record.kind,
            title: record.title,
            href: record.href,
            traditionIds: record.traditionId ? [record.traditionId] : [],
            region: record.region,
            startDate: record.startYear,
            endDate: record.endYear,
            dateNotes: record.dateNote,
            lat: record.geography.lat,
            lng: record.geography.lng,
            locationType:
              record.kind === "work" ? "Work origin" : "Repository location",
            precision: "Approximate editorial anchor",
            context: record.description,
            sources: [...record.sourceUrls, ...record.sourceNotes],
            fullText: record.hasText,
            images: record.hasImage,
          } satisfies ExplorationRecord,
        ];
      }),
    [records],
  );
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    callbackRef.current = onSelectRecords;
  }, [onSelectRecords]);

  useEffect(() => {
    currentRecordsRef.current = mapRecords;
    handleRef.current?.update(mapRecords);
  }, [mapRecords]);

  useEffect(() => {
    let stopped = false;
    const controller = new AbortController();
    let ownedHandle: MapHandle | null = null;
    setMapError("");
    if (element.current) {
      provider
        .create(
          element.current,
          (rows) => callbackRef.current(rows.map(({ id }) => id)),
          (message) => {
            if (!stopped) setMapError(message);
          },
          controller.signal,
        )
        .then((handle) => {
          if (stopped) {
            handle.destroy();
            return;
          }
          ownedHandle = handle;
          handleRef.current = handle;
          handle.update(currentRecordsRef.current);
        })
        .catch(() => {
          if (!stopped) {
            setMapError(
              "Map unavailable. All records remain accessible in the anchor list below.",
            );
          }
        });
    }
    return () => {
      stopped = true;
      controller.abort();
      ownedHandle?.destroy();
      handleRef.current = null;
    };
  }, [mapGeneration, provider]);

  const focusWorld = () => setMapGeneration((generation) => generation + 1);

  return (
    <section className={styles.mapPanel} aria-labelledby="currents-map-title">
      <header className={styles.panelHeader}>
        <div>
          <span className={styles.kicker}>Geographic lens</span>
          <h2 id="currents-map-title">Evidence anchors</h2>
        </div>
        <button
          type="button"
          className={styles.iconButton}
          onClick={focusWorld}
          aria-label="Reset world map view"
          title="Reset world map view"
        >
          <LocateFixed size={17} aria-hidden="true" />
        </button>
      </header>
      <div className={styles.mapFrame}>
        <div
          ref={element}
          className={styles.mapCanvas}
          aria-label="Interactive world map of approximate editorial anchors"
        />
        <div className={styles.mapCornerNote}>
          <MapIcon size={14} aria-hidden="true" />
          Modern base map · historical borders unavailable
        </div>
        {mapError && (
          <div className={styles.mapError} role="status">
            <MapPinOff size={17} aria-hidden="true" />
            {mapError}
          </div>
        )}
      </div>
      <div className={styles.mapLegend}>
        <span><i className={styles.markerDot} />Approximate work anchor</span>
        <span><i className={styles.markerCluster}>3</i>Coincident records</span>
        <span><i className={styles.markerMissing} />Missing coordinates stay listed</span>
      </div>
      <details className={styles.anchorNavigator}>
        <summary>Keyboard anchor list ({anchors.length})</summary>
        <div>
          {anchors.map((anchor) => (
            <button
              type="button"
              key={anchor.id}
              onClick={() => onSelectRecords(anchor.recordIds)}
              aria-pressed={anchor.recordIds.some((id) => selected.has(id))}
            >
              <span>{anchor.label}</span>
              <small>{anchor.recordIds.length} record{anchor.recordIds.length === 1 ? "" : "s"}</small>
            </button>
          ))}
        </div>
      </details>
    </section>
  );
}
