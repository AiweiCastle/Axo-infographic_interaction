import type { EasingName } from "./types";

export type Easing = (t: number) => number;

const linear: Easing = (t) => t;
const easeOutCubic: Easing = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic: Easing = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuart: Easing = (t) => 1 - Math.pow(1 - t, 4);
const easeOutExpo: Easing = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const EASINGS: Record<EasingName, Easing> = {
  linear,
  easeOutCubic,
  easeInOutCubic,
  easeOutQuart,
  easeOutExpo,
};

export const EASING_NAMES: EasingName[] = [
  "linear",
  "easeOutCubic",
  "easeInOutCubic",
  "easeOutQuart",
  "easeOutExpo",
];

export function applyEasing(name: EasingName, t: number): number {
  const fn = EASINGS[name] ?? linear;
  return fn(Math.max(0, Math.min(1, t)));
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
