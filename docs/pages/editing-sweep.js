// Sweep (you-draw-it).
export default {
    path: 'editing/sweep.html',
    title: 'Sweep (you-draw-it)',
    lead:
        '<code class="inline">sweep()</code> (aka <code class="inline">youDrawIt()</code>) is a ' +
        'drag that repaints each point’s value as the pointer crosses its column — the NYT ' +
        '“you draw it” interaction. It is sugar over ' +
        '<code class="inline">drag({ pick: "sweep", guide: true })</code>, and it is ' +
        'series-scoped: it locks onto the nearest line at drag-start and paints only that one.',
    sections: [
        {
            id: 'sweep',
            title: 'Sweep a single line',
            intro: 'Press and drag horizontally; every point the pointer passes takes the pointer’s value.',
            examples: [
                {
                    title: 'Draw a curve',
                    blurb: 'edit: drag({ pick: "sweep" }) on the value channel; the x positions stay fixed.',
                    try: '<b>Sweep</b> left-to-right across the chart.',
                    code:
`mount(Elicit({
  width: 420, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    lineY({
      stroke: "#4f46e5", strokeWidth: 3, curve: "catmullRom",
      data: [
        { x: 0, y: 50 }, { x: 1, y: 50 }, { x: 2, y: 50 }, { x: 3, y: 50 },
        { x: 4, y: 50 }, { x: 5, y: 50 }, { x: 6, y: 50 }, { x: 7, y: 50 },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 7] },
        y: { field: "y", type: "linear", domain: [0, 100],
             edit: drag({ pick: "sweep", guide: true }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'series',
            title: 'Series-scoped sweep',
            intro:
                'With multiple lines, a sweep locks onto the nearest line at drag-start and paints ' +
                'only it — the others hold. Grouping comes from the stroke field.',
            examples: [
                {
                    title: 'Two lines, swept independently',
                    blurb: 'The sweep touches only the line it started nearest to.',
                    try: '<b>Sweep</b> over one line to reshape it; the other stays put.',
                    code:
`mount(Elicit({
  width: 420, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    lineY({
      strokeWidth: 3, curve: "catmullRom",
      data: [
        { g: "plan",   x: 0, y: 30 }, { g: "plan",   x: 1, y: 45 }, { g: "plan",   x: 2, y: 40 }, { g: "plan",   x: 3, y: 60 },
        { g: "actual", x: 0, y: 70 }, { g: "actual", x: 1, y: 62 }, { g: "actual", x: 2, y: 75 }, { g: "actual", x: 3, y: 68 },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 3] },
        y: { field: "y", type: "linear", domain: [0, 100],
             edit: drag({ pick: "sweep", guide: true }) },
        stroke: { field: "g", type: "ordinal" },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
