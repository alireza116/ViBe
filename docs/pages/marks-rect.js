// Rect mark — rect / rectX / rectY.
export default {
    path: 'marks/rect.html',
    title: 'Rect',
    lead:
        'The generalized <b>bar</b>: each axis independently resolves its extent as a ' +
        '<b>span</b> (x1/x2, y1/y2), a categorical <b>band</b>, or a baseline→value ' +
        'length — so a rectangle can span BOTH axes at once (Observable Plot’s rect: ' +
        'heatmap cells, 2-D regions, binned histograms, annotation boxes). ' +
        '<code class="inline">rect</code> spans both axes; <code class="inline">rectX</code> / ' +
        '<code class="inline">rectY</code> force one axis to a baseline→value length. ' +
        'Prefer <code class="inline">bar</code> when one axis is a category band and the other ' +
        'a value (classic elicitation bars); use <code class="inline">rect</code> when both ' +
        'axes are spans/bands, and pair it with <code class="inline">brushRect()</code> for ' +
        'edge/corner/body editing.',
    api: [
        {
            name: 'rect(options) · rectX(options) · rectY(options)',
            summary:
                'Import from <code class="inline">vibe.plot</code>. <code class="inline">rect</code> ' +
                'spans both axes; <code class="inline">rectX</code> forces value on x (y a span/band), ' +
                '<code class="inline">rectY</code> forces value on y. All three share these options.',
            signatures: [
                'rect({ channels, edits, constraints, id }) → Feature',
                'rectX(options) → Feature   // value on x',
                'rectY(options) → Feature   // value on y',
            ],
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'Channel map — spans (x1/x2, y1/y2), bands, or single x/y values per axis. See <b>Channels</b>.' },
                { name: 'edits', type: 'Edit[]', default: '—', desc: 'Mark-level edits; per-channel edits live in <code class="inline">channels[ch].edit</code>. Use <code class="inline">brushRect</code> for 2-D edge/corner/body editing.' },
                { name: 'constraints', type: 'Constraint[]', default: '—', desc: 'Data invariants, promoted to the dataset.' },
                { name: 'fill, stroke, …', type: 'style', default: "fill: 'steelblue'", desc: 'Style shorthands / channels (the shared style surface).' },
            ],
            channels: [
                { name: 'x1 / x2', type: 'linear', desc: 'Horizontal span endpoints. Share x’s resolved scale.' },
                { name: 'y1 / y2', type: 'linear', desc: 'Vertical span endpoints. Share y’s resolved scale.' },
                { name: 'x / y', type: 'band | linear', desc: 'A single value (baseline→value) or a band, when that axis isn’t a span.' },
                { name: 'fill, stroke, strokeWidth, opacity', type: 'const | field', desc: 'Standard style surface; a field tints through the ordinal palette.' },
            ],
            returns: 'A <b>feature</b> emitting one <code class="inline">rect</code> per datum.',
        },
    ],
    sections: [
        {
            id: 'basics',
            title: 'A 2-D rectangle (both axes are spans)',
            intro: 'Give both axes explicit endpoints and each datum draws a rectangle spanning x1→x2 and y1→y2.',
            examples: [
                {
                    title: 'Region boxes',
                    blurb: 'x1/x2 and y1/y2 place each rect; fill by a field.',
                    code:
`mount(Elicit({
  width: 360, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { x1: 1, x2: 4, y1: 1, y2: 3, kind: "a" },
    { x1: 5, x2: 8, y1: 4, y2: 7, kind: "b" },
    { x1: 3, x2: 6, y1: 6, y2: 9, kind: "a" },
  ],
  schema: {
    x1: { type: "quantitative", domain: [0, 10] },
    x2: { type: "quantitative", domain: [0, 10] },
    y1: { type: "quantitative", domain: [0, 10] },
    y2: { type: "quantitative", domain: [0, 10] },
    kind: { type: "categorical", domain: ["a", "b"] },
  },
  features: [
    rect({
      fillOpacity: 0.6,
      channels: {
        x1: { field: "x1" }, x2: { field: "x2" },
        y1: { field: "y1" }, y2: { field: "y2" },
        fill: { field: "kind" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'histogram',
            title: 'Binned histogram (rectY)',
            intro:
                'A histogram is a vertical rect whose <b>x</b> is a quantitative bin span ' +
                '(x1/x2) and whose <b>y</b> is a count from the baseline — that is exactly ' +
                '<code class="inline">rectY</code>. Data must already be binned (one row per ' +
                'bin); there is no binning transform. Prefer <code class="inline">barY</code> ' +
                'when bins are categorical labels instead of numeric edges.',
            examples: [
                {
                    title: 'Pre-binned counts',
                    blurb: 'x1/x2 place each bin on a shared quantitative x; y is the count.',
                    code:
`mount(Elicit({
  width: 400, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { x1: 0, x2: 2, n: 4 },
    { x1: 2, x2: 4, n: 12 },
    { x1: 4, x2: 6, n: 18 },
    { x1: 6, x2: 8, n: 9 },
    { x1: 8, x2: 10, n: 3 },
  ],
  schema: {
    x1: { type: "quantitative", domain: [0, 10] },
    x2: { type: "quantitative", domain: [0, 10] },
    n:  { type: "quantitative", domain: [0, 24] },
  },
  features: [
    rectY({
      fill: "#2563eb", fillOpacity: 0.75, stroke: "#1e40af",
      channels: {
        x1: { field: "x1" },
        x2: { field: "x2" },
        y:  { field: "n" },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Editable bin heights',
                    blurb: 'Drag on y to reshape the belief distribution; clamp keeps counts ≥ 0.',
                    try: '<b>Drag</b> a bin’s top edge to change its count.',
                    code:
`mount(Elicit({
  width: 400, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { x1: 0, x2: 2, n: 4 },
    { x1: 2, x2: 4, n: 12 },
    { x1: 4, x2: 6, n: 18 },
    { x1: 6, x2: 8, n: 9 },
    { x1: 8, x2: 10, n: 3 },
  ],
  schema: {
    x1: { type: "quantitative", domain: [0, 10] },
    x2: { type: "quantitative", domain: [0, 10] },
    n:  { type: "quantitative", domain: [0, 24] },
  },
  constraints: [clamp({ min: 0, max: 24, field: "n" })],
  features: [
    rectY({
      fill: "#0d9488", fillOpacity: 0.75, stroke: "#0f766e",
      channels: {
        x1: { field: "x1" },
        x2: { field: "x2" },
        y:  { field: "n", edit: drag({ guide: true }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'editing',
            title: 'Composable 2-D editing (brushRect)',
            intro:
                'brushRect() edits all four extents. It is OPT-IN and composable: grab an EDGE to ' +
                'resize one side, a CORNER to resize two extents, the BODY to move the whole rect. ' +
                '<code class="inline">resize</code> (\'both\' | \'x\' | \'y\' | \'none\') picks which axes resize; ' +
                '<code class="inline">move</code> (bool) toggles body-drag — so you can ship resize-one-axis, ' +
                'move-only, or resize-only.',
            examples: [
                {
                    title: 'Full 2-D: edges, corners, body',
                    blurb: 'Default brushRect(): every direction live.',
                    try: '<b>Drag</b> an edge to resize a side, a corner to resize two extents, or the body to move.',
                    code:
`mount(Elicit({
  width: 360, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [ { x1: 2, x2: 6, y1: 2, y2: 6 } ],
  schema: {
    x1: { type: "quantitative", domain: [0, 10] },
    x2: { type: "quantitative", domain: [0, 10] },
    y1: { type: "quantitative", domain: [0, 10] },
    y2: { type: "quantitative", domain: [0, 10] },
  },
  features: [
    rect({
      fill: "#2563eb", fillOpacity: 0.5, stroke: "#2563eb",
      channels: {
        x1: { field: "x1" }, x2: { field: "x2" },
        y1: { field: "y1" }, y2: { field: "y2" },
      },
      edits: [ brushRect({ edgeInset: 12 }) ],
    }),
  ],
}))`,
                },
                {
                    title: 'Resize x only',
                    blurb: 'brushRect({ resize: "x" }) — only the vertical edges resize; body still moves.',
                    try: '<b>Drag</b> a left/right edge to resize width; the body to move.',
                    code:
`mount(Elicit({
  width: 360, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [ { x1: 2, x2: 6, y1: 2, y2: 6 } ],
  schema: {
    x1: { type: "quantitative", domain: [0, 10] },
    x2: { type: "quantitative", domain: [0, 10] },
    y1: { type: "quantitative", domain: [0, 10] },
    y2: { type: "quantitative", domain: [0, 10] },
  },
  features: [
    rect({
      fill: "#0d9488", fillOpacity: 0.5, stroke: "#0d9488",
      channels: {
        x1: { field: "x1" }, x2: { field: "x2" },
        y1: { field: "y1" }, y2: { field: "y2" },
      },
      edits: [ brushRect({ resize: "x", edgeInset: 12 }) ],
    }),
  ],
}))`,
                },
                {
                    title: 'Move only',
                    blurb: 'brushRect({ resize: "none" }) — no edges grab; the whole rect translates.',
                    try: '<b>Drag</b> anywhere in the rect to move it (edges do nothing).',
                    code:
`mount(Elicit({
  width: 360, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [ { x1: 3, x2: 7, y1: 3, y2: 7 } ],
  schema: {
    x1: { type: "quantitative", domain: [0, 10] },
    x2: { type: "quantitative", domain: [0, 10] },
    y1: { type: "quantitative", domain: [0, 10] },
    y2: { type: "quantitative", domain: [0, 10] },
  },
  features: [
    rect({
      fill: "#7b2d8b", fillOpacity: 0.5, stroke: "#7b2d8b",
      channels: {
        x1: { field: "x1" }, x2: { field: "x2" },
        y1: { field: "y1" }, y2: { field: "y2" },
      },
      edits: [ brushRect({ resize: "none" }) ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
