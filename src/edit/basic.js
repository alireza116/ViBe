// @ts-check
// basic.js — the universal edits: every one applies to any mark with the
// channels it governs. `drag` moves, `resize` scales a magnitude, `cycle`
// advances a discrete channel, `create` mints a datum, `remove` deletes one, and
// `custom` is the escape hatch. Line-scoped authoring edits live in line.js.
//
// An edit is the inverse of encoding: where `encode` maps data -> visual, an
// edit's apply() maps a gesture -> that channel's data, through the SAME scale.

import { makeEdit, markCenter, schemaDefaults } from './shared.js';

/**
 * drag — position edit: invert the pointer coordinate on each positional channel.
 * On x AND y it's a 2D move; on y alone it's a bar drag. Works on any invertible
 * scale (linear pixel, band -> nearest category) via scale.invertValue.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function drag(options = {}) {
    const { channel, channels, ...rest } = options;
    return makeEdit({
        type: 'drag',
        gesture: 'drag',
        channels: channels || (channel ? [channel] : null),
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const next = { ...ctx.datum };
            for (const ch of ctx.channels) {
                const visual = ch.name === 'x' ? ctx.pointer.x
                    : ch.name === 'y' ? ctx.pointer.y : undefined;
                if (visual === undefined || !ch.scale || !ch.scale.invertible) continue;
                next[ch.field] = ch.scale.invertValue(visual);
            }
            return next;
        }
    });
}

/**
 * resize — magnitude edit: the gesture's radius (distance from the mark centre)
 * inverts back to the channel's value, mirroring how the channel encodes value
 * -> radius. Usually placed on `size`.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function resize(options = {}) {
    const { channel, ...rest } = options;
    return makeEdit({
        type: 'resize',
        gesture: 'drag',
        channels: channel ? [channel] : null,
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const ch = ctx.channels[0];
            const c = markCenter(ctx.node);
            if (!ch || !ch.scale || !ch.scale.invertible || !c) return undefined;
            const radius = Math.hypot(ctx.pointer.x - c.cx, ctx.pointer.y - c.cy);
            return { ...ctx.datum, [ch.field]: ch.scale.invertValue(radius) };
        }
    });
}

/**
 * cycle — discrete edit: advance the channel to the next value in its domain.
 * Usually placed on an ordinal `color`. Needs a stable domain (see notes).
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function cycle(options = {}) {
    const { channel, ...rest } = options;
    return makeEdit({
        type: 'cycle',
        gesture: 'click',
        channels: channel ? [channel] : null,
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const ch = ctx.channels[0];
            if (!ch || !ch.scale || !ch.scale.domain || !ctx.datum) return undefined;
            const domain = ch.scale.domain();
            if (!domain.length) return undefined;
            const i = domain.indexOf(ctx.datum[ch.field]);
            return { ...ctx.datum, [ch.field]: domain[(i + 1) % domain.length] };
        }
    });
}

/**
 * create — its own declaration (not a channel edit): a plane gesture that mints a
 * NEW datum. It reuses the exact same scale inverses as `drag` — the clicked
 * pixel is inverted through each positional channel — plus `defaults` for the
 * non-positional fields (group, mag, …). Editing the created mark afterwards
 * routes through the channel edits like any other mark, so create and edit share
 * one bidirectional model. `trigger` picks the plane gesture ('click' default,
 * or 'dblclick' to keep create distinct from a plane drag).
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function create(options = {}) {
    const { channels, defaults = {}, trigger = 'click', ...rest } = options;
    return makeEdit({
        type: 'create',
        gesture: trigger,
        // Default to the positional channels; resolveChannels drops any the
        // feature doesn't encode (so a 1D likert create just omits the missing y).
        channels: channels || ['x', 'y'],
        pick: 'plane',
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            // Seed every declared schema field first (its `default`, else null —
            // present-but-unset, editable later), so a minted datum matches the
            // elicited shape. Explicit create `defaults` then win, and the inverted
            // pointer wins last for the positional channels below.
            const datum = { ...schemaDefaults(ctx.schema), ...defaults };
            let placed = false;
            for (const ch of ctx.channels) {
                const visual = ch.name === 'x' ? ctx.pointer.x
                    : ch.name === 'y' ? ctx.pointer.y : undefined;
                if (visual === undefined || !ch.scale || !ch.scale.invertible) continue;
                datum[ch.field] = ch.scale.invertValue(visual);
                placed = true;
            }
            if (!placed) return undefined; // no positionable channel: nothing to place
            return [...ctx.data, datum];
        }
    });
}

/**
 * remove — deletes the targeted datum. Like every other edit it is just a
 * { gesture, when, pick } descriptor, so it shares the dispatch and arbitration:
 * `when` decides whether it (vs. a sibling edit on the same gesture) claims the
 * event, and `pick` selects the target — 'direct' (the mark clicked) or 'nearest'
 * (the closest mark within threshold, deletable from empty space).
 *
 * Trigger defaults to a plain click. When another click edit already lives on the
 * mark (e.g. `cycle` recolour), pair them with a modifier so they don't both
 * fire: `cycle({ when: when.noAlt })` + `remove({ when: when.alt })` — Alt-click
 * to delete, plain click to recolour.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function remove(options = {}) {
    const { channel, channels, ...rest } = options;
    return makeEdit({
        type: 'remove',
        gesture: options.gesture || 'click',
        channels: channels || (channel ? [channel] : null),
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            if (ctx.index == null) return undefined; // no target resolved
            return ctx.data.filter((_, i) => i !== ctx.index);
        }
    });
}

/**
 * custom — the escape hatch: arbitrary edit over the whole datum + event.
 * @param {(datum: any, event: any, ctx: import('../types').EditContext) => any} fn
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function custom(fn, options = {}) {
    return makeEdit({
        type: 'custom',
        gesture: options.gesture || 'drag',
        channels: options.channels || null,
        ...options,
        apply: (/** @type {import('../types').EditContext} */ ctx) => fn(ctx.datum, ctx.event, ctx)
    });
}
