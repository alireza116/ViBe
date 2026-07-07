// @ts-check
import { SceneGraph } from './scene.js';
import { resolveScales } from './resolve.js';
import { collectEdits, resolveChannels } from '../edit/route.js';
import { drivers, needsPlaneOnTop } from '../edit/drivers/index.js';
import { autoEditGuides } from '../edit/guide.js';
import { D3Renderer } from '../renderers/d3-renderer.js';
import { resolveEffects } from './effects.js';
import { autoAxes } from './axes.js';

// Dev-only builds (Vite sets import.meta.env.DEV; undefined under a bare Node
// import) get a capability guard: a line-scoped edit (edit.line.*) attached to a
// mark that doesn't group points into series is almost certainly a mistake.
const DEV = !!(/** @type {any} */ (import.meta).env && /** @type {any} */ (import.meta).env.DEV);
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

/**
 * @param {import('../types').ElicitSpec} spec
 * @returns {HTMLDivElement}
 */
export function Elicit(spec) {
    const {
        width = 600,
        height = 400,
        margins = { top: 20, right: 20, bottom: 30, left: 40 },
        // Top-level x / y are read as global positional scale specs by
        // resolveScales (spec.x / spec.y); channels beyond x/y come from marks.
        features: userFeatures = [],
        // Global axis convenience: desugars into composable axis/grid marks (see
        // autoAxes). Explicit axis marks in `features` take precedence per channel.
        axes,
        guides = [],
        // Interaction-effects layer (grab / proximity-select), customizable and
        // kept separate from mark style channels. See core/effects.js.
        effects: effectsSpec,
        renderer = new D3Renderer()
    } = spec;

    const effects = resolveEffects(effectsSpec);

    // Prepend auto-injected axis/grid marks (drawn behind marks via the background
    // layer). Explicit axis marks the user composed into `features` are preserved.
    const features = [...autoAxes(userFeatures, axes), ...userFeatures];

    const innerWidth = width - margins.left - margins.right;
    const innerHeight = height - margins.top - margins.bottom;

    // 1. Maintain data state (store).
    // Each feature that provides data keeps its own array within the state,
    // keyed by feature id.
    /** @type {Record<string, any[]>} */
    const state = {};
    features.forEach((feature, index) => {
        const id = feature.id || `feature-${index}`;
        feature.id = id;
        if (feature.data) {
            // Deep copy so we never mutate the caller's original spec data.
            state[id] = JSON.parse(JSON.stringify(feature.data));
        }
    });

    // Auto-guides: an edit declared `guide: true` self-draws its guide (constraint
    // bounds + nearest snap ring) without the caller repeating the feature id in a
    // top-level guides list (see edit/guide.js).
    const allGuides = [...autoEditGuides(features), ...guides];

    // Plane-on-top mode: when a feature has an edit whose driver resolves its
    // target from an arbitrary pointer position (nearest/sweep/draw), the plane
    // must sit above the marks and own the gesture. The renderer reads this flag.
    const planeOnTop = features.some(feature => needsPlaneOnTop(collectEdits(feature)));

    // Transient interaction (UI) state, separate from the belief data `state`. The
    // interaction drivers keep a per-feature session here (proximity selection,
    // sweep/draw locks); guides read it to draw the snap ring + highlight.
    /** @type {{ session: Record<string, any> }} */
    const ui = { session: {} };

    // The most recently built scene nodes per feature, so plane-pick edits can
    // hit-test against exact mark geometry and guides can look marks up by index.
    /** @type {Record<string, any[]>} */
    const featureNodes = {};

    // 2. Calculate scales (Observable Plot model): one GLOBAL scale per channel,
    //    resolved from the union of every feature's encoding + the top-level
    //    positional specs. Recomputed each render so inferred domains (e.g. a
    //    colour/size channel) track data as create/drag mutate it. `scales` is a
    //    channel map { x, y, color, size, … }; unused channels are absent.
    const dims = { width: innerWidth, height: innerHeight };
    let scales = resolveScales(features, state, spec, dims);

    // Set up container.
    const container = document.createElement('div');
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.position = 'relative';

    const scene = new SceneGraph();

    // 3. Coordinator - rebuild the scene graph from current state and render.
    const update = () => {
        scene.clear();

        // Re-resolve global scales so inferred domains follow the live data.
        scales = resolveScales(features, state, spec, dims);

        features.forEach(feature => {
            const currentData = state[feature.id] || [];
            const nodes = feature.build(currentData, scales, innerWidth, innerHeight);
            featureNodes[feature.id] = nodes;

            const edits = collectEdits(feature);
            if (DEV) warnLineScopeMismatch(feature, edits);

            // A feature with a direct-pick edit is interactive on its marks, so the
            // renderer should show an editable cursor on them. Plane-pick edits
            // (nearest/sweep/draw) put the cursor on the plane instead, so they
            // don't mark nodes editable.
            const editable = edits.some(e => e.pick === 'direct');

            // Tag every node with its feature so gesture events can find the
            // feature's edits, and flag interactive marks for the cursor.
            nodes.forEach((/** @type {any} */ node) => {
                node.featureId = feature.id;
                if (editable) node.editable = true;
                scene.add(node);
            });
        });

        // Build guides last so they can read the freshly-updated state of every
        // feature. Guides are purely visual (non-interactive) annotations.
        const guideCtx = {
            scales,
            state,
            features,
            featureNodes,
            ui,
            effects,
            width: innerWidth,
            height: innerHeight
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
            width,
            height,
            margins,
            scales,
            spec,
            planeOnTop,
            effects,
            onEvent: handleEvent
        });
    };

    // Run one edit against a resolved target and commit. `index` addresses the
    // datum being edited (null for create, which appends). The gesture is inverted
    // through the scales in apply(), producing a data-space proposal; that proposal
    // is then judged by the DATA-LAYER INVARIANTS (feature.constraints, plus any
    // edit-scoped constrain sugar) before it commits. Constraints never see pixels.
    // Returns whether data changed.
    /**
     * @param {any} feature
     * @param {import('../types').Edit} edit
     * @param {any} event
     * @param {number | null} index
     * @returns {boolean}
     */
    const runEdit = (feature, edit, event, index) => {
        const currentData = state[feature.id] || [];
        const encoding = feature.encoding || {};
        const resolved = resolveChannels(edit.channels, encoding, scales);
        const ctx = {
            data: currentData,
            datum: index != null ? currentData[index] : undefined,
            index,
            pointer: { x: event.x, y: event.y },
            node: event.node || null,
            event: event.rawEvent,
            channels: resolved,
            scales,
            encoding,
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
        if (edit.when && !edit.when(ctx)) return false; // arbitration

        const result = edit.apply(ctx);
        if (result === undefined) return false;

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

        // Data-layer invariants: feature-wide first (hold for every edit), then any
        // edit-scoped guard sugar. Pure data context — no scales-as-geometry.
        const invariants = [...(feature.constraints || []), ...edit.constrain];
        const cctx = { activeIndex, scales, encoding };
        let rejected = false;
        for (const constraint of invariants) {
            const r = constraint(newData, currentData, cctx);
            if (r === false) { rejected = true; break; }
            if (r !== true && r !== undefined) newData = r;
        }
        if (rejected) return false;

        state[feature.id] = newData;
        if (feature.onChange) feature.onChange(newData);
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
        collectEdits(feature)
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
        const edits = collectEdits(feature).filter(e => e.pick !== 'direct');
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

        let changed = false;
        for (const driver of drivers) {
            const matching = edits.filter(e => driver.wants(e));
            if (matching.length === 0) continue;
            const dctx = {
                feature, event, edits: matching,
                marks: featureNodes[fid] || [],
                data: state[fid] || [],
                session,
                runEdit: runFeatureEdit
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

    // Initial render. Deferred so the container can be attached to the DOM first
    // if the renderer needs measured dimensions.
    setTimeout(update, 0);

    return container;
}
