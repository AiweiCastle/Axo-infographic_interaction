"use client";

import { useState } from "react";
import type { PrototypeSettings, SnapMode, EasingName } from "@/lib/types";
import { EASING_NAMES } from "@/lib/easings";
import styles from "./SettingsDrawer.module.css";

interface Props {
  settings: PrototypeSettings;
  update: <K extends keyof PrototypeSettings>(
    group: K,
    patch: Partial<PrototypeSettings[K]>,
  ) => void;
  reset: () => void;
  stateCount: number;
}

const SNAP_MODES: SnapMode[] = ["mandatory", "proximity", "none"];

export function SettingsDrawer({ settings, update, reset, stateCount }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open settings"
        aria-expanded={open}
      >
        <span className={styles.fabIcon} aria-hidden>
          {/* Gear icon */}
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.94 4.24-1.59-.92a7.62 7.62 0 0 0 0-3.64l1.59-.92a.75.75 0 0 0 .27-1.02l-1.5-2.6a.75.75 0 0 0-1.02-.27l-1.59.92a7.6 7.6 0 0 0-3.15-1.82V1.75A.75.75 0 0 0 13.2 1h-3a.75.75 0 0 0-.75.75v1.83A7.6 7.6 0 0 0 6.3 5.4l-1.59-.92a.75.75 0 0 0-1.02.27l-1.5 2.6a.75.75 0 0 0 .27 1.02l1.59.92a7.62 7.62 0 0 0 0 3.64l-1.59.92a.75.75 0 0 0-.27 1.02l1.5 2.6a.75.75 0 0 0 1.02.27l1.59-.92a7.6 7.6 0 0 0 3.15 1.82v1.83c0 .42.33.75.75.75h3c.41 0 .75-.33.75-.75v-1.83a7.6 7.6 0 0 0 3.15-1.82l1.59.92c.36.21.82.08 1.02-.27l1.5-2.6a.75.75 0 0 0-.27-1.02Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <button
          type="button"
          className={styles.scrim}
          onClick={() => setOpen(false)}
          aria-label="Close settings"
        />
      )}

      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-hidden={!open}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>Prototype settings</h3>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={reset}
              title="Reset to JSON config defaults"
            >
              Reset
            </button>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <Group label="Scroll">
            <Number
              label="Scroll distance per state (vh)"
              min={40}
              max={400}
              step={5}
              value={settings.scroll.distancePerStateVh}
              onChange={(v) => update("scroll", { distancePerStateVh: v })}
            />
            <Select<SnapMode>
              label="Snap mode"
              value={settings.scroll.snap}
              options={SNAP_MODES}
              onChange={(v) => update("scroll", { snap: v })}
            />
            <Range
              label="Advance threshold"
              min={0.05}
              max={0.95}
              step={0.05}
              value={settings.scroll.advanceThreshold}
              onChange={(v) => update("scroll", { advanceThreshold: v })}
            />
          </Group>

          <Group label="Layer motion">
            <Number
              label="Active raise (px)"
              min={0}
              max={120}
              step={1}
              value={settings.layer.activeRaisePx}
              onChange={(v) => update("layer", { activeRaisePx: v })}
            />
            <Number
              label="Drift per step (px)"
              min={0}
              max={120}
              step={1}
              value={settings.layer.driftPerStepPx}
              onChange={(v) => update("layer", { driftPerStepPx: v })}
            />
            <Number
              label="Fade start (steps after active)"
              min={0}
              max={5}
              step={1}
              value={settings.layer.fadeStartStep}
              onChange={(v) => update("layer", { fadeStartStep: v })}
            />
            <Number
              label="Fade end (steps after active)"
              min={0}
              max={6}
              step={1}
              value={settings.layer.fadeEndStep}
              onChange={(v) => update("layer", { fadeEndStep: v })}
            />
            <PercentRange
              label="Fade begin opacity (previous layer)"
              value={settings.layer.beginOpacity}
              onChange={(v) => update("layer", { beginOpacity: v })}
            />
            <PercentRange
              label="Final opacity (faded layers)"
              value={settings.layer.finalOpacity}
              onChange={(v) => update("layer", { finalOpacity: v })}
            />
            <Range
              label="Layer scale (proportional size)"
              min={0.5}
              max={1.6}
              step={0.02}
              value={settings.layer.layerScale}
              onChange={(v) => update("layer", { layerScale: v })}
            />
            <Number
              label="Transition (ms)"
              min={0}
              max={2000}
              step={20}
              value={settings.layer.transitionMs}
              onChange={(v) => update("layer", { transitionMs: v })}
            />
            <Select<EasingName>
              label="Easing"
              value={settings.layer.easing}
              options={EASING_NAMES}
              onChange={(v) => update("layer", { easing: v })}
            />
          </Group>

          <Group label="Caption">
            <Number
              label="Slide step (px)"
              min={100}
              max={600}
              step={5}
              value={settings.caption.slideStepPx}
              onChange={(v) => update("caption", { slideStepPx: v })}
            />
            <Number
              label="Transition (ms)"
              min={0}
              max={2000}
              step={20}
              value={settings.caption.transitionMs}
              onChange={(v) => update("caption", { transitionMs: v })}
            />
            <Select<EasingName>
              label="Easing"
              value={settings.caption.easing}
              options={EASING_NAMES}
              onChange={(v) => update("caption", { easing: v })}
            />
            <Toggle
              label="Cross-fade between captions"
              value={settings.caption.crossFade}
              onChange={(v) => update("caption", { crossFade: v })}
            />
          </Group>

          <Group label="Shadow">
            <Toggle
              label="Enabled"
              value={settings.shadow.enabled}
              onChange={(v) => update("shadow", { enabled: v })}
            />
            <Number
              label="Distance (px)"
              min={0}
              max={60}
              step={1}
              value={settings.shadow.distancePx}
              onChange={(v) => update("shadow", { distancePx: v })}
            />
            <Number
              label="Radius (px)"
              min={0}
              max={80}
              step={1}
              value={settings.shadow.radiusPx}
              onChange={(v) => update("shadow", { radiusPx: v })}
            />
            <PercentRange
              label="Opacity"
              value={settings.shadow.opacity}
              onChange={(v) => update("shadow", { opacity: v })}
            />
            <Select
              label="Blend mode"
              value={settings.shadow.blendMode}
              options={[
                "normal",
                "multiply",
                "overlay",
                "color-burn",
                "soft-light",
                "hard-light",
                "darken",
              ]}
              onChange={(v) => update("shadow", { blendMode: v })}
            />
          </Group>

          <Group label="Visual">
            <Number
              label="Canvas height (px)"
              min={140}
              max={500}
              step={4}
              value={settings.visual.canvasHeightPx}
              onChange={(v) => update("visual", { canvasHeightPx: v })}
            />
            <Number
              label="Stack vertical offset (px)"
              min={-80}
              max={80}
              step={2}
              value={settings.visual.stackOffsetPx}
              onChange={(v) => update("visual", { stackOffsetPx: v })}
            />
            <Number
              label="Badge number size (px)"
              min={6}
              max={32}
              step={1}
              value={settings.visual.badgeFontSizePx}
              onChange={(v) => update("visual", { badgeFontSizePx: v })}
            />
            <ColorInput
              label="Background"
              value={settings.visual.backgroundColor}
              onChange={(v) => update("visual", { backgroundColor: v })}
            />
            <ColorInput
              label="Accent (active badge)"
              value={settings.visual.accentColor}
              onChange={(v) => update("visual", { accentColor: v })}
            />
            <ColorInput
              label="Heading"
              value={settings.visual.headingColor}
              onChange={(v) => update("visual", { headingColor: v })}
            />
            <ColorInput
              label="Body"
              value={settings.visual.bodyColor}
              onChange={(v) => update("visual", { bodyColor: v })}
            />
          </Group>

          <Group label="Debug">
            <Toggle
              label="Show overlay"
              value={settings.debug.showOverlay}
              onChange={(v) => update("debug", { showOverlay: v })}
            />
            <Toggle
              label="Show layer outlines"
              value={settings.debug.showOutlines}
              onChange={(v) => update("debug", { showOutlines: v })}
            />
            <ForceState
              stateCount={stateCount}
              value={settings.debug.forceState}
              onChange={(v) => update("debug", { forceState: v })}
            />
          </Group>
        </div>
      </aside>
    </>
  );
}

/* ----- Small input primitives ----- */

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.group}>
      <h4 className={styles.groupTitle}>{label}</h4>
      <div className={styles.groupBody}>{children}</div>
    </section>
  );
}

function Number({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldRow}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={styles.range}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={styles.numInput}
        />
      </span>
    </label>
  );
}

function Range({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        <span className={styles.fieldValue}>{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={styles.range}
      />
    </label>
  );
}

function PercentRange({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  // Storage stays 0..1; UI shows 0..100 %.
  const pct = Math.round(value * 100);
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        <span className={styles.fieldValue}>{pct}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pct}
        onChange={(e) => onChange(parseFloat(e.target.value) / 100)}
        className={styles.range}
      />
    </label>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={styles.select}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`${styles.field} ${styles.toggleField}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.toggle}
      />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.colorRow}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorInput}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorText}
        />
      </span>
    </label>
  );
}

function ForceState({
  stateCount,
  value,
  onChange,
}: {
  stateCount: number;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>
        Force state
        <span className={styles.fieldValue}>
          {value === null ? "scroll-driven" : value}
        </span>
      </span>
      <div className={styles.forceRow}>
        <button
          type="button"
          className={`${styles.forceBtn} ${value === null ? styles.forceActive : ""}`}
          onClick={() => onChange(null)}
        >
          auto
        </button>
        {Array.from({ length: stateCount }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.forceBtn} ${value === i ? styles.forceActive : ""}`}
            onClick={() => onChange(i)}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
