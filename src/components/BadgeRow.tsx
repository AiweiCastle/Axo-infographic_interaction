"use client";

import styles from "./BadgeRow.module.css";

interface Props {
  totalBadges: number;
  /** 0 = intro/none active, 1..N = layer N highlighted. */
  activeIndex: number;
  accentColor: string;
  fontSizePx?: number;
  onSelect?: (badgeNumber: number) => void;
}

export function BadgeRow({
  totalBadges,
  activeIndex,
  accentColor,
  fontSizePx,
  onSelect,
}: Props) {
  return (
    <div className={styles.row}>
      {Array.from({ length: totalBadges }, (_, i) => {
        const n = i + 1;
        const isActive = n === activeIndex;
        // Circle scales proportionally to font size (matches the original
        // 10px → 12px inactive / 16px active ratio).
        const circleSize =
          fontSizePx != null
            ? fontSizePx * (isActive ? 1.6 : 1.2)
            : undefined;
        const labelSize =
          fontSizePx != null ? fontSizePx * (isActive ? 1.1 : 1) : undefined;
        const buttonStyle: React.CSSProperties = {
          ...(isActive ? { backgroundColor: accentColor } : {}),
          ...(circleSize != null
            ? { width: circleSize, height: circleSize }
            : {}),
        };
        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect?.(n)}
            className={`${styles.badge} ${isActive ? styles.active : ""}`}
            style={buttonStyle}
            aria-label={`Layer ${n}${isActive ? " (current)" : ""}`}
            aria-pressed={isActive}
          >
            <span
              className={styles.label}
              style={labelSize != null ? { fontSize: labelSize } : undefined}
            >
              {n}
            </span>
          </button>
        );
      })}
    </div>
  );
}
