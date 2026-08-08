// @ts-check
// group.js — a composite glyph with a LOCAL COORDINATE FRAME.
//
// `composite` groups ordinary marks over one dataset, but every part still
// resolves its position through the chart's GLOBAL scales. That is right for an
// error bar (its caps are values on the y axis) and wrong for a glyph whose
// parts are placed relative to the glyph itself — a face's eye is not "at y =
// 0.16 of the data", it is "16% of the way up this face". `group` is that second
// case: it defines a per-datum box and lets a part place itself inside it.
//
//   group({
//     channels: { x: { field: 'gdp' }, y: { field: 'life' }, size: { value: 40 } },
//     parts: [
//       point({   channels: { x: { field: 'gdp' }, y: { field: 'life' } } }),
//       ellipse({ channels: { x: { datum: -0.4, scale: 'frame' },
//                             y: { datum:  0.16, scale: 'frame' },
//                             rx: { field: 'openness',
//                                   scale: { type: 'frame', range: [0.06, 0.19] },
//                                   edit: slide({ axis: 'x', increase: 'right' }) } } }),
//     ],
//   })
//
// ── The frame ───────────────────────────────────────────────────────────────
// The group's own `x` / `y` / `size` channels define, FOR EACH ROW, an origin
// (cx, cy) and a half-size R. A part's channel flagged `scale: 'frame'` is then
// resolved against that box: local +1 on x is cx + R, local +1 on y is cy - R
// (local y is UP), a magnitude of 1 is R. `frameFamilyOf` in core/encoding.js
// owns which channel reads the box which way; `createFrameScale` in
// core/scales.js turns each into a real linear scale.
//
// Real scale is the whole point. A frame channel is not a pixel offset a mark
// computes and an edit has to un-compute with a bespoke track — it is an
// ordinary invertible Scale that happens to be built per datum, so:
//   · a mark encodes through `encodeChannel`, exactly as it always does, and
//   · an edit inverts through the SAME object (each node carries its frame map
//     as `node.frame`, and computeEdit overlays it — see core/elicit.js).
// So `slide` / `move` / `rotate` / `resize` work inside a frame unchanged; there
// is no second inversion path, and "an edit is the inverse of encoding" is true
// per datum rather than approximately.
//
// A local range lives on the channel's ScaleSpec (`scale: { type: 'frame',
// range: [0.06, 0.19] }`), never as a `range` on the channel — and the DOMAIN
// still comes from the schema, like every other channel. `{ datum: -0.4,
// scale: 'frame' }` is a pinned local position: its domain IS the local range,
// so it encodes to that spot in the box for every row.
//
// ── What the group emits ────────────────────────────────────────────────────
// Like `composite`, this is a DESUGARING: it returns plain features and `Elicit`
// flattens them. The engine learns nothing. It returns:
//
//   1. a FRAME ANCHOR — an inert feature (`build: () => []`) carrying the
//      group's x/y/size channels. It draws nothing; it exists so the global
//      resolver sees those fields and builds the axes/scales the frame origin is
//      measured against. Any `edit` on those channels is stripped from the
//      anchor (a feature with no nodes can't be grabbed, and a plane edit
//      declared twice fires twice) — declare it on the part that draws the
//      handle instead, which is what the anchor's dev-warning says.
//   2. the PARTS, each wrapped so its `build` runs once per row with that row's
//      frame scales substituted in. Each part stays its own feature, so
//      direct-pick dispatch keeps a drag on one part off its siblings.
//
// Two consequences of the per-row wrapping, both deliberate:
//   · a part's `build` sees a ONE-ROW dataset, so a derived `{ fn }` channel is
//     called as `(d, 0, [d])` — it can't look across rows. Read the field.
//   · a series (line-family) mark cannot span rows inside a frame, so it is
//     dev-warned rather than silently drawing one-point lines.
//
// Non-frame group channels (fill, opacity, …) trickle into the parts exactly as
// `composite`'s do, inherited edits landing on the last part only.

import { normalizeMarkOptions, encodeChannel, positionalKeys, themeOf } from './mark.js';
import { mergeChannels } from './composite.js';
import { createFrameScale, bandwidthOf, isBand } from '../core/scales.js';
import { frameSpecOf, frameFamilyOf, frameLocalRange, channelRange } from '../core/encoding.js';
import { warn } from '../core/dev.js';

// The group's own channels — the ones that DEFINE the box rather than describe a
// part. They stay off the trickle-down list: inheriting them would place every
// part at the group's anchor, which is the opposite of a local frame.
const FRAME_KEYS = ['x', 'y', 'size'];

/**
 * The frame's default half-size when the group declares no `size`: half a
 * category slot when the glyph sits in one (so a face fills its band, the same
 * rule `arc` uses to fit a slot), else a comfortable share of the plot.
 * @param {import('../types').ScaleMap} scales
 * @param {number} width @param {number} height
 * @returns {number}
 */
function defaultHalfSize(scales, width, height) {
    /** @type {number[]} */
    const slots = [];
    if (isBand(scales.x)) slots.push(bandwidthOf(scales.x, 0));
    if (isBand(scales.y)) slots.push(bandwidthOf(scales.y, 0));
    const slot = slots.filter((s) => s > 0);
    return slot.length ? Math.min(...slot) / 2 : Math.min(width, height) * 0.35;
}

/**
 * The value domain of one frame channel. A `{ field }` channel is in the field's
 * own units, so the SCHEMA owns its domain exactly as it does everywhere else; a
 * `{ datum }` constant is already stated in local units, so the local range IS
 * its domain (making the scale the identity local -> pixel mapping).
 * @param {any} spec the ChannelSpec
 * @param {number[]} localRange
 * @param {Record<string, any>} schema
 * @returns {any[]}
 */
function frameDomain(spec, localRange, schema) {
    if (spec.field == null) return localRange;
    const fieldSpec = schema && schema[spec.field];
    const domain = fieldSpec && fieldSpec.domain;
    if (Array.isArray(domain) && domain.length) return [domain[0], domain[domain.length - 1]];
    warn(
        `frame:domain:${spec.field}`,
        `field "${spec.field}" is encoded on a frame channel inside a group, but the schema ` +
        `declares no domain for it — a frame maps the field's DOMAIN onto the glyph's local ` +
        `box, so without one it falls back to [0, 1]. Declare it: ` +
        `schema: { ${spec.field}: { type: "quantitative", domain: [lo, hi] } }.`
    );
    return [0, 1];
}

/**
 * Build the frame scale map for ONE row: one linear scale per frame-flagged
 * channel of this part, closed over that row's origin and half-size.
 * @param {Record<string, any>} channels the part's channel map
 * @param {string[]} names the frame-flagged channel names
 * @param {{ cx: number, cy: number, r: number }} box
 * @param {Record<string, any>} schema
 * @param {{ width: number, height: number }} dims
 * @param {any} theme
 * @returns {Record<string, any>}
 */
function frameScales(channels, names, box, schema, dims, theme) {
    /** @type {Record<string, any>} */
    const out = {};
    for (const name of names) {
        const spec = channels[name];
        const frameSpec = frameSpecOf(spec) || {};
        const family = frameFamilyOf(name);
        // Where in the box this channel's extremes land. A 'plain' channel (angle,
        // curvature) has no local box — its units are its own — so it falls back to
        // the channel's ordinary default output range.
        const localRange = frameSpec.range
            || frameLocalRange(name)
            || channelRange(name, 'linear', dims, theme);
        const scale = createFrameScale({
            domain: frameDomain(spec, localRange, schema),
            localRange,
            origin: family === 'x' ? box.cx : family === 'y' ? box.cy : 0,
            halfSize: box.r,
            family,
        });
        if (scale) out[name] = scale;
    }
    return out;
}

/**
 * The travel descriptors (`node.dm`) for a part's editable frame channels, so
 * `guide: { track: true }` can draw where a handle may go.
 *
 * Only the POSITIONAL families get one, and only for a channel carrying an edit.
 * The contract is that a track IS the mapping the edit inverts through — so it is
 * drawn for the case where that is exactly true (a positional frame channel: its
 * scale's pixel range is its travel) and left off where it would be a plausible
 * lie (a magnitude or an angle has no straight track, and an edit like `slide`
 * anchors its own).
 * @param {Record<string, any>} channels
 * @param {string[]} names the frame-flagged channel names
 * @param {Record<string, any>} frame the per-datum frame scales
 * @returns {{ x?: any, y?: any } | null}
 */
function frameTracks(channels, names, frame) {
    /** @type {Record<string, any>} */
    const dm = {};
    for (const name of names) {
        const spec = channels[name];
        const scale = frame[name];
        if (!spec || !spec.edit || spec.field == null || !scale) continue;
        const axis = frameFamilyOf(name);
        if (axis !== 'x' && axis !== 'y') continue;
        const domain = scale.domainConfig || [];
        if (domain.length < 2 || dm[axis]) continue;
        const loVal = domain[0];
        const hiVal = domain[domain.length - 1];
        dm[axis] = {
            channel: name,
            field: spec.field,
            pxAt0: scale.encode(loVal),
            pxAt1: scale.encode(hiVal),
            loVal,
            hiVal,
        };
    }
    return Object.keys(dm).length ? dm : null;
}

/**
 * @param {import('../types').GroupOptions} [options]
 * @returns {any[]} the anchor + parts, as features for Elicit's flattened list
 */
export function group(options = {}) {
    const opts = normalizeMarkOptions(options, { mark: 'group', allow: ['parts', 'discreteScale'] });
    const {
        id,
        parts = [],
        constraints,
        edits,
        channels: groupChannels = {},
        // A glyph usually sits in a category slot; 'band' gives each one a centred
        // interval to be sized against. Stamped onto parts that state no preference,
        // exactly as composite does.
        discreteScale = 'band',
    } = opts;

    const name = id || 'group';
    const last = parts.length - 1;

    // ── 1. The frame anchor ────────────────────────────────────────────────
    /** @type {Record<string, any>} */
    const anchorChannels = {};
    for (const key of FRAME_KEYS) {
        const spec = groupChannels[key];
        // A frame-flagged group channel would be circular (the box measured against
        // itself), so it never reaches the anchor.
        if (!spec || frameSpecOf(spec)) continue;
        if (spec.edit) {
            warn(
                `group:anchoredit:${name}:${key}`,
                `group "${name}" puts an edit on its "${key}" channel, which defines the glyph's ` +
                `frame and draws nothing — so there is no node to grab and the edit is dropped. ` +
                `Declare it on the part that draws the handle (e.g. the head mark's ` +
                `${key}: { field: "…", edit: move() }).`
            );
            const { edit: _edit, ...rest } = spec;
            anchorChannels[key] = rest;
            continue;
        }
        anchorChannels[key] = spec;
    }

    const anchor = {
        id: `${name}/frame`,
        markName: 'group',
        channels: anchorChannels,
        // Group-level invariants ride here. Placement is immaterial — the engine
        // promotes every feature's constraints into one dataset-wide set — but
        // attaching them once keeps the set clean before it dedupes.
        constraints,
        discreteScale,
        ...positionalKeys(anchorChannels),
        /** @returns {import('../types').FeatureNode[]} */
        build: () => [],
    };

    // ── 2. The parts ───────────────────────────────────────────────────────
    /** @type {Record<string, any>} */
    const trickle = {};
    for (const [key, spec] of Object.entries(groupChannels)) {
        if (FRAME_KEYS.includes(key)) continue;
        trickle[key] = spec;
    }

    const wrapped = parts.map((/** @type {any} */ part, /** @type {number} */ i) => {
        // Marks close over their factory `channels` object inside build(), so the
        // merge must MUTATE that object rather than replace the property — the same
        // load-bearing detail composite documents.
        const closed = part.channels || (part.channels = {});
        const merged = mergeChannels(trickle, { ...closed }, i === last);
        for (const key of Object.keys(closed)) delete closed[key];
        Object.assign(closed, merged);

        const framed = Object.keys(closed).filter((ch) => frameSpecOf(closed[ch]));

        if (framed.length && part.supportsSeries) {
            warn(
                `group:series:${name}:${i}`,
                `group "${name}" contains a series mark (${part.markName || 'a line-family mark'}) ` +
                `with frame-scaled channels. A frame is per ROW, so the mark is built one row at a ` +
                `time and cannot group rows into a series. Position it on the global scales, or ` +
                `move it out of the group.`
            );
        }

        const inner = part.build;
        const build = !framed.length ? inner : (
            /**
             * @param {any[]} currentData
             * @param {import('../types').ScaleMap} scales
             * @param {number} width @param {number} height
             * @returns {import('../types').FeatureNode[]}
             */
            (currentData, scales, width, height) => {
                const schema = /** @type {any} */ (scales).schema || {};
                const theme = themeOf(scales);
                const dims = { width, height };
                const fallbackR = defaultHalfSize(scales, width, height);
                /** @type {import('../types').FeatureNode[]} */
                const out = [];
                for (let index = 0; index < currentData.length; index++) {
                    const d = currentData[index];
                    const box = {
                        cx: encodeChannel(scales, groupChannels, 'x', d, width / 2, index, currentData),
                        cy: encodeChannel(scales, groupChannels, 'y', d, height / 2, index, currentData),
                        r: encodeChannel(scales, groupChannels, 'size', d, fallbackR, index, currentData),
                    };
                    const frame = frameScales(closed, framed, box, schema, dims, theme);
                    const tracks = frameTracks(closed, framed, frame);
                    const nodes = inner([d], { ...scales, ...frame }, width, height) || [];
                    for (const node of nodes) {
                        // The inner build saw a one-row dataset, so its index is 0.
                        node.index = index;
                        node.data = d;
                        // The scales this node was encoded through, so an edit on it
                        // inverts through the same objects (core/elicit.js).
                        node.frame = frame;
                        if (tracks && node.dm == null) node.dm = tracks;
                        out.push(node);
                    }
                }
                return out;
            }
        );

        return {
            ...part,
            channels: closed,
            build,
            // Inherited channels may arrive after the factory stamped xKey/yKey from
            // its own (then-empty) map — refresh from the merge.
            xKey: (closed.x && closed.x.field) || part.xKey,
            yKey: (closed.y && closed.y.field) || part.yKey,
            // Deterministic, stable ids: the engine keys scene nodes and driver
            // sessions by feature id.
            id: part.id || `${name}/${i}`,
            discreteScale: part.discreteScale || discreteScale,
            // Group-level edits land on the LAST part, the same rule composite uses
            // for an inherited channel edit: one dataset, so a whole-dataset edit
            // declared on every part would fire once per part.
            edits: i === last && edits ? [...edits, ...(part.edits || [])] : part.edits,
        };
    });

    return [anchor, ...wrapped];
}
