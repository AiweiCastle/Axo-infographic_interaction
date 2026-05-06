"use client";

import { useMemo } from "react";
import type { MattressConfig, PrototypeSettings } from "@/lib/types";
import { clamp, lerp } from "@/lib/easings";
import styles from "./MattressStack.module.css";

interface Props {
  config: MattressConfig;
  settings: PrototypeSettings;
  /** Discrete state: 0 = rest, 1 = layer 1 active, 2 = layer 2 active, etc. */
  state: number;
}

/**
 * Layer geometry mirrors the Figma frame 6:421 default state (Number=0):
 *   - Animate Layer canvas: 342×264.4
 *   - Base image:   left 22,    top 118,   w 304.5, h 135.5
 *   - Layer 4:      left 29,    top 86,    w 293.5, h 94    (Pocket spring)
 *   - Layer 3:      left 29.46, top 69.87, w 290.4, h 65.4  (Support memory foam)
 *   - Layer 2:      left 29.46, top 57.48, w 290.4, h 56.6  (Cooling memory gel)
 *   - Layer 1:      left 29.46, top 33.77, w 293.5, h 56.6  (TENCEL cover)
 *
 * Each layer's index in `config.layers` maps top-to-bottom: index 0 = topmost
 * (layer 1).
 *
 * Position math is purely state-driven — no scroll interpolation. Browser CSS
 * transitions on `transform` and `opacity` provide the smooth motion between
 * states; the easing/duration are configurable.
 */
const CANVAS_W = 342;
const CANVAS_H_DEFAULT = 264.4;
const LAYER_GEOM = [
  { left: 29.46, top: 33.77, width: 293.5, height: 56.6 }, // layer 1 (top)
  { left: 29.46, top: 57.48, width: 290.4, height: 56.6 }, // layer 2
  { left: 29.46, top: 69.87, width: 290.4, height: 65.4 }, // layer 3
  { left: 29.0, top: 86.0, width: 293.5, height: 94.0 }, // layer 4 (NEW)
];
const BASE_GEOM = { left: 22.0, top: 118.0, width: 304.5, height: 135.5 };

export function MattressStack({ config, settings, state }: Props) {
  const layerCount = config.layers.length;
  const scale = settings.visual.canvasHeightPx / CANVAS_H_DEFAULT;
  const canvasW = CANVAS_W * scale;
  const canvasH = settings.visual.canvasHeightPx;

  const transitionMs = settings.layer.transitionMs;
  const cssEasing = easingToCss(settings.layer.easing);

  const layerStyles = useMemo(() => {
    return config.layers.map((_, i) => {
      // Layer i becomes "active" at state (i+1).
      const stepsSinceActive = state - (i + 1);
      let translateY = 0;
      let opacity = 1;
      if (stepsSinceActive < 0) {
        // Hasn't been activated yet — at rest.
        translateY = 0;
        opacity = 1;
      } else {
        // Active or already-active layers: raise by one fixed amount,
        // then drift further up for each subsequent state.
        translateY =
          -settings.layer.activeRaisePx -
          settings.layer.driftPerStepPx * stepsSinceActive;
        // Fade based on how many states ago this layer was active.
        // The fade lerps from `beginOpacity` at fadeStartStep down to
        // `finalOpacity` at fadeEndStep. Steps before fadeStartStep stay at 1.
        const { fadeStartStep, fadeEndStep, beginOpacity, finalOpacity } =
          settings.layer;
        if (stepsSinceActive < fadeStartStep) {
          opacity = 1;
        } else if (stepsSinceActive >= fadeEndStep) {
          opacity = finalOpacity;
        } else {
          const range = Math.max(0.0001, fadeEndStep - fadeStartStep);
          const k = (stepsSinceActive - fadeStartStep) / range;
          opacity = lerp(beginOpacity, finalOpacity, k);
        }
      }
      return {
        translateY,
        opacity: clamp(opacity, 0, 1),
      };
    });
  }, [state, config.layers, settings.layer]);

  const containerStyle: React.CSSProperties = {
    width: canvasW,
    height: canvasH,
    transform: `translateY(${settings.visual.stackOffsetPx}px)`,
  };

  return (
    <div
      className={styles.canvas}
      style={containerStyle}
      data-debug-outline={settings.debug.showOutlines || undefined}
    >
      {/* Base mattress (always at rest). Single self-contained asset from
          Figma — fills the geometry box directly. */}
      <div
        className={styles.layer}
        style={{
          left: BASE_GEOM.left * scale,
          top: BASE_GEOM.top * scale,
          width: BASE_GEOM.width * scale,
          height: BASE_GEOM.height * scale,
        }}
        data-role="base"
      >
        <img
          src={config.base.src}
          alt={config.base.alt}
          draggable={false}
          className={styles.img}
        />
      </div>

      {/* Layers — render bottom-to-top so layer 1 paints on top */}
      {config.layers.map((layer, i) => {
        const geom = LAYER_GEOM[i] ?? LAYER_GEOM[LAYER_GEOM.length - 1];
        const ls = layerStyles[i];
        // Shadow only on layers still resting in the stack (not yet activated).
        const isResting = state - (i + 1) < 0;
        const sh = settings.shadow;
        // Apply layerScale around each layer's center so growing/shrinking
        // doesn't shift the layer off its anchor.
        const ls_scale = settings.layer.layerScale;
        const scaledW = geom.width * scale * ls_scale;
        const scaledH = geom.height * scale * ls_scale;
        const centerX = (geom.left + geom.width / 2) * scale;
        const centerY = (geom.top + geom.height / 2) * scale;
        const layerLeft = centerX - scaledW / 2;
        const layerTop = centerY - scaledH / 2;
        const shadowVisible = sh.enabled && isResting;
        return (
          <div key={i} style={{ display: "contents" }}>
            {/* Shadow: black silhouette clone of the layer img, blurred and
                offset, blended with color-burn against what's behind it. */}
            <img
              src={layer.src}
              aria-hidden
              draggable={false}
              className={styles.img}
              style={{
                position: "absolute",
                left: layerLeft,
                top: layerTop,
                width: scaledW,
                height: scaledH,
                transform: `translateY(${ls.translateY * scale + sh.distancePx}px)`,
                filter: `brightness(0) blur(${sh.radiusPx / 2}px)`,
                opacity: shadowVisible ? sh.opacity * ls.opacity : 0,
                mixBlendMode: sh.blendMode,
                transition: `transform ${transitionMs}ms ${cssEasing}, opacity ${transitionMs}ms ${cssEasing}`,
                zIndex: 10 + 2 * (layerCount - i) - 1,
                pointerEvents: "none",
              }}
            />
            <div
              className={styles.layer}
              style={{
                left: layerLeft,
                top: layerTop,
                width: scaledW,
                height: scaledH,
                transform: `translateY(${ls.translateY * scale}px)`,
                opacity: ls.opacity,
                transition: `transform ${transitionMs}ms ${cssEasing}, opacity ${transitionMs}ms ${cssEasing}`,
                zIndex: 10 + 2 * (layerCount - i),
              }}
              data-role={`layer-${i + 1}`}
            >
              <img
                src={layer.src}
                alt={layer.alt}
                draggable={false}
                className={styles.img}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Map our easing names to CSS timing functions. */
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
