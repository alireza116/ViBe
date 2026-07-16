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

Note what the channel does *not* carry. A field's **data type** and its **domain** describe the data, not one mark's view of it, so they are declared once on the spec's `schema`. The **scale** is then derived: a categorical field on a bar's x is a band (a bar needs the interval), on a dot's x it is a point (a dot wants the tick). Name a scale explicitly only when you want something else — `scale: "log"`, `scale: { type: "sqrt", range: [4, 20] }`, or a live `d3.scaleBand().padding(0.3)`, which is adopted as you built it. For a colour channel, set the palette with `scale: { scheme: "tableau10" }` (categorical) or `scale: { scheme: "RdBu" }` (a ColorBrewer diverging / sequential set — discrete for ordinal domains, a two-stop ramp for continuous; add `reverse: true` to flip direction), or a raw `scale: { range: [...] }`. The **`symbol`** channel is the same idea for glyphs: a category → an emoji / unicode shape through an ordinal scale, so any shape mark (`point`, `dotStack`, `waffle`) can draw a glyph in place of its circle/rect. Give it glyphs with `scale: { range: ["😢","😐","😊"] }` or a named `scale: { scheme: "faces" }`; edit the underlying category with `cycle()` / `legend()`.

---

## Architecture

VibeJS is layered for extensibility:

1. **Core engine (`vibe.Elicit`)** — the orchestrator (`src/core/elicit.js`). Deep-copies the spec's **one dataset** into a reactive store, resolves one **global scale per channel** (Observable-Plot model), rebuilds the scene each render, and routes gesture events to the matching edits. The unidirectional flow: `gesture → invert through scale → data-space proposal → data invariants → commit → re-render`.

   **One schema.** The schema is the contract of the elicited dataset: every field's measurement type and domain. It is what lets a chart resolve its scales and mint rows from *zero* starter data. Scales are resolved per channel by **unioning the schema domains of every field on that axis** — so an error bar's `mean`, `lo` and `hi` share one y axis that spans all three.

   **One dataset.** A chart elicits exactly one dataset — even a slider elicits a one-row dataset — so `data` lives on the spec, never on a mark. Each mark is a *view* over those rows: it encodes some columns, and where a channel carries an `edit`, it writes them back. Several marks over the same rows is the point, not a special case: a glyph is just marks that encode different columns of one row (see `composite`), and they all re-derive from the committed data on the next render.

   **Locked rows (`lock`).** Some rows are *given* rather than elicited — the record so far, the points already measured, last quarter's actuals. `lock: "seed"` fixes the rows the chart was seeded with while leaving every row an edit *adds* free; `lock: (d) => d.year <= 1990` locks rows by what they are. A lock is a property of the data, so it sits on the spec beside `data` and `schema`, and it has two halves, both automatic: a **dataset invariant** run last on every commit (so it outranks every other repair — a gesture that spans locked and free rows keeps its changes to the free ones and snaps the locked ones back; deleting a locked row is rejected), and a **pointer** policy (a locked row's marks aren't grabbable, show no editable cursor, and are skipped by proximity picking — so `nearest` / `sweep` / `draw` never target one). That last part is what makes a you-draw-it chart work: because the seeded line is invisible to picking, a drag beside it doesn't grab a frozen line, it starts drawing. `setData` re-seeds the chart, so it re-takes a `"seed"` lock. See `docs/editing/lock.html`.

2. **Abstract scene graph (`src/core/scene.js`)** — a flat, layout-calculated collection of abstract nodes (`circle`, `rect`, `line`, `path`, `text`), independent of the DOM or any renderer.

3. **Marks (`vibe.plot.*`)** — pure data-to-geometry factories on a shared foundation (`src/plot/mark.js`): every mark resolves its channels through `encodeChannel` and the standard style surface (`fill`, `stroke`, `strokeWidth`, `opacity`, …) the same way. Marks compose across scale types and orientations.
   - `point` → `circle` (scatter; x/y/size/fill/stroke channels). Add a `symbol` channel and it draws a glyph (emoji / unicode shape) per datum instead of a circle.
   - `face` → an expressive, parametric emotion glyph (Chernoff-style): a datum's fields are encoded into a face with seven params (mouth curve/open/asym, eye scale/squint, brow height/tilt), each editable by **directly manipulating the feature** — grab the mouth and pull it into a smile, drag an eye wider, tilt a brow (2-D drags where a feature carries two params; small eyelid/lip dots for squint & open). Bind params with a `features` map (`{ mouthCurve: 'valence', … }`); `face()` is the two-field emotion preset. A single-datum glyph like `trend`; its centre is placed by x/y when present, so a plot of faces is a small-multiple or an emotion-space scatter.
   - `bar` / `barY` / `barX` → `rect` (band axis = category + thickness, linear axis = value — or an explicit start/end span via x1/x2 or y1/y2; orientation auto-detected).
   - `rect` / `rectX` / `rectY` → the generalized bar: each axis independently resolves a **span** (x1/x2, y1/y2), a **band**, or a baseline→value length, so a rectangle can span both axes (heatmap cells, 2-D regions, binned histograms). `brushRect()` adds composable 2-D editing — grab an **edge** to resize a side, a **corner** for two extents, the **body** to move; `resize` (`'both'`/`'x'`/`'y'`/`'none'`) and `move` (bool) make it opt-in.
   - `tick` / `tickX` / `tickY` → `line` (a bar's zero-thickness sibling).
   - `text` / `textX` / `textY` → a per-datum `text` label (string at x/y; `text`/`fontSize`/`textAnchor`/`lineAnchor`/`dx`/`dy` raw, `angle` in degrees, `format` a d3-format string or function for display). Editable like any mark: `drag` to reposition, a value channel sharing the label's field for a draggable numeric readout, `cycle`/`rotate`, or `editText()` to double-click-and-retype (an inline input; the renderer owns the keyboard lifecycle and emits a `commit` gesture).
   - `line` / `lineY` / `lineX` / `connectedScatter` / `path` → a connecting `path` per series plus one `circle` handle per datum; grouped by `series`, ordered by `order`.
   - `rule` / `ruleX` / `ruleY` → a straight reference line at a data value (`y: { datum: 50 }`), or a **span** segment (a stem / whisker) between `y1`/`y2` (or `x1`/`x2`) at a category. An ordinary editable mark: put an `edit` on an endpoint and the cap becomes a handle.
   - `composite` → a **glyph**: a named group of ordinary marks as `parts` (a stem, a whisker, a dot, two caps). Each part encodes some columns of the same rows; a part whose channel carries an `edit` is a handle. It desugars into its parts as plain features — `Elicit` flattens them — so nothing about a glyph reaches the engine. Drag one handle and the rest re-derive from the changed row (lollipop, error bar). Because each handle is its own mark, dragging one cannot move another: dispatch already routes a gesture to the feature owning the node you touched.
   - `dotStack` / `dotStackY` / `dotStackX` → a stacked dot plot (token counter): one datum per token, tokens sharing a slot stack into a countable column (drop with `create`, take back with `remove`).
   - `waffle` / `waffleY` / `waffleX` → a bar subdivided into a grid of uniform, touching cells (`rect` or `circle`) where one cell is a fixed quantity (`unit`); `value / unit` cells fill, laid out `multiple` across the band (auto-sized square, width ≤ bandwidth) — exact counting and proportion picking. Drive it with `edit.waffleFill()`, which maps the pointer to the exact cell (row + column) and fills up to and including it, consistently for click and drag.
   - `cone` → a line + cone correlation glyph: a single `{ r, spread }` belief drawn as a rotating mean line plus a `Normal(r, spread)` fan (paired with the `rotate` edit and stages).
   - `needle` → a pivoted gauge/dial pointer (tapered path + hub). Encodes a value on `angle` (degrees via the channel scale; default range `[180, 0]` = left→right through the top). `orient: 'top'|'right'|'bottom'|'left'` (or `arc`/`start`/`end`) picks the semicircle — keep `scale.range` in sync. Optional `x`/`y` place the pivot on categorical or linear axes. Pair with `axisRadial` for chrome and `text` for a center readout.
   - `axisRadial` → circular / semicircular axis chrome (arc spine, ticks, labels, optional colored categorical bands). Sibling of `axisX`/`axisY`; reads the global `angle` scale. Tick labels anchor by angle (so long category names grow outward, not off the edge) and take `tickFormat`/`tickValues`/`labelFill`. Bind `x`/`y` to fields and it draws **one ring per row** — a mini axis around each small-multiple needle.
   - `arc` / `pie` / `donut` → stacked angular slices (part-to-whole). Magnitudes on `angle`'s field normalize to a full or partial circle; `innerRadius` makes a donut. Pass `edit: edit.arc.edge()` to drag a slice boundary and redistribute the two adjacent shares (see `edit.arc.*` below).
   - `geoBasemap` / `geoTile` / `geoPoint` / `geoPolygon` / `geoLine` / `geoText` / `geoRect` → geographic marks for map elicitation. Chart-level `projection` (`"mercator"`, `{ type, domain, … }`, or a live d3.geo* instance) builds a shared `{ apply, invert, path }` context (not a 1D scale). **Basemap topology is a mark option** — `geoBasemap({ geojson: featureCollection })` (FeatureCollection draws one path per feature). Load your own GeoJSON (`fetch` / `import`) and pass it in; fit with `projection: { type: "mercator", domain: geojson }`. Editable lon/lat, GeoJSON geometries, coordinate lists, and geographic AABBs live on the **dataset**. Pair with `edit.geo.*`. `geoLine` reads its shape from its channels: `coordinates`/`geometry` → **one line per row** (a vertex list each, reshaped with `edit.geo.dragVertex`); `lon`/`lat` → **one path across the rows** in `order` (default `'sequence'`), grouped by `series` — the geographic connected scatter, the geo sibling of `path`. Put the dots on a sibling `geoPoint` and the trail re-derives as they're dragged. `geoTile({ url })` is a **raster** basemap — the Leaflet model, a pyramid of `{z}/{x}/{y}` images (OSM by default, or any tile server) laid behind the marks, keyed so on-screen tiles survive a re-render without re-fetching. It **requires `projection: "mercator"`**: a tile is a picture pre-baked in Web Mercator, so under any other projection it cannot register with the data — the mark verifies the projection by *behaviour* (probing that lon/lat land where the Mercator formula says, which rejects an equirectangular that agrees on the equator, and an oblique rotation) and warns instead of drawing a misaligned map. Attribution is a licence condition of every tile service and is drawn by default; public OSM tiles are rate-limited, so point `url` at your own server for production. `geoText` is the `text` mark with the projection doing the placement: position is the only thing a projection changes about a label, so it shares `text.js`'s node builder (`textNodeAt`) and inherits the whole text surface unchanged — `editText()` to retype content, `cycle()` for a categorical label, `rotate()` on `angle`, `dx`/`dy` to nudge the glyph off its anchor. Pair it with a sibling `geoPoint` over the same rows and dragging the dot carries the label. GeoJSON must use RFC 7946 ring winding: a reversed exterior ring reads to d3 as the polygon's *complement* (it "covers the globe"), which silently fits the projection to the whole world — `createProjection` dev-warns and names the offending features.
   - `trend` → an intercept-then-slope line: `{ intercept, slope }` with an intercept handle (translate) and a slope handle (rotate about the anchor), stageable.
   - `axis` / `axisX` / `axisY` / `grid` / `gridX` / `gridY` → composable axis & gridline marks (or use the global `axes` convenience). Pass an `edit` to make an axis **interactive** — see `edit.axis.*` below.

4. **Edits (`vibe.edit.*`)** — a gesture that writes a channel back to the data. An edit is a small descriptor `{ gesture, channels, when, pick, scope, constrain, guide, apply }`, declared **co-located** on a channel (`channels.y.edit = drag()`) or at **mark level** (`edits: [...]`).
   - **Universal** edits (any mark): `drag`, `dragSpan` / `brushSpan` (move / edge-resize a 1-D span), `brushRect` (composable 2-D edge/corner/body editing of a rect's four extents), `resize`, `rotate` (pointer angle about the plot centre — or `pivot: 'mark'` — → a channel value; `fold: false` for full-circle dials; `pick: 'direct'` for a needle handle), `cycle`, `create`, `toggle` (click a slot to pick or un-pick it), `remove`, `editText` (retype a text mark's content), `custom`.
   - **Line-scoped** edits, namespaced as `edit.line.*` so their scope is visible: `anchor` (add one point), `newSeries` (seed a whole line), `draw` (author a line by dragging), `sweep` (you-draw-it repaint), `removeSeries` (delete a whole line).
   - **Axis-scoped** edits, namespaced as `edit.axis.*` — the one family that writes the **schema's domain**, not a datum (they carry `target: 'domain'`): `edit.axis.scale()` drags a numeric/temporal axis's end-handle to grow/shrink its range (`mode: 'grow'` resizes the chart instead of rescaling in place); `edit.axis.categories()` adds / renames / removes categories on a discrete axis (reusing the `editText` inline-typing lifecycle; rename relabels matching rows, remove deletes them; `mode: 'grow'` grows the chart by one band-step per category instead of re-dividing it — e.g. extending a 5-point Likert scale to 7). The domain lives on the schema and scales re-resolve every render, so the grid, guides and marks reflow for free. Read the reshaped domain with `el.getSchema()`.
   - **Arc-scoped** edit, namespaced as `edit.arc.*`: `edit.arc.edge()` drags a slice boundary of an `arc`/`pie`/`donut` to move value between the two touching rows — one grows by what the other loses, holding the total fixed. Every boundary gets a grab handle, including the seam that wraps the last slice back to the first on a full circle (so *n* slices → *n* handles); `handles: false` keeps them grabbable but invisible.
   - **Geo-scoped** edits, namespaced as `edit.geo.*`: `drag` / `create` (lon/lat via `projection.invert`), `draw` / `dragVertex` (coordinate-list lines), `brush` / `createRect` (geographic west/south/east/north boxes). `brush` runs on the `geoBrush` driver — edge/corner/body, with the grabbed zone latched at **dragstart** and held for the gesture (re-deciding it per tick turns a move into a resize mid-drag), a body move translating by the geographic delta, and a dragend pass that un-inverts a crossed pair. They require chart `projection` and a `geo*` mark.
   - `pick` selects the target: `direct` (the mark hit), `nearest` (closest within a threshold), `plane` (no target — create), or a driver lifecycle (`sweep` / `draw` / `brush` / `probe`). Multi-event lifecycles live in **self-describing drivers** (`src/edit/drivers/`) — adding an interaction mode is a new driver file, not an engine change.
   - `pick: 'probe'` is the **hover-preview / click-commit** flow, with no drag: the pointer probes a value (the mark follows the cursor as an *uncommitted preview*), and a click settles it. Any edit works this way. Preview and commit run the same `apply` + the same invariants through one code path, so the preview cannot drift from what the click writes — and a preview never reaches `onChange` or `getData`.
   - `when` arbitrates when several edits share a gesture (`vibe.when.alt`, `noAlt`, `shift`, `near`, `far`, …): e.g. plain click recolours, Alt-click deletes.
   - `stage` gates an edit to one step of a multi-stage elicitation ("first X, then Y"). It is a uniform filter applied to every edit — not a new mode. A `probe` click on a staged edit commits that stage's field and advances automatically (freezing it); you can also drive stages yourself with `setStage` / `nextStage`. See `cone` and `trend`.

5. **Constraints (`vibe.constraints.*`)** — **data-layer invariants**: pure rules over the dataset, run on every edit commit (never see pixels). They both *gate* a proposal (return `false` to reject) and *repair* it (return the corrected rows) — and since the rows are shared, a repair propagates to every mark on the next render. Declared on the spec (`constraints: [...]`, the canonical home) or on a mark as sugar, in which case the engine promotes it to the dataset so it still holds for **every** edit from **every** mark. Per-edit sugar is `edit.constrain`. Built-ins: `clamp({ min, max, field })`, `maintainSum({ targetSum, field })`, `count({ max, strategy })`, `unique({ field, max })`, `snap({ field, step, origin })`. Author your own with `constraints.define(reducer, meta?)` — write just the rule against a clean data context and return a number (set the field), object (merge), array (replace dataset), or `false` (reject).

6. **Guides (`vibe.guides.*`)** — non-interactive annotations, rebuilt every render so they track live data. `guides.rule` (reference line), `guides.region` (shaded band), `guides.proximity` (nearest-pick selection), `guides.custom(fn)` (draw arbitrary nodes from the render context). An edit's own constraint bounds + snap ring draw automatically when it declares `guide: true`. Guide nodes never capture the pointer, which is why the survey widgets' affordances live here.

7. **Format (`vibe.format.*`)** — display formatters for text marks (and anywhere a value is shown as a string). A mark's `format` option takes a d3-format string or `(v) => string`; helpers mint common ones (`format.number('.1f')`, `format.percent()`, `format.si()`, `format.time('%b %Y')`, `format.prefix('$')`, `format.suffix(' kg')`). Display-only — the underlying field stays the raw value.

8. **Widgets (`vibe.widgets.*`)** — higher-level named elicitations, each a pure recipe over the core API (no new interaction surface): `likert`, `multipleChoice`, `slider`, `matrix`, `lineCone`. Each returns an **ElicitSpec** you pass straight to `Elicit(widgets.likert({…}))`. They look like survey instruments rather than charts — option rings, a cell grid, a track — but that styling is *only* the guide layer (`widgets.THEME`, `optionRings`, `cellGrid`, `sliderTrack`, `crosshair`), so each has a plain-chart twin built from the same mark, edit and constraint.

9. **Renderer (`vibe.D3Renderer`)** — draws the scene graph to SVG via D3, binding drag/click. Swappable for Canvas/WebGL/etc.

**Reading data out.** `Elicit(spec)` returns the chart element augmented with a small observation API: `getData()` (a deep copy of the committed belief dataset), `getSchema()` (a deep copy of the engine-owned schema, including any domain an editable axis reshaped — the caller's `spec.schema` is never mutated), `setData(data)` (seed/reset + re-render), and `on("change" | "stage", cb)` (subscribe; returns an unsubscribe). This is in addition to the spec's `onChange`.

**Sizing.** `width`/`height` are pixels by default (`responsive: "fixed"`). Set `responsive: "scale"` to wrap the SVG in a `viewBox` so the browser scales it to fill the parent (one draw, aspect ratio preserved), or `responsive: "reflow"` (alias `true`) to measure the parent and redraw at native pixels on resize (crisp text; width tracks the container, height stays the given value). A reflow chart wires a `ResizeObserver` — call `el.destroy()` when unmounting it. See `docs/sizing.html`.

---

## Project structure

```text
vibe-js/
├── src/
│   ├── core/
│   │   ├── elicit.js       # Engine: state store, scale resolution, event routing, render loop
│   │   ├── lock.js         # Read-only rows (spec.lock): the invariant + the pointer policy
│   │   ├── axes.js         # Resolve the global `axes` convenience into axis/grid marks
│   │   ├── resolve.js      # Global per-channel scale resolution
│   │   ├── scales.js       # Scale wrappers (encode / invertValue) over d3-scale
│   │   ├── encoding.js     # Channel inference + invert primitives
│   │   ├── projection.js   # Chart geographic projection (apply / invert / path)
│   │   ├── tiles.js        # Slippy-map tile cover for geoTile (Web Mercator check + {z}/{x}/{y} placement)
│   │   ├── samples.js      # Domain sampling for line authoring
│   │   ├── effects.js      # Interaction-feedback layer (grab / select)
│   │   └── scene.js        # Abstract scene graph
│   ├── plot/               # Marks (mark.js = shared channel/style foundation)
│   │   ├── point.js · face.js · bar.js · rect.js · tick.js · text.js · line.js · rule.js · composite.js · axis.js
│   │   ├── geo.js · needle.js · axisRadial.js · arc.js · polar.js
│   │   ├── dotStack.js · waffle.js · cone.js · trend.js
│   ├── edit/               # The edit model
│   │   ├── basic.js        # Universal edits (drag/dragSpan/brushSpan/brushRect/resize/rotate/cycle/create/toggle/remove/editText/custom)
│   │   ├── line.js         # Line-scoped edits (anchor/newSeries/draw/sweep/removeSeries)
│   │   ├── axis.js         # Axis-scoped edits (scale/categories) — write the schema DOMAIN, not the dataset
│   │   ├── geo.js          # Geo-scoped edits (drag/create/draw/dragVertex/brush/createRect)
│   │   ├── when.js         # Arbitration predicates
│   │   ├── pick.js         # Target selection (nearest / proximity)
│   │   ├── route.js        # collectEdits / resolveChannels
│   │   ├── guide.js        # An edit's self-drawn guide (bounds + snap ring)
│   │   ├── shared.js       # makeEdit + datum/series helpers
│   │   └── drivers/        # Self-describing interaction modes (plane/nearest/sweep/draw/brush/brushRect/geoBrush/probe/axisDrag)
│   ├── constraints/        # Data-layer invariants (define/clamp/maintainSum/count/unique/snap)
│   ├── widgets/            # Named survey instruments (likert/choice/slider/matrix/lineCone) + theme.js
│   ├── guides/             # rule / region / proximity / custom annotations
│   ├── format.js           # Display formatters (number/percent/si/time/prefix/suffix)
│   ├── renderers/
│   │   └── d3-renderer.js  # The default SVG renderer
│   ├── types.d.ts          # Type contracts for the whole API
│   └── index.js            # Public API aggregator
├── index.html              # Landing page → docs/
├── docs/                   # Classic HTML docs (+ playground.html) — kept for now
├── docs-next/              # Next.js React docs (editable examples + playground)
├── vite.config.js          # Classic docs site build → site/
├── vite.lib.config.js      # Library build → dist/vibe.js
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

## Install & use

VibeJS is ESM. Consumers need a bundler (Vite, webpack, etc.) or a browser that can resolve bare imports via import maps. Runtime dependency: `d3`.

### From source (default — works off `main` with no build)

Clone or install the package and import the public API from the package root. `package.json` points `exports` / `main` at `src/index.js`, so a normal install resolves to source:

```bash
npm install vibe-js
# or, from a checkout / GitHub:
# npm install github:alireza116/ViBe
```

```javascript
import * as vibe from "vibe-js";
const { Elicit, plot, edit, constraints } = vibe;
```

Types ship from `src/types.d.ts` (`"types"` in `package.json`).

### From the built bundle

If you want a single ESM file (CDN, simpler packaging, or to avoid resolving the `src/` tree):

```bash
npm install
npm run build:lib   # → dist/vibe.js (+ sourcemap); d3 stays external
```

Then either:

```javascript
// After publishing / packing with dist/ included:
import * as vibe from "vibe-js/dist";
```

```html
<!-- Browser: load d3 first, then the bundle (adjust paths as needed) -->
<script type="importmap">
  { "imports": { "d3": "https://cdn.jsdelivr.net/npm/d3@7/+esm" } }
</script>
<script type="module">
  import * as vibe from "./dist/vibe.js";
</script>
```

`d3` is not bundled — your app (or the import map) must provide it.

---

## Development

```bash
cd vibe-js
npm install
npm run dev            # classic Vite docs / playground (HTML harness)
npm run dev:docs-next  # Next.js React docs (editable examples)
npm run typecheck      # tsc --noEmit against types.d.ts
npm run verify:browser
```

### Builds (lib, classic docs, and Next docs are separate)

| Command | Config | Output | What it is |
|---|---|---|---|
| `npm run build:lib` | `vite.lib.config.js` | `dist/vibe.js` | Publishable ESM library (`d3` external) |
| `npm run build` / `build:docs` | `vite.config.js` | `site/` | Classic static HTML docs |
| `npm run build:docs-next` | `docs-next/` | `docs-next/.next/` | Next.js React docs |
| `npm run start:docs-next` | — | — | Serve the Next docs production build |
| `npm run preview` | `vite.config.js` | serves `site/` | Preview the classic docs build |

```bash
npm run build:lib         # library → dist/
npm run build:docs        # classic docs → site/
npm run build:docs-next   # React docs (Next)
npm run start:docs-next   # serve React docs
```

### Classic docs (`docs/`)

Kept for now as the historical harness-based site:

- `index.html` — landing page linking into the docs.
- `docs/` — a page per mark and feature; examples are `code` strings run by `_harness.js`.
- `docs/playground.html` — dropdown composition playground.

### Next.js docs (`docs-next/`) — preferred going forward

React/Next App Router site with **live-editable** examples (`react-live` editor + Reset to default). Content lives in `docs-next/content/`; each example is a file under `docs-next/examples/` exporting `{ meta, code }`. The playground (`/playground`) loads curated presets into the same live editor.

```bash
npm run dev:docs-next      # http://localhost:3000
```

To re-generate content/examples/routes from the classic `docs/pages/*.js` modules:

```bash
npm run migrate:docs-next
```

**Reuse in another Next app** (e.g. a lab site): import the docs UI from the package export, or copy `docs-next/`:

```javascript
import { DocShell, ExampleLive, SITE, createVibeScope } from "vibe-js/docs-ui";
```

Chart surfaces are client components (`'use client'`); the lab page that embeds them must be a client boundary too.

---

## Roadmap

- Faceted / coordinated multi-chart layouts (compose multiple `Elicit` instances at the app level for now).
- Animation / alternate renderers (Canvas, WebGL).
- Needle uncertainty fuzz.
