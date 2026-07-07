// @ts-check
import * as d3 from 'd3';
import { DEFAULT_EFFECTS } from '../core/effects.js';

// Curve name -> d3 curve factory for line-mark paths. Mirrors Observable Plot's
// `curve` option; unknown names fall back to a straight polyline.
/** @type {Record<string, any>} */
const CURVES = {
    linear: d3.curveLinear,
    catmullRom: d3.curveCatmullRom,
    natural: d3.curveNatural,
    step: d3.curveStep,
    stepAfter: d3.curveStepAfter,
    stepBefore: d3.curveStepBefore,
    basis: d3.curveBasis,
    cardinal: d3.curveCardinal,
    monotoneX: d3.curveMonotoneX,
    monotoneY: d3.curveMonotoneY
};

/**
 * @param {string} [name]
 * @returns {any}
 */
function resolveCurve(name) {
    return (name && CURVES[name]) || d3.curveLinear;
}

export class D3Renderer {
    constructor() {
        // The standard paint surface: node field -> [SVG attribute, base default].
        // Every shape draw runs `_applyStyle`, which reads these off the node.
        // ADDING A STYLE CHANNEL IS ONE ROW HERE (plus resolving it in the mark).
        // Per-context defaults (a mark's fill, a rule's stroke) are supplied by
        // the draw call and override the base default below.
        /** @type {[string, string, any][]} */
        this.STYLE_ATTRS = [
            ['fill', 'fill', null],
            ['stroke', 'stroke', null],
            ['strokeWidth', 'stroke-width', null],
            ['strokeDasharray', 'stroke-dasharray', null],
            ['opacity', 'opacity', null],
            ['fillOpacity', 'fill-opacity', null],
            ['strokeOpacity', 'stroke-opacity', null]
        ];
    }

    /**
     * @param {any} context
     */
    render(context) {
        const { container, scene, width, height, margins, onEvent, planeOnTop = false } = context;
        const effects = context.effects || DEFAULT_EFFECTS;

        const innerWidth = width - margins.left - margins.right;
        const innerHeight = height - margins.top - margins.bottom;

        const { g, plane } = this._ensureScene(container, { width, height, margins, innerWidth, innerHeight });

        /** @param {any} event */
        const pointer = (event) => d3.pointer(event, g.node());

        this._bindPlaneGestures(plane, pointer, onEvent, planeOnTop);

        const drag = this._makeDrag(onEvent, effects.grab);
        // A mark-scoped click (routed to the mark's click edits, e.g. cycle /
        // remove). d3.drag suppresses the click after a real drag, so this only
        // fires on a click without movement — drag moves, click edits.
        /** @param {any} event @param {any} d */
        const markClick = (event, d) => {
            const [px, py] = pointer(event);
            onEvent({ type: 'click', x: px, y: py, node: d, rawEvent: event });
        };

        // Partition scene nodes by type + role. Draw order below (background ->
        // guides -> mark rects -> mark circles -> guide circles -> lines -> text)
        // is the z-order and must be preserved.
        const byType = (/** @type {string} */ t) => scene.children.filter((/** @type {any} */ n) => n.type === t);
        const allRects = byType('rect');
        const allCircles = byType('circle');
        const allLines = byType('line');
        const allPaths = byType('path');
        const allTexts = byType('text');

        // Draw order == z-order: background, then guide regions (behind marks),
        // then interactive marks, then guide circles (proximity rings, in front
        // of marks), then foreground lines, then labels.
        this._drawBackground(g, allLines.filter((/** @type {any} */ n) => n.background),
            allTexts.filter((/** @type {any} */ n) => n.background));

        this._drawGuideRegions(g, allRects.filter((/** @type {any} */ n) => n.guide));

        // Connecting paths (line marks) sit above guide regions but BELOW the
        // handle dots, so the dots stay grabbable on top of the line.
        this._drawPaths(g, allPaths);

        this._drawMarks(g,
            allRects.filter((/** @type {any} */ n) => !n.guide),
            allCircles.filter((/** @type {any} */ n) => !n.guide),
            { drag, markClick });

        this._drawGuideCircles(g, allCircles.filter((/** @type {any} */ n) => n.guide));
        this._drawLines(g, allLines.filter((/** @type {any} */ n) => !n.background), { drag, markClick });
        this._drawLabels(g, allTexts.filter((/** @type {any} */ n) => !n.background));

        // In plane-on-top (proximity) mode the plane must sit above the marks and
        // own all pointer events; the marks become purely visual. Guides already
        // use pointer-events:none, so they remain visible through the plane.
        if (planeOnTop) {
            g.selectAll('.mark').style('pointer-events', 'none');
            plane.raise().style('cursor', 'pointer');
        }
    }

    // -- setup ---------------------------------------------------------------

    /**
     * Once-only scaffolding: the svg, the translated scene group, the transparent
     * interaction plane, and the background layer (behind every mark). Idempotent
     * — on re-render it just returns the existing nodes.
     * @param {any} container
     * @param {{ width: number, height: number, margins: any, innerWidth: number, innerHeight: number }} dims
     * @returns {{ svg: any, g: any, plane: any }}
     */
    _ensureScene(container, { width, height, margins, innerWidth, innerHeight }) {
        /** @type {any} */
        let svg = d3.select(container).select('svg');
        if (svg.empty()) {
            svg = d3.select(container).append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('user-select', 'none'); // prevent text selection during drag

            const g = svg.append('g')
                .attr('class', 'scene-container')
                .attr('transform', `translate(${margins.left},${margins.top})`);

            // Transparent background plane, behind everything, that captures
            // interactions on empty space (used by plane-pick edits, e.g. create).
            g.append('rect')
                .attr('class', 'plane')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', innerWidth)
                .attr('height', innerHeight)
                .style('fill', 'transparent')
                .style('pointer-events', 'all');

            // Background layer, right above the plane and behind every mark. Axes
            // and gridlines (composable marks emitting `background:true` nodes,
            // see plot/axis.js) render here so marks always sit on top of them.
            g.append('g').attr('class', 'bg-layer');
        }

        const g = svg.select('.scene-container');
        return { svg, g, plane: g.select('rect.plane') };
    }

    /**
     * Wire plane gestures. `click`/`dblclick` are always available (create). In
     * plane-on-top mode we additionally drive hover + drag manually (rather than
     * via d3.drag, whose preventDefault suppresses dblclick), distinguishing a
     * click from a drag ourselves and keeping gesture state on the renderer so it
     * survives re-renders mid-drag.
     * @param {any} plane
     * @param {(event: any) => [number, number]} pointer
     * @param {(e: any) => void} onEvent
     * @param {boolean} planeOnTop
     */
    _bindPlaneGestures(plane, pointer, onEvent, planeOnTop) {
        plane
            .on('click', (/** @type {any} */ event) => {
                // A plane drag (below) ends with a native `click` on the same element.
                // Swallow that one so a drag-to-edit doesn't also fire a click-gesture
                // edit (e.g. create/anchor minting a point where the drag released).
                // A click without a preceding drag passes through untouched.
                if (this._suppressClick) { this._suppressClick = false; return; }
                const [px, py] = pointer(event);
                onEvent({ type: 'click', x: px, y: py, rawEvent: event });
            })
            .on('dblclick', (/** @type {any} */ event) => {
                const [px, py] = pointer(event);
                onEvent({ type: 'dblclick', x: px, y: py, rawEvent: event });
            });

        if (!planeOnTop) return;

        plane
            .on('pointerdown', (/** @type {any} */ event) => {
                const [px, py] = pointer(event);
                this._planeGesture = { startX: px, startY: py, down: true, dragging: false };
                if (event.target.setPointerCapture) {
                    try { event.target.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
                }
            })
            .on('pointermove', (/** @type {any} */ event) => {
                const [px, py] = pointer(event);
                const gesture = this._planeGesture;
                if (gesture && gesture.down) {
                    if (!gesture.dragging && Math.hypot(px - gesture.startX, py - gesture.startY) > 3) {
                        gesture.dragging = true;
                        onEvent({ type: 'dragstart', x: gesture.startX, y: gesture.startY, rawEvent: event });
                    }
                    if (gesture.dragging) {
                        onEvent({ type: 'drag', x: px, y: py, rawEvent: event });
                    }
                } else {
                    onEvent({ type: 'hover', x: px, y: py, rawEvent: event });
                }
            })
            .on('pointerup', (/** @type {any} */ event) => {
                const [px, py] = pointer(event);
                const gesture = this._planeGesture;
                if (gesture && gesture.dragging) {
                    onEvent({ type: 'dragend', x: px, y: py, rawEvent: event });
                    // Suppress the native click the browser fires next (see 'click').
                    this._suppressClick = true;
                }
                this._planeGesture = null;
            })
            .on('pointerleave', (/** @type {any} */ event) => {
                if (!this._planeGesture || !this._planeGesture.down) {
                    onEvent({ type: 'hoverout', rawEvent: event });
                }
            });
    }

    /**
     * The drag behaviour attached to every interactive mark. clickDistance lets a
     * press that moves < N px still count as a click (d3 otherwise suppresses the
     * click on any movement), so mark-click editors fire reliably alongside drag.
     * @param {(e: any) => void} onEvent
     * @param {any} [grab] the resolved `grab` effect ({ filter } | null-filter to disable)
     * @returns {any}
     */
    _makeDrag(onEvent, grab) {
        // Grab feedback via CSS `filter` (an ELEMENT effect), NOT via the
        // `stroke`/`fill` paint attributes — those are real style channels the
        // mark may set, and mutating them here would clobber the mark's own
        // stroke (and leave it wiped until the next full re-render). `filter`
        // is not a style channel, so `_applyStyle` never touches it: it rides
        // through the mid-drag re-renders and is cleared on end with no redraw.
        // The filter string is customizable via the effects layer (core/effects.js).
        const filter = (grab && grab.filter != null)
            ? grab.filter
            : (grab === undefined ? DEFAULT_EFFECTS.grab.filter : null);
        return d3.drag()
            .clickDistance(4)
            .on('start', function() { if (filter) d3.select(this).style('filter', filter); })
            .on('drag', function(event, d) {
                // event.x/event.y are relative to the SVG scene group.
                onEvent({ type: 'drag', x: event.x, y: event.y, node: d, rawEvent: event.sourceEvent });
            })
            .on('end', function() { if (filter) d3.select(this).style('filter', null); });
    }

    // -- style + geometry primitives -----------------------------------------

    /**
     * Apply the standard paint surface (STYLE_ATTRS) to a selection. Per-node
     * value wins; otherwise the caller's `defaults[field]` if given, else the
     * table's base default. This is the single place a style channel is applied.
     * @param {any} sel
     * @param {Record<string, any>} [defaults]
     * @returns {any}
     */
    _applyStyle(sel, defaults = {}) {
        for (const [field, attr, base] of this.STYLE_ATTRS) {
            const def = field in defaults ? defaults[field] : base;
            sel.attr(attr, (/** @type {any} */ d) => (d[field] != null ? d[field] : def));
        }
        return sel;
    }

    /** @param {any} sel */
    _geomRect(sel) {
        sel.attr('x', (/** @type {any} */ d) => d.x)
            .attr('y', (/** @type {any} */ d) => d.y)
            .attr('width', (/** @type {any} */ d) => d.width)
            .attr('height', (/** @type {any} */ d) => Math.max(0, d.height)); // no negative height
    }

    /** @param {any} sel */
    _geomCircle(sel) {
        sel.attr('cx', (/** @type {any} */ d) => d.cx)
            .attr('cy', (/** @type {any} */ d) => d.cy)
            .attr('r', (/** @type {any} */ d) => Math.max(0, d.r != null ? d.r : 5));
    }

    /** @param {any} sel */
    _geomLine(sel) {
        sel.attr('x1', (/** @type {any} */ d) => d.x1)
            .attr('x2', (/** @type {any} */ d) => d.x2)
            .attr('y1', (/** @type {any} */ d) => d.y1)
            .attr('y2', (/** @type {any} */ d) => d.y2);
    }

    /**
     * @param {any} sel
     * @param {string} [anchorDefault]
     */
    _geomText(sel, anchorDefault = 'start') {
        sel.attr('x', (/** @type {any} */ d) => d.x)
            .attr('y', (/** @type {any} */ d) => d.y)
            .attr('text-anchor', (/** @type {any} */ d) => d.textAnchor || anchorDefault)
            .attr('font-size', (/** @type {any} */ d) => (d.fontSize != null ? d.fontSize : 10))
            .text((/** @type {any} */ d) => d.text);
    }

    // -- semantic draws ------------------------------------------------------

    /**
     * Axis spines/ticks, gridlines, and axis labels — into the dedicated layer
     * behind the marks. Non-interactive.
     * @param {any} g
     * @param {any[]} bgLines
     * @param {any[]} bgTexts
     */
    _drawBackground(g, bgLines, bgTexts) {
        const bgLayer = g.select('g.bg-layer');
        const lineSel = bgLayer.selectAll('line').data(bgLines).join('line')
            .style('pointer-events', 'none');
        this._geomLine(lineSel);
        this._applyStyle(lineSel, { stroke: '#6b7280', strokeWidth: 1, opacity: 1 });

        const textSel = bgLayer.selectAll('text').data(bgTexts).join('text')
            .style('pointer-events', 'none');
        this._geomText(textSel, 'middle');
        this._applyStyle(textSel, { fill: '#374151', opacity: 1 });
    }

    /**
     * Non-interactive guide regions (shaded bands / outlines), drawn behind marks.
     * @param {any} g
     * @param {any[]} guideRects
     */
    _drawGuideRegions(g, guideRects) {
        const rectSel = g.selectAll('rect.guide-region').data(guideRects).join('rect')
            .attr('class', 'guide-region')
            .style('pointer-events', 'none');
        this._geomRect(rectSel);
        this._applyStyle(rectSel, { fill: 'none', stroke: 'none', strokeWidth: 1, opacity: 1 });
    }

    /**
     * Non-interactive guide circles (proximity rings / highlights), drawn in
     * front of marks as annotations.
     * @param {any} g
     * @param {any[]} guideCircles
     */
    _drawGuideCircles(g, guideCircles) {
        const circleSel = g.selectAll('circle.guide-circle').data(guideCircles).join('circle')
            .attr('class', 'guide-circle')
            .style('pointer-events', 'none');
        this._geomCircle(circleSel);
        this._applyStyle(circleSel, { fill: 'none', stroke: 'none', strokeWidth: 1, opacity: 1 });
    }

    /**
     * Interactive marks: rects (bars) then circles (dots). Both get the click +
     * drag wiring; only nodes flagged `editable` (their feature has a direct-pick
     * edit) show an interactive cursor — d3.drag/click is inert on the rest.
     * @param {any} g
     * @param {any[]} markRects
     * @param {any[]} markCircles
     * @param {{ drag: any, markClick: (e: any, d: any) => void }} io
     */
    _drawMarks(g, markRects, markCircles, { drag, markClick }) {
        const rectSel = g.selectAll('rect.mark').data(markRects).join('rect')
            .attr('class', 'mark')
            .style('cursor', (/** @type {any} */ d) => d.editable ? 'ns-resize' : 'default')
            .on('click', markClick)
            .call(drag);
        this._geomRect(rectSel);
        this._applyStyle(rectSel, { fill: 'black' });

        const circleSel = g.selectAll('circle.mark').data(markCircles).join('circle')
            .attr('class', 'mark')
            .style('cursor', (/** @type {any} */ d) => d.editable ? 'move' : 'default')
            .on('click', markClick)
            .call(drag);
        this._geomCircle(circleSel);
        this._applyStyle(circleSel, { fill: 'black' });
    }

    /**
     * Foreground lines. Two roles share one draw:
     *   - reference rules / guide boundaries: non-interactive (often
     *     pointerEvents:'none') — drawn as before.
     *   - interactive line marks (ticks): flagged `editable`, so they get the same
     *     click + drag wiring as rect/circle marks. Only editable nodes show an
     *     interactive cursor; d3.drag is inert on the rest.
     * @param {any} g
     * @param {any[]} lines
     * @param {{ drag: any, markClick: (e: any, d: any) => void }} io
     */
    _drawLines(g, lines, { drag, markClick }) {
        const sel = g.selectAll('line.mark').data(lines).join('line')
            .attr('class', 'mark')
            .style('pointer-events', (/** @type {any} */ d) => d.pointerEvents || 'auto')
            .style('cursor', (/** @type {any} */ d) => d.editable ? (d.cursor || 'move') : 'default')
            .on('click', markClick)
            .call(drag);
        this._geomLine(sel);
        this._applyStyle(sel, { stroke: 'black', strokeWidth: 1, opacity: 1 });
    }

    /**
     * Connecting paths for line marks: one `<path>` per node, its `d` built from
     * the node's `points` with the requested `curve` interpolation. Non-interactive
     * (pointer-events off) — the line is edited through its handle dots, not the
     * path itself — and `fill:'none'` by default so a stroked path reads as a line.
     * @param {any} g
     * @param {any[]} paths
     */
    _drawPaths(g, paths) {
        const sel = g.selectAll('path.mark-line').data(paths).join('path')
            .attr('class', 'mark-line')
            .style('pointer-events', (/** @type {any} */ d) => d.pointerEvents || 'none')
            .attr('d', (/** @type {any} */ d) =>
                d3.line().curve(resolveCurve(d.curve))(d.points || []));
        this._applyStyle(sel, { fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 1 });
    }

    /**
     * Foreground text labels (guide annotations).
     * @param {any} g
     * @param {any[]} texts
     */
    _drawLabels(g, texts) {
        const sel = g.selectAll('text.guide-label').data(texts).join('text')
            .attr('class', 'guide-label')
            .style('pointer-events', 'none');
        this._geomText(sel, 'start');
        this._applyStyle(sel, { fill: 'black', opacity: 1 });
    }
}
