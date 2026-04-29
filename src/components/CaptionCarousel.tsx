"use client";

import { useMemo } from "react";
import type {
  CaptionSettings,
  IntroCopy,
  LayerCopy,
  VisualSettings,
} from "@/lib/types";
import styles from "./CaptionCarousel.module.css";

interface Props {
  intro: IntroCopy;
  layers: LayerCopy[];
  /** Discrete state — visual snaps to the corresponding caption slot. */
  state: number;
  settings: CaptionSettings;
  visual: VisualSettings;
}

/**
 * Horizontal slide carousel. Slot 0 = intro copy, slots 1..N = each layer's
 * title/desc. The strip translates by `state * slideStepPx` and CSS handles
 * the eased transition — no scroll-correlated interpolation.
 */
export function CaptionCarousel({
  intro,
  layers,
  state,
  settings,
  visual,
}: Props) {
  const slots = useMemo(
    () => [
      { title: intro.title, desc: intro.desc, isIntro: true },
      ...layers.map((l) => ({
        title: l.title,
        desc: l.desc,
        isIntro: false,
      })),
    ],
    [intro, layers],
  );

  const cssEasing = easingToCss(settings.easing);
  const translateX = -state * settings.slideStepPx;

  return (
    <div
      className={styles.viewport}
      style={
        {
          ["--caption-transition" as never]: `${settings.transitionMs}ms ${cssEasing}`,
        } as React.CSSProperties
      }
    >
      <div
        className={styles.strip}
        style={{
          transform: `translateX(${translateX}px)`,
          width: `${slots.length * settings.slideStepPx}px`,
        }}
      >
        {slots.map((slot, i) => {
          const isCurrent = i === state;
          const opacity = settings.crossFade ? (isCurrent ? 1 : 0) : 1;
          return (
            <div
              key={i}
              className={styles.slot}
              style={{
                width: `${settings.slideStepPx}px`,
                opacity,
              }}
              aria-hidden={!isCurrent}
            >
              <h2
                className={styles.title}
                style={{ color: visual.headingColor }}
              >
                {slot.isIntro ? (
                  slot.title
                ) : (
                  <>
                    <span className={styles.numeral}>{i}.</span> {slot.title}
                  </>
                )}
              </h2>
              <p className={styles.desc} style={{ color: visual.bodyColor }}>
                {slot.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function easingToCss(name: string): string {
  switch (name) {
    case "linear":
      return "linear";
    case "easeOutCubic":
      return "cubic-bezier(0.33, 1, 0.68, 1)";
    case "easeInOutCubic":
      return "cubic-bezier(0.65, 0, 0.35, 1)";
    case "easeOutQuart":
      return "cubic-bezier(0.25, 1, 0.5, 1)";
    case "easeOutExpo":
      return "cubic-bezier(0.16, 1, 0.3, 1)";
    default:
      return "ease-out";
  }
}
