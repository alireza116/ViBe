// @ts-check
// route.js — how the engine finds and prepares a feature's edits.
//
// Edits are declared in two places: co-located on a channel (channels[ch].edit,
// the common single-channel case) or at mark level (feature.edits, for joint /
// arbitrary edits). collectEdits unifies them into one list, injecting the
// placement channel for co-located edits so every edit knows the channel names
// it governs.
//
// resolveChannels then turns those names into { name, field, scale } using the
// feature's channels (name -> field) and the global scales (name -> scale) — the
// context an edit's apply() needs. Because the field comes from the channel the
// edit is attached to, there is no implicit valueKey to inherit (the P1 fix,
// now structural).

/**
 * Looks like an Edit descriptor (gesture + apply) rather than a ChannelSpec.
 * Used by the DEV misplaced-edit guard — authors sometimes put `edit: drag()` as
 * a sibling channel key instead of on a channel or in `feature.edits`.
 * @param {any} v
 * @returns {boolean}
 */
function looksLikeEdit(v) {
    return !!(v && typeof v === 'object' && typeof v.apply === 'function' && v.gesture);
}

/**
 * @param {any} feature
 * @returns {import('../types').Edit[]}
 */
export function collectEdits(feature) {
    /** @type {import('../types').Edit[]} */
    const edits = [];
    const channels = feature.channels || {};
    for (const [name, chSpec] of Object.entries(channels)) {
        if (chSpec && chSpec.edit) {
            const e = chSpec.edit;
            // Inject the placement channel when the edit didn't name its own.
            edits.push(e.channels ? e : { ...e, channels: [name] });
        }
    }
    for (const e of (feature.edits || [])) edits.push(e);
    return edits;
}

/** @type {Set<string>} */
const warnedMisplaced = new Set();

/**
 * DEV guard: warn when a channel map looks like it misplaced an edit (a key named
 * `edit`, or a channel value that is itself an Edit descriptor). Those never reach
 * collectEdits, so the mark stays pointer-transparent and "drag does nothing".
 * @param {any} feature
 */
export function warnMisplacedEdits(feature) {
    const channels = feature.channels || {};
    const fid = feature.id || '?';
    for (const [name, chSpec] of Object.entries(channels)) {
        const key = `${fid}:${name}`;
        if (warnedMisplaced.has(key)) continue;
        if (name === 'edit' || looksLikeEdit(chSpec)) {
            warnedMisplaced.add(key);
            console.warn(
                `[vibe] feature "${fid}" has a misplaced edit under channels.${name}. ` +
                `Attach edits on a channel (y: { field, edit: drag() }) or at mark level ` +
                `(edits: [drag({ channels: ['x','y'] })]). A bare channels.edit key is ignored.`
            );
        }
    }
}

/**
 * @param {string[] | null} names
 * @param {any} markChannels
 * @param {import('../types').ScaleMap} scales
 * @returns {import('../types').ResolvedChannel[]}
 */
export function resolveChannels(names, markChannels, scales) {
    return (names || []).map((name) => ({
        name,
        field: markChannels[name] && markChannels[name].field,
        scale: scales[name] || undefined
    }));
}

