// @ts-check
import { SceneGraph } from './scene.js';
import { resolveScales } from './resolve.js';
import { collectEdits, resolveChannels } from '../edit/route.js';
import { drivers, needsPlaneOnTop } from '../edit/drivers/index.js';
import { autoEditGuides } from '../edit/guide.js';
import { D3Renderer } from '../renderers/d3-renderer.js';
import { resolveEffects } from './effects.js';
import { autoAxes } from './axes.js';

// Dev-only builds get the capability guards below. `import.meta.env.DEV` must be
// written PLAINLY: Vite only injects `import.meta.env` into a module that mentions
// it in this exact form — wrapping `import.meta` in a JSDoc cast hides it from the
// transform, leaving `env` undefined and every guard silently dead.
const DEV = !!(import.meta.env && import.meta.env.DEV);
/** @type {Set<string>} */
const warnedScope = new Set();
/**
 * @param {any} feature
 * @param {import('../types').Edit[]} edits
 */
function warnLineScopeMismatch(feature, edits) {
    for (const e of edits) {
        if (e.scope !== 'line' || feature.supportsSeries) continue;
        const key = `${feature.id}:${e.type}`;
        if (warnedScope.has(key)) continue;
        warnedScope.add(key);
        console.warn(
            `[vibe] edit.line.${e.type}() is attached to a mark without series support ` +
            `(feature "${feature.id}"). Line-scoped edits expect a line mark; it may not behave.`
        );
    }
}

// A plane gesture carries no node, so it fans to EVERY feature's plane-pick edits.
// With one dataset that means two marks each declaring `create()` append twice per
// click. Direct-pick edits are immune (routed to the touched node's feature alone).
// So: a whole-dataset edit belongs on exactly one mark. Warn rather than branch —
// the engine stays ignorant of specific edit types.
let warnedPlaneDup = false;
/** @param {any[]} features @param {(f: any) => import('../types').Edit[]} editsOf */
function warnDuplicatePlaneEdits(features, editsOf) {
    if (warnedPlaneDup) return;
    const owners = features.filter(f => editsOf(f).some(e => e.pick !== 'direct'));
    if (owners.length < 2) return;
    warnedPlaneDup = true;
    console.warn(
        `[vibe] ${owners.length} marks carry a plane-pick edit over the one dataset ` +
        `(features ${owners.map(f => `"${f.id}"`).join(', ')}). A plane gesture fans to all ` +
        `of them, so a whole-dataset edit (create/remove/rotate/toggle) will apply once per ` +
        `mark. Declare it on exactly one.`
    );
}

/**
 * @param {import('../types').ElicitSpec} spec
 * @returns {import('../types').ElicitElement}
 */
export function Elicit(spec) {
    const {
        width = 600,
        height = 400,
        margins = { top: 20, right: 20, bottom: 30, left: 40 },
        // `schema` and `scales` are read straight off the spec by resolveScales:
        // the schema owns each field's data type and DOMAIN, and `scales` is the
        // chart-level per-channel scale override.
        features: userFeatures = [],
        // Global axis convenience: desugars into composable axis/grid marks (see
        // autoAxes). Explicit axis marks in `features` take precedence per channel.
        axes,
        guides = [],
        // Interaction-effects layer (grab / proximity-select), customizable and
        // kept separate from mark style channels. See core/effects.js.
        effects: effectsSpec,
        // Sizing mode. 'fixed' (default) renders at the given pixel width/height.
        // 'scale' renders once at those dims but wraps the SVG in a viewBox so the
        // browser scales it to fill the parent (aspect ratio preserved, one draw).
        // 'reflow' measures the parent and re-renders at native pixels on resize
        // (crisp text, width tracks the container, height stays the given value).
        // `responsive: true` is an alias for 'reflow'.
        responsive,
        renderer = new D3Renderer()
    } = spec;

    const mode = responsive === true ? 'reflow'
        : (responsive === 'scale' || responsive === 'reflow') ? responsive
            : 'fixed';

    const effects = resolveEffects(effectsSpec);

    // Prepend auto-injected axis/grid marks (drawn behind marks via the background
    // layer). Explicit axis marks the user composed into `features` are preserved.
    // Flattened because a group mark (composite) desugars to an ARRAY of features.
    const features = [...autoAxes(userFeatures, axes), ...userFeatures].flat(Infinity);

    // Working dims. In 'reflow' mode `curW` tracks the container's measured width
    // (height stays the given value); 'fixed'/'scale' keep the design dims. Marks
    // and scales read the inner (margin-subtracted) dims, so recomputing them on a
    // resize is all it takes for the whole scene to reflow.
    const designW = typeof width === 'number' ? width : 600;
    const designH = typeof height === 'number' ? height : 400;
    let curW = designW;
    let curH = designH;
    let innerWidth = curW - margins.left - margins.right;
    let innerHeight = curH - margins.top - margins.bottom;

    features.forEach((feature, index) => {
        if (!feature.id) feature.id = `feature-${index}`;
    });

    // 1. The belief store: ONE dataset for the chart. A chart elicits exactly one
    //    dataset; every mark is a view over these rows, encoding some columns and
    //    (where it carries an edit) writing them back. structuredClone rather than a
    //    JSON round-trip so seed `Date` values survive for a time-scale edit.
    /** @type {any[]} */
    let dataset = structuredClone(spec.data || []);

    // The dataset's invariants, gathered once. A mark may declare `constraints` as
    // sugar; they are promoted here, so an invariant holds for EVERY edit over the
    // rows, whichever mark fired it — that is what makes a constraint declared on
    // one part of a glyph gate a drag on another. Deduped by identity so the same
    // constraint object listed on several marks runs once.
    /** @type {import('../types').Constraint[]} */
    const datasetConstraints = [...new Set([
        ...(spec.constraints || []),
        ...features.flatMap(f => f.constraints || [])
    ])];

    // Auto-guides: an edit declared `guide: true` self-draws its guide (constraint
    // bounds + nearest snap ring) without the caller repeating the feature id in a
    // top-level guides list (see edit/guide.js).
    const allGuides = [...autoEditGuides(features), ...guides];

    // Multi-stage elicitation: edits carrying a numeric `stage` are active only in
    // that stage (null = always). This is a uniform descriptor filter applied to
    // EVERY edit — the same shape as `gesture` matching — not a per-mode engine
    // branch, so the one-interaction-model invariant holds. `activeEdits` is the
    // single gate the dispatch/editable/plane-on-top paths run their edits through.
    let currentStage = spec.stage != null ? spec.stage : 0;
    /**
     * @param {any} feature
     * @returns {import('../types').Edit[]}
     */
    const activeEdits = (feature) =>
        collectEdits(feature).filter(e => e.stage == null || e.stage === currentStage);

    // Move the stage cursor WITHOUT re-rendering: drop every transient (an in-flight
    // driver lock, a hover preview) so a stage switch can't resume a half-finished
    // gesture, then notify. Callers render — `setStage` on the container does it
    // directly; a driver's `stage.next()` rides the dispatch's own re-render.
    /** @param {number} n */
    const applyStage = (n) => {
        currentStage = n;
        ui.session = {};
        ui.preview = null;
        for (const cb of listeners.stage) cb(currentStage);
    };

    // Transient interaction (UI) state, separate from the belief `dataset`. The
    // interaction drivers keep a per-feature session here (proximity selection,
    // sweep/draw locks) — those locks belong to one mark's gesture, so they stay
    // keyed by feature id. `preview` holds THE UNCOMMITTED dataset a driver has
    // proposed (the probe driver's hover); it is rendered in place of the committed
    // rows by every mark, so the pointer shows what a click would commit across the
    // whole chart, but it never reaches the belief store, `onChange`, or `getData`.
    // Cleared on commit, hoverout, and stage change.
    /** @type {{ session: Record<string, any>, preview: any[] | null }} */
    const ui = { session: {}, preview: null };

    // Caller-facing observers. `change` fires on every committed edit; `stage` fires
    // when setStage advances (Phase 2). Attached to the returned container as
    // `.on('change' | 'stage', cb)`.
    /** @type {{ change: Set<Function>, stage: Set<Function> }} */
    const listeners = { change: new Set(), stage: new Set() };

    // The most recently built scene nodes per feature, so plane-pick edits can
    // hit-test against exact mark geometry and guides can look marks up by index.
    /** @type {Record<string, any[]>} */
    const featureNodes = {};

    // 2. Calculate scales (Observable Plot model): one GLOBAL scale per channel,
    //    resolved from the union of every feature's channels, with the schema
    //    supplying each field's data type and domain. Recomputed each render so an
    //    inferred domain (a field the schema left open) tracks data as create/drag
    //    mutate it. `scales` is a channel map { x, y, fill, size, … }; unused
    //    channels are absent.
    const dims = { width: innerWidth, height: innerHeight };
    let scales = resolveScales(features, dataset, spec, dims);

    // Set up container. 'fixed' pins pixel dims; the responsive modes fill the
    // parent's width (the SVG scales via viewBox in 'scale', or is redrawn at the
    // measured size in 'reflow').
    const container = document.createElement('div');
    container.style.position = 'relative';
    if (mode === 'scale') {
        container.style.width = '100%';
        container.style.height = 'auto';
    } else if (mode === 'reflow') {
        container.style.width = '100%';
        container.style.height = `${curH}px`;
    } else {
        container.style.width = `${curW}px`;
        container.style.height = `${curH}px`;
    }

    // Recompute the margin-subtracted dims from the current outer dims, and (reflow
    // only) re-measure the container's width from the parent. Returns whether the
    // width actually changed, so a resize can skip a redundant re-render.
    const recomputeInner = () => {
        innerWidth = curW - margins.left - margins.right;
        innerHeight = curH - margins.top - margins.bottom;
        dims.width = innerWidth;
        dims.height = innerHeight;
    };
    const measure = () => {
        if (mode !== 'reflow') return false;
        const w = container.clientWidth || designW;
        if (w > 0 && w !== curW) {
            curW = w;
            recomputeInner();
            return true;
        }
        return false;
    };

    const scene = new SceneGraph();

    // 3. Coordinator - rebuild the scene graph from current state and render.
    const update = () => {
        measure(); // reflow: pick up the container's current width before drawing
        scene.clear();

        // Re-resolve global scales so inferred domains follow the live data.
        scales = resolveScales(features, dataset, spec, dims);

        // Plane-on-top mode: when an ACTIVE edit resolves its target from an
        // arbitrary pointer position (nearest/sweep/draw/brush), the plane must sit
        // above the marks and own the gesture. Computed per render because the
        // active edit set — and thus this flag — can change with the stage.
        const planeOnTop = features.some(feature => needsPlaneOnTop(activeEdits(feature)));

        if (DEV) warnDuplicatePlaneEdits(features, activeEdits);

        // A live preview (hover) stands in for the committed rows while it lasts —
        // for EVERY mark, since they all read the one dataset.
        const currentData = ui.preview || dataset;

        features.forEach(feature => {
            const nodes = feature.build(currentData, scales, innerWidth, innerHeight);
            featureNodes[feature.id] = nodes;

            if (DEV) warnLineScopeMismatch(feature, collectEdits(feature));

            // A feature with an ACTIVE direct-pick edit is interactive on its marks,
            // so the renderer should show an editable cursor on them. Plane-pick
            // edits (nearest/sweep/draw) put the cursor on the plane instead, so
            // they don't mark nodes editable.
            const editable = activeEdits(feature).some(e => e.pick === 'direct');

            // Tag every node with its feature so gesture events can find the
            // feature's edits, and flag interactive marks for the cursor.
            //
            // A mark with no direct-pick edit can't consume a gesture, so it must not
            // BLOCK one: the renderer defaults nodes to pointer-events:auto and draws
            // lines after circles, so an inert rule (a glyph's whisker) would sit over
            // a sibling's handle and swallow its drag. Silence it unless the mark
            // asked for a specific value.
            nodes.forEach((/** @type {any} */ node) => {
                node.featureId = feature.id;
                if (editable) node.editable = true;
                else if (node.pointerEvents == null) node.pointerEvents = 'none';
                scene.add(node);
            });
        });

        // Build guides last so they can read the freshly-updated data. Guides are
        // purely visual (non-interactive) annotations.
        const guideCtx = {
            scales,
            data: currentData,
            constraints: datasetConstraints,
            features,
            featureNodes,
            ui,
            effects,
            width: innerWidth,
            height: innerHeight,
            // The current stage, so an edit's auto-guide can suppress itself when
            // its edit is inactive (one guide path, gated by the same rule as edits).
            stage: currentStage
        };
        allGuides.forEach(guide => {
            const nodes = guide.build(guideCtx) || [];
            nodes.forEach((/** @type {any} */ node) => {
                node.guide = true;
                scene.add(node);
            });
        });

        renderer.render({
            container,
            scene,
            width: curW,
            height: curH,
            margins,
            scales,
            spec,
            planeOnTop,
            responsive: mode,
            effects,
            onEvent: handleEvent
        });
    };

    // Compute one edit's proposed dataset WITHOUT committing it. `index` addresses
    // the datum being edited (null for create, which appends). The gesture is
    // inverted through the scales in apply(), producing a data-space proposal; that
    // proposal is then judged by the DATA-LAYER INVARIANTS (the dataset's
    // constraints, plus any edit-scoped constrain sugar). Constraints never see
    // pixels. Returns the accepted dataset, or null when the edit is a no-op /
    // rejected.
    //
    // Split out from `runEdit` so a hover can PREVIEW the very same proposal (same
    // apply, same invariants) without writing it to the belief store — see
    // previewEdit + the probe driver.
    /**
     * @param {any} feature
     * @param {import('../types').Edit} edit
     * @param {any} event
     * @param {number | null} index
     * @returns {any[] | null}
     */
    const computeEdit = (feature, edit, event, index) => {
        const currentData = dataset;
        const markChannels = feature.channels || {};
        const resolved = resolveChannels(edit.channels, markChannels, scales);
        const ctx = {
            data: currentData,
            datum: index != null ? currentData[index] : undefined,
            index,
            pointer: { x: event.x, y: event.y },
            node: event.node || null,
            event: event.rawEvent,
            channels: resolved,
            scales,
            markChannels,
            // Plot pixel dimensions, so a gesture whose geometry is the whole plane
            // (rotate about the centre) can measure against it without a mark node —
            // the angular sibling of resize reading the mark centre.
            width: innerWidth,
            height: innerHeight,
            // The dataset schema, so a mint (create) can populate every declared
            // field with its default (or null) — not just the positional ones.
            schema: spec.schema,
            xKey: feature.xKey || 'x',
            yKey: feature.yKey || 'y',
            // The feature's series (grouping) field and its current scene nodes, so
            // proximity-aware edits (anchor / newSeries) and `when.near|far` can
            // resolve WHICH line a plane gesture means. Harmless to other edits.
            seriesKey: feature.seriesKey || null,
            marks: featureNodes[feature.id] || [],
            // The line's ordering knob and the engine's per-drag lock, for a `draw`
            // (create-as-you-drag) edit. Harmless to every other edit.
            order: feature.order || null,
            drawState: (ui.session && ui.session[feature.id]) || null
        };
        if (edit.when && !edit.when(ctx)) return null; // arbitration

        const result = edit.apply(ctx);
        if (result === undefined) return null;

        // A whole-dataset edit (create appends, remove filters) returns an array; a
        // mark edit returns the new datum, spliced in at `index`.
        let newData = Array.isArray(result)
            ? result
            : currentData.map((d, i) => (i === index ? result : d));

        // Which datum the gesture touched, for invariants that resolve a violation
        // relative to it (create -> the appended one; a delete -> none; else `index`).
        const activeIndex = edit.type === 'create' ? newData.length - 1
            : (edit.type === 'remove' || edit.type === 'removeSeries') ? null
                : index;

        // Data-layer invariants: the dataset's first (they hold for every edit from
        // every mark), then any edit-scoped guard sugar. Pure data context — no
        // scales-as-geometry. A constraint may reject the proposal (false) or repair
        // it (return an array); the marks re-derive from the repaired rows.
        const invariants = [...datasetConstraints, ...edit.constrain];
        const cctx = { activeIndex, scales, markChannels };
        let rejected = false;
        for (const constraint of invariants) {
            const r = constraint(newData, currentData, cctx);
            if (r === false) { rejected = true; break; }
            if (r !== true && r !== undefined) newData = r;
        }
        if (rejected) return null;

        return newData;
    };

    // Commit an edit: compute its proposal, write it to the belief store, drop any
    // preview it supersedes, and notify. Returns whether data changed.
    /**
     * @param {any} feature
     * @param {import('../types').Edit} edit
     * @param {any} event
     * @param {number | null} index
     * @returns {boolean}
     */
    const runEdit = (feature, edit, event, index) => {
        const newData = computeEdit(feature, edit, event, index);
        if (!newData) return false;
        dataset = newData;
        ui.preview = null;
        if (spec.onChange) spec.onChange(newData);
        for (const cb of listeners.change) cb(structuredClone(newData));
        return true;
    };

    // Preview an edit: compute the SAME proposal (same apply, same invariants) but
    // park it in the transient preview store instead of the belief store. The next
    // render draws it in place of the committed rows, so a hover shows exactly what
    // a click would commit — and `getData`/`onChange` never see it.
    /**
     * @param {any} feature
     * @param {import('../types').Edit} edit
     * @param {any} event
     * @param {number | null} index
     * @returns {boolean}
     */
    const previewEdit = (feature, edit, event, index) => {
        const newData = computeEdit(feature, edit, event, index);
        if (!newData) return false;
        ui.preview = newData;
        return true;
    };

    // Direct-pick edits: the gesture landed on a mark (event.node). Fan the
    // gesture out to every direct edit whose `gesture` matches; `when` arbitrates
    // between edits sharing a gesture (plain-drag move vs Shift-drag resize).
    /**
     * @param {any} feature
     * @param {any} event
     * @returns {boolean}
     */
    const dispatchDirectEdits = (feature, event) => {
        const index = event.node ? event.node.index : undefined;
        if (index == null) return false;
        let changed = false;
        activeEdits(feature)
            .filter(e => e.pick === 'direct' && e.gesture === event.type)
            .forEach(edit => { if (runEdit(feature, edit, event, index)) changed = true; });
        return changed;
    };

    // Plane-pick edits: the gesture is on the plane (no node). Each interaction
    // driver (edit/drivers) owns one pick-mode lifecycle; we hand every driver the
    // edits it `wants` plus a per-feature session, and it runs them. The engine no
    // longer knows any specific mode — adding one means adding a driver file.
    /**
     * @param {any} feature
     * @param {any} event
     * @returns {boolean}
     */
    const dispatchPlaneEdits = (feature, event) => {
        const edits = activeEdits(feature).filter(e => e.pick !== 'direct');
        if (edits.length === 0) return false;
        const fid = feature.id;

        // Per-feature transient session the drivers read/write (proximity selection,
        // sweep/draw locks); guides render from it.
        const session = {
            get: () => (ui.session && ui.session[fid]) || null,
            /** @param {any} patch */
            set: (patch) => {
                ui.session = ui.session || {};
                ui.session[fid] = { ...(ui.session[fid] || {}), ...patch };
            },
            clear: () => { if (ui.session) delete ui.session[fid]; }
        };
        /** @param {import('../types').Edit} edit @param {number | null} index */
        const runFeatureEdit = (edit, index) => runEdit(feature, edit, event, index);
        /** @param {import('../types').Edit} edit @param {number | null} index */
        const previewFeatureEdit = (edit, index) => previewEdit(feature, edit, event, index);

        // The feature's uncommitted proposal, and the chart's stage cursor. Handed to
        // drivers as capabilities exactly like `session` — so a multi-event lifecycle
        // (hover to preview, click to commit and advance) lives in its driver file,
        // not in engine branches.
        const preview = {
            get: () => ui.preview,
            clear: () => {
                if (!ui.preview) return false;
                ui.preview = null;
                return true;
            }
        };
        const stage = {
            get: () => currentStage,
            /** @param {number} n */
            set: (n) => applyStage(n),
            next: () => applyStage(currentStage + 1)
        };

        let changed = false;
        for (const driver of drivers) {
            const matching = edits.filter(e => driver.wants(e));
            if (matching.length === 0) continue;
            const dctx = {
                feature, event, edits: matching,
                marks: featureNodes[fid] || [],
                data: dataset,
                // Read-only: lets a driver (e.g. brush) encode a channel's current
                // pixel position for hit-zone classification, without reinventing
                // scale lookup — the same global scales every edit already inverts through.
                scales,
                session,
                preview,
                stage,
                runEdit: runFeatureEdit,
                previewEdit: previewFeatureEdit
            };
            if (driver.onEvent(dctx)) changed = true;
        }
        return changed;
    };

    // 4. Event routing.
    //    - Events carrying a `node` are mark-scoped (change existing elements) and
    //      route to that mark's direct-pick edits.
    //    - Events without a `node` are plane-scoped and route to every feature's
    //      plane/nearest/sweep/draw edits.
    /**
     * @param {any} event
     */
    const handleEvent = (event) => {
        let shouldRender = false;

        if (event.node) {
            // Dispatch to the touched mark's feature (direct pick).
            const feature = features.find(f => f.id === event.node.featureId);
            if (feature && dispatchDirectEdits(feature, event)) shouldRender = true;
        } else {
            // Plane gestures -> every feature's plane/nearest/sweep/draw edits.
            features.forEach(feature => {
                if (dispatchPlaneEdits(feature, event)) shouldRender = true;
            });
        }

        if (shouldRender) {
            update();
        }
    };

    // Caller-facing data API, attached to the container the engine returns. This
    // is pure observation over the belief `dataset` — it adds no interaction path
    // (edits/constraints stay the only way a gesture mutates data).
    const el = /** @type {import('../types').ElicitElement} */ (/** @type {any} */ (container));
    // A deep copy so callers can't mutate the live store; structuredClone (not a
    // JSON round-trip) preserves Date values a time-scale edit may have written.
    el.getData = () => structuredClone(dataset);
    // Replace the dataset and re-render. Bypasses constraints by design:
    // constraints gate GESTURES; caller-supplied data is trusted (seeding/reset).
    el.setData = (/** @type {any[]} */ data) => {
        dataset = structuredClone(data);
        ui.preview = null;
        update();
    };
    // Subscribe to committed changes; returns an unsubscribe function.
    el.on = (/** @type {'change' | 'stage'} */ type, /** @type {Function} */ cb) => {
        listeners[type].add(cb);
        return () => listeners[type].delete(cb);
    };

    // Multi-stage controls. Advancing the stage re-renders (the active edit set,
    // plane-on-top, and cursors all follow currentStage) and drops every transient.
    el.getStage = () => currentStage;
    el.setStage = (/** @type {number} */ stage) => {
        applyStage(stage);
        update();
    };
    el.nextStage = () => el.setStage(currentStage + 1);

    // 'reflow' mode: watch the container and re-render when the parent resizes.
    // rAF-coalesced (a resize can fire many times per frame) and guarded so a
    // render that doesn't change the width can't feed back into a loop.
    /** @type {ResizeObserver | null} */
    let ro = null;
    if (mode === 'reflow' && typeof ResizeObserver !== 'undefined') {
        let scheduled = false;
        ro = new ResizeObserver(() => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(() => {
                scheduled = false;
                if (measure()) update();
            });
        });
        ro.observe(container);
    }
    // Detach the observer (and its hold on the container). Call when unmounting a
    // reflow chart; no-op otherwise.
    el.destroy = () => {
        if (ro) { ro.disconnect(); ro = null; }
    };

    // Initial render. Deferred so the container can be attached to the DOM first
    // if the renderer needs measured dimensions.
    setTimeout(update, 0);

    return el;
}
