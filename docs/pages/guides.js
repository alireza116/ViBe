// Guides — non-interactive annotations that track live data.
export default {
    path: 'guides.html',
    title: 'Guides',
    lead:
        'A guide is a graphical mark that isn’t bound to a row the way a plot mark is: it draws an ' +
        'annotation. But it is still allowed to <b>depend on the data</b> — every guide option may ' +
        'be a literal <i>or</i> a function of the guide context ' +
        '(<code class="inline">{ data, scales, features, ui, width, height, stage }</code>), so a ' +
        'mean line is one line of spec. Guides rebuild every render and never capture a gesture. ' +
        '<code class="inline">guides.rule</code> draws a reference line at a data value, ' +
        '<code class="inline">guides.region</code> shades a band between two values, and ' +
        '<code class="inline">guides.proximity</code> visualizes what a nearest-pick edit has ' +
        'selected. (An edit’s own constraint bounds draw automatically via ' +
        '<code class="inline">guide: true</code>.)',
    api: [
        {
            name: 'guides.rule · guides.region · guides.proximity',
            summary:
                'Import from <code class="inline">vibe.guides</code> and pass in the chart’s ' +
                '<code class="inline">guides: [...]</code>. All position in <b>data space</b> through the same ' +
                '<code class="inline">scale.encode()</code> a mark uses, so they compose across scale types. Non-interactive.',
            signatures: [
                'guides.rule({ x?, y?, stroke, strokeDasharray, label }) → Guide',
                'guides.region({ x?, y?, fill, opacity }) → Guide',
                'guides.proximity({ target, color }) → Guide',
                'guides.custom((ctx) => FeatureNode[]) → Guide',
                '',
                '// any option may be a function of the guide context:',
                'guides.rule({ y: ({ data }) => d3.mean(data, (d) => d.y), label: "mean" })',
            ],
            options: [
                { name: 'rule.x / y', type: 'any | (ctx) => any', default: '—', desc: 'The value to draw the reference line at (a number, a category, or a function of the data).' },
                { name: 'rule.label', type: 'string | (ctx) => string', default: '—', desc: 'Optional text label near the line.' },
                { name: 'rule.stroke / strokeDasharray', type: 'style', default: "#64748b / '5 4'", desc: 'Line colour and dash pattern.' },
                { name: 'region.x / y', type: '[a, b] | (ctx) => [a, b]', default: '—', desc: 'The two values to shade between on that axis.' },
                { name: 'region.fill / opacity', type: 'style', default: '#64748b / 0.1', desc: 'Band fill and opacity.' },
                { name: 'proximity.target', type: 'string', default: '—', desc: 'The feature id whose nearest-pick selection to visualize (ring + highlight).' },
                { name: 'proximity.color', type: 'string', default: 'effect', desc: 'Override the highlight colour (else the effects layer’s).' },
            ],
            returns:
                'Each returns a <b>Guide</b> (<code class="inline">{ isGuide: true, build(ctx) }</code>), rebuilt every render so it tracks live data.',
        },
    ],
    sections: [
        {
            id: 'annotations',
            title: 'Rule & region',
            intro:
                'A shaded target band (region) and a reference line (rule) annotate a chart. They ' +
                'sit under the marks and follow the same scales, so they stay put as points move.',
            examples: [
                {
                    title: 'A target band with a rule',
                    blurb: 'guides.region shades 40–60; guides.rule marks the midpoint. Drag the dots across them.',
                    try: '<b>Drag</b> a dot in and out of the target band.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  guides: [
    guides.region({ y: [40, 60], fill: "#0d9488", opacity: 0.14 }),
    guides.rule({ y: 50, label: "target 50" }),
  ],
  data: [{ x: 20, y: 30 }, { x: 50, y: 55 }, { x: 80, y: 70 }],
  schema: {
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      fill: "#0d9488",
      size: 9,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
      edits: [ drag({ channels: ["x", "y"] }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'live',
            title: 'Guides derived from the data',
            intro:
                'A guide option can be a function of the guide context, so an annotation can be ' +
                'computed from the rows it annotates. Here one rule is a fixed target and the other ' +
                'is the running <b>mean</b> — recomputed on every commit, because guides rebuild each ' +
                'render. The band tracks the spread the same way.',
            examples: [
                {
                    title: 'A mean line that chases the bars',
                    blurb: 'guides.rule({ y: ({ data }) => d3.mean(data, (d) => d.y) }) — the annotation reads the dataset.',
                    try: '<b>Drag</b> a bar — the fixed target holds, the mean line and the band follow.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  guides: [
    // A literal: a fixed reference.
    guides.rule({ y: 50, label: "target 50" }),
    // A function of the context: recomputed from the live rows every render.
    guides.region({
      y: ({ data }) => [d3.min(data, (d) => d.y), d3.max(data, (d) => d.y)],
      fill: "#6366f1", opacity: 0.10,
    }),
    guides.rule({
      y: ({ data }) => d3.mean(data, (d) => d.y),
      label: "mean",
      stroke: "#e4572e",
    }),
  ],
  schema: {
    x: { type: "categorical",  domain: ["A", "B", "C", "D"] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  data: [
    { x: "A", y: 30 }, { x: "B", y: 55 },
    { x: "C", y: 45 }, { x: "D", y: 70 },
  ],
  constraints: [ clamp({ field: "y", min: 0, max: 100 }) ],
  features: [
    bar({
      fill: "#6366f1",
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
    ],
};
