// Axis, Grid & Rule — reference marks + the global axes:{} convenience.
export default {
    path: 'marks/axes.html',
    title: 'Axis, Grid & Rule',
    lead:
        'Axes and gridlines are composable marks. Configure them the easy way through the ' +
        'global <code class="inline">axes: {…}</code> convenience (ticks, formats, titles, ' +
        'hiding, free positioning), or add <code class="inline">axisX</code> / ' +
        '<code class="inline">axisY</code> / <code class="inline">gridY</code> / ' +
        '<code class="inline">ruleY</code> as explicit features for full control.',
    api: [
        {
            name: 'axis · axisX · axisY',
            summary:
                'A spine, ticks, labels and an optional title for one channel’s scale. Import from ' +
                '<code class="inline">vibe.plot</code>, or configure implicitly via the global ' +
                '<code class="inline">axes:{…}</code> on <code class="inline">Elicit</code> (which desugars into these).',
            signature: 'axisX({ ticks, tickFormat, title, anchor, transform, grid, … }) → Feature',
            options: [
                { name: 'channel', type: "'x' | 'y'", default: "'x'", desc: 'Which scale to draw (pinned by axisX/axisY).' },
                { name: 'anchor', type: "'bottom'|'top'|'left'|'right'", default: 'per axis', desc: 'Which side the axis sits on.' },
                { name: 'transform', type: '(ctx) => {x?,y?}', default: '—', desc: 'Override the base translate — cross at the origin, or a centred 1D axis.' },
                { name: 'ticks', type: 'number', default: '5', desc: 'Approximate tick count (linear scales).' },
                { name: 'tickValues', type: 'any[]', default: '—', desc: 'Explicit tick values (overrides <code class="inline">ticks</code>).' },
                { name: 'tickFormat', type: 'string | fn', default: 'auto', desc: 'A d3-format string or a formatter function.' },
                { name: 'tickSize', type: 'number', default: '6', desc: 'Tick mark length in pixels.' },
                { name: 'title', type: 'string', default: '—', desc: 'Axis title, centred and pushed past the labels.' },
                { name: 'stroke / fill / fontSize', type: 'style', default: '#6b7280 / #374151 / 10', desc: 'Spine + tick colour, label colour (labels are text nodes, so they take a <code class="inline">fill</code>), label size.' },
                { name: 'grid', type: 'boolean', default: 'false', desc: 'Also add a matching grid mark alongside the axis.' },
            ],
            returns: 'A background <b>feature</b> emitting <code class="inline">line</code> + <code class="inline">text</code> nodes; redraws as the domain grows.',
        },
        {
            name: 'grid · gridX · gridY',
            summary: 'Full-span gridlines across the plot, one per tick.',
            signature: 'gridY({ ticks, tickValues, stroke, strokeWidth }) → Feature',
            options: [
                { name: 'channel', type: "'x' | 'y'", default: "'x'", desc: 'Which scale to draw lines for (pinned by gridX/gridY).' },
                { name: 'ticks', type: 'number', default: '5', desc: 'Approximate line count.' },
                { name: 'tickValues', type: 'any[]', default: '—', desc: 'Explicit positions (overrides <code class="inline">ticks</code>).' },
                { name: 'stroke / strokeWidth', type: 'style', default: '#e5e7eb / 1', desc: 'Line colour and width.' },
            ],
            returns: 'A background <b>feature</b> emitting one full-span <code class="inline">line</code> per tick.',
        },
        {
            name: 'rule · ruleX · ruleY',
            summary:
                'A straight reference line at a value on one axis — or, with a pair of endpoint ' +
                'channels, a <b>span</b> segment (a lollipop stem / error-bar whisker) at a category. ' +
                'An ordinary editable mark: put an <code class="inline">edit</code> on an endpoint ' +
                'channel and its cap becomes a handle. A rule with no edit is left ' +
                '<code class="inline">pointerEvents:"none"</code> by the engine, so an inert whisker ' +
                'never swallows a sibling handle’s drag.',
            signatures: [
                'ruleY({ channels: { y: { datum: 50 } } }) → Feature   // reference line at y = 50',
                'ruleX({ channels: { x, y1, y2 } }) → Feature          // span per datum',
            ],
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'The value channel — <code class="inline">{ datum }</code> for a constant, <code class="inline">{ field }</code> for one rule per row. <code class="inline">y1/y2</code> or <code class="inline">x1/x2</code> switch to span mode.' },
                { name: 'edits / constraints', type: 'Edit[] / Constraint[]', default: '—', desc: 'As on any mark. A per-channel <code class="inline">edit</code> makes that endpoint draggable.' },
                { name: 'strokeDasharray', type: 'string', default: '—', desc: 'Dash pattern passthrough.' },
                { name: 'stroke, strokeWidth, opacity', type: 'style', default: "stroke:'black'", desc: 'Standard style surface.' },
            ],
            channels: [
                { name: 'x / y', type: 'datum | field', desc: 'The reference value axis. <code class="inline">{ datum: 50 }</code> is DATA space — it goes through the scale. (<code class="inline">{ value: 50 }</code> would be 50 pixels.)' },
                { name: 'y1 / y2', type: 'linear', desc: 'Span endpoints (vertical). A lone endpoint spans from the value-axis baseline.' },
                { name: 'x1 / x2', type: 'linear', desc: 'Span endpoints (horizontal).' },
            ],
            returns: 'A <b>feature</b> emitting one non-interactive <code class="inline">line</code> per rule (full-extent, or a span segment).',
        },
    ],
    sections: [
        {
            id: 'global',
            title: 'The global axes:{} convenience',
            intro:
                'Pass a per-channel config to shape ticks, formats and titles, or a transform to ' +
                'reposition an axis. axes: false drops them entirely.',
            examples: [
                {
                    title: 'Gridlines, ticks, format & title',
                    blurb: 'y gets a grid and percent formatting; x a tick count and a title.',
                    code:
`mount(Elicit({
  width: 380, height: 300,
  margins: { top: 16, right: 16, bottom: 30, left: 44 },
  axes: {
    x: { ticks: 4, title: "Funnel step" },
    y: { grid: true, tickFormat: ".0%", title: "Conversion" },
  },
  data: [
    { step: "Visit", rate: 1.0 }, { step: "Signup", rate: 0.62 },
    { step: "Active", rate: 0.41 }, { step: "Paid", rate: 0.18 },
  ],
  schema: {
    step: { type: "categorical", domain: ["Visit", "Signup", "Active", "Paid"] },
    rate: { type: "quantitative", domain: [0, 1] },
  },
  features: [
    bar({
      channels: {
        x: { field: "step" },
        y: { field: "rate" },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Origin-crossing axes',
                    blurb: 'transform moves each axis to the zero line on the other scale.',
                    code:
`mount(Elicit({
  width: 360, height: 300,
  margins: { top: 16, right: 16, bottom: 24, left: 28 },
  axes: {
    x: { transform: ({ scales }) => ({ y: scales.y(0) }), ticks: 5 },
    y: { transform: ({ scales }) => ({ x: scales.x(0) }), ticks: 5 },
  },
  data: [
    { x: -8, y: 6 }, { x: 5, y: -3 }, { x: -4, y: -7 },
    { x: 9, y: 4 }, { x: 2, y: 8 }, { x: -6, y: 2 },
  ],
  schema: {
    x: { type: "quantitative", domain: [-10, 10] },
    y: { type: "quantitative", domain: [-10, 10] },
  },
  features: [
    point({
      size: 5, fill: "#4f46e5",
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
    }),
  ],
}))`,
                },
                {
                    title: '1D centered slider axis',
                    blurb: 'One point channel; the axis is pinned to the vertical center via transform, and y is dropped.',
                    try: '<b>Drag</b> a dot along the axis.',
                    code:
`mount(Elicit({
  width: 360, height: 200,
  margins: { top: 16, right: 20, bottom: 24, left: 20 },
  axes: {
    x: { transform: ({ height }) => ({ y: height / 2 }), ticks: 5, title: "Belief (0-100)" },
    y: false,   // drop the default y axis
  },
  data: [{ v: 20 }, { v: 55 }, { v: 80 }],
  schema: {
    v: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      size: 8, fill: "#0d9488",
      channels: {
        x: { field: "v" },
      },
      edits: [ drag({ channels: ["x"] }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'composable',
            title: 'Axis, grid & rule as marks',
            intro:
                'Turn the global axes off (axes: false) and add reference marks as features — ' +
                'they render in z-order with your data, so you control exactly what draws and where.',
            examples: [
                {
                    title: 'Explicit gridY + axisX/axisY + ruleY',
                    blurb: 'A gridline layer under the dots, a dashed rule at y = 50, and two titled axes — all as features.',
                    code:
`mount(Elicit({
  width: 380, height: 280,
  margins: { top: 16, right: 16, bottom: 30, left: 36 },
  axes: false,   // no auto axes; we place our own
  data: [{ x: 15, y: 30 }, { x: 40, y: 62 }, { x: 65, y: 44 }, { x: 88, y: 74 }],
  schema: {
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    gridY({ ticks: 5 }),
    ruleY({ y: 50, stroke: "#e4572e", strokeDasharray: "4 3" }),
    point({
      fill: "#4f46e5",
      size: 8,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
    }),
    axisX({ title: "x", ticks: 5 }),
    axisY({ title: "y", ticks: 5 }),
  ],
}))`,
                },
            ],
        },
    ],
};
