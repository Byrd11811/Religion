"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenText, ChevronLeft, ChevronRight, MapPinOff } from "lucide-react";
import type { CurrentsRecord } from "./types";
import styles from "./SacredCurrents.module.css";

const PAGE_SIZE = 24;

interface Props {
  records: CurrentsRecord[];
  selectedIds: string[];
  onSelectRecord: (id: string) => void;
}

export function RecordDirectory({ records, selectedIds, onSelectRecord }: Props) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = useMemo(
    () => records.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [records, safePage],
  );

  useEffect(() => setPage(0), [records]);

  return (
    <details className={styles.recordDirectory} data-testid="currents-record-directory">
      <summary>
        <span>
          <BookOpenText size={17} aria-hidden="true" />
          Browse every record in this view
        </span>
        <strong>{records.length.toLocaleString()}</strong>
      </summary>
      <div className={styles.directoryBody}>
        <header>
          <div>
            <span className={styles.kicker}>Accessible catalog index</span>
            <h2>Dated, undated, mapped and unlocated records</h2>
          </div>
          <p>
            This list follows the active layers and filters. Missing dates and
            coordinates remain explicit and never receive invented positions.
          </p>
        </header>
        {visible.length ? (
          <ul className={styles.directoryList}>
            {visible.map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => onSelectRecord(record.id)}
                  aria-pressed={selectedIds.includes(record.id)}
                >
                  <span
                    className={styles.recordSwatch}
                    style={{ background: record.traditionColor }}
                    aria-hidden="true"
                  />
                  <span>
                    <strong>{record.title}</strong>
                    <small>
                      {record.kind} · {record.traditionName} · {record.dateLabel}
                    </small>
                  </span>
                  {!record.geography && (
                    <span className={styles.directoryMissing}>
                      <MapPinOff size={13} aria-hidden="true" /> Unlocated
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.directoryEmpty}>No records match the active scope.</p>
        )}
        {pageCount > 1 && (
          <nav className={styles.directoryPager} aria-label="Record index pages">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={safePage === 0}
            >
              <ChevronLeft size={15} aria-hidden="true" /> Previous
            </button>
            <span>
              Page {safePage + 1} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
              disabled={safePage === pageCount - 1}
            >
              Next <ChevronRight size={15} aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>
    </details>
  );
}
