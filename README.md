# VibeJS

VibeJS is a declarative, grammar-of-graphics-inspired JavaScript library for structured, interactive visual **belief elicitation**. Unlike charting libraries that only display static data, VibeJS builds empty or pre-filled charts where users directly construct or modify data points — expressing their beliefs — through intuitive mouse/touch gestures.

The library is decoupled from any single rendering framework. It maintains an internal abstract **Scene Graph** of shapes to draw, which a pluggable renderer (the default is D3/SVG) translates into pixels.

---

## The core idea: an edit is the inverse of encoding

Every mark reads a **channel** surface: a channel is a constant (`fill: "red"`) or a data field through a scale (`y: { field: "n" }`). Encoding maps **data → visual**. An **edit** attached to a channel maps a **gesture → data**, back through the *same* scale. That symmetry is the whole model:

```javascript
schema: { n: { type: "quantitative", domain: [0, 100] } }   // what n IS
y: { field: "n", edit: drag() }
//   ── encode: n → pixel ──┘  └─ edit: drag pixel → n
```

Note what the channel does *not* carry. A field's **data type** and its **domain** describe the data, not one mark's view of it, so they are declared once on the spec's `schema`. The **scale** is then derived: a categorical field on a bar's x is a band (a bar needs the interval), on a dot's x it is a point (a dot wants the tick). Name a scale explicitly only when you want something else — `scale: "log"`, `scale: { type: "sqrt", range: [4, 20] }`, or a live `d3.scaleBand().padding(0.3)`, which is adopted as you built it.

---

## Architecture

VibeJS is layered for extensibility:

1. **Core engine (`vibe.Elicit`)** — the orchestrator (`src/core/elicit.js`). Deep-copies the spec's **one dataset** into a reactive store, resolves one **global scale per channel** (Observable-Plot model), rebuilds the scene each render, and routes gesture events to the matching edits. The unidirectional flow: `gesture → invert through scale → data-space proposal → data invariants → commit → re-render`.

   **One schema.** The schema is the contract of the elicited dataset: every field's measurement type and domain. It is what lets a chart resolve its scales and mint rows from *zero* starter data. Scales are resolved per channel by **unioning the schema domains of every field on that axis** — so an error bar's `mean`, `lo` and `hi` share one y axis that spans all three.

   **One dataset.** A chart elicits exactly one dataset — even a slider elicits a one-row dataset — so `data` lives on the spec, never on a mark. Each mark is a *view* over those rows: it encodes some columns, and where a channel carries an `edit`, it writes them back. Several marks over the same rows is the point, not a special case: a glyph is just marks that encode different columns of one row (see `composite`), and they all re-derive from the committed data on the next render.

2. **Abstract scene graph (`src/core/scene.js`)** — a flat, layout-calculated collection of abstract nodes (`circle`, `rect`, `line`, `path`, `text`), independent of the DOM or any renderer.

3. **Marks (`vibe.plot.*`)** — pure data-to-geometry factories on a shared foundation (`src/plot/mark.js`): every mark resolves its channels through `encodeChannel` and the standard style surface (`fill`, `stroke`, `strokeWidth`, `opacity`, …) the same way. Marks compose across scale types and orientations.
   - `point` → `circle` (scatter; x/y/size/fill/stroke channels).
   - `bar` / `barY` / `barX` → `rect` (band axis = category + thickness, linear axis = value — or an explicit start/end span via x1/x2 or y1/y2; orientation auto-detected).
   - `tick` / `tickX` / `tickY` → `line` (a bar's zero-thickness sibling).
   - `line` / `lineY` / `lineX` / `connectedScatter` / `path` → a connecting `path` per series plus one `circle` handle per datum; grouped by `series`, ordered by `order`.
   - `rule` / `ruleX` / `ruleY` → a straight reference line at a data value (`y: { datum: 50 }`), or a **span** segment (a stem / whisker) between `y1`/`y2` (or `x1`/`x2`) at a category. An ordinary editable mark: put an `edit` on an endpoint and the cap becomes a handle.
   - `composite` → a **glyph**: a named group of ordinary marks as `parts` (a stem, a whisker, a dot, two caps). Each part encodes some columns of the same rows; a part whose channel carries an `edit` is a handle. It desugars into its parts as plain features — `Elicit` flattens them — so nothing about a glyph reaches the engine. Drag one handle and the rest re-derive from the changed row (lollipop, error bar). Because each handle is its own mark, dragging one cannot move another: dispatch already routes a gesture to the feature owning the node you touched.
   - `dotStack` / `dotStackY` / `dotStackX` → a stacked dot plot (token counter): one datum per token, tokens sharing a slot stack into a countable column (drop with `create`, take back with `remove`).
   - `waffle` / `waffleY` / `waffleX` → a bar subdivided into a grid of uniform, touching cells (`rect` or `circle`) where one cell is a fixed quantity (`unit`); `value / unit` cells fill, laid out `multiple` across the band (auto-sized square, width ≤ bandwidth) — exact counting and proportion picking. Drive it with `edit.waffleFill()`, which maps the pointer to the exact cell (row + column) and fills up to and including it, consistently for click and drag.
   - `cone` → a line + cone correlation glyph: a single `{ r, spread }` belief drawn as a rotating mean line plus a `Normal(r, spread)` fan (paired with the `rotate` edit and stages).
   - `trend` → an intercept-then-slope line: `{ intercept, slope }` with an intercept handle (translate) and a slope handle (rotate about the anchor), stageable.
   - `axis` / `axisX` / `axisY` / `grid` / `gridX` / `gridY` → composable axis & gridline marks (or use the global `axes` convenience).

4. **Edits (`vibe.edit.*`)** — a gesture that writes a channel back to the data. An edit is a small descriptor `{ gesture, channels, when, pick, scope, constrain, guide, apply }`, declared **co-located** on a channel (`channels.y.edit = drag()`) or at **mark level** (`edits: [...]`).
   - **Universal** edits (any mark): `drag`, `resize`, `rotate` (pointer angle about the plot centre → a channel value), `cycle`, `create`, `toggle` (click a slot to pick or un-pick it), `remove`, `custom`.
   - **Line-scoped** edits, namespaced as `edit.line.*` so their scope is visible: `anchor` (add one point), `newSeries` (seed a whole line), `draw` (author a line by dragging), `sweep` (you-draw-it repaint), `removeSeries` (delete a whole line).
   - `pick` selects the target: `direct` (the mark hit), `nearest` (closest within a threshold), `plane` (no target — create), or a driver lifecycle (`sweep` / `draw` / `brush` / `probe`). Multi-event lifecycles live in **self-describing drivers** (`src/edit/drivers/`) — adding an interaction mode is a new driver file, not an engine change.
   - `pick: 'probe'` is the **hover-preview / click-commit** flow, with no drag: the pointer probes a value (the mark follows the cursor as an *uncommitted preview*), and a click settles it. Any edit works this way. Preview and commit run the same `apply` + the same invariants through one code path, so the preview cannot drift from what the click writes — and a preview never reaches `onChange` or `getData`.
   - `when` arbitrates when several edits share a gesture (`vibe.when.alt`, `noAlt`, `shift`, `near`, `far`, …): e.g. plain click recolours, Alt-click deletes.
   - `stage` gates an edit to one step of a multi-stage elicitation ("first X, then Y"). It is a uniform filter applied to every edit — not a new mode. A `probe` click on a staged edit commits that stage's field and advances automatically (freezing it); you can also drive stages yourself with `setStage` / `nextStage`. See `cone` and `trend`.

5. **Constraints (`vibe.constraints.*`)** — **data-layer invariants**: pure rules over the dataset, run on every edit commit (never see pixels). They both *gate* a proposal (return `false` to reject) and *repair* it (return the corrected rows) — and since the rows are shared, a repair propagates to every mark on the next render. Declared on the spec (`constraints: [...]`, the canonical home) or on a mark as sugar, in which case the engine promotes it to the dataset so it still holds for **every** edit from **every** mark. Per-edit sugar is `edit.constrain`. Built-ins: `clamp({ min, max, field })`, `maintainSum({ targetSum, field })`, `count({ max, strategy })`, `unique({ field, max })`, `snap({ field, step, origin })`. Author your own with `constraints.define(reducer, meta?)` — write just the rule against a clean data context and return a number (set the field), object (merge), array (replace dataset), or `false` (reject).

6. **Guides (`vibe.guides.*`)** — non-interactive annotations, rebuilt every render so they track live data. `guides.rule` (reference line), `guides.region` (shaded band), `guides.proximity` (nearest-pick selection), `guides.custom(fn)` (draw arbitrary nodes from the render context). An edit's own constraint bounds + snap ring draw automatically when it declares `guide: true`. Guide nodes never capture the pointer, which is why the survey widgets' affordances live here.

7. **Widgets (`vibe.widgets.*`)** — higher-level named elicitations, each a pure recipe over the core API (no new interaction surface): `likert`, `multipleChoice`, `slider`, `matrix`, `lineCone`. Each returns an **ElicitSpec** you pass straight to `Elicit(widgets.likert({…}))`. They look like survey instruments rather than charts — option rings, a cell grid, a track — but that styling is *only* the guide layer (`widgets.THEME`, `optionRings`, `cellGrid`, `sliderTrack`, `crosshair`), so each has a plain-chart twin built from the same mark, edit and constraint.

8. **Renderer (`vibe.D3Renderer`)** — draws the scene graph to SVG via D3, binding drag/click. Swappable for Canvas/WebGL/etc.

**Reading data out.** `Elicit(spec)` returns the chart element augmented with a small observation API: `getData()` (a deep copy of the committed belief dataset), `setData(data)` (seed/reset + re-render), and `on("change" | "stage", cb)` (subscribe; returns an unsubscribe). This is in addition to the spec's `onChange`.

**Sizing.** `width`/`height` are pixels by default (`responsive: "fixed"`). Set `responsive: "scale"` to wrap the SVG in a `viewBox` so the browser scales it to fill the parent (one draw, aspect ratio preserved), or `responsive: "reflow"` (alias `true`) to measure the parent and redraw at native pixels on resize (crisp text; width tracks the container, height stays the given value). A reflow chart wires a `ResizeObserver` — call `el.destroy()` when unmounting it. See `docs/sizing.html`.

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
│   │   ├── point.js · bar.js · tick.js · line.js · rule.js · composite.js · axis.js
│   │   ├── dotStack.js · waffle.js · cone.js · trend.js
│   ├── edit/               # The edit model
│   │   ├── basic.js        # Universal edits (drag/resize/rotate/cycle/create/toggle/remove/custom)
│   │   ├── line.js         # Line-scoped edits (anchor/newSeries/draw/sweep/removeSeries)
│   │   ├── when.js         # Arbitration predicates
│   │   ├── pick.js         # Target selection (nearest / proximity)
│   │   ├── route.js        # collectEdits / resolveChannels
│   │   ├── guide.js        # An edit's self-drawn guide (bounds + snap ring)
│   │   ├── shared.js       # makeEdit + datum/series helpers
│   │   └── drivers/        # Self-describing interaction modes (plane/nearest/sweep/draw/brush/probe)
│   ├── constraints/        # Data-layer invariants (define/clamp/maintainSum/count/unique/snap)
│   ├── widgets/            # Named survey instruments (likert/choice/slider/matrix/lineCone) + theme.js
│   ├── guides/             # rule / region / proximity / custom annotations
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
  // The contract of the elicited dataset: what each field IS, and its domain.
  // Every scale below is derived from this — no mark declares one.
  schema: {
    x: { type: "categorical",  domain: ["A", "B", "C", "D"] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  // THE dataset. A chart elicits exactly one; every mark is a view over these rows.
  data: [
    { x: "A", y: 25 }, { x: "B", y: 25 },
    { x: "C", y: 25 }, { x: "D", y: 25 },
  ],
  // Data invariants — they gate and repair every edit, from any mark.
  constraints: [ clamp({ min: 0 }), maintainSum({ targetSum: 100 }) ],
  onChange: (data) => console.log("elicitation state:", data),
  features: [
    // `datum` is a DATA-space constant: it goes through the y scale, so the line
    // lands where y = 50 is. (`value` would mean 50 pixels.)
    vibe.plot.ruleY({ stroke: "red", strokeDasharray: "4", channels: { y: { datum: 50 } } }),
    barY({
      id: "elicited-probabilities",
      fill: "purple",
      channels: {
        x: { field: "x" },                            // categorical + bar -> band
        // The value channel carries the edit; drag writes y back through the scale.
        y: { field: "y", edit: drag({ guide: true }) }, // quantitative -> linear
      },
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
- `docs/` — a page per mark (bar, tick, point, line, composite, stacked dots, waffle, line + cone, trend) and per feature (editing, probe, stages, scales, constraints, widgets, effects, guides, schema). Each page opens with an **API reference** (signature, options, channels, returns/emits) and then shows live examples with the exact code beside each result.
- `docs/playground.html` — a composition playground: pick a mark, scales, edits, constraints, and guides from dropdowns and see the spec built and rendered live.

---

## Roadmap

- Cross-category dragging along a band axis (snap the pointer to the nearest band).
- Orientation-aware constraint guides for `clamp` on x-value marks and box regions for 2D clamps.
- A legend/swatch picker edit for discrete channels (the old `legendChannel`, to be re-expressed against the edit model once interactive legends land).
