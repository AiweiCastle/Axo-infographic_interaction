import type { PrototypeSettings } from "./types";

/**
 * Hard-coded fallback used if /config/mattress.json fails to load.
 * Keep in sync with the `defaults` block of public/config/mattress.json.
 */
export const FALLBACK_DEFAULTS: PrototypeSettings = {
  scroll: {
    distancePerStateVh: 110,
    snap: "none",
    advanceThreshold: 0.5,
  },
  layer: {
    activeRaisePx: 34,
    driftPerStepPx: 25,
    fadeStartStep: 1,
    fadeEndStep: 2,
    beginOpacity: 0.1,
    finalOpacity: 0,
    layerScale: 1,
    transitionMs: 320,
    easing: "easeOutCubic",
  },
  caption: {
    slideStepPx: 335,
    transitionMs: 360,
    easing: "easeOutCubic",
    crossFade: true,
  },
  shadow: {
    enabled: true,
    distancePx: 6,
    radiusPx: 12,
    opacity: 0.25,
    blendMode: "color-burn",
  },
  visual: {
    canvasHeightPx: 264,
    stackOffsetPx: 0,
    badgeFontSizePx: 14,
    backgroundColor: "#FBF9F4",
    accentColor: "#844025",
    headingColor: "#3C101E",
    bodyColor: "#7C5F68",
  },
  debug: {
    showOverlay: false,
    showOutlines: false,
    forceState: null,
  },
};

export const STORAGE_KEY = "mattress-prototype:settings:v1";
