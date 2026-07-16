// Area mark — area / areaY / areaX.
export default {
    path: 'marks/area.html',
    title: 'Area',
    lead:
        'A filled path under a series — the distributional sibling of <code class="inline">line</code>. ' +
        'Same grouping / ordering knobs; optional handles so sweep and drag reuse the line edit machinery. ' +
        '<code class="inline">areaY</code> fills to the y baseline; <code class="inline">areaX</code> to the x baseline. ' +
        'Declare an endpoint <b>pair</b> instead (<code class="inline">y1</code> + <code class="inline">y2</code>) and it ' +
        'fills <b>between</b> them rather than down to the baseline — an <b>uncertainty band</b>, editable by both edges.',
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
                { name: 'y1 / y2 · x1 / x2', type: 'linear', desc: 'An endpoint <b>pair</b> on the value axis: fill between the two fields instead of down to the baseline (a confidence band / fan chart). They share the value axis\'s scale, so they resolve exactly like <code class="inline">y</code>, and declaring a pair picks the value axis on its own. Handles appear on <b>both</b> edges. Same span/baseline split <code class="inline">bar</code> and <code class="inline">rect</code> make.' },
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
        {
            id: 'band',
            title: 'Uncertainty band',
            intro:
                'Give the value axis an endpoint <b>pair</b> and the area fills between them — the shape of a ' +
                'confidence interval or a fan chart. Both edges get handles, so the interval is elicited by ' +
                'dragging its ends. Pair it with <code class="inline">ordering</code> so the band cannot be turned ' +
                'inside-out: drag the low edge above the high one and the high edge is carried along, because the ' +
                'edge you grabbed is the one you meant.',
            examples: [
                {
                    title: 'Editable confidence band',
                    blurb: 'areaY with a y1/y2 pair; ordering keeps lo ≤ hi.',
                    try: '<b>Drag</b> either edge — push the low edge past the high one and the band moves rather than inverting.',
                    code:
`mount(Elicit({
  width: 400, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { year: 2025, lo: 20, hi: 45 }, { year: 2026, lo: 25, hi: 60 },
    { year: 2027, lo: 22, hi: 72 }, { year: 2028, lo: 18, hi: 85 },
  ],
  schema: {
    year: { type: "quantitative", domain: [2025, 2028] },
    lo:   { type: "quantitative", domain: [0, 100] },
    hi:   { type: "quantitative", domain: [0, 100] },
  },
  // A dataset invariant: it holds whichever edge you grab.
  constraints: [ ordering({ lower: "lo", upper: "hi" }) ],
  features: [
    areaY({
      fill: "#2563eb", stroke: "#2563eb",
      channels: {
        x:  { field: "year" },
        y1: { field: "lo", edit: drag({ channels: ["y1"] }) },
        y2: { field: "hi", edit: drag({ channels: ["y2"] }) },
      },
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
