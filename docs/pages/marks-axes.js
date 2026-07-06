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
  features: [
    bar({
      data: [
        { step: "Visit", rate: 1.0 }, { step: "Signup", rate: 0.62 },
        { step: "Active", rate: 0.41 }, { step: "Paid", rate: 0.18 },
      ],
      encoding: {
        x: { field: "step", type: "band",
             domain: ["Visit", "Signup", "Active", "Paid"] },
        y: { field: "rate", type: "linear", domain: [0, 1] },
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
  features: [
    point({
      data: [
        { x: -8, y: 6 }, { x: 5, y: -3 }, { x: -4, y: -7 },
        { x: 9, y: 4 }, { x: 2, y: 8 }, { x: -6, y: 2 },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [-10, 10] },
        y: { field: "y", type: "linear", domain: [-10, 10] },
        size: { value: 5 }, color: { value: "#4f46e5" },
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
  features: [
    point({
      data: [{ v: 20 }, { v: 55 }, { v: 80 }],
      encoding: {
        x: { field: "v", type: "linear", domain: [0, 100] },
        size: { value: 8 }, color: { value: "#0d9488" },
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
  features: [
    gridY({ ticks: 5 }),
    ruleY({ y: 50, stroke: "#e4572e", strokeDasharray: "4 3" }),
    point({
      fill: "#4f46e5",
      data: [{ x: 15, y: 30 }, { x: 40, y: 62 }, { x: 65, y: 44 }, { x: 88, y: 74 }],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 100] },
        size: { value: 8 },
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
