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

Note what the channel does *not* carry. A field's **data type** and its **domain** describe the data, not one mark's view of it, so they are declared once on the spec's `schema`. The **scale** is then derived: a categorical field on a bar's x is a band (a bar needs the interval), on a dot's x it is a point (a dot wants the tick). Name a scale explicitly only when you want something else — `scale: "log"`, `scale: { type: "symlog" }` (log-like, but it spans zero and negatives, which `log` cannot), `scale: { type: "sqrt", range: [4, 20] }`, or a live `d3.scaleBand().padding(0.3)`, which is adopted as you built it. For a colour channel, set the palette with `scale: { scheme: "tableau10" }` (categorical) or `scale: { scheme: "RdBu" }` (a ColorBrewer diverging / sequential set — discrete for ordinal domains, a two-stop ramp for continuous; add `reverse: true` to flip direction), or a raw `scale: { range: [...] }`. For a value read against a reference — a difference, an error, a surprise — `scale: { type: "diverging", pivot: 0 }` gives each side of the pivot its own half of the ramp, so the pivot keeps the neutral colour even on a lopsided domain like `[-2, 10]` (one ramp stretched across both halves would put "neutral" at 4). The **`symbol`** channel is the same idea for glyphs: a category → an emoji / unicode shape through an ordinal scale, so any shape mark (`point`, `dotStack`, `waffle`) can draw a glyph in place of its circle/rect. Give it glyphs with `scale: { range: ["😢","😐","😊"] }` or a named `scale: { scheme: "faces" }`; edit the underlying category with `cycle()` / `legend()`.

---

## Architecture

VibeJS is layered for extensibility:

1. **Core engine (`vibe.Elicit`)** — the orchestrator (`src/core/elicit.js`). Deep-copies the spec's **one dataset** into a reactive store, resolves one **global scale per channel** (Observable-Plot model), rebuilds the scene each render, and routes gesture events to the matching edits. The unidirectional flow: `gesture → invert through scale → data-space proposal → data invariants → commit → re-render`.

   **One schema.** The schema is the contract of the elicited dataset: every field's measurement type and domain. It is what lets a chart resolve its scales and mint rows from *zero* starter data. Scales are resolved per channel by **unioning the schema domains of every field on that axis** — so an error bar's `mean`, `lo` and `hi` share one y axis that spans all three.

   **One dataset.** A chart elicits exactly one dataset — even a slider elicits a one-row dataset — so `data` lives on the spec, never on a mark. Each mark is a *view* over those rows: it encodes some columns, and where a channel carries an `edit`, it writes them back. Several marks over the same rows is the point, not a special case: a glyph is just marks that encode different columns of one row (see `composite`), and they all re-derive from the committed data on the next render.

   **Locked rows (`lock`).** Some rows are *given* rather than elicited — the record so far, the points already measured, last quarter's actuals. `lock: "seed"` fixes the rows the chart was seeded with while leaving every row an edit *adds* free; `lock: (d) => d.year <= 1990` locks rows by what they are. A lock is a property of the data, so it sits on the spec beside `data` and `schema`, and it has two halves, both automatic: a **dataset invariant** run last on every commit (so it outranks every other repair — a gesture that spans locked and free rows keeps its changes to the free ones and snaps the locked ones back; deleting a locked row is rejected), and a **pointer** policy (a locked row's marks aren't grabbable, show no editable cursor, and are skipped by proximity picking — so `nearest` / `sweep` / `draw` never target one). That last part is what makes a you-draw-it chart work: because the seeded line is invisible to picking, a drag beside it doesn't grab a frozen line, it starts drawing. `setData` re-seeds the chart, so it re-takes a `"seed"` lock. See the [Locked rows](docs-next/content/editing-lock.ts) docs page (`/editing/lock`).

2. **Abstract scene graph (`src/core/scene.js`)** — a flat, layout-calculated collection of abstract nodes (`circle`, `rect`, `line`, `path`, `text`, `image`), independent of the DOM or any renderer.

3. **Marks (`vibe.plot.*`)** — pure data-to-geometry factories on a shared foundation (`src/plot/mark.js`): every mark resolves its channels through `encodeChannel` and the standard style surface (`fill`, `stroke`, `strokeWidth`, `opacity`, …) the same way. Marks compose across scale types and orientations.
   - `point` → `circle` or centred `rect` (`shape: 'circle'|'square'`; scatter; x/y/size/fill/stroke channels). An `angle` channel orients squares (and symbol glyphs) about their centre — circles are rotation-invariant. Add a `symbol` channel and it draws a glyph (emoji / unicode shape) per datum instead of a circle/square.
   - `face` → an expressive, parametric emotion glyph (Chernoff-style): a datum's fields are encoded into a face with seven params (mouth curve/open/asym, eye scale/squint, brow height/tilt), each editable by **directly manipulating the feature** — grab the mouth and pull it into a smile, drag an eye wider, tilt a brow (2-D drags where a feature carries two params; small eyelid/lip dots for squint & open). The seven params are **channels** — bind them in `channels` (`{ mouthCurve: { field: 'valence' }, … }`), exactly like `fill`/`size`; `face()` is the two-field emotion preset. A single-datum glyph like `trend`; its centre is placed by x/y when present, so a plot of faces is a small-multiple or an emotion-space scatter.
   - `bar` / `barY` / `barX` → `rect` (band axis = category + thickness, linear axis = value — or an explicit start/end span via x1/x2 or y1/y2; orientation auto-detected).
   - `rect` / `rectX` / `rectY` → the generalized bar: each axis independently resolves a **span** (x1/x2, y1/y2), a **band**, or a baseline→value length, so a rectangle can span both axes (heatmap cells, 2-D regions, binned histograms). Carries `angle` like other geometry marks. `brushRect()` adds composable 2-D editing — grab an **edge** to resize a side, a **corner** for two extents, the **body** to move; `resize` (`'both'`/`'x'`/`'y'`/`'none'`) and `move` (bool) make it opt-in.
   - `tick` / `tickX` / `tickY` → `line` (a bar's zero-thickness sibling); optional `angle` rotates about the segment midpoint.
   - `text` / `textX` / `textY` → a per-datum `text` label (string at x/y; `text`/`fontSize`/`textAnchor`/`lineAnchor`/`dx`/`dy` raw, `angle` in math degrees, `format` a d3-format string or function for display). Editable like any mark: `drag` to reposition, a value channel sharing the label's field for a draggable numeric readout, `cycle`/`rotate`, or `editText()` to double-click-and-retype (an inline input; the renderer owns the keyboard lifecycle and emits a `commit` gesture).
   - `line` / `lineY` / `lineX` / `connectedScatter` / `path` → a connecting `path` per series plus one `circle` handle per datum; grouped by `series`, ordered by `order`.
   - `area` / `areaY` / `areaX` → a filled path per series (the distributional sibling of `line`), sharing its `series` / `order` / `curve` / handle machinery. Fills to the value axis's baseline — or, given an endpoint **pair** on that axis (`y1` + `y2`, or `x1` + `x2`), **between** them: the uncertainty band, a confidence interval or fan chart. That is the same span-vs-baseline split `bar` and `rect` make, spelled the same way, rather than a separate band mark forking this one. The pair shares the value axis's scale (so it resolves exactly like `y`), declaring one picks the value axis on its own, and **both** edges get handles — so the interval is elicited by dragging its ends. Pair with `ordering({ lower, upper })` so it can't be turned inside-out.
   - `rule` / `ruleX` / `ruleY` → a straight reference line at a data value (`y: { datum: 50 }`), or a **span** segment (a stem / whisker) between `y1`/`y2` (or `x1`/`x2`) at a category. An ordinary editable mark: put an `edit` on an endpoint and the cap becomes a handle.
   - `composite` → a **glyph**: a named group of ordinary marks as `parts` (a stem, a whisker, a dot, two caps). Group-level `channels` (and style/`angle` shorthands) trickle into every part at desugar time — declare a shared `angle` / `x` / `fill` once; part keys win; inherited `edit`s attach to the last part only. Each part encodes some columns of the same rows; a part whose channel carries an `edit` is a handle. It desugars into its parts as plain features — `Elicit` flattens them — so nothing about a glyph reaches the engine. Drag one handle and the rest re-derive from the changed row (lollipop, error bar, rotating `+`). Because each handle is its own mark, dragging one cannot move another: dispatch already routes a gesture to the feature owning the node you touched.
   - `dotStack` / `dotStackY` / `dotStackX` → a stacked dot plot (token counter): one datum per token, tokens sharing a slot stack into a countable column (drop with `create`, take back with `remove`).
   - `waffle` / `waffleY` / `waffleX` → a bar subdivided into a grid of uniform, touching cells (`rect` or `circle`) where one cell is a fixed quantity (`unit`); `value / unit` cells fill, laid out `multiple` across the band (auto-sized square, width ≤ bandwidth) — exact counting and proportion picking. Drive it with `edit.waffle.fill()`, which maps the pointer to the exact cell (row + column) and fills up to and including it, consistently for click and drag.
   - `cone` → a line + cone correlation glyph: a single `{ r, spread }` belief drawn as a rotating mean line plus a `Normal(r, spread)` fan (paired with the `rotate` edit and stages).
   - `needle` → a pivoted gauge/dial pointer (tapered path + hub). Encodes a value on `angle` (degrees via the channel scale; default range `[180, 0]` = left→right through the top). `orient: 'top'|'right'|'bottom'|'left'` (or `arc`/`start`/`end`) picks the semicircle — keep `scale.range` in sync. Optional `x`/`y` place the pivot on categorical or linear axes. Pair with `axisRadial` for chrome and `text` for a center readout.
   - `axisRadial` → circular / semicircular axis chrome (arc spine, ticks, labels, optional colored categorical bands). Sibling of `axisX`/`axisY`; reads the global `angle` scale. Tick labels anchor by angle (so long category names grow outward, not off the edge) and take `tickFormat`/`tickValues`/`labelFill`. Bind `x`/`y` to fields and it draws **one ring per row** — a mini axis around each small-multiple needle.
   - `arc` / `pie` / `donut` → stacked angular slices (part-to-whole). Magnitudes on the `value` channel's field normalize to a full or partial circle; `innerRadius` makes a donut. (The magnitude channel is `value`, not `angle` — across the library `angle` means a rotation, and a slice's share is a quantity the layout turns into one.) Pass `edits: [edit.arc.edge()]` to drag a slice boundary and redistribute the two adjacent shares (see `edit.arc.*` below).
   - `geoBasemap` / `geoTile` / `geoPoint` / `geoPolygon` / `geoLine` / `geoText` / `geoRect` → geographic marks for map elicitation. Chart-level `projection` (`"mercator"`, `{ type, domain, … }`, or a live d3.geo* instance) builds a shared `{ apply, invert, path }` context (not a 1D scale). **Basemap topology is a mark option** — `geoBasemap({ geojson: featureCollection })` (FeatureCollection draws one path per feature). Load your own GeoJSON (`fetch` / `import`) and pass it in; fit with `projection: { type: "mercator", domain: geojson }`. Editable lon/lat, GeoJSON geometries, coordinate lists, and geographic AABBs live on the **dataset**. Pair with `edit.geo.*`. `geoLine` reads its shape from its channels: `coordinates`/`geometry` → **one line per row** (a vertex list each, reshaped with `edit.geo.dragVertex`); `lon`/`lat` → **one path across the rows** in `order` (default `'sequence'`), grouped by `series` — the geographic connected scatter, the geo sibling of `path`. Put the dots on a sibling `geoPoint` and the trail re-derives as they're dragged. `geoTile({ url })` is a **raster** basemap — the Leaflet model, a pyramid of `{z}/{x}/{y}` images (OSM by default, or any tile server) laid behind the marks, keyed so on-screen tiles survive a re-render without re-fetching. It **requires `projection: "mercator"`**: a tile is a picture pre-baked in Web Mercator, so under any other projection it cannot register with the data — the mark verifies the projection by *behaviour* (probing that lon/lat land where the Mercator formula says, which rejects an equirectangular that agrees on the equator, and an oblique rotation) and warns instead of drawing a misaligned map. Attribution is a licence condition of every tile service and is drawn by default; public OSM tiles are rate-limited, so point `url` at your own server for production. `geoText` is the `text` mark with the projection doing the placement: position is the only thing a projection changes about a label, so it shares `text.js`'s node builder (`textNodeAt`) and inherits the whole text surface unchanged — `editText()` to retype content, `cycle()` for a categorical label, `rotate()` on `angle`, `dx`/`dy` to nudge the glyph off its anchor. Pair it with a sibling `geoPoint` over the same rows and dragging the dot carries the label. GeoJSON must use RFC 7946 ring winding: a reversed exterior ring reads to d3 as the polygon's *complement* (it "covers the globe"), which silently fits the projection to the whole world — `createProjection` dev-warns and names the offending features.
   - `trend` → an intercept-then-slope line: `{ intercept, slope }` with an intercept handle (translate) and a slope handle (rotate about the anchor), stageable.
   - `axis` / `axisX` / `axisY` / `grid` / `gridX` / `gridY` → composable axis & gridline marks (or use the global `axes` convenience). Pass an `edit` to make an axis **interactive** — see `edit.axis.*` below.

4. **Edits (`vibe.edit.*`)** — a gesture that writes a channel back to the data. An edit is a small descriptor `{ gesture, channels, when, pick, scope, constrain, guide, apply }`, declared **co-located** on a channel (`channels.y.edit = drag()`) or at **mark level** (`edits: [...]`).
   - **Universal** edits (any mark): `drag`, `dragSpan` / `brushSpan` (move / edge-resize a 1-D span), `brushRect` (composable 2-D edge/corner/body editing of a rect's four extents), `resize`, `rotate` (pointer angle about the plot centre — or `pivot: 'mark'` — → a channel value; `fold: false` for full-circle dials; `pick: 'direct'` for a needle handle), `cycle`, `create`, `toggle` (click a slot to pick or un-pick it), `remove`, `editText` (retype a text mark's content), `rank` (drag to reorder a ranked slot), `legend` (click a legend swatch to set a discrete field — pair with `guides.legend()`, which shares its layout), `custom`.
   - **Line-scoped** edits, namespaced as `edit.line.*` so their scope is visible: `anchor` (add one point), `newSeries` (seed a whole line), `draw` (author a line by dragging), `sweep` (you-draw-it repaint), `removeSeries` (delete a whole line).
   - **Axis-scoped** edits, namespaced as `edit.axis.*` — the one family that writes the **schema's domain**, not a datum (they carry `target: 'domain'`): `edit.axis.scale()` drags a numeric/temporal axis's end-handle to grow/shrink its range (`mode: 'grow'` resizes the chart instead of rescaling in place); `edit.axis.categories()` adds / renames / removes categories on a discrete axis (reusing the `editText` inline-typing lifecycle; rename relabels matching rows, remove deletes them; `mode: 'grow'` grows the chart by one band-step per category instead of re-dividing it — e.g. extending a 5-point Likert scale to 7). The domain lives on the schema and scales re-resolve every render, so the grid, guides and marks reflow for free. Read the reshaped domain with `el.getSchema()`.
   - **Waffle-scoped** edit, namespaced as `edit.waffle.*`: `edit.waffle.fill()` fills a `waffle` up to (and including) the exact cell under the pointer — it reads the grid geometry the mark stamps on each cell, so it resolves row *and* column instead of rounding a 1-D value.
   - **Arc-scoped** edit, namespaced as `edit.arc.*`: `edit.arc.edge()` drags a slice boundary of an `arc`/`pie`/`donut` to move value between the two touching rows — one grows by what the other loses, holding the total fixed. Every boundary gets a grab handle, including the seam that wraps the last slice back to the first on a full circle (so *n* slices → *n* handles); `handles: false` keeps them grabbable but invisible.
   - **Geo-scoped** edits, namespaced as `edit.geo.*`: `drag` / `create` (lon/lat via `projection.invert`), `draw` / `dragVertex` / `removeVertex` (coordinate-list lines: author, reshape, simplify), `brush` / `createRect` (geographic west/south/east/north boxes). `brush` runs on the `geoBrush` driver — edge/corner/body, with the grabbed zone latched at **dragstart** and held for the gesture (re-deciding it per tick turns a move into a resize mid-drag), a body move translating by the geographic delta, and a dragend pass that un-inverts a crossed pair. They require chart `projection` and a `geo*` mark.
   - **Scope goes in the name.** A namespaced edit (`edit.line.*`, `edit.arc.*`, `edit.waffle.*`, `edit.geo.*`, `edit.axis.*`) needs the matching mark family, and each declares a `scope` naming the mark capability it requires. Attach one to a mark that lacks the capability and the engine dev-warns rather than leaving you with a gesture that silently does nothing.
   - `pick` selects the target: `direct` (the mark hit), `nearest` (closest within a threshold), `plane` (no target — create), or a driver lifecycle (`sweep` / `draw` / `brush` / `probe`). Multi-event lifecycles live in **self-describing drivers** (`src/edit/drivers/`) — adding an interaction mode is a new driver file, not an engine change.
   - `pick: 'probe'` is the **probe / settle** flow: the pointer probes a value and the proposal follows the cursor as an inert **ghost** (the committed mark stays put — so nothing flickers, even on a matrix), and a **commit** settles it. Two gestures commit, so both natural expectations work — **move-then-click**, and **grab-and-drag** (press on the mark, drag, release). Any edit works this way. Preview and commit run the same `apply` + the same invariants through one code path, so the ghost cannot drift from what a commit writes — and a preview never reaches `onChange` or `getData`. The ghost is drawn by the engine's ghost pass (only the rows a proposal would change, styled by `theme.ghost`).
   - `when` arbitrates when several edits share a gesture (`vibe.when.alt`, `noAlt`, `shift`, `near`, `far`, …): e.g. plain click recolours, Alt-click deletes.
   - `stage` gates an edit to one step of a multi-stage elicitation ("first X, then Y"). It is a uniform filter applied to every edit — not a new mode. A `probe` click on a staged edit commits that stage's field and advances automatically (freezing it); you can also drive stages yourself with `setStage` / `nextStage`. See `cone` and `trend`.

5. **Constraints (`vibe.constraints.*`)** — **data-layer invariants**: pure rules over the dataset, run on every edit commit (never see pixels). They both *gate* a proposal (return `false` to reject) and *repair* it (return the corrected rows) — and since the rows are shared, a repair propagates to every mark on the next render. Declared on the spec (`constraints: [...]`, the canonical home) or on a mark as sugar, in which case the engine promotes it to the dataset so it still holds for **every** edit from **every** mark. Per-edit sugar is `edit.constrain`. Built-ins fall into three kinds — **bounds**: `clamp({ min, max, field })`, `snap({ field, step, origin })`; **cardinality**: `count({ max, strategy })`, `unique({ field, max })`, `maintainSum({ targetSum, field })`; and **shape**: `ordering({ fields })` keeps fields of a row in order (`lo <= mean <= hi`, so an interval glyph can't be dragged inside-out), `monotonic({ field, along, dir })` stops a curve reversing along an axis (a CDF that dips means negative probability mass), `spacing({ field, min })` keeps adjacent values a minimum distance apart. The shape rules **repair by pushing the neighbours aside**, holding the field you actually dragged — they know which one that is by diffing against the previous rows — so a crossed handle reads as the interval moving rather than as the handle sticking (`ordering`'s `mode: 'block'` rejects instead). Author your own with `constraints.define(reducer, meta?)` — write just the rule against a clean data context and return a number (set the field), object (merge), array (replace dataset), or `false` (reject).

6. **Guides (`vibe.guides.*`)** — non-interactive annotations, rebuilt every render so they track live data. `guides.rule` (reference line), `guides.region` (shaded band), `guides.proximity` (nearest-pick selection), `guides.custom(fn)` (draw arbitrary nodes from the render context). An edit's own constraint bounds + snap ring draw automatically when it declares `guide: true`. Guide nodes never capture the pointer, which is why the survey widgets' affordances live here.

7. **Format (`vibe.format.*`)** — display formatters for text marks (and anywhere a value is shown as a string). A mark's `format` option takes a d3-format string or `(v) => string`; helpers mint common ones (`format.number('.1f')`, `format.percent()`, `format.si()`, `format.time('%b %Y')`, `format.prefix('$')`, `format.suffix(' kg')`). Display-only — the underlying field stays the raw value.

8. **Widgets (`vibe.widgets.*`)** — higher-level named elicitations, each a pure recipe over the core API (no new interaction surface): `likert`, `multipleChoice`, `slider`, `matrix`, `lineCone`, `ranking`, `allocation`, `probabilityTokens`, `interval` (alias `ci`), `histogram`, `region`, `thermometer`, `labeledValue`. Each returns an **ElicitSpec** you pass straight to `Elicit(widgets.likert({…}))`. They share one option contract — `question`, `value`/`values`, `onChange`, `width`/`height`, `stage`, and `theme` — and look like survey instruments rather than charts (option rings, a cell grid, a track), but that styling is *only* the guide layer (`optionRings`, `cellGrid`, `sliderTrack`, `crosshair`), so each has a plain-chart twin built from the same mark, edit and constraint. Pass `theme: themes.survey` (or any partial) and the whole family restyles at once.

9. **Theme (`vibe.themes`, `setTheme`, `spec.theme`)** — the **style layer**: one data object of default colours, fonts, a `background`, and affordance tokens, deep-merged over the built-in `DEFAULT_THEME`. It supplies the *defaults* marks/chrome/renderers draw with (a per-datum paint channel still wins, and per-mark `theme.marks[name]` overrides sit in between). Resolved once per chart the way `effects` is (`spec.theme → resolveTheme → ctx.theme`, threaded to marks on the scale map), so it never adds a second style path. Built-ins: `themes.survey` (a professional survey look) and `themes.dark` (a self-contained dark mode — its `background` token paints the chart's own surface). `setTheme(partial)` sets an app-wide default. See `/theming`.

10. **Renderer (`vibe.D3Renderer`)** — draws the scene graph to SVG via D3, binding drag/click. Swappable for Canvas/WebGL/etc.

**Reading data out.** `Elicit(spec)` returns the chart element augmented with a small observation API: `getData()` (a deep copy of the committed belief dataset), `getSchema()` (a deep copy of the engine-owned schema, including any domain an editable axis reshaped — the caller's `spec.schema` is never mutated), `setData(data)` (seed/reset + re-render; also clears the undo history, since a reseed is a new starting point rather than an edit), and `on("change" | "stage", cb)` (subscribe; returns an unsubscribe). This is in addition to the spec's `onChange`.

**Taking it back.** `undo()` / `redo()` step through the elicitation's history, with `canUndo()` / `canRedo()` for a button's disabled state. The unit is a **gesture**, not a commit: a drag writes on every pointermove, so undo reverses the whole drag rather than replaying it backwards a pixel at a time. History is snapshot-based (an edit's `apply` is already pure, so the state before it *is* the undo — no edit describes its own inverse) and covers the schema too, so undoing a category-add puts the domain, the rows and the chart size back together. Both fire the ordinary `change` notification.

**Keyboard.** A pointer isn't the only way to say what you believe. Any mark carrying a direct-pick edit is focusable, and the arrow keys drive that same edit (Shift for a coarser step) — the renderer reports "one step this way" and the engine resolves it against the channel's scale into the pixel a pointer would have been at, so a step means *the next category* on a band axis and a fraction of the range on a continuous one. No separate keyboard edit exists, and each press is its own undo entry. Pair it with `snap` and the keyboard lands on exact stops.

**Sizing.** `width`/`height` are pixels by default (`responsive: "fixed"`). Set `responsive: "scale"` to wrap the SVG in a `viewBox` so the browser scales it to fill the parent (one draw, aspect ratio preserved), or `responsive: "reflow"` (alias `true`) to measure the parent and redraw at native pixels on resize (crisp text; width tracks the container, height stays the given value). A reflow chart wires a `ResizeObserver` — call `el.destroy()` when unmounting it. See the [Responsive sizing](docs-next/content/sizing.ts) docs page (`/sizing`).

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
│   │   ├── theme.js        # Style layer: DEFAULT_THEME, resolveTheme, setTheme, per-mark defaults
│   │   ├── themes.js       # Built-in themes (default, survey)
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
│   ├── widgets/            # Named survey instruments (likert/choice/slider/matrix/lineCone/ranking/allocation/…) + shared.js (contract) + theme.js (affordances)
│   ├── guides/             # rule / region / proximity / custom annotations
│   ├── format.js           # Display formatters (number/percent/si/time/prefix/suffix)
│   ├── renderers/
│   │   └── d3-renderer.js  # The default SVG renderer
│   ├── types.d.ts          # Type contracts for the whole API
│   └── index.js            # Public API aggregator
├── docs-next/              # The docs: Next.js site with editable examples
├── scripts/
│   └── verify-browser.mjs  # The regression gate: real Chromium over the docs
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
npm run dev            # the docs, live (http://localhost:3000)
npm run typecheck      # tsc --noEmit against types.d.ts
npm run verify:browser # the regression gate: real Chromium over the docs
```

### Builds (the library and the docs site are separate)

| Command | Config | Output | What it is |
|---|---|---|---|
| `npm run dev` | `docs-next/` | http://localhost:3000 | The docs, live |
| `npm run build:lib` | `vite.lib.config.js` | `dist/vibe.js` | Publishable ESM library (`d3` external) |
| `npm run build:docs` | `docs-next/` | `docs-next/.next/` | The docs site |
| `npm run start:docs` | — | — | Serve the docs production build |
| `npm run typecheck` | `tsconfig.json` | — | `tsc --noEmit` against `src/types.d.ts` |
| `npm run verify:browser` | `scripts/` | — | The regression gate (real Chromium over the docs) |

```bash
npm run dev               # the docs, live
npm run build:lib         # library → dist/
npm run build:docs        # docs site
```

### Docs (`docs-next/`)

A Next App Router site with **live-editable** examples (`react-live` editor + Reset to default), and the project's only documentation — the older harness-based `docs/` tree was retired in favour of it.

**Everything for a page lives in its route folder.** `docs-next/app/marks/bar/` holds `page.mdx` (the prose, as markdown), `api.tsx` (the reference table, as JSX), and `_examples/*.example.txt` (the chart bodies — a bare `mount(Elicit({…}))` script each). The page imports its examples directly:

```mdx
import verticalBar from './_examples/a-vertical-bar-chart.example.txt';

<Section id="basics" title="Band × value">

The band axis slots the bars; the linear axis sets their length from a baseline.

<Example code={verticalBar} title="A vertical bar chart" blurb="x band, y value." />

</Section>
```

`_examples/` is a Next private folder, so it never becomes a route. The `.txt` extension is deliberate: it stops the bundler parsing a chart body as a module, which would inject dev HMR / `import.meta` into the string the editor evals. `docs-next/lib/nav.ts` is the sidebar; a page's in-page anchors are read from its `<Section>` ids. `@vibe` aliases `src/index.js`, so every example on the site runs against the source.

Two rules worth knowing before editing the docs UI:

- **Section ids are load-bearing.** `verify:browser` roots assertions at them with descendant selectors (`#band .chart > div`), so the id must stay on an element that *contains* the examples. That's why `<Section>` exists and why the MDX pipeline runs with **no remark/rehype plugins** — `rehype-slug` would move ids onto the `<h2>` and silently break ~20 checks.
- **Prose is JSX, not HTML strings.** `dangerouslySetInnerHTML` appears exactly once (the `getData()` panel, which formats its own HTML). Don't reintroduce it: rendering markup from a string is what made a whole class of "tags printed on screen" bugs invisible.

The docs are also the **test suite**. `npm run verify:browser` boots this site, evaluates every example, and drives real gestures against them — see below.

**Reuse in another Next app** (e.g. a lab site): import the docs UI from the package export, or copy `docs-next/`:

```javascript
import { DocShell, ExampleLive, Section, SITE, createVibeScope } from "vibe-js/docs-ui";
```

Chart surfaces are client components (`'use client'`); the lab page that embeds them must be a client boundary too.

---

## Roadmap

- Faceted / coordinated multi-chart layouts (compose multiple `Elicit` instances at the app level for now).
- Animation / alternate renderers (Canvas, WebGL).
- Needle uncertainty fuzz.
