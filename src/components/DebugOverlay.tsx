"use client";

import styles from "./DebugOverlay.module.css";
import type { ScrollState } from "@/hooks/useScrollState";

interface Props {
  scroll: ScrollState;
  forced: number | null;
  stateCount: number;
  onStep: (delta: number) => void;
  onForce: (state: number | null) => void;
}

export function DebugOverlay({
  scroll,
  forced,
  stateCount,
  onStep,
  onForce,
}: Props) {
  return (
    <div className={styles.overlay} aria-live="polite">
      <div className={styles.line}>
        <span>raw</span>
        <strong>{scroll.raw.toFixed(3)}</strong>
      </div>
      <div className={styles.line}>
        <span>state</span>
        <strong>{forced ?? scroll.state}</strong>
      </div>
      <div className={styles.controls}>
        <button onClick={() => onStep(-1)}>-1</button>
        <button onClick={() => onStep(+1)}>+1</button>
        <button onClick={() => onForce(null)} disabled={forced === null}>
          release
        </button>
      </div>
      <div className={styles.dots}>
        {Array.from({ length: stateCount }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot} ${
              (forced ?? scroll.state) === i ? styles.dotActive : ""
            }`}
            onClick={() => onForce(i)}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
