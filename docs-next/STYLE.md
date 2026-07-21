# Writing docs-next

Target: the terseness and directness of Observable Plot's and Vega-Lite's mark
docs. A reader is building an elicitation chart, not extending VibeJS — write
for the API they call, not the engine behind it. `concepts/page.mdx` is the
calibration page — its density and tone is the target for every other page.

1. **State the why, not the internal how.** Keep causal facts in plain
   declarative form ("tiles are pre-rendered in Web Mercator, so it requires
   `projection: "mercator"`" — real, keep it). Cut narration of the engine's
   internal sequence of actions — driver names, "the engine only calls fn
   when...", "the mark checks X, then does Y, then warns." State the
   resulting behavior or constraint, not the mechanism that produces it.
   Don't over-correct into stripping every "why" — `concepts` keeps them
   ("it can't carry an `edit`, because it's opaque to the edit layer").
2. **One idea per sentence.** Break up stacked em-dash/semicolon clauses.
3. **Active, second person.** "Drag the needle to answer," not "the needle
   is dragged" or "the user can drag."
4. **Keep every API fact.** Option names, defaults, required props, gesture
   verbs, real constraints all stay — brevity trims prose, not information.
   Never name an internal-only function (e.g. a private helper like
   `mintDatum`) in reader-facing prose — if it's not exported, it's not the
   reader's concern.
5. **Lead = purpose + primary shape.** A page's `<Lead>` states what the
   mark/edit is for and its main API surface in 1–3 sentences. Sections
   state what a gesture does and what you configure for it.
6. **No analogy or scene-setting.** Skip framing like "the escape hatch,"
   "the Leaflet model," "a natural fit for." State the fact, then the API.
7. **One voice across pages.** Same term for the same idea everywhere:
   "mint" for creating a datum, "re-derives" for recomputing from committed
   rows, British spelling to match the existing corpus (colour, behaviour,
   licence, recolour). Backtick every identifier, option, and function name
   in prose — never a bare `create` or `when`. Bold sparingly, on the one
   key term being introduced (as `concepts` does with **type**, **domain**,
   **read-only**) — never bold a whole clause for emphasis.
8. **One `<Lead>` per page.** It's the singular standfirst paragraph (see
   `Lead.tsx`'s own doc comment) — a second `<Lead>` block fights the
   component. If a page has two distinct points, fold the second into
   whichever `Section` it's actually about.

## Before / after

**`geoTile()`** (marks/geo, tiles section) — states the why in plain terms,
drops the driver-name/procedural narration:

> Before: "For an actual map under your data — streets, water, labels — use
> `geoTile()`: the Leaflet model, a pyramid of 256px images from a tile
> server, laid on the plane behind the marks. **It requires
> `projection: "mercator"`** (unrotated). A tile is a pre-rendered picture
> baked in Web Mercator, so under any other projection it cannot be made to
> register with the data; the mark checks the projection's behaviour, draws
> nothing, and warns rather than showing you a misaligned map."
>
> After: "`geoTile()` lays a raster basemap — a pyramid of 256px tiles from
> a tile server — behind your marks. Tiles are pre-rendered in Web
> Mercator, so it requires `projection: "mercator"`; other projections draw
> nothing and log a warning instead of a misaligned map."

**`custom(fn)`** (editing/gestures, custom section) — also dropped "the
escape hatch" from the section title itself, not just the prose:

> Before: "custom(fn) wraps fn as apply. The edit still declares its
> gesture (default drag) — the engine only calls fn when that gesture
> fires. fn receives the EditContext: ctx.datum is the touched row,
> ctx.event the raw DOM event, plus the pointer, scales, data, … — see the
> Editing overview. Return a new datum (or array); every field you set is
> written into the belief store."
>
> After: "`custom(fn)` sets `fn` as the edit's `apply`. It fires on a
> gesture (`drag` by default). `fn` receives an `EditContext`: `ctx.datum`
> (the touched row), `ctx.event`, plus pointer, scales, and data — see
> Editing overview for the full shape. Return a new datum, or an array of
> data; the fields you set are written back."

**Legend space reservation** (marks/legend, discrete section):

> Before: "`legendColor()` reads the `fill` scale and draws a swatch per
> category. `anchor` picks the side; the engine measures the legend and
> shrinks the plot so the bars never draw underneath it."
>
> After: "`legendColor()` reads the `fill` scale and draws a swatch per
> category. `anchor` sets which side it's on. The plot shrinks to leave
> room, so the legend never overlaps the marks."

**Constraint definition** (constraints, Lead):

> Before: "A constraint is a pure rule over **the dataset**. It holds no
> matter which edit fired it, or which _mark_ that edit was declared on —
> so an invariant written once gates a drag on a bar and a click on a dot
> alike. It can both **reject** a proposal and **repair** it (return the
> corrected rows), and because every mark reads those rows, a repair shows
> up everywhere on the next render. Declare it on the `Elicit` spec
> (`constraints: [...]`); declaring it on a mark is sugar — the engine
> promotes it to the dataset either way."
>
> After: "A constraint is a rule over the dataset. It applies to every edit
> and every mark, regardless of which one declared it. It can reject a
> proposed change, or repair it by returning corrected rows — a repair
> shows up everywhere on the next render, since every mark reads the same
> rows. Declare it in `constraints: [...]` on the `Elicit` spec, or on a
> mark as shorthand; both end up on the dataset."

**Two `<Lead>`s, an internal function name, and a buried correctness rule**
(editing/existence — the worst offender found so far):

> Before: two stacked `<Lead>` blocks. First: "**Creation is mark-agnostic.**
> An edit is the inverse of encoding... That is why a single core
> (`mintDatum`) serves them all, and why the variants differ on just
> **three knobs**: *how many rows*..." Second: "**Declare a creator on
> exactly one mark.** A plane gesture carries no node, so it fans out to
> _every_ mark's plane-pick edits..."
>
> After: one `<Lead>` — "Create and remove work like any edit: `create`
> inverts the clicked pixel into a datum through the same scales `encode`
> uses, then appends it to the dataset — every mark reading those rows
> encodes it, composite glyphs included. `edit.line.anchor` / `newSeries` /
> `draw` extend that to connected paths; `edit.geo.create` / `createRect` /
> `draw` on [Geo](/marks/geo) invert a map projection instead. `remove` and
> `edit.line.removeSeries` take rows back." The "one mark" rule moved into
> the `create` section, next to the example it actually governs.
> `mintDatum` (an internal helper, not exported) was dropped entirely.

## What stays untouched

- `<Section id="...">` values — `scripts/verify-browser.mjs` roots
  assertions on them.
- `_examples/*.example.txt` and `api.tsx` — code and data, not prose.
- `authoring` and `renderers` target SDK authors extending VibeJS, not
  chart authors — architecture vocabulary there is correct, not verbose.
  Tighten sentences; don't strip the depth.
