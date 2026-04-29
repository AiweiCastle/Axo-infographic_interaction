"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MattressConfig } from "@/lib/types";
import { FALLBACK_DEFAULTS } from "@/lib/defaults";
import { useScrollState } from "@/hooks/useScrollState";
import { useSettings } from "@/hooks/useSettings";
import { MattressStack } from "@/components/MattressStack";
import { BadgeRow } from "@/components/BadgeRow";
import { CaptionCarousel } from "@/components/CaptionCarousel";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { DebugOverlay } from "@/components/DebugOverlay";
import styles from "./page.module.css";

export default function Page() {
  const [config, setConfig] = useState<MattressConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // When a badge is tapped, the indicator jumps directly to that number
  // even though the underlying scroll-driven state animates through
  // intermediate values. Cleared once scroll catches up.
  const [pendingBadge, setPendingBadge] = useState<number | null>(null);

  // Load mattress.json once on mount.
  useEffect(() => {
    let alive = true;
    fetch("/config/mattress.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: MattressConfig) => {
        if (alive) setConfig(data);
      })
      .catch((err) => {
        if (alive) setConfigError(String(err?.message ?? err));
      });
    return () => {
      alive = false;
    };
  }, []);

  const jsonDefaults = config?.defaults ?? null;
  const { settings, update, reset, hydrated } = useSettings(jsonDefaults);

  const layerCount = config?.layers.length ?? 0;
  // States: 0 = intro/rest, 1..layerCount = layer N active.
  const stateCount = layerCount + 1;

  const scroll = useScrollState({
    stateCount,
    containerRef,
    sectionRef,
    advanceThreshold: settings.scroll.advanceThreshold,
    forceState: settings.debug.forceState,
  });

  const currentState = settings.debug.forceState ?? scroll.state;
  const scrollBadge = useMemo(() => {
    if (!config) return 0;
    return currentState === 0 ? 0 : Math.min(layerCount, currentState);
  }, [config, currentState, layerCount]);
  const activeBadge = pendingBadge ?? scrollBadge;

  // Clear the pending override once scroll-driven state matches the target.
  useEffect(() => {
    if (pendingBadge !== null && scrollBadge === pendingBadge) {
      setPendingBadge(null);
    }
  }, [pendingBadge, scrollBadge]);

  // Apply visual.background to scroll container via CSS variable
  const shellStyle = useMemo<React.CSSProperties>(
    () => ({
      ["--bg" as never]: settings.visual.backgroundColor,
    }),
    [settings.visual.backgroundColor],
  );

  if (configError) {
    return (
      <div className={styles.loadingOverlay}>
        <div>
          <strong>Failed to load /config/mattress.json:</strong>{" "}
          {configError}
        </div>
      </div>
    );
  }

  if (!config) {
    return <div className={styles.loadingOverlay}>Loading config…</div>;
  }

  // Snap points: one per state, spaced through the section
  const snapPositions = Array.from({ length: stateCount }, (_, i) =>
    stateCount > 1 ? (i / (stateCount - 1)) * 100 : 0,
  );

  return (
    <>
      <div
        ref={containerRef}
        className={styles.shell}
        style={shellStyle}
        data-snap={settings.scroll.snap === "none" ? undefined : settings.scroll.snap}
      >
        <section className={styles.intro}>
          <div className={styles.introInner}>
            <p className={styles.introKicker}>Castlery / Nectar</p>
            <h1 className={styles.introTitle}>The Comfort You Sleep On</h1>
            <p className={styles.introDesc}>
              Scroll to peel back each layer of the mattress and see what makes
              it work.
            </p>
            <span className={styles.introHint}>scroll</span>
          </div>
        </section>

        <section
          ref={sectionRef}
          className={styles.section}
          style={{
            height: `${
              settings.scroll.distancePerStateVh * Math.max(1, stateCount - 1)
            }vh`,
          }}
        >
          <div className={styles.snapPoints}>
            {snapPositions.map((pct, i) => (
              <div
                key={i}
                className={styles.snapPoint}
                style={{ top: `${pct}%` }}
                aria-hidden
              />
            ))}
          </div>
          <div className={styles.sticky}>
            <div className={styles.frame}>
              <div className={styles.headerStack}>
                <MattressStack
                  config={config}
                  settings={settings}
                  state={currentState}
                />
                <BadgeRow
                  totalBadges={config.totalBadges}
                  activeIndex={activeBadge}
                  accentColor={settings.visual.accentColor}
                  onSelect={(n) => {
                    const container = containerRef.current;
                    const section = sectionRef.current;
                    if (!container || !section) return;
                    if (settings.debug.forceState !== null) {
                      update("debug", { forceState: null });
                    }
                    setPendingBadge(n);
                    const segments = Math.max(stateCount - 1, 1);
                    const travel = Math.max(1, section.offsetHeight - container.clientHeight);
                    const target = section.offsetTop + (n / segments) * travel;
                    container.scrollTo({ top: target, behavior: "smooth" });
                  }}
                />
              </div>
              <CaptionCarousel
                intro={config.intro}
                layers={config.layers}
                state={currentState}
                settings={settings.caption}
                visual={settings.visual}
              />
            </div>
          </div>
        </section>

        <section className={styles.outro}>
          <div className={styles.outroInner}>
            <h2 className={styles.outroTitle}>Reliable comfort, layer by layer.</h2>
            <p className={styles.outroDesc}>
              Made with materials trusted by sleep researchers, backed by a
              100-night home trial.
            </p>
            <span className={styles.scrollUpHint}>↑ scroll back to replay</span>
          </div>
        </section>
      </div>

      {hydrated && (
        <SettingsDrawer
          settings={settings}
          update={update}
          reset={reset}
          stateCount={stateCount}
        />
      )}

      {settings.debug.showOverlay && (
        <DebugOverlay
          scroll={scroll}
          forced={settings.debug.forceState}
          stateCount={stateCount}
          onStep={(delta) => {
            const current = settings.debug.forceState ?? scroll.state;
            const next = Math.max(0, Math.min(stateCount - 1, current + delta));
            update("debug", { forceState: next });
          }}
          onForce={(s) => update("debug", { forceState: s })}
        />
      )}
    </>
  );
}

// Suppress unused-import warning for FALLBACK_DEFAULTS during dev
// (kept for clarity; uncomment if you want to inline-default without JSON fetch)
void FALLBACK_DEFAULTS;
