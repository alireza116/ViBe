// Core concepts — the channel model shared by every mark.
export default {
    path: 'concepts.html',
    title: 'Core concepts',
    lead:
        'Every mark reads the same <b>channel</b> surface. A channel is either a constant ' +
        '(<code class="inline">fill: "red"</code>) or a data field through a scale ' +
        '(<code class="inline">fill: { field: "kind" }</code>). No accessor functions — ' +
        'specs stay serializable. Encoding maps data → visual; an edit on a channel maps a ' +
        'gesture → data, back through the same scale.',
    sections: [
        {
            id: 'channels',
            title: 'A channel is a constant or a field',
            intro:
                'Constant channels take a raw value. Field channels name a data field and ' +
                'resolve it through a scale — a category through the ordinal palette, a number ' +
                'through a ramp. The same surface (x, y, fill, stroke, size, opacity, …) is ' +
                'available on every mark, plus top-level style shorthands.',
            examples: [
                {
                    title: 'Field-driven colour (ordinal palette)',
                    blurb: 'encoding: { fill: { field: "kind" } } — a category drives fill through the ordinal palette.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    bar({
      data: [
        { cat: "A", n: 34, kind: "low" },  { cat: "B", n: 58, kind: "high" },
        { cat: "C", n: 22, kind: "low" },  { cat: "D", n: 47, kind: "high" },
      ],
      encoding: {
        x: { field: "cat", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "n", type: "linear", domain: [0, 60] },
        fill: { field: "kind" },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Constant style shorthands',
                    blurb: 'stroke, strokeWidth, opacity as top-level shorthands on a point — a constant channel needs no scale.',
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
    ],
};
