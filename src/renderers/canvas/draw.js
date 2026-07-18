// @ts-check
// Painting: typed FeatureNodes -> canvas 2D calls. The mirror image of the D3
// renderer's semantic draws — same node types, same z-order, same per-draw style
// defaults — but emitting `ctx.fill()`/`ctx.stroke()` instead of SVG attributes.
// No interaction here; this module is a pure function of (context, nodes).
import * as d3 from 'd3';
import { markCenter } from '../../edit/shared.js';
import { STYLE_FIELDS, resolveCurve } from '../shared.js';

// SVG text-anchor -> canvas textAlign. `middle` is the only rename.
/** @type {Record<string, CanvasTextAlign>} */
const ALIGN = { start: 'start', middle: 'center', end: 'end', left: 'left', right: 'right', center: 'center' };
// SVG dominant-baseline -> canvas textBaseline. Unset falls back to alphabetic
// (SVG's default), matching how axis tick labels render.
/** @type {Record<string, CanvasTextBaseline>} */
const BASELINE = {
    middle: 'middle', central: 'middle', hanging: 'hanging',
    'text-before-edge': 'top', 'text-after-edge': 'bottom',
    alphabetic: 'alphabetic', ideographic: 'ideographic'
};

/**
 * Resolve a node's style channels against per-draw defaults, exactly like the D3
 * renderer's `_applyStyle`: per-node value wins, else the caller's default, else the
 * shared base (null).
 * @param {any} node
 * @param {Record<string, any>} defaults
 * @returns {Record<string, any>}
 */
function styleOf(node, defaults) {
    /** @type {Record<string, any>} */
    const s = {};
    for (const { field, base } of STYLE_FIELDS) {
        const def = field in defaults ? defaults[field] : base;
        s[field] = node[field] != null ? node[field] : def;
    }
    return s;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} dash strokeDasharray as a string ("4 4" / "4,4"), array, or null
 */
function setDash(ctx, dash) {
    if (dash == null || dash === 'none') { ctx.setLineDash([]); return; }
    if (Array.isArray(dash)) { ctx.setLineDash(dash); return; }
    ctx.setLineDash(String(dash).split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n)));
}

/**
 * Fill then stroke a path (SVG paints fill under stroke). `opacity` composites both;
 * `fillOpacity`/`strokeOpacity` scale each pass — approximated with globalAlpha,
 * which is close enough to the SVG semantics for every mark in this library.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Record<string, any>} s resolved style
 * @param {Path2D} [path] optional Path2D (else the ctx's current path)
 */
function paint(ctx, s, path) {
    const op = s.opacity != null ? s.opacity : 1;
    if (s.fill && s.fill !== 'none') {
        ctx.globalAlpha = op * (s.fillOpacity != null ? s.fillOpacity : 1);
        ctx.fillStyle = s.fill;
        path ? ctx.fill(path) : ctx.fill();
    }
    if (s.stroke && s.stroke !== 'none') {
        ctx.globalAlpha = op * (s.strokeOpacity != null ? s.strokeOpacity : 1);
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = s.strokeWidth != null ? s.strokeWidth : 1;
        setDash(ctx, s.strokeDasharray);
        path ? ctx.stroke(path) : ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
}

/**
 * Run `draw` with the node's `angle` (math degrees, 0°=+x CCW) applied about its
 * centre. SVG uses rotate(-deg); the canvas equivalent is a negative rotation about
 * the same pivot (markCenter), so both renderers agree on where a rotated mark lands.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} node
 * @param {() => void} draw
 */
function withAngle(ctx, node, draw) {
    if (node.angle != null && node.angle !== 0) {
        const c = markCenter(node);
        if (c) {
            ctx.save();
            ctx.translate(c.cx, c.cy);
            ctx.rotate((-node.angle * Math.PI) / 180);
            ctx.translate(-c.cx, -c.cy);
            draw();
            ctx.restore();
            return;
        }
    }
    draw();
}

/** @param {CanvasRenderingContext2D} ctx @param {any} node @param {Record<string,any>} defaults */
function circle(ctx, node, defaults) {
    withAngle(ctx, node, () => {
        const r = Math.max(0, node.r != null ? node.r : 5);
        ctx.beginPath();
        ctx.arc(node.cx, node.cy, r, 0, 2 * Math.PI);
        paint(ctx, styleOf(node, defaults));
    });
}

/** @param {CanvasRenderingContext2D} ctx @param {any} node @param {Record<string,any>} defaults */
function rect(ctx, node, defaults) {
    withAngle(ctx, node, () => {
        ctx.beginPath();
        ctx.rect(node.x, node.y, node.width, Math.max(0, node.height));
        paint(ctx, styleOf(node, defaults));
    });
}

/** @param {CanvasRenderingContext2D} ctx @param {any} node @param {Record<string,any>} defaults */
function line(ctx, node, defaults) {
    withAngle(ctx, node, () => {
        ctx.beginPath();
        ctx.moveTo(node.x1, node.y1);
        ctx.lineTo(node.x2, node.y2);
        paint(ctx, styleOf(node, defaults));
    });
}

/** @param {CanvasRenderingContext2D} ctx @param {any} node @param {Record<string,any>} defaults */
function path(ctx, node, defaults) {
    let p;
    if (node.d) {
        p = new Path2D(node.d);
    } else {
        // d3 shape generators accept any object with the canvas path methods; Path2D
        // qualifies, so the SAME curve factory that SVG feeds `d3.line()` draws here.
        p = new Path2D();
        d3.line().curve(resolveCurve(node.curve)).context(/** @type {any} */(p))(node.points || []);
    }
    paint(ctx, styleOf(node, defaults), p);
}

/**
 * @param {CanvasRenderingContext2D} ctx @param {any} node
 * @param {Record<string,any>} defaults @param {string} anchorDefault
 */
function text(ctx, node, defaults, anchorDefault) {
    if (node.text == null) return;
    withAngle(ctx, node, () => {
        const s = styleOf(node, defaults);
        ctx.font = `${node.fontSize != null ? node.fontSize : 10}px sans-serif`;
        ctx.textAlign = ALIGN[node.textAnchor || anchorDefault] || 'start';
        ctx.textBaseline = BASELINE[node.dominantBaseline] || 'alphabetic';
        const op = s.opacity != null ? s.opacity : 1;
        if (s.fill && s.fill !== 'none') {
            ctx.globalAlpha = op * (s.fillOpacity != null ? s.fillOpacity : 1);
            ctx.fillStyle = s.fill;
            ctx.fillText(String(node.text), node.x, node.y);
        }
        if (s.stroke && s.stroke !== 'none') {
            ctx.globalAlpha = op * (s.strokeOpacity != null ? s.strokeOpacity : 1);
            ctx.strokeStyle = s.stroke;
            ctx.lineWidth = s.strokeWidth != null ? s.strokeWidth : 1;
            ctx.strokeText(String(node.text), node.x, node.y);
        }
        ctx.globalAlpha = 1;
    });
}

/**
 * Draw a background raster tile. Images load asynchronously, so a cache miss kicks
 * off a load and repaints on arrival (via `requestRepaint`); until then the tile is
 * simply absent, exactly as an <image> with an unfetched href would be.
 * @param {CanvasRenderingContext2D} ctx @param {any} node
 * @param {Map<string, any>} cache @param {() => void} requestRepaint
 */
function image(ctx, node, cache, requestRepaint) {
    if (!node.href) return;
    let entry = cache.get(node.href);
    if (!entry) {
        const img = new Image();
        entry = { img, ready: false };
        img.onload = () => { entry.ready = true; requestRepaint(); };
        img.src = node.href;
        cache.set(node.href, entry);
    }
    if (!entry.ready) return;
    withAngle(ctx, node, () => {
        const prev = ctx.globalAlpha;
        if (node.opacity != null) ctx.globalAlpha = node.opacity;
        ctx.drawImage(entry.img, node.x, node.y, node.width, node.height);
        ctx.globalAlpha = prev;
    });
}

/**
 * Paint the whole scene in z-order — the exact partition-and-order of the D3
 * renderer's `render` (background → guide regions → paths → mark rects → mark
 * circles → guide circles → foreground lines → text marks → labels). Draw order IS
 * z-order on a canvas (last wins), so this ordering is load-bearing.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any[]} children scene nodes
 * @param {{ images: Map<string, any>, requestRepaint: () => void }} io
 */
export function paintScene(ctx, children, io) {
    const nodes = children || [];
    /** @param {string} t */
    const byType = (t) => nodes.filter((n) => n.type === t);
    const rects = byType('rect');
    const circles = byType('circle');
    const lines = byType('line');
    const paths = byType('path');
    const texts = byType('text');
    const images = byType('image');

    // Background: tiles (floor), then background lines (gridlines), then bg labels.
    images.forEach((n) => image(ctx, n, io.images, io.requestRepaint));
    lines.filter((n) => n.background).forEach((n) => line(ctx, n, { stroke: '#6b7280', strokeWidth: 1, opacity: 1 }));
    texts.filter((n) => n.background).forEach((n) => text(ctx, n, { fill: '#374151', opacity: 1 }, 'middle'));

    // Guide regions (shaded bands) behind the marks.
    rects.filter((n) => n.guide).forEach((n) => rect(ctx, n, { fill: 'none', stroke: 'none', strokeWidth: 1, opacity: 1 }));

    // Connecting paths sit above guide regions but below the handle dots.
    paths.forEach((n) => path(ctx, n, { fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 1 }));

    // Interactive marks: rects (bars) then circles (dots).
    rects.filter((n) => !n.guide).forEach((n) => rect(ctx, n, { fill: 'black' }));
    circles.filter((n) => !n.guide).forEach((n) => circle(ctx, n, { fill: 'black' }));

    // Guide circles (proximity rings) in front of marks.
    circles.filter((n) => n.guide).forEach((n) => circle(ctx, n, { fill: 'none', stroke: 'none', strokeWidth: 1, opacity: 1 }));

    // Foreground lines (rules / ticks).
    lines.filter((n) => !n.background).forEach((n) => line(ctx, n, { stroke: 'black', strokeWidth: 1, opacity: 1 }));

    // Foreground text: editable text marks (centre-anchored) then inert labels.
    const fg = texts.filter((n) => !n.background);
    fg.filter((n) => n.editable).forEach((n) => text(ctx, n, { fill: 'black', opacity: 1 }, 'middle'));
    fg.filter((n) => !n.editable).forEach((n) => text(ctx, n, { fill: 'black', opacity: 1 }, 'start'));
}
