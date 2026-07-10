// Guides — non-interactive annotations that track live data.
export default {
    path: 'guides.html',
    title: 'Guides',
    lead:
        'Guides are non-interactive annotations, rebuilt every render so they track the live ' +
        'data. <code class="inline">guides.rule</code> draws a reference line at a data value, ' +
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
            ],
            options: [
                { name: 'rule.x / y', type: 'any', default: '—', desc: 'The value to draw the reference line at (a number or a category).' },
                { name: 'rule.label', type: 'string', default: '—', desc: 'Optional text label near the line.' },
                { name: 'rule.stroke / strokeDasharray', type: 'style', default: "#64748b / '5 4'", desc: 'Line colour and dash pattern.' },
                { name: 'region.x / y', type: '[a, b]', default: '—', desc: 'The two values to shade between on that axis.' },
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
  features: [
    point({
      fill: "#0d9488",
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 100] },
        size: { value: 9 },
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
            title: 'Guides follow the data',
            intro:
                'Because guides rebuild each render, a rule pinned to a data value stays correct as ' +
                'edits change the dataset — here the even-split line under a maintainSum total.',
            examples: [
                {
                    title: 'A rule under a live total',
                    blurb: 'The bars keep a total of 100; the rule marks the even split as they move.',
                    try: '<b>Drag</b> any bar — the others compensate, the rule holds.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  guides: [ guides.rule({ y: 25, label: "even split (25)" }) ],
  data: ["A", "B", "C", "D"].map((c) => ({ x: c, y: 25 })),
  features: [
    bar({
      fill: "#6366f1",
      encoding: {
        x: { field: "x", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "y", type: "linear", domain: [0, 100], edit: drag({ guide: true }) },
      },
      constraints: [
        clamp({ field: "y", min: 0 }),
        maintainSum({ field: "y", targetSum: 100 }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
