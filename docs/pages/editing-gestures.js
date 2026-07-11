// Drag · Resize · Cycle · Custom — the gesture primitives.
export default {
    path: 'editing/gestures.html',
    title: 'Drag · Resize · Cycle · Custom',
    lead:
        'Different channels take different gestures. <code class="inline">drag</code> moves a ' +
        'position, <code class="inline">resize</code> inverts a radius into a magnitude, ' +
        '<code class="inline">cycle</code> clicks through a category, and ' +
        '<code class="inline">custom</code> is the escape hatch for anything else. Several ' +
        'edits can share one mark, separated by <code class="inline">when</code>.',
    api: [
        {
            name: 'drag(options)',
            summary: 'Position edit — inverts the pointer on each positional channel. On x+y a 2D move; on y alone a bar drag.',
            signature: 'drag({ channel, channels, pick, threshold, when, guide, constrain }) → Edit',
            options: [
                { name: 'channel', type: 'string', default: 'injected', desc: 'A single channel to govern (co-located edits inject their own).' },
                { name: 'channels', type: 'string[]', default: '—', desc: 'Multiple channels for a joint move (e.g. <code class="inline">["x","y"]</code>).' },
                { name: 'pick', type: "'direct'|'nearest'|'sweep'", default: "'direct'", desc: 'Target selection; <code class="inline">nearest</code> grabs from anywhere within <code class="inline">threshold</code>.' },
                { name: 'guide', type: 'boolean', default: '—', desc: 'Draw the constraint bounds + snap ring while dragging.' },
                { name: 'when, threshold, constrain', type: '—', default: '—', desc: 'Shared Edit fields (see the Editing overview).' },
            ],
            returns: 'An <b>Edit</b>. <code class="inline">apply</code> returns the datum with each governed field rewritten from the pointer.',
        },
        {
            name: 'resize(options)',
            summary: 'Magnitude edit — the gesture radius from the mark centre inverts back to the channel value.',
            signature: 'resize({ channel }) → Edit',
            options: [
                { name: 'channel', type: 'string', default: 'injected', desc: 'The magnitude channel, usually <code class="inline">size</code>. Its scale must be invertible.' },
            ],
            returns: 'An <b>Edit</b> returning the datum with the channel field set from the pointer radius.',
        },
        {
            name: 'cycle(options)',
            summary: 'Discrete edit — a click advances the channel to the next value in its domain. Needs a stable ordinal domain.',
            signature: 'cycle({ channel }) → Edit',
            options: [
                { name: 'channel', type: 'string', default: 'injected', desc: 'The ordinal channel to advance (usually <code class="inline">color</code>/<code class="inline">fill</code>).' },
            ],
            returns: 'An <b>Edit</b> (gesture <code class="inline">click</code>) returning the datum with the field stepped to the next domain entry.',
        },
        {
            name: 'custom(fn, options)',
            summary:
                'The escape hatch — an arbitrary edit. <code class="inline">fn</code> is the body of ' +
                '<code class="inline">apply</code>; the descriptor still declares which gesture fires it.',
            signature: 'custom((datum, event, ctx) => datum | data[] | undefined, options?) → Edit',
            options: [
                { name: 'fn', type: '(datum, event, ctx) => …', default: '—', desc: '<code class="inline">datum</code> is <code class="inline">ctx.datum</code>, <code class="inline">event</code> is the raw DOM event (<code class="inline">ctx.event</code>), <code class="inline">ctx</code> is the full <b>EditContext</b> (see Editing overview). Return a new datum, a full dataset, or <code class="inline">undefined</code> to no-op — whatever fields you put on the datum become data.' },
                { name: 'options.gesture', type: "'drag'|'click'|…", default: "'drag'", desc: 'Which gesture runs this edit. The engine matches <code class="inline">event.type</code> to this; <code class="inline">fn</code> itself does not choose the gesture.' },
                { name: 'options.pick, when, …', type: '—', default: '—', desc: 'Any shared Edit fields (see the Editing overview).' },
            ],
            returns:
                'An <b>Edit</b>. Default <code class="inline">gesture: "drag"</code>, <code class="inline">pick: "direct"</code>. ' +
                'Full <code class="inline">ctx</code> field list lives on the Editing overview under <b>EditContext</b>.',
        },
    ],
    sections: [
        {
            id: 'resize',
            title: 'Resize a magnitude',
            intro:
                'size: { edit: resize() } — the drag radius from the dot centre inverts to the ' +
                'value, mirroring how size encodes it. The stroke survives the resize.',
            examples: [
                {
                    title: 'Drag outward to grow',
                    blurb: 'resize() maps the gesture radius back to the size field.',
                    try: '<b>Drag</b> a dot outward or inward to grow/shrink it.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: 25, y: 50, mag: 3 }, { x: 55, y: 50, mag: 7 }, { x: 82, y: 50, mag: 11 },
  ],
  schema: {
    x:   { type: "quantitative", domain: [0, 100] },
    y:   { type: "quantitative", domain: [0, 100] },
    mag: { domain: [0, 14] },
  },
  features: [
    point({
      fill: "#ede9fe", stroke: "#7c3aed", strokeWidth: 2,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
        size: { field: "mag", edit: resize() },
      },
      constraints: [ clamp({ field: "mag", min: 1, max: 14 }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'multi',
            title: 'One mark, three gestures',
            intro:
                'Move, resize, and recolour on a single mark — separated by when. Plain drag ' +
                'moves, Shift-drag resizes, click cycles the category.',
            examples: [
                {
                    title: 'Move · Shift-resize · click-cycle',
                    blurb: 'when.noShift / when.shift split the drag; cycle() advances the fill category.',
                    try: '<b>Drag</b> to move · <b><kbd>Shift</kbd>+drag</b> to resize · <b>Click</b> to recolour.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: 24, y: 70, mag: 5, team: "A" },
    { x: 55, y: 34, mag: 9, team: "B" },
    { x: 80, y: 60, mag: 12, team: "C" },
  ],
  schema: {
    x:    { type: "quantitative", domain: [0, 100] },
    y:    { type: "quantitative", domain: [0, 100] },
    mag:  { domain: [0, 14] },
    team: { domain: ["A", "B", "C"] },
  },
  features: [
    point({
      channels: {
        x: { field: "x" },
        y: { field: "y" },
        size: { field: "mag" },
        fill: { field: "team", edit: cycle() },
      },
      edits: [
        drag({ channels: ["x", "y"], when: when.noShift }),  // plain drag = move
        resize({ channel: "size", when: when.shift }),        // shift-drag = resize
      ],
      constraints: [ clamp({ field: "mag", min: 1, max: 14 }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'custom',
            title: 'Custom — the escape hatch',
            intro:
                'custom(fn) wraps fn as apply. The edit still declares its gesture (default drag) — ' +
                'the engine only calls fn when that gesture fires. fn receives (datum, event, ctx): ' +
                'datum is the touched row, event the raw DOM event, ctx the EditContext (pointer, ' +
                'scales, data, … — see the Editing overview). Return a new datum (or array); every ' +
                'field you set is written into the belief store.',
            examples: [
                {
                    title: 'Invert y yourself',
                    blurb:
                        'gesture defaults to drag. ctx.pointer is plot pixels; scales.y.invertValue ' +
                        'maps them back to data. touched: true is just another field on the returned ' +
                        'datum — it shows up in getData() because you put it there.',
                    try: '<b>Drag</b> a dot — y follows the pointer; the data panel gains <code class="inline">touched: true</code>.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [{ x: 30, y: 30 }, { x: 70, y: 70 }],
  schema: {
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      fill: "#2563eb",
      size: 8,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
      edits: [
        // default gesture: "drag" — pass { gesture: "click" } to change it
        custom((datum, event, ctx) => ({
          ...datum,
          y: ctx.scales.y.invertValue(ctx.pointer.y),
          touched: true, // becomes data; omit if you only want to rewrite y
        })),
      ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
