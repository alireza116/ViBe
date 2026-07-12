// Arc / pie / donut — stacked angular slices.
export default {
    path: 'marks/arc.html',
    title: 'Arc · Pie · Donut',
    lead:
        'Data-driven <b>pie</b> and <b>donut</b> slices. Each row’s magnitude (the ' +
        '<code class="inline">angle</code> field) is stacked and normalized to a circle ' +
        '(or partial arc). Shares path math with <code class="inline">axisRadial</code>. ' +
        'Wire <code class="inline">edit: edit.arc.edge()</code> to <b>drag a slice boundary</b> ' +
        'and redistribute the two adjacent shares (the total stays fixed).',
    api: [
        {
            name: 'arc(options) · pie(options) · donut(options)',
            summary: 'Import from <code class="inline">vibe.plot</code>. <code class="inline">pie</code> / <code class="inline">donut</code> are thin wrappers.',
            signatures: [
                'arc({ channels, outerRadius, innerRadius, padAngle, arc, start, end }) → Feature',
                'pie(options) → Feature',
                'donut(options) → Feature',
            ],
            options: [
                { name: 'outerRadius', type: 'number', default: '40% of min(w,h)', desc: 'Outer radius in px.' },
                { name: 'innerRadius', type: 'number', default: '0', desc: 'Inner radius; &gt;0 makes a donut. <code class="inline">donut()</code> defaults this.' },
                { name: 'padAngle', type: 'number', default: '0', desc: 'Gap between slices in degrees.' },
                { name: 'arc / start / end', type: '…', default: "'full'", desc: 'Angular span of the whole pie.' },
                { name: 'edit', type: 'Edit | Edit[]', default: '—', desc: 'Boundary editing — usually <code class="inline">edit.arc.edge()</code>. Draws a grab handle on every boundary (a full circle also gets a seam handle).' },
                { name: 'handles / handleSize', type: 'boolean / number', default: 'true / 5', desc: '<code class="inline">handles: false</code> keeps the edge grabbable but hides the dot.' },
            ],
            channels: [
                { name: 'angle', type: 'magnitude field', desc: 'Slice size in data units; layout normalizes by the sum of rows.' },
                { name: 'fill', type: 'ordinal | const', desc: 'Slice colour.' },
                { name: 'x / y', type: 'linear', desc: 'Optional centre.' },
            ],
            returns: 'A <b>feature</b> emitting one filled <code class="inline">path</code> per row.',
        },
    ],
    sections: [
        {
            id: 'pie',
            title: 'Pie',
            intro: 'Full circle, zero inner radius.',
            examples: [
                {
                    title: 'Party shares',
                    blurb: 'Three slices from a shared total.',
                    code:
`mount(Elicit({
  width: 300, height: 280,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  axes: false,
  data: [
    { party: "D", share: 48 },
    { party: "R", share: 45 },
    { party: "O", share: 7 },
  ],
  schema: {
    party: { type: "categorical" },
    share: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    pie({
      outerRadius: 100,
      channels: {
        angle: { field: "share" },
        fill: { field: "party" },
      },
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'donut',
            title: 'Donut',
            intro: 'Same layout with an inner hole — room for a center label.',
            examples: [
                {
                    title: 'Donut with center text',
                    blurb: 'Static proportions; text is a sibling mark.',
                    code:
`mount(Elicit({
  width: 300, height: 280,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  axes: false,
  data: [
    { party: "D", share: 48, label: "48%" },
    { party: "R", share: 45, label: "" },
    { party: "O", share: 7, label: "" },
  ],
  schema: {
    party: { type: "categorical" },
    share: { type: "quantitative", domain: [0, 100] },
    label: { type: "categorical" },
  },
  features: [
    donut({
      outerRadius: 100, innerRadius: 55,
      channels: {
        angle: { field: "share" },
        fill: { field: "party" },
      },
    }),
    text({
      fontSize: 22,
      channels: {
        text: { value: "100%" },
        textAnchor: { value: "middle" },
        lineAnchor: { value: "middle" },
      },
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'edit',
            title: 'Editable slice boundaries',
            intro:
                'Wire <code class="inline">edit.arc.edge()</code> and <b>every</b> boundary gets a ' +
                'draggable handle — including the seam where the last slice meets the first on a full ' +
                'circle, so <i>n</i> slices give <i>n</i> handles. Dragging a boundary moves value ' +
                'between exactly the two slices it separates: one grows by what the other loses, so the ' +
                'total is preserved.',
            examples: [
                {
                    title: 'Drag any boundary',
                    blurb: 'Each handle pair-shifts its two neighbors; the seam handle links the last and first slice.',
                    try: '<b>Drag</b> a dot on any slice edge (including the seam at 9 o’clock).',
                    code:
`mount(Elicit({
  width: 300, height: 280,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  axes: false,
  data: [
    { party: "D", share: 40 },
    { party: "R", share: 35 },
    { party: "O", share: 25 },
  ],
  schema: {
    party: { type: "categorical" },
    share: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    pie({
      outerRadius: 100,
      edit: edit.arc.edge(),
      channels: {
        angle: { field: "share" },
        fill: { field: "party" },
      },
    }),
  ],
}));`,
                },
                {
                    title: 'Donut, four slices',
                    blurb: 'Four slices → four handles; drag the seam to trade the last and first slice.',
                    try: '<b>Drag</b> any edge — the two adjacent slices rebalance.',
                    code:
`mount(Elicit({
  width: 300, height: 280,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  axes: false,
  data: [
    { cat: "A", v: 20 },
    { cat: "B", v: 20 },
    { cat: "C", v: 20 },
    { cat: "D", v: 40 },
  ],
  schema: {
    cat: { type: "categorical" },
    v: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    donut({
      outerRadius: 100, innerRadius: 50,
      edit: edit.arc.edge(),
      handleSize: 6,
      channels: {
        angle: { field: "v" },
        fill: { field: "cat", scale: { scheme: "tableau10" } },
      },
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
