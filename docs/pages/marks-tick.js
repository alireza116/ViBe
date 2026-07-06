// Tick mark — tick / tickX / tickY.
export default {
    path: 'marks/tick.html',
    title: 'Tick',
    lead:
        'A tick is bar’s zero-thickness sibling: a thin line marking a value on the linear ' +
        'axis and spanning the other axis. Over a category band it reads as a value marker ' +
        '(like a bar without the fill); over a full continuous extent it reads as a rug / strip. ' +
        '<code class="inline">inset</code> shrinks each end, <code class="inline">length</code> ' +
        'fixes a centered length.',
    sections: [
        {
            id: 'value-marker',
            title: 'A value marker across bands',
            intro:
                'tickY marks a y value spanning each category’s band — the same channel/edit ' +
                'model as a bar, so it drags identically.',
            examples: [
                {
                    title: 'Ticks over a band axis',
                    blurb: 'One tick per category, spanning the band at its y value.',
                    code:
`mount(Elicit({
  width: 380, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    tickY({
      stroke: "#4f46e5", strokeWidth: 3,
      data: [
        { x: "A", y: 20 }, { x: "B", y: 45 },
        { x: "C", y: 30 }, { x: "D", y: 60 },
      ],
      encoding: {
        x: { field: "x", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "y", type: "linear", domain: [0, 100] },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Drag a value (ticks)',
                    blurb: 'Same y edit as a bar; pick: "nearest" grabs the tick from anywhere in its column.',
                    try: '<b>Drag</b> a tick up or down — from anywhere in its column.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    tickY({
      stroke: "#4f46e5", strokeWidth: 3,
      data: [
        { x: "A", y: 20 }, { x: "B", y: 45 },
        { x: "C", y: 30 }, { x: "D", y: 60 },
      ],
      encoding: {
        x: { field: "x", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "y", type: "linear", domain: [0, 100],
             edit: drag({ pick: "nearest" }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'rug',
            title: 'A rug / strip plot',
            intro:
                'With no band on the other axis, a tick spans the full extent — a strip of marks ' +
                'at each datum’s position. inset trims the ends so the strip floats off the frame.',
            examples: [
                {
                    title: 'tickX — a distribution strip',
                    blurb: 'Values along x, each drawn as a vertical mark spanning y. inset shortens them.',
                    code:
`mount(Elicit({
  width: 400, height: 200,
  margins: { top: 16, right: 16, bottom: 28, left: 16 },
  features: [
    tickX({
      stroke: "#0d9488", strokeWidth: 2, inset: 10,
      data: [
        { v: 12 }, { v: 18 }, { v: 21 }, { v: 34 }, { v: 39 },
        { v: 41 }, { v: 55 }, { v: 58 }, { v: 63 }, { v: 71 }, { v: 84 },
      ],
      encoding: {
        x: { field: "v", type: "linear", domain: [0, 100] },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
