"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PrototypeSettings } from "@/lib/types";
import { FALLBACK_DEFAULTS, STORAGE_KEY } from "@/lib/defaults";

/**
 * Deep-merge any saved overrides on top of the JSON-config defaults.
 * Settings panel writes to localStorage; "Reset" clears it.
 */
export function useSettings(jsonDefaults: PrototypeSettings | null) {
  const baseline = useMemo<PrototypeSettings>(
    () => jsonDefaults ?? FALLBACK_DEFAULTS,
    [jsonDefaults],
  );

  const [overrides, setOverrides] = useState<Partial<PrototypeSettings> | null>(
    null,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setOverrides(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const settings = useMemo<PrototypeSettings>(() => {
    if (!overrides) return baseline;
    return {
      scroll: { ...baseline.scroll, ...(overrides.scroll ?? {}) },
      layer: { ...baseline.layer, ...(overrides.layer ?? {}) },
      caption: { ...baseline.caption, ...(overrides.caption ?? {}) },
      shadow: { ...baseline.shadow, ...(overrides.shadow ?? {}) },
      visual: { ...baseline.visual, ...(overrides.visual ?? {}) },
      debug: { ...baseline.debug, ...(overrides.debug ?? {}) },
    };
  }, [baseline, overrides]);

  const update = useCallback(
    <K extends keyof PrototypeSettings>(
      group: K,
      patch: Partial<PrototypeSettings[K]>,
    ) => {
      setOverrides((prev) => {
        const next: Partial<PrototypeSettings> = { ...(prev ?? {}) };
        const existingGroup = (next[group] ?? {}) as Partial<
          PrototypeSettings[K]
        >;
        next[group] = { ...existingGroup, ...patch } as PrototypeSettings[K];
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setOverrides(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { settings, update, reset, hydrated };
}
