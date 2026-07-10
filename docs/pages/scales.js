// Scales & encoding — types, domains, palettes.
export default {
    path: 'scales.html',
    title: 'Scales & encoding',
    lead:
        'A scale turns a data value into a visual one. The type is inferred from the data or ' +
        'declared per channel: <code class="inline">linear</code> / <code class="inline">time</code> ' +
        '(continuous), <code class="inline">band</code> / <code class="inline">point</code> ' +
        '(categorical position), <code class="inline">ordinal</code> (category → palette), ' +
        '<code class="inline">sequential</code> (number → colour ramp). Every scale is invertible, ' +
        'which is what makes editing possible.',
    api: [
        {
            name: 'Channel spec',
            summary:
                'Each entry in a mark’s <code class="inline">encoding</code> is one channel. A channel is a ' +
                'constant, a scaled field, or a raw field — plus an optional co-located <code class="inline">edit</code>.',
            options: [
                { name: 'field', type: 'string', default: '—', desc: 'The data field to read and map through the channel’s scale.' },
                { name: 'value', type: 'any', default: '—', desc: 'A constant instead of a field (e.g. <code class="inline">fill: { value: "red" }</code>).' },
                { name: 'type', type: 'ScaleType', default: 'inferred', desc: 'Force the scale type; otherwise inferred from the data. See <b>Scale types</b>.' },
                { name: 'domain', type: 'any[]', default: 'from data', desc: 'The input extent / category list.' },
                { name: 'range', type: 'any[]', default: 'from geometry', desc: 'The output extent (pixels, colours). Positional ranges default to the plot size.' },
                { name: 'scale', type: 'null', default: '—', desc: '<code class="inline">scale: null</code> passes the field through unscaled (a literal colour / pixel).' },
                { name: 'edit', type: 'Edit', default: '—', desc: 'Co-locate an edit so a gesture writes this channel back through the same scale.' },
            ],
            channels: [
                { name: 'linear / time', type: 'continuous', desc: 'Number/date → pixel. Invertible for dragging.' },
                { name: 'band / point', type: 'categorical', desc: 'Category → position (band = interval with width; point = a tick).' },
                { name: 'ordinal', type: 'categorical', desc: 'Category → palette entry (cycles through colours).' },
                { name: 'sequential', type: 'continuous', desc: 'Number → colour ramp.' },
            ],
            returns:
                'The engine resolves <b>one global scale per channel</b> (unioning across marks, and across ' +
                '<code class="inline">x/x1/x2</code> and <code class="inline">y/y1/y2</code>), exposed to <code class="inline">build</code> as <code class="inline">scales.x</code>, <code class="inline">scales.y</code>, ….',
        },
    ],
    sections: [
        {
            id: 'continuous',
            title: 'Continuous → colour & size',
            intro:
                'A numeric field through a sequential scale becomes a colour ramp; through the ' +
                'size channel it becomes a radius. Both read the same field here.',
            examples: [
                {
                    title: 'Sequential ramp + size',
                    blurb: 'fill: { field } → ramp, size: { field } → radius, from one numeric field.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 34 },
  data: [
    { h: 150, weight: 48 }, { h: 160, weight: 57 }, { h: 170, weight: 66 },
    { h: 180, weight: 78 }, { h: 190, weight: 92 }, { h: 165, weight: 61 },
  ],
  features: [
    point({
      stroke: "#334155", strokeWidth: 1,
      encoding: {
        x: { field: "h", type: "linear", domain: [140, 200] },
        y: { field: "weight", type: "linear", domain: [40, 100] },
        fill: { field: "weight" },   // number -> sequential ramp
        size: { field: "weight" },   // number -> radius
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'categorical',
            title: 'Categorical → ordinal palette',
            intro: 'A categorical field on a colour channel resolves through the ordinal palette — one hue per category.',
            examples: [
                {
                    title: 'Ordinal palette',
                    blurb: 'fill: { field: "kind" } assigns palette colours across the category domain.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { cat: "A", n: 34, kind: "low" },  { cat: "B", n: 58, kind: "high" },
    { cat: "C", n: 22, kind: "low" },  { cat: "D", n: 47, kind: "high" },
  ],
  features: [
    bar({
      encoding: {
        x: { field: "cat", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "n", type: "linear", domain: [0, 60] },
        fill: { field: "kind" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'categorical-position',
            title: 'Categorical position → point scale',
            intro:
                'When a positional channel is categorical, it resolves to a point scale — the mark ' +
                'sits on the category’s tick. Two categorical axes make a discrete grid.',
            examples: [
                {
                    title: 'A band × band grid',
                    blurb: 'Both positions are categories, so each dot lands on a (x, y) cell.',
                    code:
`mount(Elicit({
  width: 360, height: 300,
  data: [
    { x: "A", y: "Low", group: "alpha" },
    { x: "B", y: "Mid", group: "beta" },
    { x: "C", y: "High", group: "gamma" },
  ],
  features: [
    point({
      encoding: {
        x: { field: "x", domain: ["A", "B", "C"] },
        y: { field: "y", domain: ["Low", "Mid", "High"] },
        size: { value: 12 },
        color: { field: "group", type: "ordinal",
                 domain: ["alpha", "beta", "gamma"] },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
