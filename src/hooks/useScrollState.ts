"use client";

import { useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/easings";

interface Args {
  /** Total number of states (e.g. 4 means states 0..3). */
  stateCount: number;
  /** Ref to the scroll-snap container that holds the section. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Ref to the tall section whose scroll progress drives the animation. */
  sectionRef: React.RefObject<HTMLElement | null>;
  /** How far through a segment scroll must travel before the state advances. */
  advanceThreshold: number;
  /** When non-null, force this state regardless of scroll. */
  forceState: number | null;
}

export interface ScrollState {
  /** Discrete state. Visual always sits at one of these — never in between. */
  state: number;
  /** Raw 0..1 progress through the animation track (for debug only). */
  raw: number;
}

/**
 * Reads scroll position and produces a *discrete* state. The visual is always
 * at one of the integer states — there is no continuous interpolation. As
 * scroll crosses `advanceThreshold` of a segment, the state flips and CSS
 * transitions on the layer/caption elements ease the visual to its new spot.
 *
 * Symmetric hysteresis is applied so the user can't oscillate between states
 * by jiggling scroll near a boundary: once advanced, you must scroll back past
 * `(1 - advanceThreshold)` of the previous segment to retreat.
 */
export function useScrollState({
  stateCount,
  containerRef,
  sectionRef,
  advanceThreshold,
  forceState,
}: Args): ScrollState {
  const [state, setState] = useState(0);
  const [raw, setRaw] = useState(0);
  const stateRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (forceState !== null && forceState !== undefined) {
      stateRef.current = forceState;
      setState(forceState);
      setRaw(stateCount > 1 ? forceState / (stateCount - 1) : 0);
      return;
    }

    const compute = () => {
      const container = containerRef.current;
      const section = sectionRef.current;
      if (!container || !section) return;

      const containerScroll = container.scrollTop;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const viewportH = container.clientHeight;
      const travel = Math.max(1, sectionHeight - viewportH);
      const rawNow = clamp(
        (containerScroll - sectionTop) / travel,
        0,
        1,
      );

      const segments = Math.max(stateCount - 1, 1);
      const continuous = rawNow * segments; // 0..segments
      const segIndex = Math.min(Math.floor(continuous), segments - 1);
      const frac = continuous - segIndex;

      const upBoundary = clamp(advanceThreshold, 0, 1);
      const downBoundary = clamp(1 - advanceThreshold, 0, 1);

      const last = stateRef.current;
      let next = last;

      // Going forward (segIndex >= last): advance when frac crosses upBoundary
      // Going backward (segIndex < last): retreat when frac drops past downBoundary
      const idealForward = segIndex + (frac >= upBoundary ? 1 : 0);
      const idealBackward = segIndex + (frac > downBoundary ? 1 : 0);

      if (idealForward > last) {
        next = Math.min(idealForward, segments);
      } else if (idealBackward < last) {
        next = Math.max(idealBackward, 0);
      }

      // If user has scrolled multiple segments at once (e.g. flick), allow
      // skipping past the immediate neighbour rather than getting stuck.
      const hardSnap = Math.min(Math.max(Math.round(continuous), 0), segments);
      if (Math.abs(hardSnap - last) >= 2) {
        next = hardSnap;
      }

      if (next !== last) {
        stateRef.current = next;
        setState(next);
      }
      setRaw(rawNow);
    };

    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };

    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [containerRef, sectionRef, stateCount, advanceThreshold, forceState]);

  return { state, raw };
}
