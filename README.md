# VibeJS

VibeJS is a declarative, grammar-of-graphics-inspired JavaScript library designed for structured, interactive visual belief elicitation. Unlike traditional charting libraries that only display static data, VibeJS enables the creation of interactive empty or pre-filled charts where users can directly construct or modify data points (expressing their beliefs) through intuitive mouse/touch gestures.

This library is decoupled from any single rendering framework. It maintains an internal abstract Scene Graph representing the shapes to be drawn, which is then translated by a pluggable renderer (such as the D3-based SVG renderer) into pixels.

---

## Architecture Overview

VibeJS is structured into modular layers to maximize extensibility:

1. **Core Engine (`vibe.Elicit`)**
   - The central orchestrator of the elicitation process.
   - Parses the chart specification, maintains the reactive state of the user's belief data, and generates the abstract layout.
   - Hosts the event router which dispatches interactive events to the configured interactors.

2. **Abstract Scene Graph (`src/core/scene.js`)**
   - An intermediate, layout-calculated collection of abstract shapes (like `rect`, `line`, `text`).
   - Completely independent of DOM structures or specific rendering libraries.

3. **Features/Marks (`vibe.plot.*`)**
   - Pure, stateless data-to-geometry mappers that **compose across scale types and orientations** — the mark reads its channels through whatever scales the spec provides, so the same mark transposes itself to fit the data.
   - `plot.bar` → `rect` nodes. The **band** axis is the category (sets position + thickness); the **linear** axis is the value (sets length from a baseline). Orientation is auto-detected from the scale types: `x: band, y: linear` gives vertical bars, `x: linear, y: band` gives horizontal bars. `plot.barY` / `plot.barX` force an orientation.
   - `plot.dot` → `circle` nodes, for any per-axis scale type: linear×linear (scatter), band×linear (categorical scatter — dots centered in each band), or a single scale (1D strip plot — the missing dimension parks at center).
   - `plot.ruleY` produces horizontal baseline reference annotations.
   - Both scales are optional; a mark with only one scale renders a 1D plot.

4. **Interactors (`vibe.interactors.*`)**
   - Behaviors mapped to specific features in the specification. Each interactor declares an event **target scope** that determines how it is wired up:
     - **`target: 'mark'` — direct interactions.** Bound to existing rendered marks; fire on the mark itself. `dragY` (move a bar's value) and `dragXY` (move a scatter point in x and y) are direct-manipulation change interactions.
     - **`target: 'plane'` — background interactions.** Bound to the plot background, so they capture the pointer anywhere:
       - `create` appends a new datum at the pointer (a _create_ interaction).
       - `proximityDrag` selects the **nearest mark within a pixel threshold** and moves it (a _change_ interaction that doesn't require a precise hit). This makes small bars grabbable anywhere in their column and circles grabbable from nearby.
   - An interactor translates screen coordinates back into data coordinates using inverted scales and returns a proposed dataset, which is then filtered through the interactor's constraints before being committed.
   - **Proximity mode & gesture differentiation.** When a plane interactor uses pointer-move/drag gestures (proximity), the plane sits above the marks and owns all pointer events, so it can drive a live _hover_ highlight (nearest mark within threshold — nothing snaps when far) and lock the selection at drag start. Because create and change now share the plane, they are told apart by **gesture**: e.g. `create({ trigger: 'dblclick' })` for creation vs. drag for moving. Threshold and drag axis are configurable: `proximityDrag({ threshold: 40, axis: 'y' })` for bars, `axis: 'xy'` for scatter.

5. **Constraints (`vibe.constraints.*`)**
   - Guard functions that **limit** the data updates proposed by interactors, so the user can drag freely up to a boundary and is stopped there. Constraints compose: each is fed the result of the previous one.
   - **Authoring your own — `constraints.define(reducer, meta?)`.** This is the extension point every built-in is built on. Instead of hand-writing the plumbing (locate the active datum, map the array, return a new one), you write just the _rule_ against a clean context and return a value in whatever shape is natural:

     ```javascript
     // context: { data, oldData, scales, xKey, yKey, nodeData, index, active, activeX, value }
     const snapTo5 = vibe.constraints.define(
       ({ value }) => Math.round(value / 5) * 5,
     ); // number  -> constrained y-value
     const onDiagonal = vibe.constraints.define(({ active, xKey, yKey }) => ({
       [yKey]: active[xKey],
     })); // object -> merged into active datum
     const rejectNeg = vibe.constraints.define(({ value }) =>
       value < 0 ? false : value,
     ); // false   -> reject interaction
     const normalize = vibe.constraints.define(({ data, yKey }) => {
       // array   -> full replacement dataset
       const total = data.reduce((s, d) => s + d[yKey], 0);
       return data.map((d) => ({ ...d, [yKey]: d[yKey] / total }));
     });
     ```

     `meta` may carry `{ type, options }` for guide introspection, and/or a `guide(ctx)` function so a custom constraint can draw its own visual guide via `guides.constraints`. (`constraints.custom` is an alias.)

   - Built-ins (both authored with `define`):
     - `clamp({ min, max })`: Restricts the dragged value to a range (e.g., keeping a bar between 0% and 50%). Omitted bounds default to the y-scale domain.
     - `maintainSum({ targetSum })`: Bounds the dragged datum so the total of all values never exceeds `targetSum` — values grow only until the budget is exhausted, then stop.

6. **Guides (`vibe.guides.*`)**
   - Purely visual, non-interactive annotations that **guide** the user's interaction, rebuilt on every render so they stay **context-dependent** (they track the live data).
   - `guides.constraints({ target })` introspects the constraints attached to a feature's interactors and draws where each one currently limits interaction:
     - `clamp` → shaded "allowed" band plus min/max boundary lines.
     - `maintainSum` → a cap tick over each bar showing how high it can go given the current total of the others; the ticks move as the user drags.
   - `guides.proximity({ target })` visualizes proximity selection: a dashed threshold ring around the pointer plus a bright highlight on the currently-snapped mark (a ring for circles, an outline for bars). Added automatically when a `proximityDrag` has `highlight: true` (the default).
   - Declared either as a top-level `guides: [...]` array on the spec, or automatically from an interactor: `showGuides: true` adds a constraints guide (e.g. `dragY({ showGuides: true })`) and `highlight` adds a proximity guide, each without repeating the feature id. Both accept an options object, e.g. `showGuides: { color: "#2a9d5c" }`.

7. **Renderer Abstraction (`vibe.D3Renderer`)**
   - Draws the abstract Scene Graph onto the screen.
   - The default `D3Renderer` uses D3 selections to generate SVG nodes and bind drag behaviors. This abstraction allows the library to be easily ported to standard Canvas, WebGL, or non-D3 renderers in the future.

---

## Project Structure

```text
vibe-js/
├── src/
│   ├── core/
│   │   ├── elicit.js      # Main entry point; coordinates state and event routing
│   │   ├── scales.js      # Abstract scale generators wrapping d3-scale
│   │   └── scene.js       # Abstract scene graph definitions
│   ├── renderers/
│   │   └── d3-renderer.js # The ONLY renderer module (SVG drawing with D3)
│   ├── plot/              # The plot sub-module for visual marks
│   │   ├── index.js
│   │   ├── bar.js         # rect mark: bar / barY / barX (orientation from scales)
│   │   ├── dot.js         # circle mark: any scale type per axis, incl. 1D
│   │   └── rule.js        # Abstract reference line generator
│   ├── interactors/       # Interaction specifications
│   │   ├── index.js
│   │   ├── drag.js        # dragY / dragXY change interactions (mark-target)
│   │   ├── create.js      # create interaction (plane-target; click/dblclick)
│   │   └── proximity.js   # proximityDrag: nearest-mark selection (plane-target)
│   ├── constraints/       # Predicates / filters for interaction data
│   │   ├── index.js
│   │   ├── define.js      # Abstract base + user extension point (define/custom)
│   │   ├── clamp.js       # Bound restrictor (authored via define)
│   │   └── maintainSum.js # Cumulative value constraint (authored via define)
│   ├── guides/            # Context-dependent visual interaction guides
│   │   ├── index.js
│   │   ├── constraints.js # Draws where constraints limit interaction
│   │   └── proximity.js   # Highlights the nearest-mark proximity selection
│   └── index.js           # Public API aggregator
├── index.html             # Landing page → links into docs/
├── docs/                  # Multi-page documentation site
│   ├── _nav.js            # Sidebar sitemap (groups → pages)
│   ├── _harness.js        # Shared render engine (highlight + renderPage)
│   ├── styles.css         # Shared docs stylesheet
│   ├── pages/             # One example module per page
│   ├── marks/ · editing/  # Feature pages (bar, tick, point, line, …)
│   └── playground.html    # Composition playground
├── vite.config.js         # Dev server hot-reloading configurations
└── package.json
```

---

## Example API Usage

Constructing a belief elicitation tool is simple and completely declarative:

```javascript
import * as vibe from "vibe-js";

const beliefChart = vibe.Elicit({
  width: 600,
  height: 400,
  // Specify layout axes and domains
  x: { type: "band", domain: ["A", "B", "C", "D"] },
  y: { type: "linear", domain: [0, 100] },

  // Context-dependent visual guides (non-interactive)
  guides: [
    // Draws where the bars' constraints currently limit interaction
    vibe.guides.constraints({ target: "elicited-probabilities" }),
  ],

  // Construct the chart using features
  features: [
    // 1. Static reference line showing 50%
    vibe.plot.ruleY({ y: 50, stroke: "red", strokeDasharray: "4" }),

    // 2. Interactive bars that users can drag
    vibe.plot.barY({
      id: "elicited-probabilities",
      data: [
        { x: "A", y: 25 },
        { x: "B", y: 25 },
        { x: "C", y: 25 },
        { x: "D", y: 25 },
      ],
      x: "x",
      y: "y",
      fill: "purple",
      interactors: [
        vibe.interactors.dragY({
          // Guard updates with specific constraints
          constraints: [
            vibe.constraints.clamp({ min: 0 }), // prevent negative values
            vibe.constraints.maintainSum({ targetSum: 100 }), // cap total sum to 100
          ],
          onChange: (newData) => {
            console.log("Current elicitation state:", newData);
          },
        }),
      ],
    }),
  ],
});

// Append the generated container to your page
document.getElementById("chart-container").appendChild(beliefChart);
```

---

## Development

To start the demo playground with live hot-reloading:

```bash
cd vibe-js
npm install
npx vite
```

- `index.html` — the landing page, linking into the docs.
- `docs/` — a multi-page documentation site: a page per mark (bar, tick, point, line) and per feature (editing, scales, constraints, effects, guides, schema), each showing the exact code beside its live result.
- `docs/playground.html` — a **composition playground**: pick a mark, scale types, interaction mode, constraint, and guides from dropdowns and the spec is built and rendered live. The place to test composing new elicitation devices.

---

## Possible improvements / TODO

- **Make the "active datum" hand-off explicit.** Constraints act on the datum being interacted with, identified via `context.nodeData` / `context.nodeIndex`. For mark interactions the core sets these; for plane interactions (`create`, `proximityDrag`) the interactor's handler communicates the active datum by **mutating the shared `context` object** before returning (the core passes the same `context` to the handler and then to the constraints). This works and is commented at each call site, but it is implicit. A cleaner contract would have handlers return a structured result (e.g. `{ data, activeIndex }`) so the active datum is passed forward explicitly rather than via side effect.
- **Dragging along a band axis.** Interactions currently move values along _continuous_ axes only; a band axis fixes position (you drag within a category, not across categories). Cross-category dragging would need band-aware inversion (snap the pointer to the nearest band).
- **Orientation-aware constraint guides.** `guides.constraints` still draws bounds along y (horizontal lines). For horizontal bars the value axis is x, and for scatter a `clamp` would want a box region — the guide geometry should follow the constraint's `valueScale`/orientation.
- `plot.trend` mark and `interactors.clickTrend` are stubbed but not yet implemented.
- A mark-target `delete` interaction (e.g. shift-click a point to remove it) — fits the existing target-scope machinery.
