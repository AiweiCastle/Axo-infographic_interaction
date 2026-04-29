import type { PrototypeSettings } from "./types";

/**
 * Hard-coded fallback used if /config/mattress.json fails to load.
 * Keep in sync with the `defaults` block of public/config/mattress.json.
 */
export const FALLBACK_DEFAULTS: PrototypeSettings = {
  scroll: {
    distancePerStateVh: 130,
    snap: "mandatory",
    advanceThreshold: 0.5,
  },
  layer: {
    activeRaisePx: 34,
    driftPerStepPx: 24,
    fadeStartStep: 1,
    fadeEndStep: 2,
    beginOpacity: 1,
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
  visual: {
    canvasHeightPx: 264,
    stackOffsetPx: 0,
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
