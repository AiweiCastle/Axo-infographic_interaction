# Mattress Layer Prototype

A mobile-first, scroll-driven prototype that mirrors the Figma "Mattress Layer" frame
(`https://www.figma.com/design/iCBP4hEcyTj3wzXdGoY5W5/Claude-Space?node-id=6-420`).

As the user scrolls, each mattress layer raises up sequentially while the
caption carousel and active badge advance in lock-step. The motion is fully
configurable from a settings drawer, and assets/copy are swappable via a single
JSON file.

---

## Getting started

```bash
cd mattress-prototype
npm install
npm run dev
```

Open <http://localhost:3000> in a mobile-emulated browser, or visit
`http://<your-laptop-LAN-ip>:3000` from your phone (both devices on the same
Wi-Fi).

Other scripts:

```bash
npm run build       # production build
npm run start       # serve production build
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
```

---

## How the animation works

The Figma file has four frames (states 0–3). This prototype implements that
exact pattern:

| State | What happens                                                                |
| ----- | --------------------------------------------------------------------------- |
| 0     | All layers at rest. Caption shows "7 Layers of Reliable Comfort" intro.     |
| 1     | Layer 1 raises by `activeRaisePx`. Badge "1" highlights.                    |
| 2     | Layer 1 drifts further up & fades. Layer 2 raises. Badge "2" highlights.    |
| 3     | Layer 2 fades, Layer 3 raises. Badge "3" highlights.                        |

**Motion is discrete, not continuous.** The visual is *always* at one of the
defined states — there are no in-between positions while you scroll. As scroll
crosses the configured `advanceThreshold` of a segment, the state flips and
CSS transitions on the layer/caption elements ease the visual to its new spot.
This is the "magnetic / sticky" behavior — once you've passed the threshold,
the layer locks at its new position; you have to scroll back past
`(1 - advanceThreshold)` of the previous segment to retreat.

Translation and opacity are computed in `src/components/MattressStack.tsx`,
and the timing/easing of the inter-state animation is owned by CSS.

The badge row always renders 1–7 (configurable via `totalBadges` in
`mattress.json`); badges 4–7 stay inactive until you add more layers.

---

## Replacing visual assets

All assets live in **`public/assets/`** and are referenced from
**`public/config/mattress.json`**.

### Quick swap (same number of layers)

1. Drop your replacement PNGs into `public/assets/` keeping the file names:
   - `base.png` — the mattress base (with brand mark)
   - `layer-1.png` — top layer (currently TENCEL Lyocell Cover)
   - `layer-2.png` — middle layer (Cooling Memory Gel)
   - `layer-3.png` — bottom layer (Pocket Spring)
2. Save and refresh. The page hot-reloads in dev.

### Custom paths or new copy

Edit `public/config/mattress.json`:

```json
{
  "intro": { "title": "...", "desc": "..." },
  "base":  { "src": "/assets/base.png", "alt": "..." },
  "layers": [
    { "src": "/assets/layer-1.png", "alt": "...", "title": "...", "desc": "..." },
    { "src": "/assets/layer-2.png", "alt": "...", "title": "...", "desc": "..." },
    { "src": "/assets/layer-3.png", "alt": "...", "title": "...", "desc": "..." }
  ],
  "totalBadges": 7,
  "defaults": { ... }
}
```

### Adding more layers (4–7)

Append entries to the `layers` array. The animation, badge row, and caption
carousel scale automatically.

```json
"layers": [
  { "src": "/assets/layer-1.png", ... },
  { "src": "/assets/layer-2.png", ... },
  { "src": "/assets/layer-3.png", ... },
  { "src": "/assets/layer-4.png", ... }
]
```

> Note: the Figma file only specifies geometry for layers 1–3. New layers
> reuse the geometry of the bottom-most layer slot. Adjust
> `LAYER_GEOM` in `src/components/MattressStack.tsx` if you need bespoke
> per-layer positioning.

---

## Settings drawer

Tap the gear icon (top-right) to open. Every setting persists to
`localStorage` under the key `mattress-prototype:settings:v1`. **Reset**
restores the JSON config defaults.

| Group        | Knob                       | What it does                                                            |
| ------------ | -------------------------- | ----------------------------------------------------------------------- |
| Scroll       | Scroll distance per state (vh) | How much scroll travel triggers the next state (total = this × (states − 1)) |
|              | Snap mode                  | `mandatory` / `proximity` / `none`                                      |
|              | Advance threshold          | How far through a segment scroll must travel to flip to the next state  |
| Layer motion | Active raise (px)          | How far the active layer translates up                                  |
|              | Drift per step (px)        | How far previously active layers continue moving each step              |
|              | Fade start / end step      | Step window over which faded layers go from begin to final opacity      |
|              | Fade begin opacity (previous layer) | Opacity at the START of the fade — the previous layer's appearance, shown 0–100% |
|              | Final opacity (faded layers) | Opacity once a layer is fully faded, shown 0–100%                     |
|              | Layer scale                | Proportional size for animated layers (0.5×–1.6×)                       |
|              | Transition (ms) + easing   | CSS transition timing for layer transforms                              |
| Caption      | Slide step (px)            | Horizontal distance between caption slots                               |
|              | Transition (ms) + easing   | Carousel slide timing                                                   |
|              | Cross-fade between captions| Whether non-focused captions fade out                                   |
| Visual       | Canvas height              | Scales the entire mattress canvas; geometry scales proportionally       |
|              | Stack vertical offset      | Nudges the stack up/down                                                |
|              | Background / accent / heading / body | Brand colors                                                  |
| Debug        | Show overlay               | Floating panel with raw scroll, t, state, ±1 step, and direct dot jumps |
|              | Show layer outlines        | Outlines around canvas + each layer for tuning geometry                 |
|              | Force state                | Override scroll-driven state (auto / 0..N)                              |

---

## Project layout

```
mattress-prototype/
├── package.json
├── next.config.js
├── tsconfig.json
├── public/
│   ├── assets/             ← drop replacement images here
│   │   ├── base.png
│   │   ├── layer-1.png
│   │   ├── layer-2.png
│   │   └── layer-3.png
│   └── config/
│       └── mattress.json   ← assets paths, copy, default settings
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx        ← scroll container + sections
    │   ├── page.module.css
    │   └── globals.css
    ├── components/
    │   ├── MattressStack.tsx        ← layer geometry + motion math
    │   ├── BadgeRow.tsx             ← 1..N badge dots
    │   ├── CaptionCarousel.tsx      ← horizontal sliding caption strip
    │   ├── SettingsDrawer.tsx       ← gear-icon panel
    │   └── DebugOverlay.tsx         ← floating debug panel
    ├── hooks/
    │   ├── useScrollState.ts        ← maps scroll position → t & state
    │   └── useSettings.ts           ← merges JSON defaults + localStorage overrides
    └── lib/
        ├── types.ts                 ← shared TS types
        ├── defaults.ts              ← fallback if JSON fails
        └── easings.ts               ← easing function library
```

---

## Notes & known scope

- This is a prototype — the production build hasn't been optimised for image
  size. Replace the draft Figma assets with compressed, properly-sized PNG/WebP
  files before shipping.
- States 0–3 are wired to real Figma assets. States 4–7 (badges shown but
  inactive) require additional images + `mattress.json` entries.
- Scroll-snap fidelity varies by browser — iOS Safari and modern Chrome both
  honour `scroll-snap-type`, but velocity-based behaviour differs slightly.
- The font stack falls back to system-ui — replace with a hosted Aime font
  file if you have license access.
