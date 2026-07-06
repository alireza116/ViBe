// @ts-check
import { SceneGraph } from './scene.js';
import { resolveScales } from './resolve.js';
import { collectEdits, resolveChannels } from '../edit/route.js';
import { nearestMark, nearestMarkOnAxis, nearestSeries, pickThreshold } from '../edit/pick.js';
import { buildEditGuide } from '../edit/guide.js';
import { D3Renderer } from '../renderers/d3-renderer.js';
import { resolveEffects } from './effects.js';
import { axisX, axisY, gridX, gridY } from '../plot/axis.js';
import * as guideBuilders from '../guides/index.js';

/**
 * Resolve the global `axes` convenience into composable axis/grid marks — the
 * IMPLICIT layer of the Observable-Plot axis model. Only channels the user did
 * not already compose an explicit axis mark for are auto-injected, so an explicit
 * `axisX(...)` in `features` always wins. `spec.axes`:
 *   undefined -> default axis on both positional channels (today's behaviour)
 *   false     -> no axes at all
 *   { x, y }  -> per-channel config object, or `false` to suppress that channel.
 * @param {any[]} features
 * @param {any} axesOpt
 * @returns {any[]} the axis/grid marks to prepend (drawn behind marks)
 */
function autoAxes(features, axesOpt) {
    if (axesOpt === false) return [];
    /** @type {any[]} */
    const injected = [];
    /** @param {string} ch */
    const hasExplicit = (ch) => features.some(f => (f.isAxis || f.isGrid) && f.channel === ch);
    const builders = { x: { axis: axisX, grid: gridX }, y: { axis: axisY, grid: gridY } };
    for (const ch of /** @type {const} */ (['x', 'y'])) {
        const cfg = axesOpt ? axesOpt[ch] : {};
        if (cfg === false) continue;           // channel suppressed
        if (hasExplicit(ch)) continue;         // user composed their own
        const opts = cfg || {};
        injected.push(builders[ch].axis(opts));
        if (opts.grid) injected.push(builders[ch].grid(opts));
    }
    return injected;
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

    // Auto-guides: interactors can request guides for their feature without the
    // caller repeating the feature id in a top-level guides list:
    //   - `showGuides` -> a constraints guide (where constraints limit dragging).
    //   - `highlight`  -> a proximity guide (highlights the nearest-mark selection).
    // Deduped per (feature, guide type).
    /** @type {any[]} */
    const autoGuides = [];
    /** @type {Set<string>} */
    const seenAutoGuides = new Set();
    
    /**
     * @param {string} kind
     * @param {string} featureId
     * @param {any} guide
     */
    const addAutoGuide = (kind, featureId, guide) => {
        const key = `${featureId}:${kind}`;
        if (!seenAutoGuides.has(key)) {
            seenAutoGuides.add(key);
            autoGuides.push(guide);
        }
    };
    features.forEach(feature => {
        (feature.interactors || []).forEach((/** @type {any} */ interactor) => {
            if (interactor.showGuides) {
                const opts = typeof interactor.showGuides === 'object' ? interactor.showGuides : {};
                addAutoGuide('constraints', feature.id, guideBuilders.constraints({ target: feature.id, ...opts }));
            }
            if (interactor.highlight) {
                const opts = typeof interactor.highlight === 'object' ? interactor.highlight : {};
                addAutoGuide('proximity', feature.id, guideBuilders.proximity({ target: feature.id, ...opts }));
            }
        });

        // New model: an edit declared `guide: true` self-draws (constraint bounds
        // + nearest snap ring) via buildEditGuide. No `target` — the edit already
        // owns its channel and constraints. Deduped per (feature, edit type).
        collectEdits(feature).forEach((edit, i) => {
            if (!edit.guide) return;
            addAutoGuide(`edit-${edit.type}-${i}`, feature.id, {
                isGuide: true,
                /** @param {any} ctx */
                build: (ctx) => buildEditGuide(feature, edit, ctx)
            });
        });
    });
    const allGuides = [...autoGuides, ...guides];

    // Plane-on-top mode: when a feature needs the plane to capture pointer moves
    // or drags anywhere (not just on a mark), the plane must sit above the marks.
    // Two cases: a legacy proximity interactor, or a new `pick: 'nearest'` edit —
    // both resolve their target from an arbitrary pointer position, so they need
    // the plane to own the gesture. The renderer reads this flag.
    const planeOnTop =
        features.some(feature =>
            (feature.interactors || []).some((/** @type {any} */ i) =>
                (i.target || 'mark') === 'plane' && (i.hover || i.dragstart || i.drag)
            )
        ) ||
        features.some(feature =>
            collectEdits(feature).some(e => e.pick === 'nearest' || e.pick === 'sweep')
        );

    // Transient interaction (UI) state, separate from the belief data `state`.
    // Guides and plane interactors read/write it (e.g. proximity selection).
    /** @type {any} */
    const ui = { proximity: {} };

    // The most recently built scene nodes per feature, so plane interactors can
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

            // Attach metadata for mark-scoped interactors (those that operate on
            // existing marks). Plane-scoped interactors are routed via the plane,
            // not the marks, so they are not attached here.
            const markInteractors = (feature.interactors || [])
                .filter((/** @type {any} */ i) => (i.target || 'mark') === 'mark');
            if (markInteractors.length > 0) {
                nodes.forEach((/** @type {any} */ node) => {
                    node.interactors = markInteractors.map((/** @type {any} */ interactorDef) => ({
                        type: interactorDef.type,
                        featureId: feature.id
                    }));
                });
            }

            // Tag every mark node with its feature so gesture events can find the
            // feature's edits (the new `edit` dispatch path).
            nodes.forEach((/** @type {any} */ node) => { node.featureId = feature.id; });

            nodes.forEach((/** @type {any} */ node) => scene.add(node));
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

    // Apply a single interactor to an event: build context, run the handler and
    // its constraints, then commit to state. Returns whether a re-render is
    // needed (data committed, or a handler requested a redraw for UI state).
    /**
     * @param {any} feature
     * @param {any} interactorDef
     * @param {any} event
     * @returns {boolean}
     */
    const applyInteraction = (feature, interactorDef, event) => {
        const handler = interactorDef[event.type];
        if (!handler) return false;

        const featureId = feature.id;
        const currentData = state[featureId] || [];

        const context = {
            event: event.rawEvent,
            x: event.x,
            y: event.y,
            data: currentData,
            scales,
            // For mark (change) interactions these identify the touched datum;
            // for plane (create/proximity) interactions they are undefined.
            nodeData: event.node ? event.node.data : undefined,
            nodeIndex: event.node ? event.node.index : undefined,
            // The touched scene node itself, so geometry-based editors (e.g.
            // resize, which measures a radius from the mark centre) can read it.
            node: event.node,
            xKey: feature.xKey || 'x',
            yKey: feature.yKey || 'y',
            // The feature's channel encoding, so channel-scoped interactors can
            // resolve channel -> field generically (e.g. edit the colour field).
            encoding: feature.encoding,
            // Extras for plane interactors: the feature id, its current marks (for
            // proximity hit-testing) and the shared transient UI state.
            featureId,
            marks: featureNodes[featureId] || [],
            ui
        };

        // Gesture arbitration, kept SEPARATE from the interactions: a `when`
        // predicate (added by gate()) decides whether this interactor acts on
        // this gesture — e.g. plain-drag vs Shift-drag selects move vs resize.
        // The interaction itself stays unaware of how it was selected.
        if (interactorDef.when && !interactorDef.when(context)) return false;

        // The interactor returns:
        //   undefined -> no-op (no re-render)
        //   true      -> redraw only (it mutated UI state, e.g. proximity hover)
        //   array     -> a proposed dataset to commit (after constraints)
        let newData = handler(context);
        if (newData === undefined) return false;
        if (newData === true) return true;

        // Run constraints. A constraint may return `false` to reject the whole
        // interaction, or a modified dataset to bound/limit it. Each constraint
        // is fed the result of the previous one so they compose.
        const constraints = interactorDef.constraints || [];
        for (const constraint of constraints) {
            const result = constraint(newData, currentData, context);
            if (result === false) {
                return false; // rejected
            } else if (result !== true && result !== undefined) {
                newData = result;
            }
        }

        state[featureId] = newData;
        if (interactorDef.onChange) {
            interactorDef.onChange(newData);
        }
        return true;
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
            marks: featureNodes[feature.id] || []
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
        // relative to it (create -> the appended one; remove -> none; else `index`).
        const activeIndex = edit.type === 'create' ? newData.length - 1
            : edit.type === 'remove' ? null
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

    // Plane-pick edits: the gesture is on the plane (no node). Two kinds:
    //   - create (pick 'plane'): mint a new datum on the matching gesture.
    //   - nearest (pick 'nearest'): resolve the closest mark within threshold and
    //     edit it, holding a lock across the drag (like the old proximityDrag).
    // Nearest also maintains the transient ui.proximity selection its guide draws.
    /**
     * @param {string} fid
     * @returns {any}
     */
    const readSel = (fid) => (ui.proximity && ui.proximity[fid]) || null;
    
    /**
     * @param {string} fid
     * @param {any} patch
     */
    const writeSel = (fid, patch) => {
        ui.proximity = ui.proximity || {};
        ui.proximity[fid] = { ...(ui.proximity[fid] || {}), ...patch };
    };

    /**
     * @param {any} feature
     * @param {any} event
     * @returns {boolean}
     */
    const dispatchPlaneEdits = (feature, event) => {
        const planeEdits = collectEdits(feature).filter(e => e.pick === 'plane' || e.pick === 'nearest' || e.pick === 'sweep');
        if (planeEdits.length === 0) return false;
        const fid = feature.id;
        let changed = false;

        // create — matches its own trigger gesture ('click' / 'dblclick').
        planeEdits
            .filter(e => e.pick === 'plane' && e.gesture === event.type)
            .forEach(edit => { if (runEdit(feature, edit, event, null)) changed = true; });

        // nearest — manage the proximity lock + selection, then edit on drag.
        const nearestEdits = planeEdits.filter(e => e.pick === 'nearest');
        if (nearestEdits.length > 0) {
            const marks = featureNodes[fid] || [];
            const threshold = pickThreshold(nearestEdits[0]);

            if (event.type === 'hover') {
                const hit = nearestMark(marks, event.x, event.y, threshold);
                writeSel(fid, { px: event.x, py: event.y, threshold, hoverIndex: hit });
                changed = true; // redraw ring only
            } else if (event.type === 'hoverout') {
                if (ui.proximity) delete ui.proximity[fid];
                changed = true;
            } else if (event.type === 'dragstart') {
                const hit = nearestMark(marks, event.x, event.y, threshold);
                writeSel(fid, { px: event.x, py: event.y, threshold, hoverIndex: hit, activeIndex: hit });
                changed = true;
            } else if (event.type === 'dragend') {
                const info = readSel(fid);
                if (info) info.activeIndex = null;
                changed = true;
            } else {
                // Any other gesture a nearest edit declares — a drag (uses the
                // lock set on dragstart) or a discrete gesture like a click/dblclick
                // delete (resolve a fresh nearest target). Keep the ring at the
                // pointer either way.
                const info = readSel(fid);
                if (info) { info.px = event.x; info.py = event.y; }
                const matching = nearestEdits.filter(e => e.gesture === event.type);
                if (matching.length > 0) {
                    let index = info ? info.activeIndex : null;
                    if (index == null) index = nearestMark(marks, event.x, event.y, threshold);
                    if (index != null) {
                        matching.forEach(edit => { if (runEdit(feature, edit, event, index)) changed = true; });
                    }
                } else if (info) {
                    changed = true; // nothing to run; still redraw the ring
                }
            }
        }

        // sweep (you-draw-it) — like nearest, but distance is measured along the
        // domain axis only and the target is RE-RESOLVED every drag event (no
        // dragstart lock), so one horizontal sweep paints each point's value as
        // the pointer crosses its column.
        const sweepEdits = planeEdits.filter(e => e.pick === 'sweep');
        if (sweepEdits.length > 0) {
            const marks = featureNodes[fid] || [];
            const threshold = pickThreshold(sweepEdits[0]);
            // The channels the sweep governs: one positional axis -> paint that
            // value along the OTHER (a function line); both x AND y -> a 2D sweep
            // (connected scatter), retargeting by euclidean distance.
            const chans = sweepEdits[0].channels || ['y'];
            const twoD = chans.includes('x') && chans.includes('y');
            const valueName = chans[0] || 'y';
            /** @type {'x' | 'y'} */
            const axis = valueName === 'x' ? 'y' : 'x'; // sweep (domain) axis, 1D case

            // Resolve the point under the pointer, scoped to the LOCKED series so
            // overlapping lines don't fight over a column. 1D sweeps by domain axis,
            // 2D sweeps by euclidean nearest.
            /** @param {any} lockSeries */
            const resolve = (lockSeries) => twoD
                ? nearestMark(marks, event.x, event.y, threshold, lockSeries)
                : nearestMarkOnAxis(marks, event.x, event.y, threshold, axis, lockSeries);

            if (event.type === 'hover') {
                const s = nearestSeries(marks, event.x, event.y, threshold);
                const hit = resolve(s == null ? undefined : s);
                writeSel(fid, { px: event.x, py: event.y, threshold, hoverIndex: hit, series: s });
                changed = true;
            } else if (event.type === 'hoverout') {
                if (ui.proximity) delete ui.proximity[fid];
                changed = true;
            } else if (event.type === 'dragstart') {
                // Lock onto the nearest line for the whole drag.
                const s = nearestSeries(marks, event.x, event.y, threshold);
                const index = resolve(s == null ? undefined : s);
                writeSel(fid, { px: event.x, py: event.y, threshold, hoverIndex: index, activeIndex: index, series: s });
                if (index != null) {
                    sweepEdits.forEach(edit => { if (runEdit(feature, edit, event, index)) changed = true; });
                }
                changed = true;
            } else if (event.type === 'dragend') {
                const info = readSel(fid);
                if (info) { info.activeIndex = null; info.series = null; }
                changed = true;
            } else if (event.type === 'drag') {
                // Paint: retarget within the locked series each event (no per-point
                // lock), so one stroke fills the whole line.
                const info = readSel(fid);
                const lock = info && info.series != null ? info.series : undefined;
                const index = resolve(lock);
                writeSel(fid, { px: event.x, py: event.y, threshold, hoverIndex: index, activeIndex: index });
                if (index != null) {
                    sweepEdits.forEach(edit => { if (runEdit(feature, edit, event, index)) changed = true; });
                }
                changed = true;
            }
        }
        return changed;
    };

    // 4. Event routing.
    //    - Events carrying a `node` are mark-scoped (change existing elements)
    //      and route to that mark's edits (new) or interactors (legacy).
    //    - Events without a `node` are plane-scoped (create new elements) and
    //      route to every feature's plane-target interactors.
    /**
     * @param {any} event
     */
    const handleEvent = (event) => {
        let shouldRender = false;

        if (event.node) {
            // New edit path: dispatch to the touched mark's feature (direct pick).
            const feature = features.find(f => f.id === event.node.featureId);
            if (feature && dispatchDirectEdits(feature, event)) shouldRender = true;
        } else {
            // New edit path: plane gestures -> every feature's plane/nearest edits.
            features.forEach(feature => {
                if (dispatchPlaneEdits(feature, event)) shouldRender = true;
            });
        }

        if (event.node && event.node.interactors) {
            event.node.interactors.forEach((/** @type {any} */ nodeInteractor) => {
                const feature = features.find(f => f.id === nodeInteractor.featureId);
                const interactorDef = feature.interactors.find((/** @type {any} */ i) => i.type === nodeInteractor.type);
                if (interactorDef && applyInteraction(feature, interactorDef, event)) {
                    shouldRender = true;
                }
            });
        } else if (!event.node) {
            features.forEach(feature => {
                (feature.interactors || []).forEach((/** @type {any} */ interactorDef) => {
                    if ((interactorDef.target || 'mark') === 'plane' && interactorDef[event.type]) {
                        if (applyInteraction(feature, interactorDef, event)) {
                            shouldRender = true;
                        }
                    }
                });
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
