// resize.js — edit a magnitude channel (default `size`) by dragging radially
// from the mark's centre.
//
// This is the "spatial-invert" editor for a non-positional channel: the gesture
// produces a visual value the same way position does, just with a different
// geometry. Where a move reads the pointer coordinate, a resize reads the
// DISTANCE from the mark centre to the pointer (a radius), then inverts it back
// to data through the channel's scale — exactly mirroring how the size channel
// encodes data -> radius. So it reuses the whole channel machinery: any
// invertible channel whose scale outputs a radius can be resized this way.
//
//   vibe.interactors.resize({ channel: "size" })
//
// To let resize coexist with a move drag on the same mark, arbitrate the gesture
// OUTSIDE the interaction with gate() — e.g. gate(resize(), modifierHeld('shift'))
// for plain-drag = move, Shift-drag = resize. The interaction stays unaware.

// Centre of a scene node: circles carry cx/cy; rects carry x/y/width/height.
function markCenter(node) {
    if (!node) return null;
    if (node.cx != null) return { cx: node.cx, cy: node.cy };
    if (node.x != null && node.width != null) {
        return { cx: node.x + node.width / 2, cy: node.y + node.height / 2 };
    }
    return null;
}

export function resize(options = {}) {
    const { channel = 'size', onChange, constraints = [] } = options;

    return {
        type: 'resize',
        target: 'mark',
        onChange,
        constraints,
        channel,

        drag: (context) => {
            const { data, nodeIndex, node, x, y, encoding, scales } = context;
            if (nodeIndex == null) return undefined;

            const field = encoding && encoding[channel] && encoding[channel].field;
            const scale = scales[channel];
            const center = markCenter(node);
            // Need a field, an invertible scale (radius -> data), and a centre.
            if (field == null || !scale || !scale.invertible || !center) return undefined;

            // Visual value for this gesture = radius from the centre; invert it
            // back to data (clamped into the channel's domain).
            const radius = Math.hypot(x - center.cx, y - center.cy);
            const value = scale.invertValue(radius);

            // Constraints will bound `value` too (they treat the resized field as
            // the active value when valueKey is set).
            context.valueKey = field;
            context.valueScale = scale;
            return data.map((d, i) => (i === nodeIndex ? { ...d, [field]: value } : d));
        }
    };
}
