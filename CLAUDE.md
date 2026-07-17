# CLAUDE.md

Guidance for Claude Code when working in this repo. VibeJS just went through a consistency pass that unified a previously-duplicated API surface (see `git log` for "API Consistency" era commits). The rules below encode the design decisions from that pass — follow them so the API doesn't re-fragment.

## What this is

A declarative viz library for interactive belief elicitation. `Elicit(spec)` renders an SVG chart where gestures write back to data. The core idea: **an edit is the inverse of encoding** — `encode` maps data → visual through a channel's scale; an edit's `apply()` maps a gesture → data through the *same* scale.

Entry points: `src/index.js` (public API), `src/core/elicit.js` (engine), `src/plot/mark.js` (shared mark foundation), `src/edit/index.js` (edit barrel). Read `README.md` for the architecture map before making structural changes.

## Non-negotiable invariants

**The schema owns the data type and the DOMAIN; a mark owns neither.** A field's measurement type (`quantitative`/`categorical`/`ordinal`/`temporal`) and its domain describe the *data*, so they live once on `spec.schema`. A channel's `type` is the **data** type (an override for a field the schema doesn't cover), never a scale type. A channel's `scale` is the scale — a name, a `ScaleSpec`, a live d3 scale, or `null`. There is no `domain` or `range` on a channel. `resolveScales` picks a scale via `scaleTypeFor(channel, measure, discretePref)` and takes the axis domain as the **union of the schema domains of every field bucketed onto it** (`unionDomains`) — that union is why an error bar's `mean`/`lo`/`hi` share one y axis. Don't re-add a per-channel domain "just for this chart"; declare the field.

**Never branch on `scale.type`.** `type` is a label. Control flow reads the capability flags `createScale`/`adoptScale` stamp on every scale: `kind` (`band` | `point` | `continuous` | `discrete`), `temporal`, `invertible`. A `log` scale behaves exactly like a `linear` one everywhere it matters, and a user-supplied `d3.scaleBand()` has no `type` at all — an allowlist of type strings silently marks it non-invertible, so the chart draws and **every edit on that channel dies with no error**. Adding a scale type means adding a case in `core/scales.js` and nowhere else.

**One dataset. `Elicit` owns it; marks never do.** A chart elicits exactly one dataset — even a slider elicits a one-row dataset. `data` lives on `ElicitSpec`; the engine holds it as a single array (`dataset` in `elicit.js`). A mark is a *view* over those rows: it encodes some columns and, where a channel carries an `edit`, writes them back. Do not add a `data` (or `onChange`) option to a mark factory, and do not reintroduce a per-feature data store keyed by feature id — that model made two marks over the same rows impossible and is what forced `composite` to fake a glyph inside one feature.

**A whole-dataset edit belongs on exactly one mark.** A plane gesture carries no node, so it fans to *every* feature's plane-pick edits (`dispatchPlaneEdits`). With one dataset that means `create()` on two marks appends twice per click, and two `rotate()`s rotate twice. Direct-pick edits are immune — they route to the touched node's feature alone. The engine dev-warns (`warnDuplicatePlaneEdits`) rather than branching; keep it that way. Sequential composition of *direct* edits within one event is intended: a coupled edit writes fields, sibling marks re-derive on the next render.

**A mark with no direct-pick edit is pointer-transparent.** The engine sets `pointerEvents:'none'` on such a mark's nodes unless the mark set a value itself. This is load-bearing, not cosmetic: the renderer defaults nodes to `pointer-events:auto` and draws lines *after* circles, so an inert rule (a glyph's whisker) sits above a sibling's handle and would swallow its drag. Don't "optimize" this away.

**One interaction model.** Everything routes through `edit` + drivers. Do not add a second parallel interaction system (an "interactors"-style layer) no matter how convenient it seems for one use case — that duplication is exactly what the consistency pass removed. If an edit needs new behavior, extend the `Edit` descriptor or add a driver; don't build a side path.

**Edits are descriptors, not closures with hidden state.** An edit is `{ type, gesture, channels, when, pick, scope, threshold, into, constrain, guide, apply }` built via `makeEdit` (`src/edit/shared.js`). `apply(ctx)` is pure given `ctx` — it returns a datum (direct edit), a full array (whole-dataset edit), or `undefined` (no-op). Never mutate `ctx.data` in place.

**Multi-event lifecycles are drivers, not engine branches.** If you're adding an interaction mode that needs `hover`/`dragstart`/`drag`/`dragend` state (like `nearest`, `sweep`, `draw`), write a new file in `src/edit/drivers/` implementing `{ name, wants(edit), onEvent(ctx) }` and register it in `drivers/index.js`. **Never** add a new `if (pick === '...')` branch inside `core/elicit.js`'s dispatch — that's the god-module pattern the drivers refactor eliminated. The engine must stay ignorant of specific modes.

**Scope goes in the name.** An edit that only works on marks with series grouping (a `line` family capability) belongs under `edit.line.*` and must set `scope: 'line'` in its descriptor (the engine dev-warns on a scope mismatch — see `warnLineScopeMismatch` in `elicit.js`). A genuinely universal edit (works on any mark) stays top-level in `edit.*`. Don't add a mark-specific edit to the top-level namespace "because it's simpler" — that's the flat-namespace problem the namespacing fixed.

**One positional-resolution path.** Every mark resolves a datum → pixel through `encodeChannel` (`src/plot/mark.js`) for its value axis, or the band-geometry helpers (`bandwidthOf`/`baselineOf`/`isBand`/`isDiscrete` in `core/scales.js`) for its category axis. Do not call `scale(d[key])` directly in a new mark — that reintroduces the "four different ways to place a point" inconsistency that existed across `bar`/`dot`/`rule` before the cleanup. `core/encoding.js` once carried a whole *second*, unused resolution path (`resolveChannel`/`resolveEncoding`/`adjustDatum`/`assignChannel`/`datumFromPointer`); it was deleted. Don't grow another.

**`value` is visual space; `datum` is data space.** On a channel, `{ value: 25 }` is the output — it skips the scale, so on `y` it means pixel 25. `{ datum: 25 }` is in the field's own units and goes *through* the scale, so it lands where y = 25 is. Top-level constant shorthands (`fill: 'red'`, `size: 9`) desugar to `{ value }` via `normalizeMarkOptions`. Keep `SHORTHANDS` (what desugars) distinct from `STANDARD_STYLE_CHANNELS` (what `resolveStyle` sweeps onto a node): `size` belongs to the first only, because marks read it themselves.

**One guide path.** `src/edit/guide.js`'s `buildEditGuide` is the only constraint-guide drawer. If you add a constraint, either let it fall through to no guide (acceptable for cardinality rules like `count`/`unique`) or add a case in `constraintGuide`'s switch — don't create a second standalone guide module that reads the constraint set independently.

**Constraints are pure data invariants, scoped to the dataset.** A constraint (`defineConstraint` in `src/constraints/define.js`) receives `{ data, oldData, activeIndex, active, field, value, domain }` — never pixels, never a scale used as geometry. It may *gate* a proposal (`false`) or *repair* it (return the corrected rows). The canonical home is `spec.constraints`; a mark's `constraints` is sugar the engine **promotes** into one dataset-wide set (`datasetConstraints`, deduped by identity), so an invariant holds for every edit from every mark. Don't scope a constraint back to the feature that declared it — that would let a glyph's cap drag bypass a rule declared on its dot. If a constraint's *guide* only makes sense for certain mark shapes (e.g. `maintainSum`'s cap-tick needs a band axis), guard the guide function, not the constraint itself.

## Adding a new mark

Follow the contract documented at the top of `src/plot/mark.js`. Concretely:
- `build(currentData, scales, width, height) -> FeatureNode[]` is the one required method. `currentData` is the chart's dataset, handed in by the engine — the mark takes no `data` option and no `onChange`.
- Resolve position/style through `encodeChannel` / `resolveStyle` — don't hand-roll scale lookups.
- Set `discreteScale: 'band'` (bar/tick — needs an interval) or `'point'` (point/line — needs a tick), plus `xKey`/`yKey`. This says what the mark needs for *discrete* data; the schema says which fields are discrete. A mark that merely spans (like `rule`) should leave it undefined so a `composite` can stamp its own.
- Return `edits`, `constraints`, `xKey`, `yKey` from the factory. `rule` silently dropped all four for a long time, which made a draggable whisker impossible; if a mark accepts an option, it must pass it on.
- Don't set `pointerEvents` on your nodes to make them inert — leave it, and the engine silences any mark with no direct-pick edit (see the pointer-transparency invariant). Setting it yourself also disables the mark when it *does* carry an edit.
- If the mark groups points into series (a line-family mark), set `seriesKey`, `order`, and `supportsSeries: true` so line-scoped edits and the dev guard work.
- Export both a bare form (auto-detects orientation/axis) and, where the mark has a natural direction, `...X`/`...Y` variants — every directional mark in this codebase (`bar`, `tick`, `line`, `axis`, `grid`, `rule`) follows that pairing. Don't ship an asymmetric `ruleY`-with-no-`ruleX` again.

**Glyphs: prefer a group of marks over one clever mark.** If a glyph's handles map to distinct *fields* of a row, build it as a `composite` — a group that desugars into ordinary marks (`Elicit` flattens nested arrays in `features`). Each handle is then its own feature, so direct-pick dispatch keeps a drag on one handle from touching another, and each handle edits a plain `y`/`x` channel. Only when several handles must live on **one** feature over **one** datum (their positions are *derived*, not fields — see `trend`'s intercept/slope) do you need the `channel` node tag plus a `when: ctx => ctx.node.channel === '…'` guard to arbitrate. Reach for that pattern last; it was `composite`'s old shape and the group form replaced it.

## Adding a new edit

- Universal (any mark) → `src/edit/basic.js`, exported top-level from `edit/index.js`.
- Line-scoped → `src/edit/line.js`, added to the `line` object export (`edit.line.yourEdit`), `scope: 'line'` set.
- Build it with `makeEdit` from `shared.js`; reuse `schemaDefaults`/`nextSeriesKey`/`markCenter` rather than reimplementing them.
- If it needs proximity/target resolution, use `edit/pick.js`'s `nearestMark`/`nearestSeries`/`nearestMarkOnAxis` — don't write a second distance function.
- If it needs a multi-event lifecycle, see "Multi-event lifecycles are drivers" above.
- Create/remove should stay symmetric: if you add a new "build" primitive (like `anchor`/`newSeries`/`draw`), consider whether the corresponding "take apart" primitive exists (`remove`/`removeSeries`) or is a deliberate gap.

## Naming conventions to preserve

- `channels` is the mark's channel map (Observable Plot's word). `EditContext.markChannels` is that map as an edit sees it; `EditContext.channels` / `Edit.channels` are a *list of channel names*. Don't collapse the two.
- `type` is always a **data** type (`MeasureType`). A scale type is named by `scale`, or by `ScaleSpec.type`. The two vocabularies never share a key.
- `size` is a radius in px, on every mark. Not `r`, not `handleRadius` — those were three names for one idea. A sub-element's radius is `handleSize`.
- `fill` / `stroke` are the colour channels. There is no `color` channel (it used to mean a fill fallback on `point`/`line` *and* the label colour on `axis`).
- `series` is the public option name; `seriesKey` is the internal feature field. Don't introduce a third synonym.
- `pick` values are target-selection strategies or driver keys (`direct`, `nearest`, `plane`, `sweep`, `draw`) — not arbitrary interaction descriptors.
- `constrain` (edit-scoped, singular) vs `constraints` (plural, the dataset's invariants — canonical on `spec`, accepted on a mark as sugar and promoted) — keep the distinction; don't rename one to match the other.
- `guide: true` on an `Edit` means "self-draw"; a `Constraint.guide` is a drawer *function*. Same word, deliberately different shapes, both documented in `types.d.ts` — don't try to unify them into one meaning.
- Don't add a second alias for an existing edit (we removed `youDrawIt` as a redundant alias of `sweep`). One documented name per behavior.

## Before committing a structural change

1. `npm run typecheck` (`tsc --noEmit` against `src/types.d.ts`) must stay clean.
2. `npm run verify:browser` must stay green. It is the **only** regression gate (there is no unit-test suite): it boots `docs-next`, drives real Chromium, and asserts actual gesture outcomes. If you touched dispatch, marks, or edits, add a check there — the driver/session state machines only prove out under real pointer events, and every interaction bug this repo has shipped was invisible to typecheck. To drive a gesture by hand: `npm run dev`, then load the route.
3. **`docs-next/` is the documentation.** Update it if the public surface changed — the docs are the regression surface, and a feature with no page effectively doesn't exist. The old `docs/` tree was retired on 2026-07-16; don't recreate an HTML-and-harness docs site beside the Next one.
4. `src/types.d.ts` is the source of truth for shapes (`Edit`, `Constraint`, `FeatureNode`, `Session`, …) — update it alongside any descriptor change.

## Don't reintroduce

- A second interaction/dispatch system alongside `edit`.
- A `data` or `onChange` option on a mark, or a per-feature data store keyed by feature id.
- Constraints scoped to the feature that declared them rather than to the dataset.
- Direct `scale(value)` calls in mark `build()` instead of `encodeChannel`.
- A mark without style/encoding support "for the quick case" (this is how `dot` diverged from `point` before being folded back in).
- Engine code that branches on a specific `pick`/edit `type` outside the driver registry.
- A standalone guide or constraint-introspection module that duplicates `edit/guide.js`.
- A glyph that fakes several marks inside one feature and arbitrates its own handles, when a `composite` group of real marks would do.
- A `domain` or `range` on a channel, or a `spec.x` / `spec.y` scale block. Domains live on the schema; scale config lives on `scale` (per channel) or `spec.scales` (per chart).
- A `scale.type === '…'` branch anywhere outside `core/scales.js`. Read `kind` / `temporal` / `invertible`.
- A second name for a field on a mark: `channels` is the only place a field is named. (`x` once meant a field name on `bar`, a constant on `rule`, a scale config on `spec`, and nothing on `point`.)
- A mark factory that accepts `edits` / `constraints` and drops them.
