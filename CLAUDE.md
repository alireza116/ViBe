# CLAUDE.md

Guidance for Claude Code when working in this repo. VibeJS just went through a consistency pass that unified a previously-duplicated API surface (see `git log` for "API Consistency" era commits). The rules below encode the design decisions from that pass — follow them so the API doesn't re-fragment.

## What this is

A declarative viz library for interactive belief elicitation. `Elicit(spec)` renders an SVG chart where gestures write back to data. The core idea: **an edit is the inverse of encoding** — `encode` maps data → visual through a channel's scale; an edit's `apply()` maps a gesture → data through the *same* scale.

Entry points: `src/index.js` (public API), `src/core/elicit.js` (engine), `src/plot/mark.js` (shared mark foundation), `src/edit/index.js` (edit barrel). Read `README.md` for the architecture map before making structural changes.

## Non-negotiable invariants

**One dataset. `Elicit` owns it; marks never do.** A chart elicits exactly one dataset — even a slider elicits a one-row dataset. `data` lives on `ElicitSpec`; the engine holds it as a single array (`dataset` in `elicit.js`). A mark is a *view* over those rows: it encodes some columns and, where a channel carries an `edit`, writes them back. Do not add a `data` (or `onChange`) option to a mark factory, and do not reintroduce a per-feature data store keyed by feature id — that model made two marks over the same rows impossible and is what forced `composite` to fake a glyph inside one feature.

**A whole-dataset edit belongs on exactly one mark.** A plane gesture carries no node, so it fans to *every* feature's plane-pick edits (`dispatchPlaneEdits`). With one dataset that means `create()` on two marks appends twice per click, and two `rotate()`s rotate twice. Direct-pick edits are immune — they route to the touched node's feature alone. The engine dev-warns (`warnDuplicatePlaneEdits`) rather than branching; keep it that way. Sequential composition of *direct* edits within one event is intended: a coupled edit writes fields, sibling marks re-derive on the next render.

**A mark with no direct-pick edit is pointer-transparent.** The engine sets `pointerEvents:'none'` on such a mark's nodes unless the mark set a value itself. This is load-bearing, not cosmetic: the renderer defaults nodes to `pointer-events:auto` and draws lines *after* circles, so an inert rule (a glyph's whisker) sits above a sibling's handle and would swallow its drag. Don't "optimize" this away.

**One interaction model.** Everything routes through `edit` + drivers. Do not add a second parallel interaction system (an "interactors"-style layer) no matter how convenient it seems for one use case — that duplication is exactly what the consistency pass removed. If an edit needs new behavior, extend the `Edit` descriptor or add a driver; don't build a side path.

**Edits are descriptors, not closures with hidden state.** An edit is `{ type, gesture, channels, when, pick, scope, threshold, into, constrain, guide, apply }` built via `makeEdit` (`src/edit/shared.js`). `apply(ctx)` is pure given `ctx` — it returns a datum (direct edit), a full array (whole-dataset edit), or `undefined` (no-op). Never mutate `ctx.data` in place.

**Multi-event lifecycles are drivers, not engine branches.** If you're adding an interaction mode that needs `hover`/`dragstart`/`drag`/`dragend` state (like `nearest`, `sweep`, `draw`), write a new file in `src/edit/drivers/` implementing `{ name, wants(edit), onEvent(ctx) }` and register it in `drivers/index.js`. **Never** add a new `if (pick === '...')` branch inside `core/elicit.js`'s dispatch — that's the god-module pattern the drivers refactor eliminated. The engine must stay ignorant of specific modes.

**Scope goes in the name.** An edit that only works on marks with series grouping (a `line` family capability) belongs under `edit.line.*` and must set `scope: 'line'` in its descriptor (the engine dev-warns on a scope mismatch — see `warnLineScopeMismatch` in `elicit.js`). A genuinely universal edit (works on any mark) stays top-level in `edit.*`. Don't add a mark-specific edit to the top-level namespace "because it's simpler" — that's the flat-namespace problem the namespacing fixed.

**One positional-resolution path.** Every mark resolves a datum → pixel through `encodeChannel` (`src/plot/mark.js`) for its value axis, or the band-geometry helpers (`bandwidthOf`/`baselineOf`/`isBand` in `core/scales.js`) for its category axis. Do not call `scale(d[key])` directly in a new mark — that reintroduces the "four different ways to place a point" inconsistency that existed across `bar`/`dot`/`rule` before the cleanup.

**One guide path.** `src/edit/guide.js`'s `buildEditGuide` is the only constraint-guide drawer. If you add a constraint, either let it fall through to no guide (acceptable for cardinality rules like `count`/`unique`) or add a case in `constraintGuide`'s switch — don't create a second standalone guide module that reads the constraint set independently.

**Constraints are pure data invariants, scoped to the dataset.** A constraint (`defineConstraint` in `src/constraints/define.js`) receives `{ data, oldData, activeIndex, active, field, value, domain }` — never pixels, never a scale used as geometry. It may *gate* a proposal (`false`) or *repair* it (return the corrected rows). The canonical home is `spec.constraints`; a mark's `constraints` is sugar the engine **promotes** into one dataset-wide set (`datasetConstraints`, deduped by identity), so an invariant holds for every edit from every mark. Don't scope a constraint back to the feature that declared it — that would let a glyph's cap drag bypass a rule declared on its dot. If a constraint's *guide* only makes sense for certain mark shapes (e.g. `maintainSum`'s cap-tick needs a band axis), guard the guide function, not the constraint itself.

## Adding a new mark

Follow the contract documented at the top of `src/plot/mark.js`. Concretely:
- `build(currentData, scales, width, height) -> FeatureNode[]` is the one required method. `currentData` is the chart's dataset, handed in by the engine — the mark takes no `data` option and no `onChange`.
- Resolve position/style through `encodeChannel` / `resolveStyle` — don't hand-roll scale lookups.
- Set `categoricalScale: 'band'` (bar/tick — needs an interval) or `'point'` (point/line — needs a tick), plus `xKey`/`yKey`.
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

- `series` is the public option name; `seriesKey` is the internal feature field. Don't introduce a third synonym.
- `pick` values are target-selection strategies or driver keys (`direct`, `nearest`, `plane`, `sweep`, `draw`) — not arbitrary interaction descriptors.
- `constrain` (edit-scoped, singular) vs `constraints` (plural, the dataset's invariants — canonical on `spec`, accepted on a mark as sugar and promoted) — keep the distinction; don't rename one to match the other.
- `guide: true` on an `Edit` means "self-draw"; a `Constraint.guide` is a drawer *function*. Same word, deliberately different shapes, both documented in `types.d.ts` — don't try to unify them into one meaning.
- Don't add a second alias for an existing edit (we removed `youDrawIt` as a redundant alias of `sweep`). One documented name per behavior.

## Before committing a structural change

1. `npm run typecheck` (`tsc --noEmit` against `src/types.d.ts`) must stay clean.
2. If you touched dispatch, marks, or edits, exercise it in a real browser — start `npx vite`, load a relevant `docs/pages/*.js` example or `docs/playground.html`, and drive the actual gesture. Don't rely on typecheck alone for interaction changes; the driver/session state machines only prove out under real pointer events.
3. Update `docs/pages/*.js` and `README.md` if the public surface changed — this repo's docs are the regression surface (there is no test suite), and stale docs are exactly the drift this pass cleaned up.
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
