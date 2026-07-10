// Sweep (you-draw-it).
export default {
    path: 'editing/sweep.html',
    title: 'Sweep (you-draw-it)',
    lead:
        '<code class="inline">edit.line.sweep()</code> is a ' +
        'drag that repaints each point’s value as the pointer crosses its column — the NYT ' +
        '“you draw it” interaction. It is sugar over ' +
        '<code class="inline">drag({ pick: "sweep", guide: true })</code>, and it is ' +
        'series-scoped: it locks onto the nearest line at drag-start and paints only that one.',
    api: [
        {
            name: 'edit.line.sweep(options)',
            summary:
                'Line-scoped (<code class="inline">scope: "line"</code>). Sugar over ' +
                '<code class="inline">drag({ pick: "sweep", guide: true })</code>: a drag repaints the value ' +
                'of each point the pointer crosses, locked to one series.',
            signature: 'edit.line.sweep(options?) → Edit',
            options: [
                { name: 'options', type: 'object', default: '{}', desc: 'Any shared Edit fields — <code class="inline">channels</code>, <code class="inline">when</code>, <code class="inline">threshold</code>, <code class="inline">constrain</code>. <code class="inline">pick</code>/<code class="inline">guide</code>/<code class="inline">scope</code> are preset.' },
            ],
            returns: 'An <b>Edit</b> the engine routes through the <code class="inline">sweep</code> driver (locks the nearest line at drag-start).',
        },
        {
            name: 'edit.line.draw(options)',
            summary:
                'The authoring counterpart: near an existing line it edits (sweeps) it; in empty ' +
                'space it draws a new one — you-draw-it for domain lines, freehand for <code class="inline">order:"sequence"</code>.',
            signature: 'edit.line.draw({ domain, value, samples, minDist, threshold, into }) → Edit',
            options: [
                { name: 'domain / value', type: "'x' | 'y'", default: "'x' / 'y'", desc: 'The positional axes.' },
                { name: 'samples', type: 'number | any[]', default: 'ticks', desc: 'Domain grid the you-draw-it upsert snaps to.' },
                { name: 'minDist', type: 'number', default: '8', desc: 'Freehand pointer-sampling distance in pixels.' },
                { name: 'threshold', type: 'number', default: '40', desc: 'Proximity radius for the edit-vs-draw decision.' },
                { name: 'into', type: "'nearest' | 'new'", default: "'nearest'", desc: 'Near edits / far draws, or always draw a fresh line.' },
            ],
            returns: 'An <b>Edit</b> routed through the <code class="inline">draw</code> driver (owns the per-drag mode lock).',
        },
    ],
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
  data: [
    { x: 0, y: 50 }, { x: 1, y: 50 }, { x: 2, y: 50 }, { x: 3, y: 50 },
    { x: 4, y: 50 }, { x: 5, y: 50 }, { x: 6, y: 50 }, { x: 7, y: 50 },
  ],
  features: [
    lineY({
      stroke: "#4f46e5", strokeWidth: 3, curve: "catmullRom",
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
  data: [
    { g: "plan",   x: 0, y: 30 }, { g: "plan",   x: 1, y: 45 }, { g: "plan",   x: 2, y: 40 }, { g: "plan",   x: 3, y: 60 },
    { g: "actual", x: 0, y: 70 }, { g: "actual", x: 1, y: 62 }, { g: "actual", x: 2, y: 75 }, { g: "actual", x: 3, y: 68 },
  ],
  features: [
    lineY({
      strokeWidth: 3, curve: "catmullRom",
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
