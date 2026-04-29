# Claude handoff — Mattress Layer Prototype

This file is for the next Claude session that picks up this project. Read it
end-to-end before doing anything.

---

## What this project is

A mobile-first, scroll-driven prototype that animates 3 mattress layers
sequentially as the user scrolls. Mirrors the Figma frame "Mattress Layer"
(`https://www.figma.com/design/iCBP4hEcyTj3wzXdGoY5W5/Claude-Space?node-id=6-420`).
States 0 → 3, where state 0 is rest and states 1..3 each raise+activate one
layer while previous layers drift up and fade.

**Critical design constraint: discrete state machine, not continuous
interpolation.** The visual is *always* at one of the integer states — there
are no in-between positions during scroll. As scroll crosses
`advanceThreshold` of a segment, the state flips and CSS transitions on layer
elements ease the visual to its new spot. Hysteresis prevents flicker around
boundaries.

---

## Tech stack

- Next.js 14 (App Router) + TypeScript
- CSS Modules (no Tailwind, no styled-components)
- No state library — `useState` + a small `useSettings` hook backed by `localStorage`
- Asset replacement via `public/config/mattress.json` (no rebuild needed)

Run the dev server: `npm run dev` then open `http://localhost:3000` (or
`http://<lan-ip>:3000` from a phone on the same Wi-Fi).

Typecheck: `npx tsc --noEmit`.

---

## File layout

```
mattress-prototype/
├── public/
│   ├── assets/{base,layer-1,layer-2,layer-3}.png   ← Figma exports
│   └── config/mattress.json                         ← assets paths, copy, default settings
└── src/
    ├── app/
    │   ├── page.tsx                                 ← scroll container + sections
    │   ├── page.module.css
    │   ├── layout.tsx, globals.css
    ├── components/
    │   ├── MattressStack.tsx       ← layer geometry + per-state position math
    │   ├── BadgeRow.tsx            ← 1..N badge dots
    │   ├── CaptionCarousel.tsx     ← horizontal sliding caption strip
    │   ├── SettingsDrawer.tsx      ← gear-icon settings panel
    │   └── DebugOverlay.tsx        ← floating debug panel (state, +/- step, dots)
    ├── hooks/
    │   ├── useScrollState.ts       ← maps scrollTop → discrete state with hysteresis
    │   └── useSettings.ts          ← merges JSON defaults + localStorage overrides
    └── lib/
        ├── types.ts, defaults.ts, easings.ts
```

---

## Settings model (the heart of this prototype)

All settings live in `PrototypeSettings` (`src/lib/types.ts`) and persist to
`localStorage` under key `mattress-prototype:settings:v1`. The drawer (gear
icon) edits them live; **Reset** restores JSON defaults.

| Group        | Field                       | Notes                                                       |
| ------------ | --------------------------- | ----------------------------------------------------------- |
| Scroll       | `distancePerStateVh`        | vh of scroll to advance one state. Total section = this × (stateCount − 1). |
|              | `snap`                      | `mandatory` / `proximity` / `none`                           |
|              | `advanceThreshold`          | 0..1, fraction of segment scroll must travel to flip state  |
| Layer motion | `activeRaisePx`             | how far the active layer translates up                       |
|              | `driftPerStepPx`            | extra translate per state for previously-active layers       |
|              | `fadeStartStep` / `fadeEndStep` | step window over which faded layers go from begin to final |
|              | `beginOpacity`              | 0..1, opacity at fadeStartStep (the "previous" layer)        |
|              | `finalOpacity`              | 0..1, opacity at fadeEndStep (the "previous-of-previous" layer) |
|              | `layerScale`                | proportional size for animated layers (1.0 = native)         |
|              | `transitionMs` / `easing`   | CSS transition timing for layer transforms                   |
| Caption      | `slideStepPx`               | horizontal distance between caption slots                    |
|              | `transitionMs` / `easing`   | carousel slide timing                                        |
|              | `crossFade`                 | whether non-focused captions fade out                        |
| Visual       | `canvasHeightPx`            | scales the entire mattress canvas; geometry scales proportionally |
|              | `stackOffsetPx`             | nudges the stack up/down                                     |
|              | `backgroundColor`           | brand bg `#FBF9F4`                                           |
|              | `accentColor`               | active badge `#844025`                                       |
|              | `headingColor`              | `#3C101E`                                                    |
|              | `bodyColor`                 | `#7C5F68`                                                    |
| Debug        | `showOverlay`               | floating panel with raw scroll, state, ±1, dot jumps         |
|              | `showOutlines`              | outlines around canvas + each layer                          |
|              | `forceState`                | overrides scroll-driven state when non-null                  |

UI display nuances:
- `beginOpacity` and `finalOpacity` are stored as 0..1 but displayed as 0–100%
  via the `PercentRange` primitive in `SettingsDrawer.tsx`.

---

## How the animation math works

In `MattressStack.tsx`, for each layer `i`:

```
stepsSinceActive = state - (i + 1)     // -1 = not yet active, 0 = active, 1+ = past
```

- `stepsSinceActive < 0` → opacity 1, no translate (resting position).
- `stepsSinceActive >= 0` → translateY = -(activeRaisePx + driftPerStepPx × stepsSinceActive).
- Opacity fade lerps from `beginOpacity` (at `fadeStartStep`) to `finalOpacity`
  (at `fadeEndStep`). Steps before `fadeStartStep` stay at 1.
- `layerScale` scales width/height around each layer's center (so anchor doesn't shift).
- Base mattress uses Figma's nested-image crop: outer wrapper with
  `overflow:hidden`, inner img positioned with percentages from Figma
  (`width 101.33%`, `height 159.34%`, `left -1.03%`, `top -50.72%`).

`useScrollState.ts` does the discrete-state-with-hysteresis logic. The key
trick on flick scrolls: if `Math.abs(hardSnap - last) >= 2`, jump directly
instead of getting stuck advancing one state at a time.

---

## ⚠️ Known issues to fix (in priority order)

### 1. Badge click breaks scroll-driven animation **[OPEN BUG]**

**Repro:** Open the prototype, click any badge number. From that point on,
scrolling no longer advances the state — animation is frozen at whatever badge
was clicked.

**Cause:** `src/app/page.tsx` line ~141:
```tsx
<BadgeRow
  ...
  onSelect={(n) => {
    update("debug", { forceState: n });   // ← sets forceState forever
  }}
/>
```
And `useScrollState.ts` lines 49-54 returns early without attaching the
scroll listener whenever `forceState` is non-null.

**Fix plan:** Replace the badge `onSelect` so it scrolls the container to the
position corresponding to state `n`, instead of forcing the state. Keep
`forceState` available for the DebugOverlay (it should still override there).

```ts
// In page.tsx, the badge onSelect should be roughly:
onSelect={(n) => {
  const container = containerRef.current;
  const section = sectionRef.current;
  if (!container || !section) return;
  const segments = Math.max(stateCount - 1, 1);
  const travel = Math.max(1, section.offsetHeight - container.clientHeight);
  const target = section.offsetTop + (n / segments) * travel;
  container.scrollTo({ top: target, behavior: "smooth" });
}}
```

This way the scroll listener stays attached, the scroll position updates,
`useScrollState` recomputes naturally, and future scrolls Just Work — picking
up from wherever the click landed.

### 2. Git index is in an inconsistent state

If `git status` shows a wall of `deleted:` lines and untracked `??` versions
of the same files, the index is broken but the files are physically fine on
disk (verified — `wc -l src/app/page.tsx` gives 197). Recovery:

```bash
rm -f .git/index.lock
git reset --hard HEAD
git status   # should be: nothing to commit, working tree clean
```

The good commit is tagged `v1-fade-controls`. If something gets really lost,
`git checkout v1-fade-controls -- .` will restore everything.

### 3. GitHub remote still has the auto-init commit

`origin/main` is at `a757fcd` (GitHub's auto-generated `Initial commit` with
just a README), unrelated to local `main` at `a7835f8` (the prototype).
Pushing fails with "fetch first" because of unrelated histories.

After fix #2 stabilizes the working tree, force-push to overwrite remote:

```bash
git push -u origin main --force-with-lease
git push origin --tags
```

Remote URL: `git@github.com:AiweiCastle/Axo-infographic_interaction.git`
Branch: `main`
Tags: currently just `v1-fade-controls`. After fixing #1, recommend tagging
`v2-badge-scrolls`.

---

## How the prior session was set up

- Discrete state machine was the chosen pattern after explicit user direction
  ("Each state needs to be correlated and magnetic or sticky to position…
  Intermediate positions are not allowed"). Don't reintroduce continuous
  interpolation.
- `beginOpacity` was added on top of `finalOpacity` per user request, so
  faded layers can sit at any in-between opacity (e.g. previous = 50%,
  prev-of-prev = 0%).
- `distancePerStateVh` replaced the older `sectionVh`. Total section height
  is computed in `page.tsx` as `distancePerStateVh × (stateCount − 1)`.
- Figma assets are downloaded locally to `public/assets/` — don't rely on
  Figma S3 URLs (they expire after ~7 days).

---

## Conventions

- Edit existing files; don't scaffold new ones unless the task genuinely needs
  a new module.
- Don't add Tailwind, styled-components, or another CSS lib — CSS Modules only.
- TypeScript strict mode is on; verify with `npx tsc --noEmit` after edits.
- Settings changes need to be reflected in three places: `types.ts`,
  `defaults.ts`, and `public/config/mattress.json`. Forgetting one breaks the
  load-defaults flow silently (FALLBACK_DEFAULTS will be missing the field).
