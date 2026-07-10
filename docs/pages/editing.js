// Editing overview — the inverse of encoding.
export default {
    path: 'editing/index.html',
    title: 'Editing — the inverse of encoding',
    lead:
        'Attach an edit to a channel and a gesture writes that channel back to the data through ' +
        'the same scale. An edit is a small descriptor — <code class="inline">gesture</code> ' +
        '(drag / click / dblclick), <code class="inline">pick</code> (direct / nearest / plane), ' +
        '<code class="inline">when</code> (arbitration), <code class="inline">constrain</code>, ' +
        'and <code class="inline">guide</code>. Place it on a channel ' +
        '(<code class="inline">channels.y.edit</code>) or at mark level ' +
        '(<code class="inline">edits: [...]</code>).',
    api: [
        {
            name: 'The Edit descriptor',
            summary:
                'Every edit factory (<code class="inline">vibe.edit.*</code>) returns this shape. ' +
                '<code class="inline">apply(ctx)</code> is pure: given the context it returns a datum ' +
                '(direct edit), a full array (whole-dataset edit), or <code class="inline">undefined</code> (no-op).',
            options: [
                { name: 'gesture', type: "'drag'|'click'|'dblclick'", default: "'drag'", desc: 'The raw gesture that triggers the edit.' },
                { name: 'channels', type: 'string[] | null', default: 'null', desc: 'Channel names it governs; <code class="inline">null</code> injects the channel it was placed on.' },
                { name: 'when', type: '(ctx) => boolean', default: 'null', desc: 'Arbitration — whether this edit claims the gesture (e.g. only on Shift). See <code class="inline">vibe.when</code>.' },
                { name: 'pick', type: "'direct'|'nearest'|'plane'|driver", default: "'direct'", desc: 'How the gesture selects its target. <code class="inline">nearest</code>/<code class="inline">sweep</code>/<code class="inline">draw</code>/<code class="inline">brush</code> route through drivers.' },
                { name: 'threshold', type: 'number', default: '0', desc: 'Proximity radius (px) for <code class="inline">nearest</code>-style picks.' },
                { name: 'scope', type: "null | 'line'", default: 'null', desc: 'Universal, or line-scoped (needs a series-grouping mark).' },
                { name: 'constrain', type: 'Constraint[]', default: '[]', desc: 'Per-edit constraint sugar; the canonical home is the spec’s <code class="inline">constraints</code> (the dataset’s invariants).' },
                { name: 'guide', type: 'boolean', default: 'null', desc: 'Self-draw this edit’s guide (constraint bounds + snap ring).' },
                { name: 'apply', type: '(ctx) => datum | data[] | undefined', default: '—', desc: 'The edit itself — maps the gesture to data through the same scale.' },
            ],
            returns:
                'The <code class="inline">ctx</code> passed to <code class="inline">apply</code>/<code class="inline">when</code> carries ' +
                '<code class="inline">{ datum, index, data, pointer, event, node, channels, scales, markChannels }</code>.',
        },
        {
            name: 'Edit catalogue',
            summary:
                'Universal edits import bare (<code class="inline">vibe.edit.drag</code>); line-scoped ones ' +
                'live under <code class="inline">vibe.edit.line.*</code> so their scope shows in the name.',
            options: [
                { name: 'drag', type: 'drag', default: 'gestures', desc: 'Move — invert the pointer on each positional channel.' },
                { name: 'resize', type: 'drag', default: 'gestures', desc: 'Magnitude — the radius from the mark centre inverts to a value (usually <code class="inline">size</code>).' },
                { name: 'cycle', type: 'click', default: 'gestures', desc: 'Advance a discrete channel to its next domain value.' },
                { name: 'custom', type: 'drag', default: 'gestures', desc: 'Escape hatch — an arbitrary <code class="inline">(datum, event, ctx) => …</code>.' },
                { name: 'dragSpan / brushSpan', type: 'drag', default: 'bar', desc: 'Move / resize a two-endpoint span (x1·x2 or y1·y2).' },
                { name: 'create / remove', type: 'click', default: 'existence', desc: 'Mint a datum from the pointer / delete the target.' },
                { name: 'line.anchor / newSeries / draw / sweep / removeSeries', type: 'line', default: 'existence · sweep', desc: 'Author and reshape connected paths.' },
            ],
            returns: 'See the <b>Gestures</b>, <b>Sweep</b> and <b>Existence</b> pages for each factory’s own options.',
        },
    ],
    sections: [
        {
            id: 'drag',
            title: 'Drag a value',
            intro:
                'The canonical edit: drag() inverts the pointer on each positional channel it ' +
                'governs. On a bar’s y, a drag rewrites the value.',
            examples: [
                {
                    title: 'Drag a value (bars)',
                    blurb: 'y carries edit: drag(). The gesture → data path mirrors the data → height encoding.',
                    try: '<b>Drag</b> a bar up or down.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: "A", y: 20 }, { x: "B", y: 45 },
    { x: "C", y: 30 }, { x: "D", y: 60 },
  ],
  schema: {
    x: { type: "categorical", domain: ["A", "B", "C", "D"] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    bar({
      fill: "#4f46e5",
      channels: {
        x: { field: "x" },
        y: { field: "y", edit: drag() },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'pick',
            title: 'Pick — how an edit finds its target',
            intro:
                'pick: "direct" uses the mark under the pointer; pick: "nearest" grabs the closest ' +
                'mark within a pixel threshold, so small marks are reachable from nearby empty ' +
                'space. guide: true self-draws the snap ring.',
            examples: [
                {
                    title: 'Nearest pick from empty space',
                    blurb: 'A 2D nearest drag: move near a dot to select it, drag from empty space to grab the closest.',
                    try: '<b>Drag</b> from anywhere near a dot to grab it.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [{ x: 25, y: 35 }, { x: 55, y: 68 }, { x: 78, y: 30 }],
  schema: {
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      fill: "#ffffff", stroke: "#334155", strokeWidth: 2,
      size: 10,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
      edits: [ drag({ channels: ["x", "y"], pick: "nearest", threshold: 45, guide: true }) ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
