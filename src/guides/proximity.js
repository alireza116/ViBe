// @ts-check
// guides.proximity: highlights the current proximity selection produced by a
// proximityDrag interactor. It reads the transient interaction state (ui) and
// draws:
//   - a dashed "threshold" ring around the pointer (the snap radius), and
//   - a bright highlight around the currently-snapped mark (a ring for circles,
//     an outline for bars). If nothing is within threshold, only the ring shows.
//
// Added automatically when a proximityDrag has `highlight: true`, or declared
// explicitly: vibe.guides.proximity({ target: "my-feature" }).
//
// This is the legacy standalone form of the `select` interaction effect; it now
// delegates to the shared builder so it looks identical to the edit-owned guide
// and honours the same customizable effects layer (ctx.effects.select). An
// explicit `color` option still overrides, for backward compatibility.
import { selectEffectNodes } from '../edit/guide.js';
import { DEFAULT_EFFECTS } from '../core/effects.js';

/**
 * @param {{ target: string, color?: string }} options
 * @returns {any}
 */
export function proximity(options) {
    const { target, color } = options;

    return {
        isGuide: true,
        /**
         * @param {any} ctx
         * @returns {import('../types').FeatureNode[]}
         */
        build: (ctx) => {
            const info = ctx.ui && ctx.ui.proximity && ctx.ui.proximity[target];
            if (!info) return [];
            const base = (ctx.effects && ctx.effects.select) || DEFAULT_EFFECTS.select;
            // An explicit guide `color` option wins over the effect's colour.
            const select = color != null ? { ...base, color } : base;
            const marks = (ctx.featureNodes && ctx.featureNodes[target]) || [];
            return selectEffectNodes(info, marks, select);
        }
    };
}
