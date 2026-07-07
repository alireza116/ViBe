// Point mark.
export default {
    path: 'marks/point.html',
    title: 'Point',
    lead:
        '<code class="inline">point</code> is the channel-driven circle: every channel — x, y, ' +
        'size, fill/color, stroke — resolves through the global scales, so one mark is a full ' +
        'scatter.',
    sections: [
        {
            id: 'channels',
            title: 'Channels: size, fill, colour',
            intro:
                'A numeric field can drive the radius (size) and a continuous colour ramp at ' +
                'once; a categorical field drives the ordinal palette. Constants and fields mix ' +
                'freely on the same mark.',
            examples: [
                {
                    title: 'Sequential fill + size from a number',
                    blurb: 'A numeric field drives both the continuous colour ramp and the radius.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 34 },
  features: [
    point({
      data: [
        { h: 150, weight: 48 }, { h: 160, weight: 57 }, { h: 170, weight: 66 },
        { h: 180, weight: 78 }, { h: 190, weight: 92 }, { h: 165, weight: 61 },
      ],
      stroke: "#334155", strokeWidth: 1,
      encoding: {
        x: { field: "h", type: "linear", domain: [140, 200] },
        y: { field: "weight", type: "linear", domain: [40, 100] },
        fill: { field: "weight" },   // number -> sequential ramp
        size: { field: "weight" },   // number -> radius
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Constant style shorthands',
                    blurb: 'Outlined, semi-transparent dots via top-level stroke / strokeWidth / opacity.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    point({
      data: [
        { x: 12, y: 40 }, { x: 30, y: 22 }, { x: 48, y: 55 },
        { x: 66, y: 33 }, { x: 80, y: 68 }, { x: 22, y: 60 },
      ],
      fill: "#fde68a", stroke: "#b45309", strokeWidth: 2, opacity: 0.85,
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 80] },
        size: { value: 9 },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'editing',
            title: 'Moving points in 2D',
            intro: 'When both x and y carry a drag, a gesture inverts the pointer through both positional scales.',
            examples: [
                {
                    title: '2D move (scatter)',
                    blurb: 'Both x and y carry edit: drag(), so a dot moves anywhere.',
                    try: '<b>Drag</b> a dot anywhere.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    point({
      fill: "#2563eb", stroke: "#1f2733", strokeWidth: 1, opacity: 0.85,
      data: [{ x: 20, y: 30 }, { x: 50, y: 62 }, { x: 78, y: 40 }],
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
    ],
};
