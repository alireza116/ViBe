// Bar mark — bar / barY / barX.
export default {
    path: 'marks/bar.html',
    title: 'Bar',
    lead:
        'A rectangular mark: one axis is a categorical <b>band</b> (the position), the other ' +
        'a linear <b>value</b> drawn as length from a baseline (or an explicit start/end span ' +
        'via x1/x2 or y1/y2). <code class="inline">bar</code> auto-detects orientation from ' +
        'which axis is a band; <code class="inline">barY</code> forces vertical, ' +
        '<code class="inline">barX</code> horizontal. For rectangles that span <b>both</b> axes ' +
        '(heatmap cells, 2-D regions), use <code class="inline">rect</code> + ' +
        '<code class="inline">brushRect()</code> instead.',
    api: [
        {
            name: 'bar(options) · barY(options) · barX(options)',
            summary:
                'Import from <code class="inline">vibe.plot</code>. <code class="inline">bar</code> ' +
                'infers orientation from which axis is a band; <code class="inline">barY</code> forces ' +
                'vertical, <code class="inline">barX</code> horizontal. All three share these options.',
            signatures: [
                'bar({ channels, orientation, edits, constraints, id }) → Feature',
                'barY(options) → Feature   // orientation: "vertical"',
                'barX(options) → Feature   // orientation: "horizontal"',
            ],
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'Channel map — one band axis (category) and one linear axis (value or a span). See <b>Channels</b>.' },
                { name: 'orientation', type: "'vertical' | 'horizontal'", default: 'auto', desc: 'Override the inferred direction (bar only; barY/barX pin it).' },
                { name: 'stack', type: 'true | string', default: '—', desc: 'Stack bars that share a category. <code class="inline">true</code> uses the fill/series field; a string names the series field. Declare a schema domain covering the stacked total.' },
                { name: 'edits', type: 'Edit[]', default: '—', desc: 'Mark-level edits; per-channel edits live in <code class="inline">channels[ch].edit</code>.' },
                { name: 'constraints', type: 'Constraint[]', default: '—', desc: 'Data invariants. Sugar — promoted to the dataset, so they hold for every edit from every mark (e.g. <code class="inline">maintainSum</code>).' },
                { name: 'fill, stroke, …', type: 'style', default: "fill: 'steelblue'", desc: 'Style shorthands / channels (see the style surface on any mark).' },
            ],
            channels: [
                { name: 'x', type: 'band | linear', desc: 'Category (band) or value (linear), depending on orientation.' },
                { name: 'y', type: 'band | linear', desc: 'The other axis. The value axis carries <code class="inline">edit: drag()</code> to make bars draggable.' },
                { name: 'y1 / y2', type: 'linear', desc: 'Explicit vertical span (barY) — draw between two values instead of from the baseline.' },
                { name: 'x1 / x2', type: 'linear', desc: 'Explicit horizontal span (barX) — a Gantt-style range per category.' },
                { name: 'fill, stroke, strokeWidth, opacity', type: 'const | field', desc: 'Standard style surface; a field tints through the ordinal palette.' },
            ],
            returns: 'A <b>feature</b> emitting one <code class="inline">rect</code> per datum, styled through the standard surface.',
        },
    ],
    sections: [
        {
            id: 'basics',
            title: 'Band × value',
            intro: 'The band axis slots the bars; the linear axis sets their length from a baseline.',
            examples: [
                {
                    title: 'A vertical bar chart',
                    blurb: 'x band of categories, y linear value.',
                    code:
`mount(Elicit({
  width: 380, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { cat: "A", n: 30 }, { cat: "B", n: 55 },
    { cat: "C", n: 22 }, { cat: "D", n: 44 },
  ],
  schema: {
    cat: { type: "categorical", domain: ["A", "B", "C", "D"] },
    n:   { type: "quantitative", domain: [0, 60] },
  },
  features: [
    bar({
      fill: "#4f46e5",
      channels: {
        x: { field: "cat" },
        y: { field: "n" },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Colour by a field',
                    blurb: 'fill: { field: "kind" } tints each bar through the ordinal palette.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { cat: "A", n: 34, kind: "low" },  { cat: "B", n: 58, kind: "high" },
    { cat: "C", n: 22, kind: "low" },  { cat: "D", n: 47, kind: "high" },
  ],
  schema: {
    cat:  { type: "categorical", domain: ["A", "B", "C", "D"] },
    n:    { type: "quantitative", domain: [0, 60] },
    kind: { type: "categorical", domain: ["low", "high"] },
  },
  features: [
    bar({
      channels: {
        x: { field: "cat" },
        y: { field: "n" },
        fill: { field: "kind" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'orientation',
            title: 'Horizontal bars (barX)',
            intro:
                'Put the band on y and the value on x and the bars run horizontally. barX forces ' +
                'this orientation; bar would infer it from the band axis.',
            examples: [
                {
                    title: 'barX — value on x',
                    blurb: 'y is the category band, x the linear value drawn rightward from the baseline.',
                    code:
`mount(Elicit({
  width: 380, height: 240,
  margins: { top: 14, right: 16, bottom: 26, left: 60 },
  data: [
    { region: "North", sales: 42 }, { region: "South", sales: 68 },
    { region: "East", sales: 30 },  { region: "West", sales: 54 },
  ],
  schema: {
    region: { type: "categorical", domain: ["North", "South", "East", "West"] },
    sales:  { type: "quantitative", domain: [0, 80] },
  },
  features: [
    barX({
      fill: "#0d9488",
      channels: {
        y: { field: "region" },
        x: { field: "sales" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'span',
            title: 'Explicit spans (x1/x2, y1/y2)',
            intro:
                'Instead of one value drawn from the baseline, give the value axis two explicit ' +
                'endpoints — x1/x2 for barX, y1/y2 for barY — for a span that doesn’t start at ' +
                'zero (a Gantt-style range per category). x1/x2 share the same resolved scale as x ' +
                '(likewise y1/y2 with y), so only one needs an explicit type/domain.',
            examples: [
                {
                    title: 'Years active per person',
                    blurb: 'barX with x1/x2 spans; y is the category band.',
                    code:
`mount(Elicit({
  width: 380, height: 220,
  margins: { top: 14, right: 16, bottom: 26, left: 60 },
  data: [
    { person: "Ada",   start: 1830, end: 1852 },
    { person: "Grace", start: 1930, end: 1992 },
    { person: "Alan",  start: 1931, end: 1954 },
  ],
  schema: {
    person: { type: "categorical", domain: ["Ada", "Grace", "Alan"] },
    start:  { type: "quantitative", domain: [1820, 2000] },
    end:    { type: "quantitative", domain: [1840, 2000] },
  },
  features: [
    barX({
      fill: "#7b2d8b",
      channels: {
        y: { field: "person" },
        x1: { field: "start" },
        x2: { field: "end" },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Brush: edges + body together',
                    blurb:
                        'brushSpan() combines both: grab near an edge to resize just that end, ' +
                        'grab the body to move the whole span. Drag an edge past the other and ' +
                        'release — the fields re-sort (start stays ≤ end) with no visual jump.',
                    try: '<b>Drag</b> an edge to resize it, the body to move the whole bar, ' +
                        'or drag one edge past the other to see it flip.',
                    code:
`mount(Elicit({
  width: 380, height: 220,
  margins: { top: 14, right: 16, bottom: 26, left: 60 },
  data: [
    { person: "Ada",   start: 1830, end: 1852 },
    { person: "Grace", start: 1930, end: 1992 },
    { person: "Alan",  start: 1931, end: 1954 },
  ],
  schema: {
    person: { type: "categorical", domain: ["Ada", "Grace", "Alan"] },
    start:  { type: "quantitative", domain: [1820, 2000] },
    end:    { type: "quantitative", domain: [1840, 2000] },
  },
  features: [
    barX({
      fill: "#2563eb",
      channels: {
        y: { field: "person" },
        x1: { field: "start" },
        x2: { field: "end" },
      },
      edits: [
        brushSpan({ channels: ["x1", "x2"], threshold: 40,
                    edgeInset: 10, guide: true }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'editing',
            title: 'Editing bars',
            intro:
                'Put edit: drag() on the value channel and a bar drags to rewrite its value. ' +
                'Thin bars are easier to grab with pick: "nearest" — grab from anywhere in the column.',
            examples: [
                {
                    title: 'Drag a value',
                    blurb: 'y carries edit: drag(). Dragging writes y back through the same scale.',
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
                {
                    title: 'Nearest pick + self-drawn guide',
                    blurb: 'pick: "nearest" grabs a bar from anywhere in its column; guide: true draws the snap ring.',
                    try: '<b>Drag</b> from anywhere in a column to grab that bar.',
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
      fill: "#2563eb",
      channels: {
        x: { field: "x" },
        y: { field: "y",
             edit: drag({ pick: "nearest", threshold: 40, guide: true }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
