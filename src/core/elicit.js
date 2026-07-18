// @ts-check
import { SceneGraph } from './scene.js';
import { resolveScales } from './resolve.js';
import { createProjection } from './projection.js';
import { resolveLock, lockConstraint, isNodeLocked } from './lock.js';
import { collectEdits, resolveChannels, warnMisplacedEdits } from '../edit/route.js';
import { markCenter, nudgeTarget } from '../edit/shared.js';
import { encodeChannel } from '../plot/mark.js';
import { drivers, needsPlaneOnTop } from '../edit/drivers/index.js';
import { autoEditGuides } from '../edit/guide.js';
import { D3Renderer } from '../renderers/d3-renderer/index.js';
import { resolveEffects } from './effects.js';
import { autoAxes } from './axes.js';
import { axisOf, pointerForChannel } from './encoding.js';

// Dev-only builds get the capability guards below. `import.meta.env.DEV` must be
// written PLAINLY: Vite only injects `import.meta.env` into a module that mentions
// it in this exact form — wrapping `import.meta` in a JSDoc cast hides it from the
// transform, leaving `env` undefined and every guard silently dead.
const DEV = !!(import.meta.env && import.meta.env.DEV);
// Scope goes in the name: `edit.line.draw()` expects a line mark, `edit.arc.edge()`
// an arc, and so on. Each scope names the mark capability that makes it work; a
// mismatch is a silent no-op at runtime (the edit's `when` gate never fires), so
// warn once per feature+edit. One table, not one function per family — a new
// mark family adds a row here, not a new guard.
/** @type {Record<string, { flag: string, expects: string }>} */
const SCOPE_CAPABILITY = {
    line: { flag: 'supportsSeries', expects: 'a line mark (line/area)' },
    geo: { flag: 'supportsGeo', expects: 'a geo* mark (geoPoint, geoLine, …)' },
    arc: { flag: 'supportsArc', expects: 'an arc mark (arc/pie/donut)' },
    waffle: { flag: 'supportsWaffle', expects: 'a waffle mark' },
    axis: { flag: 'isAxis', expects: 'an axis mark (axisX/axisY/axisRadial)' },
};

/** @type {Set<string>} */
const warnedScope = new Set();
/**
 * @param {any} feature
 * @param {import('../types').Edit[]} edits
 */
function warnScopeMismatch(feature, edits) {
    for (const e of edits) {
        if (!e.scope) continue;
        const cap = SCOPE_CAPABILITY[e.scope];
        if (!cap || feature[cap.flag]) continue;
        const key = `${feature.id}:${e.scope}.${e.type}`;
        if (warnedScope.has(key)) continue;
        warnedScope.add(key);
        console.warn(
            `[vibe] edit.${e.scope}.${e.type}() is attached to a mark without ${e.scope} support ` +
            `(feature "${feature.id}"). ${e.scope}-scoped edits expect ${cap.expects}; it may not behave.`
        );
    }
}

let warnedProjCartesian = false;
/**
 * A projection chart replaces x/y placement for geo marks. Mixing ordinary
 * cartesian x/y channels on the same chart is unsupported in v1.
 * @param {any[]} features
 * @param {import('../types').ScaleMap} scales
 */
function warnProjectionCartesianMix(features, scales) {
    if (warnedProjCartesian || !/** @type {any} */ (scales).projection) return;
    const offenders = features.filter((f) => {
        if (f.supportsGeo || f.isAxis || f.isGrid) return false;
        const ch = f.channels || {};
        return Object.keys(ch).some((name) => axisOf(name) && ch[name] && ch[name].scale !== null);
    });
    if (!offenders.length) return;
    warnedProjCartesian = true;
    console.warn(
        `[vibe] spec.projection is set together with cartesian x/y channels on ` +
        `${offenders.map((f) => `"${f.id}"`).join(', ')}. Projection charts use geo* marks ` +
        `(geoPoint, geoLine, …); mixing ordinary positional marks is unsupported.`
    );
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

// Best-effort measure type for a domain a caller left undeclared but an axis edit
// just wrote (a numeric range, or a discrete value list). Only used to synthesize a
// missing schema entry — a declared field keeps its own type.
/** @param {any[]} domain @returns {import('../types').MeasureType} */
function inferMeasureOfDomain(domain) {
    const vals = domain || [];
    if (vals.some((v) => v instanceof Date)) return 'temporal';
    if (vals.every((v) => typeof v === 'number')) return 'quantitative';
    return 'categorical';
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
        // SVG overflow. Default 'hidden' clips marks to the viewport. 'visible' lets
        // content in the margin band show — needed for radial/gauge axis labels that
        // sit just outside the plot area.
        overflow = 'hidden',
        renderer = new D3Renderer()
    } = spec;

    const mode = responsive === true ? 'reflow'
        : (responsive === 'scale' || responsive === 'reflow') ? responsive
            : 'fixed';

    const effects = resolveEffects(effectsSpec);

    // Prepend auto-injected axis/grid marks (drawn behind marks via the background
    // layer). Explicit axis marks the user composed into `features` are preserved.
    // A projection chart has no cartesian axes — skip autoAxes unless the caller
    // forced them (axes !== undefined still respected via autoAxes(false)).
    // Flattened because a group mark (composite) desugars to an ARRAY of features.
    const axesOpt = spec.projection != null && axes === undefined ? false : axes;
    const features = [...autoAxes(userFeatures, axesOpt), ...userFeatures].flat(Infinity);

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

    // Read-only rows (see core/lock.js). `lock: 'seed'` fixes the rows the chart was
    // seeded with — they are given, not elicited — while leaving every later row
    // free; a predicate locks rows by what they ARE. Two halves: a dataset invariant
    // (run last in computeEdit, so a lock has the final word) and a `locked` stamp on
    // those rows' scene nodes, which makes them pointer-transparent and invisible to
    // proximity picking. `seedCount` is a live read because setData re-seeds.
    let seedCount = dataset.length;
    const isLocked = resolveLock(spec.lock, () => seedCount);
    const lockRows = isLocked ? lockConstraint(isLocked) : null;

    // The engine OWNS the schema too — an editable axis (edit.axis.*) reshapes a
    // field's DOMAIN, which lives on the schema. Clone it so a domain edit never
    // mutates the caller's spec object; resolveScales reads this copy every render,
    // so a domain write reflows axis, grid, guides and marks for free. Exposed
    // read-only via el.getSchema(). A `{ ...spec, schema }` view is what the
    // resolver sees (spec.scales and the rest pass through untouched).
    /** @type {Record<string, import('../types').FieldSchema>} */
    const schema = structuredClone(spec.schema || {});
    const liveSpec = { ...spec, schema };

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
    /** @type {(string | null)[]} */
    const stageLabels = Array.isArray(spec.stageLabels) ? spec.stageLabels : [];
    /** @param {number} n @returns {string | null} */
    const stageLabelOf = (n) => (stageLabels[n] != null ? stageLabels[n] : null);
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
        for (const cb of listeners.stage) cb(currentStage, stageLabelOf(currentStage));
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

    // ---- Undo history --------------------------------------------------------
    // An elicitation is someone's belief being drafted, so "take that back" is a
    // primitive, not a nicety. A snapshot store rather than inverse operations:
    // an edit's apply() is already a pure data -> data function, so the state
    // before it IS the undo, and no edit has to describe how to reverse itself.
    //
    // The unit is a GESTURE, not a commit. A drag commits on every pointermove, so
    // per-commit history would make undo replay the drag backwards one pixel at a
    // time. Instead a transaction opens at dragstart and closes at dragend (both
    // renderers emit them for mark and plane drags alike), and the first commit
    // inside it records the pre-gesture state — once. A click or a typed commit is
    // its own transaction.
    //
    // Snapshots carry the schema and the chart size too, because edit.axis.* writes
    // the schema's domain and can grow the chart: undoing a category-add has to put
    // the domain, the rows AND the size back.
    const MAX_HISTORY = 100;
    /** @type {any[]} */
    let past = [];
    /** @type {any[]} */
    let future = [];
    /** @type {{ before: any, recorded: boolean } | null} */
    let txn = null;

    const snapshot = () => ({
        data: structuredClone(dataset),
        schema: structuredClone(schema),
        width: curW,
        height: curH,
    });

    /** @param {any} snap */
    const restoreSnapshot = (snap) => {
        dataset = structuredClone(snap.data);
        // Replace the schema's CONTENTS: `schema` is captured by closures (and read
        // by resolveScales each render), so rebinding the name would strand them.
        for (const k of Object.keys(schema)) delete schema[k];
        Object.assign(schema, structuredClone(snap.schema));
        if (snap.width !== curW || snap.height !== curH) {
            applyResize({ width: snap.width, height: snap.height });
        }
        ui.preview = null;
    };

    // Open a transaction if none is open. Cheap: the snapshot is only kept if
    // something actually commits inside it.
    const beginTxn = () => { if (!txn) txn = { before: snapshot(), recorded: false }; };
    const endTxn = () => { txn = null; };

    // Called by every commit path. Records the pre-gesture state the first time a
    // transaction changes anything, and drops the redo stack — a new edit after an
    // undo forks the history, so the old future is gone.
    const recordHistory = () => {
        if (!txn) beginTxn();
        if (!txn || txn.recorded) return;
        past.push(txn.before);
        if (past.length > MAX_HISTORY) past.shift();
        future = [];
        txn.recorded = true;
    };

    // Notify a committed change. One place, so undo/redo tell the caller exactly
    // what an edit does.
    const notifyChange = () => {
        if (spec.onChange) spec.onChange(dataset);
        for (const cb of listeners.change) cb(structuredClone(dataset));
    };

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
    let scales = resolveScales(features, dataset, liveSpec, dims);

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

        // Re-resolve global scales so inferred domains follow the live data, and
        // an edited schema domain (edit.axis.*) reshapes every axis/grid/mark.
        scales = resolveScales(features, dataset, liveSpec, dims);
        // Chart-level geographic projection (Plot model): shared apply/invert/path
        // for every geo mark and edit.geo.*. Attached on the scale map so build()
        // and edit ctx see the same object without a second argument.
        const projection = createProjection(liveSpec.projection, dims);
        // Attached on the scale map as a reserved non-Scale key (cast) so build()
        // and edit ctx share one object without widening ScaleMap's channel types.
        if (projection) /** @type {any} */ (scales).projection = projection;
        if (DEV) warnProjectionCartesianMix(features, scales);

        // Plane-on-top mode: when an ACTIVE edit resolves its target from an
        // arbitrary pointer position (nearest/sweep/draw/brush), the plane must sit
        // above the marks and own the gesture. Computed per render because the
        // active edit set — and thus this flag — can change with the stage.
        const planeOnTop = features.some(feature => needsPlaneOnTop(activeEdits(feature)));
        // Plane-on-top drivers (brushRect, nearest, …) may stash a cursor hint in
        // their per-feature session so the interaction plane can show edge/body
        // affordances without a second interaction system.
        let planeCursor = 'pointer';
        if (planeOnTop && ui.session) {
            for (const fid of Object.keys(ui.session)) {
                const cur = ui.session[fid] && ui.session[fid].cursor;
                if (cur) { planeCursor = cur; break; }
            }
        }

        if (DEV) warnDuplicatePlaneEdits(features, activeEdits);

        // A live preview (hover) stands in for the committed rows while it lasts —
        // for EVERY mark, since they all read the one dataset.
        const currentData = ui.preview || dataset;

        features.forEach(feature => {
            const nodes = feature.build(currentData, scales, innerWidth, innerHeight);
            featureNodes[feature.id] = nodes;

            if (DEV) warnScopeMismatch(feature, collectEdits(feature));
            if (DEV) warnMisplacedEdits(feature);

            // A feature with an ACTIVE direct-pick edit is interactive on its marks,
            // so the renderer should show an editable cursor on them. Plane-pick
            // edits (nearest/sweep/draw) put the cursor on the plane instead, so
            // they don't mark nodes editable.
            const editable = activeEdits(feature).some(e => e.pick === 'direct');

            // Tag every node with its feature so gesture events can find the
            // feature's edits, and flag interactive marks for the cursor.
            //
            // A mark with no direct-pick edit can't consume a gesture, so it must not
            // BLOCK one: the renderer defaults nodes to pointer-events:auto and paints
            // later features/parts on top, so an inert rule listed after a handle (or
            // any overlapping inert chrome) would swallow its drag. Silence it unless
            // the mark asked for a specific value.
            //
            // A node over a LOCKED row is inert for the same reason, one level down:
            // its row is read-only, so it is not grabbable, shows no editable cursor,
            // and pick.js skips it when resolving a proximity target.
            nodes.forEach((/** @type {any} */ node) => {
                node.featureId = feature.id;
                const locked = isLocked && isNodeLocked(node, feature, currentData, isLocked);
                if (locked) node.locked = true;
                if (editable && !locked) node.editable = true;
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
            planeCursor,
            responsive: mode,
            overflow,
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
     * @returns {any[] | { __domain: import('../types').DomainEditResult } | null}
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
            // A non-pixel gesture payload (the text mark's `commit` typed string).
            value: event.value,
            channels: resolved,
            scales,
            markChannels,
            // Chart projection context (null on cartesian charts). Geo edits invert
            // through the same object geo marks use for apply/path.
            projection: /** @type {import('../types').ProjectionContext | null} */ (
                /** @type {any} */ (scales).projection || null
            ),
            // Plot pixel dimensions, so a gesture whose geometry is the whole plane
            // (rotate about the centre) can measure against it without a mark node —
            // the angular sibling of resize reading the mark centre.
            width: innerWidth,
            height: innerHeight,
            // The chart margins, so a grow-mode axis edit recovers the outer size
            // from an inner axis length (inner + margins). Harmless to other edits.
            margins,
            // The engine-owned dataset schema, so a mint (create) can populate
            // every declared field with its default (or null) — not just the
            // positional ones — and an axis domain edit reads a field's domain.
            schema,
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

        // A DOMAIN edit (edit.axis.*) writes the SCHEMA, not the dataset: apply
        // returns { domains, data?, resize? }. It bypasses the datum-splice and the
        // data-layer constraints (a schema change isn't a datum proposal — the same
        // reason setData is trusted). runEdit's domain-commit path handles the write;
        // wrap it so runEdit/previewEdit can tell it apart from a dataset proposal.
        if (edit.target === 'domain') {
            return (result && typeof result === 'object' && result.domains)
                ? /** @type {any} */ ({ __domain: result })
                : null;
        }

        // A whole-dataset edit (create appends, remove filters) returns an array; a
        // mark edit returns the new datum, spliced in at `index`.
        let newData = Array.isArray(result)
            ? result
            : currentData.map((d, i) => (i === index ? result : d));

        // Which datum the gesture touched, for invariants that resolve a violation
        // relative to it. Read from the edit's DECLARED cardinality (see makeEdit),
        // never from its type — a custom append/delete edit gets the same treatment
        // as the built-in create/remove without the engine knowing either exists.
        const activeIndex = edit.cardinality === 'append' ? newData.length - 1
            : edit.cardinality === 'delete' ? null
                : index;

        // Data-layer invariants: the dataset's first (they hold for every edit from
        // every mark), then any edit-scoped guard sugar. Pure data context — no
        // scales-as-geometry. A constraint may reject the proposal (false) or repair
        // it (return an array); the marks re-derive from the repaired rows.
        //
        // The lock (spec.lock) runs LAST so it has the final word: a repair by any
        // other invariant still can't write a read-only row.
        const invariants = [...datasetConstraints, ...edit.constrain, ...(lockRows ? [lockRows] : [])];
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
        const proposed = computeEdit(feature, edit, event, index);
        if (!proposed) return false;
        // A domain edit reshapes the schema (and maybe the dataset / chart size).
        if (proposed && !Array.isArray(proposed) && proposed.__domain) {
            return commitDomainEdit(proposed.__domain);
        }
        recordHistory();
        dataset = /** @type {any[]} */ (proposed);
        ui.preview = null;
        notifyChange();
        return true;
    };

    // Commit a DOMAIN edit's proposal: write each field's schema domain (creating a
    // schema entry, with an inferred measure type, for a field the caller left
    // undeclared), replace the dataset when the edit coupled a data change (category
    // remove/rename deletes/relabels rows), and resize the chart for grow-mode
    // numeric drag. Then notify. The next update() re-resolves scales from the new
    // schema, so axis/grid/guides/marks all reflow.
    /** @param {import('../types').DomainEditResult} result @returns {boolean} */
    const commitDomainEdit = (result) => {
        recordHistory();
        for (const [field, domain] of Object.entries(result.domains || {})) {
            const prev = schema[field];
            schema[field] = { ...(prev || { type: inferMeasureOfDomain(domain) }), domain };
        }
        if (Array.isArray(result.data)) dataset = result.data;
        if (result.resize) applyResize(result.resize);
        ui.preview = null;
        notifyChange();
        return true;
    };

    // Grow-the-chart: adopt new outer pixel dims (numeric axis drag in `grow` mode),
    // mirror them onto the container the way the initial sizing does, and recompute
    // the inner rect so the next render draws at the new size.
    /** @param {{ width?: number, height?: number }} size */
    const applyResize = (size) => {
        if (typeof size.width === 'number' && size.width > 0) curW = size.width;
        if (typeof size.height === 'number' && size.height > 0) curH = size.height;
        if (mode === 'fixed') {
            container.style.width = `${curW}px`;
            container.style.height = `${curH}px`;
        } else if (mode === 'reflow') {
            container.style.height = `${curH}px`;
        }
        recomputeInner();
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
        // Only a dataset proposal can be previewed; a domain edit commits directly
        // (numeric drag commits each tick, categorical add/remove is one-shot).
        if (!newData || !Array.isArray(newData)) return false;
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
            // A gesture normally fans to EVERY direct edit sharing its type (arbitrated
            // by each edit's `when`). An externally-driven event may ADDRESS one edit by
            // name (event.editName), so a feature carrying several same-gesture edits —
            // three `set()`s on a face's params — drives exactly the one asked for
            // instead of all of them. Native pointer events set no editName, so their
            // fan-out is unchanged.
            .filter(e => e.pick === 'direct' && e.gesture === event.type
                && (!event.editName || e.name === event.editName))
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

        // A keyboard nudge is INPUT NORMALIZATION, not an interaction mode: the
        // renderer reports "one step this way" and we resolve it into the pixel a
        // pointer would have been at, so it arrives as an ordinary `drag`. Every
        // direct-pick drag edit becomes keyboard-drivable with no new edit, no new
        // driver, and nothing downstream learning that keyboards exist.
        if (event.type === 'nudge') {
            // Step from where the datum's CURRENT VALUE sits, which is not the same
            // as where the node sits: a bar's centre is halfway up the bar, so
            // nudging from it would first teleport the value to the middle of
            // itself. encodeChannel answers "where is this datum on this axis" the
            // same way the mark drew it — the node centre is only the fallback for
            // a mark with nothing positional on that axis.
            const node = event.node;
            const from = markCenter(node);
            if (!from) return;
            const feature = features.find((f) => f.id === node.featureId);
            const channels = (feature && feature.channels) || {};
            const datum = node.index != null ? dataset[node.index] : node.data;
            const atX = datum ? encodeChannel(scales, channels, 'x', datum, from.cx) : from.cx;
            const atY = datum ? encodeChannel(scales, channels, 'y', datum, from.cy) : from.cy;
            event = {
                type: 'drag',
                node,
                x: nudgeTarget(scales.x, atX, event.dx, event.coarse),
                y: nudgeTarget(scales.y, atY, event.dy, event.coarse),
                // One press = one complete gesture (there is no dragend coming), so
                // it closes its own undo transaction below.
                nudge: true,
                rawEvent: event.rawEvent,
            };
        }

        // Undo transaction boundaries. A stroke is one unit of "take that back":
        // dragstart opens it and dragend closes it, so the many commits a drag makes
        // in between collapse into a single history entry. Any other gesture (click,
        // dblclick, a typed commit) is a transaction of its own — begin it here and
        // close it below, so it can't absorb the next one.
        // dragstart always starts a fresh one, so a stroke whose dragend never
        // arrived can't leak its stale "before" into the next gesture.
        if (event.type === 'dragstart') { endTxn(); beginTxn(); }
        else if (!txn) beginTxn();

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

        // Keep the transaction open only for the duration of a stroke. A nudge's
        // synthetic drag is a complete gesture on its own, so it closes too —
        // otherwise it would stay open and swallow whatever gesture came next.
        if (event.type === 'dragend' || event.nudge
            || (event.type !== 'dragstart' && event.type !== 'drag')) endTxn();

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
    // A deep copy of the engine-owned schema, so a caller can read a DOMAIN an
    // editable axis reshaped (the caller's original spec.schema is never mutated).
    el.getSchema = () => structuredClone(schema);
    // Replace the dataset and re-render. Bypasses constraints by design:
    // constraints gate GESTURES; caller-supplied data is trusted (seeding/reset).
    // That includes the lock: setData RE-SEEDS the chart, so under `lock: 'seed'`
    // the rows it hands in become the new read-only seed.
    el.setData = (/** @type {any[]} */ data) => {
        dataset = structuredClone(data);
        seedCount = dataset.length;
        ui.preview = null;
        // A reseed is a new starting point, not an edit: there is nothing sensible
        // to undo BACK to (and undoing past it would resurrect rows the caller
        // replaced, under a lock that no longer covers them).
        past = [];
        future = [];
        endTxn();
        update();
    };

    // ── External control: drive an edit from outside the chart ────────────────
    // An external controller (a slider, a `<select>`, a rotate icon, a plain
    // function) is a new INPUT SOURCE, not a second interaction system. It
    // synthesizes the SAME renderer-shaped events the pointer and keyboard
    // produce and feeds them to the one `handleEvent` — exactly what the keyboard
    // `nudge` normalizer already does above. Constraints, undo, guides,
    // `on('change')`, and re-render all run because the event traverses the
    // identical pipeline. No new pick, no driver, no dispatch branch.

    // Low-level: inject a renderer-shaped event. `x`/`y` are INNER (margin-
    // subtracted) pixels — the space `ctx.pointer` reads. Event shape:
    // { type, node?, x?, y?, value?, nudge?, rawEvent? }. Callers usually want
    // `el.control(name)` (below), which computes pixels from a DATA value for you.
    el.emit = (/** @type {any} */ event) => handleEvent(event);

    // Find the (feature, edit) an external controller addresses by `name` (set via
    // drag({ name: 'move' }) etc.). Lazy — scanned each call so it tracks re-renders
    // and stage changes.
    const findNamedEdit = (/** @type {string} */ name) => {
        /** @type {{ feature: any, edit: any } | null} */
        let hit = null;
        let count = 0;
        for (const feature of features) {
            for (const edit of collectEdits(feature)) {
                if (edit.name === name) { count++; if (!hit) hit = { feature, edit }; }
            }
        }
        if (DEV && count === 0) console.warn(`[vibe] el.control("${name}"): no edit is named "${name}".`);
        if (DEV && count > 1) console.warn(`[vibe] el.control("${name}"): ${count} edits share the name "${name}"; driving the first.`);
        return hit;
    };

    // The scene node for a datum index in a feature, resolved fresh from the CURRENT
    // render (never cached — nodes are rebuilt every update). Gives radial edits
    // (resize/rotate about the mark) their pivot via markCenter.
    const nodeAt = (/** @type {any} */ feature, /** @type {number} */ index) =>
        (featureNodes[feature.id] || []).find((/** @type {any} */ n) => n && n.index === index) || null;

    // High-level façade: a handle bound to a named edit + datum. It reads the edit's
    // own `gesture` to route value-space vs pointer-space — the FAÇADE branches; the
    // engine dispatch never learns a controller exists.
    el.control = (/** @type {string} */ name, /** @type {number} */ index = 0) => {
        // Value -> the pointer that would set it, forward-encoding through the SAME
        // scale the edit inverts (the inverse of the edit's inverse — encoding, run
        // forward). Mirrors the nudge normalizer: untouched axes keep the datum's
        // CURRENT pixel so they don't teleport.
        const dragPointer = (/** @type {any} */ feature, /** @type {any} */ edit, /** @type {any} */ value) => {
            const node = nodeAt(feature, index);
            const center = markCenter(node);
            const datum = dataset[index];
            const channels = feature.channels || {};
            // Base: where the datum currently sits, so a single-axis set doesn't move
            // the other axis.
            let x = datum ? encodeChannel(scales, channels, 'x', datum, center ? center.cx : 0) : (center ? center.cx : 0);
            let y = datum ? encodeChannel(scales, channels, 'y', datum, center ? center.cy : 0) : (center ? center.cy : 0);
            const resolved = resolveChannels(edit.channels, channels, scales);
            // `value` is either a scalar (single-channel edit) or a { channelName: v }
            // / { field: v } map for a multi-channel edit (a 2-D drag).
            const valueFor = (/** @type {any} */ ch) => {
                if (value != null && typeof value === 'object' && !(value instanceof Date)) {
                    if (ch.name in value) return value[ch.name];
                    if (ch.field != null && ch.field in value) return value[ch.field];
                    return undefined;
                }
                return value; // scalar applies to the sole channel
            };
            for (const ch of resolved) {
                if (!ch.scale || !ch.scale.invertible) continue;
                const v = valueFor(ch);
                if (v === undefined) continue;
                const visual = ch.scale.encode(v);
                const p = pointerForChannel(ch.name, visual, center);
                if (!p) continue;
                if (axisOf(ch.name) === 'x' || ch.name === 'size' || ch.name === 'angle') x = p.x;
                if (axisOf(ch.name) === 'y' || ch.name === 'size' || ch.name === 'angle') y = p.y;
            }
            return { node, x, y };
        };

        // True between begin() and end(): a live drag session, so `.set` ticks emit a
        // plain `drag` (they collapse into the open txn) instead of a self-closing
        // one-shot `nudge` drag (which would close the txn every tick).
        let live = false;

        const handle = {
            // One-shot write. Commit-gesture edits (set/editText) carry the value whole
            // in `ctx.value`; drag-gesture edits forward-encode it to a pointer. Outside
            // a begin()/end() session a drag self-closes its txn with `nudge:true` (one
            // undo entry); inside one, it stays a plain `drag` so the session collapses.
            set(/** @type {any} */ value) {
                const found = findNamedEdit(name);
                if (!found) return;
                const { feature, edit } = found;
                const node = nodeAt(feature, index);
                // editName addresses THIS edit, so a sibling edit sharing the gesture
                // (another set() on the same feature) doesn't also fire.
                if (edit.gesture === 'commit') {
                    el.emit({ type: 'commit', node, value, editName: name, x: node ? node.cx : 0, y: node ? node.cy : 0 });
                    return;
                }
                const { node: n, x, y } = dragPointer(feature, edit, value);
                el.emit(live
                    ? { type: 'drag', node: n, x, y, editName: name }
                    : { type: 'drag', node: n, x, y, nudge: true, editName: name });
            },
            // Live drag: begin()/end() bracket the txn so many .set() ticks collapse
            // into ONE undo entry (exactly like a pointer drag's dragstart..dragend).
            begin() {
                const found = findNamedEdit(name);
                if (!found) return;
                live = true;
                el.emit({ type: 'dragstart', node: nodeAt(found.feature, index), editName: name });
            },
            end() {
                const found = findNamedEdit(name);
                live = false;
                if (!found) return;
                el.emit({ type: 'dragend', node: nodeAt(found.feature, index), editName: name });
            },
            // Fire a TRIGGER edit — one that takes no value, it just acts on the datum
            // (cycle advances a category, remove drops the row, toggle flips it). An
            // external button drives it: `control(name).fire()` dispatches the edit's
            // own gesture (a click/dblclick) on the datum's node. Pass a gesture to
            // override. This is the counterpart of `.set` for the click/dblclick edits
            // — `.set` covers commit/drag, `.fire` covers the rest. (Plane-pick edits
            // like create need coordinates; use `.emit({ type, x, y })` for those.)
            fire(/** @type {string} */ gesture) {
                const found = findNamedEdit(name);
                if (!found) return;
                const g = gesture || found.edit.gesture || 'click';
                el.emit({ type: g, node: nodeAt(found.feature, index), editName: name });
            },
            // Raw passthrough, auto-scoped to this feature's node for the datum.
            emit(/** @type {any} */ event) {
                const found = findNamedEdit(name);
                el.emit({ node: found ? nodeAt(found.feature, index) : undefined, ...event });
            },
            // What values this channel ACCEPTS, read off its scale — so external UI
            // (dropdown options, slider min/max, colour choices) respects the scale
            // instead of fighting it. Reads capability flags, never `scale.type`.
            accepts() {
                const found = findNamedEdit(name);
                if (!found) return null;
                const { feature, edit } = found;
                const ch = resolveChannels(edit.channels, feature.channels || {}, scales)[0];
                const scale = /** @type {any} */ (ch && ch.scale);
                const fieldSpec = (schema && ch && ch.field && schema[ch.field]) || null;
                const measure = (fieldSpec && fieldSpec.type) || null;
                // Prefer the scale's domain; fall back to the schema's declared domain
                // so a non-positional channel (a face param) still reports its range.
                const domain = (scale && typeof scale.domain === 'function' ? scale.domain() : null)
                    || (fieldSpec && fieldSpec.domain) || null;
                const range = scale && typeof scale.range === 'function' ? scale.range() : null;
                return {
                    field: ch ? ch.field : null,
                    type: measure,                         // MeasureType (quantitative/categorical/…)
                    kind: scale ? scale.kind : null,       // band | point | continuous | discrete
                    temporal: !!(scale && scale.temporal),
                    invertible: !!(scale && scale.invertible),
                    // A discrete channel's domain IS its accepted value set; a
                    // continuous channel's domain is its accepted [min, max].
                    domain,
                    values: (
                        (scale && (scale.kind === 'band' || scale.kind === 'discrete' || scale.kind === 'point'))
                        || measure === 'categorical' || measure === 'ordinal'
                    ) ? domain : null,
                    range,
                };
            },
        };
        return handle;
    };

    // Undo / redo one GESTURE (see the history store above). Both return whether
    // they moved, so a caller can drive a button's disabled state; both fire the
    // ordinary `change` notification, because as far as anything downstream is
    // concerned the data just changed.
    el.canUndo = () => past.length > 0;
    el.canRedo = () => future.length > 0;
    el.undo = () => {
        if (!past.length) return false;
        future.push(snapshot());
        restoreSnapshot(/** @type {any} */(past.pop()));
        endTxn();
        notifyChange();
        update();
        return true;
    };
    el.redo = () => {
        if (!future.length) return false;
        past.push(snapshot());
        restoreSnapshot(/** @type {any} */(future.pop()));
        endTxn();
        notifyChange();
        update();
        return true;
    };
    // Subscribe to committed changes; returns an unsubscribe function.
    el.on = (/** @type {'change' | 'stage'} */ type, /** @type {Function} */ cb) => {
        listeners[type].add(cb);
        return () => listeners[type].delete(cb);
    };

    // Multi-stage controls. Advancing the stage re-renders (the active edit set,
    // plane-on-top, and cursors all follow currentStage) and drops every transient.
    el.getStage = () => currentStage;
    el.getStageLabel = () => stageLabelOf(currentStage);
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
