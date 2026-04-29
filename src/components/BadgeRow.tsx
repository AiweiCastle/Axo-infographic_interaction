"use client";

import styles from "./BadgeRow.module.css";

interface Props {
  totalBadges: number;
  /** 0 = intro/none active, 1..N = layer N highlighted. */
  activeIndex: number;
  accentColor: string;
  onSelect?: (badgeNumber: number) => void;
}

export function BadgeRow({
  totalBadges,
  activeIndex,
  accentColor,
  onSelect,
}: Props) {
  return (
    <div className={styles.row}>
      {Array.from({ length: totalBadges }, (_, i) => {
        const n = i + 1;
        const isActive = n === activeIndex;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect?.(n)}
            className={`${styles.badge} ${isActive ? styles.active : ""}`}
            style={isActive ? { backgroundColor: accentColor } : undefined}
            aria-label={`Layer ${n}${isActive ? " (current)" : ""}`}
            aria-pressed={isActive}
          >
            <span className={styles.label}>{n}</span>
          </button>
        );
      })}
    </div>
  );
}
