# VibeJS

VibeJS is a declarative, grammar-of-graphics-inspired JavaScript library for structured, interactive visual **belief elicitation**. Unlike charting libraries that only display static data, VibeJS builds empty or pre-filled charts where users directly construct or modify data points — expressing their beliefs — through intuitive mouse/touch gestures.

The library is decoupled from any single rendering framework. It maintains an internal abstract **Scene Graph** of shapes to draw, which a pluggable renderer (the default is D3/SVG) translates into pixels.

---

## The core idea: an edit is the inverse of encoding

Every mark reads a **channel** surface: a channel is a constant (`fill: "red"`) or a data field through a scale (`y: { field: "n" }`). Encoding maps **data → visual**. An **edit** attached to a channel maps a **gesture → data**, back through the *same* scale. That symmetry is the whole model:

```javascript
y: { field: "n", type: "linear", domain: [0, 100], edit: drag() }
//   ─────────── encode: n → pixel ───────────┘     └─ edit: drag pixel → n
```

---

## Architecture

VibeJS is layered for extensibility:

1. **Core engine (`vibe.Elicit`)** — the orchestrator (`src/core/elicit.js`). Deep-copies each feature's data into a reactive store, resolves one **global scale per channel** (Observable-Plot model), rebuilds the scene each render, and routes gesture events to the matching edits. The unidirectional flow: `gesture → invert through scale → data-space proposal → data invariants → commit → re-render`.

2. **Abstract scene graph (`src/core/scene.js`)** — a flat, layout-calculated collection of abstract nodes (`circle`, `rect`, `line`, `path`, `text`), independent of the DOM or any renderer.

3. **Marks (`vibe.plot.*`)** — pure data-to-geometry factories on a shared foundation (`src/plot/mark.js`): every mark resolves its channels through `encodeChannel` and the standard style surface (`fill`, `stroke`, `strokeWidth`, `opacity`, …) the same way. Marks compose across scale types and orientations.
   - `point` → `circle` (scatter; x/y/size/fill/stroke channels).
   - `bar` / `barY` / `barX` → `rect` (band axis = category + thickness, linear axis = value; orientation auto-detected).
   - `tick` / `tickX` / `tickY` → `line` (a bar's zero-thickness sibling).
   - `line` / `lineY` / `lineX` / `connectedScatter` / `path` → a connecting `path` per series plus one `circle` handle per datum; grouped by `series`, ordered by `order`.
   - `rule` / `ruleX` / `ruleY` → a straight reference line at a value on one axis.
   - `axis` / `axisX` / `axisY` / `grid` / `gridX` / `gridY` → composable axis & gridline marks (or use the global `axes` convenience).

4. **Edits (`vibe.edit.*`)** — a gesture that writes a channel back to the data. An edit is a small descriptor `{ gesture, channels, when, pick, scope, constrain, guide, apply }`, declared **co-located** on a channel (`encoding.y.edit = drag()`) or at **mark level** (`edits: [...]`).
   - **Universal** edits (any mark): `drag`, `resize`, `cycle`, `create`, `remove`, `custom`.
   - **Line-scoped** edits, namespaced as `edit.line.*` so their scope is visible: `anchor` (add one point), `newSeries` (seed a whole line), `draw` (author a line by dragging), `sweep` (you-draw-it repaint), `removeSeries` (delete a whole line).
   - `pick` selects the target: `direct` (the mark hit), `nearest` (closest within a threshold), `plane` (no target — create), or a driver lifecycle (`sweep` / `draw`). Multi-event lifecycles live in **self-describing drivers** (`src/edit/drivers/`) — adding an interaction mode is a new driver file, not an engine change.
   - `when` arbitrates when several edits share a gesture (`vibe.when.alt`, `noAlt`, `shift`, `near`, `far`, …): e.g. plain click recolours, Alt-click deletes.

5. **Constraints (`vibe.constraints.*`)** — **data-layer invariants**: pure rules over the dataset, run on every edit commit (never see pixels). Declared on the feature (`constraints: [...]`, hold for every edit) or as per-edit sugar (`edit.constrain`). Built-ins: `clamp({ min, max, field })`, `maintainSum({ targetSum, field })`, `count({ max, strategy })`, `unique({ field, max })`. Author your own with `constraints.define(reducer, meta?)` — write just the rule against a clean data context and return a number (set the field), object (merge), array (replace dataset), or `false` (reject).

6. **Guides (`vibe.guides.*`)** — non-interactive annotations, rebuilt every render so they track live data. `guides.rule` (reference line), `guides.region` (shaded band), `guides.proximity` (nearest-pick selection). An edit's own constraint bounds + snap ring draw automatically when it declares `guide: true`.

7. **Renderer (`vibe.D3Renderer`)** — draws the scene graph to SVG via D3, binding drag/click. Swappable for Canvas/WebGL/etc.

---

## Project structure

```text
vibe-js/
├── src/
│   ├── core/
│   │   ├── elicit.js       # Engine: state store, scale resolution, event routing, render loop
│   │   ├── axes.js         # Resolve the global `axes` convenience into axis/grid marks
│   │   ├── resolve.js      # Global per-channel scale resolution
│   │   ├── scales.js       # Scale wrappers (encode / invertValue) over d3-scale
│   │   ├── encoding.js     # Channel inference + invert primitives
│   │   ├── samples.js      # Domain sampling for line authoring
│   │   ├── effects.js      # Interaction-feedback layer (grab / select)
│   │   └── scene.js        # Abstract scene graph
│   ├── plot/               # Marks (mark.js = shared channel/style foundation)
│   │   ├── point.js · bar.js · tick.js · line.js · rule.js · axis.js
│   ├── edit/               # The edit model
│   │   ├── basic.js        # Universal edits (drag/resize/cycle/create/remove/custom)
│   │   ├── line.js         # Line-scoped edits (anchor/newSeries/draw/sweep/removeSeries)
│   │   ├── when.js         # Arbitration predicates
│   │   ├── pick.js         # Target selection (nearest / proximity)
│   │   ├── route.js        # collectEdits / resolveChannels
│   │   ├── guide.js        # An edit's self-drawn guide (bounds + snap ring)
│   │   ├── shared.js       # makeEdit + datum/series helpers
│   │   └── drivers/        # Self-describing interaction modes (plane/nearest/sweep/draw)
│   ├── constraints/        # Data-layer invariants (define/clamp/maintainSum/count/unique)
│   ├── guides/             # rule / region / proximity annotations
│   ├── renderers/
│   │   └── d3-renderer.js  # The default SVG renderer
│   ├── types.d.ts          # Type contracts for the whole API
│   └── index.js            # Public API aggregator
├── index.html              # Landing page → docs/
├── docs/                   # Multi-page documentation site (+ playground.html)
└── package.json
```

---

## Example

```javascript
import * as vibe from "vibe-js";
const { barY } = vibe.plot;
const { drag } = vibe.edit;
const { clamp, maintainSum } = vibe.constraints;

const beliefChart = vibe.Elicit({
  width: 600,
  height: 400,
  x: { type: "band", domain: ["A", "B", "C", "D"] },
  y: { type: "linear", domain: [0, 100] },
  features: [
    vibe.plot.ruleY({ y: 50, stroke: "red", strokeDasharray: "4" }),
    barY({
      id: "elicited-probabilities",
      fill: "purple",
      data: [
        { x: "A", y: 25 }, { x: "B", y: 25 },
        { x: "C", y: 25 }, { x: "D", y: 25 },
      ],
      encoding: {
        x: { field: "x", type: "band", domain: ["A", "B", "C", "D"] },
        // The value channel carries the edit; drag writes y back through the scale.
        y: { field: "y", type: "linear", domain: [0, 100], edit: drag({ guide: true }) },
      },
      // Data invariants — hold for every edit, not just this drag.
      constraints: [ clamp({ min: 0 }), maintainSum({ targetSum: 100 }) ],
      onChange: (data) => console.log("elicitation state:", data),
    }),
  ],
});

document.getElementById("chart-container").appendChild(beliefChart);
```

---

## Development

```bash
cd vibe-js
npm install
npx vite          # dev server with hot reload
npm run typecheck  # tsc --noEmit against types.d.ts
```

- `index.html` — landing page linking into the docs.
- `docs/` — a page per mark (bar, tick, point, line) and per feature (editing, scales, constraints, effects, guides, schema), each showing code beside its live result.
- `docs/playground.html` — a composition playground: pick a mark, scales, edits, constraints, and guides from dropdowns and see the spec built and rendered live.

---

## Roadmap

- `plot.trend` mark (stubbed, not yet implemented).
- Cross-category dragging along a band axis (snap the pointer to the nearest band).
- Orientation-aware constraint guides for `clamp` on x-value marks and box regions for 2D clamps.
- A legend/swatch picker edit for discrete channels (the old `legendChannel`, to be re-expressed against the edit model once interactive legends land).
