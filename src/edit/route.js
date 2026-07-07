// @ts-check
// route.js — how the engine finds and prepares a feature's edits.
//
// Edits are declared in two places: co-located on a channel (encoding[ch].edit,
// the common single-channel case) or at mark level (feature.edits, for joint /
// arbitrary edits). collectEdits unifies them into one list, injecting the
// placement channel for co-located edits so every edit knows the channel names
// it governs.
//
// resolveChannels then turns those names into { name, field, scale } using the
// feature's encoding (name -> field) and the global scales (name -> scale) — the
// context an edit's apply() needs. Because the field comes from the channel the
// edit is attached to, there is no implicit valueKey to inherit (the P1 fix,
// now structural).

/**
 * @param {any} feature
 * @returns {import('../types').Edit[]}
 */
export function collectEdits(feature) {
    /** @type {import('../types').Edit[]} */
    const edits = [];
    const enc = feature.encoding || {};
    for (const [name, chSpec] of Object.entries(enc)) {
        if (chSpec && chSpec.edit) {
            const e = chSpec.edit;
            // Inject the placement channel when the edit didn't name its own.
            edits.push(e.channels ? e : { ...e, channels: [name] });
        }
    }
    for (const e of (feature.edits || [])) edits.push(e);
    return edits;
}

/**
 * @param {string[] | null} names
 * @param {any} encoding
 * @param {import('../types').ScaleMap} scales
 * @returns {import('../types').ResolvedChannel[]}
 */
export function resolveChannels(names, encoding, scales) {
    return (names || []).map((name) => ({
        name,
        field: encoding[name] && encoding[name].field,
        scale: scales[name] || undefined
    }));
}

