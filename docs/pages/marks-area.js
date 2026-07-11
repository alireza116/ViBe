// Area mark — area / areaY / areaX.
export default {
    path: 'marks/area.html',
    title: 'Area',
    lead:
        'A filled path under a series — the distributional sibling of <code class="inline">line</code>. ' +
        'Same grouping / ordering knobs; optional handles so sweep and drag reuse the line edit machinery. ' +
        '<code class="inline">areaY</code> fills to the y baseline; <code class="inline">areaX</code> to the x baseline.',
    api: [
        {
            name: 'area(options) · areaY(options) · areaX(options)',
            summary: 'Import from <code class="inline">vibe.plot</code>.',
            signatures: [
                'area({ channels, series, order, curve, handles, edits, … }) → Feature',
                'areaY(options) → Feature',
                'areaX(options) → Feature',
            ],
            channels: [
                { name: 'x / y', type: 'linear | point', desc: 'Domain and value axes (same as line).' },
                { name: 'fill / stroke', type: 'const | field', desc: 'Area fill (default fillOpacity 0.35) and outline.' },
            ],
            returns: 'A feature emitting one filled path per series plus optional handle circles.',
        },
    ],
    sections: [
        {
            id: 'basics',
            title: 'Filled series',
            intro: 'Drag handles to reshape the belief curve.',
            examples: [
                {
                    title: 'Editable area',
                    blurb: 'areaY with drag on y handles.',
                    try: '<b>Drag</b> a handle to reshape the area.',
                    code:
`mount(Elicit({
  width: 400, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { t: 1, n: 20 }, { t: 2, n: 45 }, { t: 3, n: 35 },
    { t: 4, n: 60 }, { t: 5, n: 50 },
  ],
  schema: {
    t: { type: "quantitative", domain: [1, 5] },
    n: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    areaY({
      fill: "#2563eb", stroke: "#2563eb",
      channels: {
        x: { field: "t" },
        y: { field: "n", edit: drag() },
      },
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
