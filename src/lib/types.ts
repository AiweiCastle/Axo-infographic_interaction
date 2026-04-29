export type EasingName =
  | "linear"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeOutQuart"
  | "easeOutExpo";

export type SnapMode = "mandatory" | "proximity" | "none";

export interface ScrollSettings {
  /** Scroll distance the user must travel to advance one state, in vh. */
  distancePerStateVh: number;
  snap: SnapMode;
  /** How far through a segment scroll must travel before the state advances.
   * 0.0 = advance instantly on any scroll past the boundary
   * 0.5 = advance at the midpoint
   * 1.0 = advance only when the next snap point is fully reached
   *
   * The visual is always at a discrete state — this controls "magnetism".
   */
  advanceThreshold: number;
}

export interface LayerSettings {
  activeRaisePx: number;
  driftPerStepPx: number;
  /** Step at which a previously-active layer starts fading. */
  fadeStartStep: number;
  /** Step at which it reaches finalOpacity. */
  fadeEndStep: number;
  /** 0..1 — opacity at the START of the fade (i.e. the "previous" layer right
   * after it stops being active). Lerps from this value to `finalOpacity`
   * across the fade window. UI displays this as 0..100%. */
  beginOpacity: number;
  /** 0..1 — opacity once a layer is fully faded. UI displays this as 0..100%. */
  finalOpacity: number;
  /** Proportional scale applied to each animated layer (1.0 = native size). */
  layerScale: number;
  transitionMs: number;
  easing: EasingName;
}

export interface CaptionSettings {
  slideStepPx: number;
  transitionMs: number;
  easing: EasingName;
  crossFade: boolean;
}

export type ShadowBlendMode =
  | "normal"
  | "multiply"
  | "overlay"
  | "color-burn"
  | "soft-light"
  | "hard-light"
  | "darken";

export interface ShadowSettings {
  enabled: boolean;
  /** Vertical offset of the shadow in px. */
  distancePx: number;
  /** Blur radius of the shadow in px. */
  radiusPx: number;
  /** 0..1 — shadow opacity. UI displays this as 0..100%. */
  opacity: number;
  /** CSS mix-blend-mode applied to the shadow element. */
  blendMode: ShadowBlendMode;
}

export interface VisualSettings {
  canvasHeightPx: number;
  stackOffsetPx: number;
  /** Font size (px) of the number inside each badge dot, all states. */
  badgeFontSizePx: number;
  backgroundColor: string;
  accentColor: string;
  headingColor: string;
  bodyColor: string;
}

export interface DebugSettings {
  showOverlay: boolean;
  showOutlines: boolean;
  /** When non-null, overrides the scroll-driven state. */
  forceState: number | null;
}

export interface PrototypeSettings {
  scroll: ScrollSettings;
  layer: LayerSettings;
  caption: CaptionSettings;
  shadow: ShadowSettings;
  visual: VisualSettings;
  debug: DebugSettings;
}

export interface LayerCopy {
  src: string;
  alt: string;
  title: string;
  desc: string;
}

export interface BaseAsset {
  src: string;
  alt: string;
}

export interface IntroCopy {
  title: string;
  desc: string;
}

export interface MattressConfig {
  intro: IntroCopy;
  base: BaseAsset;
  layers: LayerCopy[];
  totalBadges: number;
  defaults: PrototypeSettings;
}
