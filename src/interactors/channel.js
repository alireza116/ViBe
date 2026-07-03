// @ts-check
// channel.js — editors for a discrete (categorical) channel, e.g. recolouring a
// mark by changing its `color` field.
//
// These are the "select" class of interaction (see the gesture taxonomy): unlike
// position/size, an ordinal channel isn't a spatial invert — you CHOOSE a member
// of `scale.domain()`. Every such editor shares one core, `assignChannel`, and
// differs only in HOW the value (and target datum) is chosen. That shared core is
// what makes the editing layers interchangeable — you can swap one for another in
// a feature's `interactors` array without touching anything else:
//
//   interactors: [ vibe.interactors.cycleChannel({ channel: "color" }) ]   // click-cycle
//   interactors: [ vibe.interactors.legendChannel({ channel: "color" }) ]  // legend picker
//
// Both set encoding[channel].field on the active datum to a domain value; they
// just get that value differently (a click that advances vs. a swatch pick).

import { assignChannel } from '../core/encoding.js';

/**
 * Resolve the field + discrete domain a channel editor operates on, from the
 * interaction context (encoding gives the field, the scale gives the domain).
 * @param {any} context
 * @param {string} channel
 * @returns {{ field: string, domain: any[] } | null}
 */
function channelTarget(context, channel) {
    const field = context.encoding && context.encoding[channel] && context.encoding[channel].field;
    const scale = context.scales && context.scales[channel];
    const domain = scale && scale.domain ? scale.domain() : null;
    if (field == null || !domain || !domain.length) return null;
    return { field, domain };
}

/**
 * cycleChannel — the in-plot reference editor: clicking a mark advances its value
 * to the next member of the channel's domain (wrapping around). No extra UI, so
 * it works anywhere a mark is clickable; best for small domains.
 * @param {any} [options]
 * @returns {any}
 */
export function cycleChannel(options = {}) {
    const { channel = 'color', onChange, constraints = [] } = options;

    return {
        type: 'cycleChannel',
        target: 'mark',
        onChange,
        constraints,
        channel,

        /**
         * @param {any} context
         * @returns {any[] | undefined}
         */
        click: (context) => {
            const { data, nodeIndex } = context;
            if (nodeIndex == null) return undefined;
            const target = channelTarget(context, channel);
            if (!target) return undefined;

            const { field, domain } = target;
            const current = data[nodeIndex][field];
            const i = domain.indexOf(current);
            const next = domain[(i + 1) % domain.length]; // -1 (unset) -> first
            return assignChannel(data, nodeIndex, field, next);
        }
    };
}

/**
 * legendChannel — a legend/swatch picker over the SAME core. The value is chosen
 * by clicking a legend swatch rather than cycling; the target datum is the one
 * currently selected (via a proximity/hover selection in shared ui state).
 *
 * The value-selection here is a plain method (`pick`) so the interface is
 * transport-agnostic: an interactive legend, a menu, or a keyboard shortcut can
 * all drive it. The legend *rendering* (interactive swatches) is a separate
 * concern layered on top — this object is the logic seam it plugs into.
 * @param {any} [options]
 * @returns {any}
 */
export function legendChannel(options = {}) {
    const { channel = 'color', onChange, constraints = [] } = options;

    return {
        type: 'legendChannel',
        target: 'mark',
        onChange,
        constraints,
        channel,

        // Called by the value source (legend swatch / menu) with the chosen
        // domain value and the index of the datum being edited. Returns the
        // proposed dataset, so it flows through constraints like any edit.
        /**
         * @param {any} context
         * @param {any} value
         * @param {number} index
         * @returns {any[] | undefined}
         */
        pick: (context, value, index) => {
            const target = channelTarget(context, channel);
            if (!target) return undefined;
            return assignChannel(context.data, index, target.field, value);
        }
    };
}
