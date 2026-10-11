import { CircleAlert, Database, MapPinOff } from "lucide-react";
import styles from "./SacredCurrents.module.css";
import type { CurrentsLayer } from "./types";

interface Props {
  total: number;
  visible: number;
  dated: number;
  mapped: number;
  unlocated: number;
  undated: number;
  byKind: Record<CurrentsLayer, number>;
}

function percent(part: number, whole: number) {
  return whole ? Math.max(2, Math.round((part / whole) * 100)) : 0;
}

export function CoveragePanel({
  total,
  visible,
  dated,
  mapped,
  unlocated,
  undated,
  byKind,
}: Props) {
  return (
    <details className={styles.coverage} data-testid="currents-coverage">
      <summary>
        <Database size={16} aria-hidden="true" />
        Coverage
        <span>{mapped} mapped records</span>
      </summary>
      <div className={styles.coverageBody}>
        <div className={styles.coverageTitle}>
          <div>
            <span className={styles.kicker}>What the view can support</span>
            <h3>Coverage, including the gaps</h3>
          </div>
          <CircleAlert size={20} aria-hidden="true" />
        </div>
        <p>
          The map shows reviewed approximate anchors. The river positions only
          dated catalog records. Missing evidence stays counted instead of
          being estimated.
        </p>
        <div className={styles.coverageStats}>
          <div>
            <strong>{visible.toLocaleString()}</strong>
            <span>visible of {total.toLocaleString()}</span>
          </div>
          <div>
            <strong>{dated.toLocaleString()}</strong>
            <span>dated</span>
          </div>
          <div>
            <strong>{mapped.toLocaleString()}</strong>
            <span>mapped</span>
          </div>
        </div>
        <div className={styles.coverageBars}>
          <div>
            <span>
              <b>Chronology</b>
              <small>{dated} dated · {undated} undated</small>
            </span>
            <i aria-hidden="true">
              <b style={{ width: `${percent(dated, total)}%` }} />
            </i>
          </div>
          <div>
            <span>
              <b>Geography</b>
              <small>{mapped} mapped · {unlocated} unlocated</small>
            </span>
            <i aria-hidden="true">
              <b style={{ width: `${percent(mapped, total)}%` }} />
            </i>
          </div>
        </div>
        <dl className={styles.kindCounts}>
          <div><dt>Works</dt><dd>{byKind.work}</dd></div>
          <div><dt>Witnesses</dt><dd>{byKind.witness}</dd></div>
          <div><dt>Artifacts</dt><dd>{byKind.artifact}</dd></div>
          <div><dt>Tradition groupings</dt><dd>{byKind.tradition}</dd></div>
        </dl>
        <div className={styles.gapNotice}>
          <MapPinOff size={17} aria-hidden="true" />
          <p>
            No historical borders, population estimates, or movement paths are
            inferred. Repository names without reviewed coordinates remain in
            the evidence drawer.
          </p>
        </div>
      </div>
    </details>
  );
}
