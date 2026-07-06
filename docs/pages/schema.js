// Data schema — declare what you elicit.
export default {
    path: 'schema.html',
    title: 'Data schema',
    lead:
        'A <code class="inline">schema</code> declares the output dataset: each field’s ' +
        'measurement type (quantitative / categorical / ordinal / temporal), range, and ' +
        'creation default. It is the source of truth for a field’s scale, so a chart resolves ' +
        'scales, draws axes, and mints data with <b>zero starter data</b>.',
    sections: [
        {
            id: 'empty',
            title: 'An empty chart that knows its axes',
            intro:
                'No data — the axes come straight from the schema. Every created point carries all ' +
                'declared fields (from the pointer or the field’s default), so it is immediately ' +
                'editable.',
            examples: [
                {
                    title: 'Elicit from nothing',
                    blurb: 'schema declares age / belief / class; create mints fully-formed data.',
                    try: '<b>Double-click</b> to create · <b>drag</b> to move · <b>click</b> to cycle the class colour.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 16, right: 16, bottom: 30, left: 36 },
  schema: {
    age:    { type: "quantitative", domain: [0, 100] },
    belief: { type: "quantitative", domain: [0, 1], default: 0.5 },
    class:  { type: "categorical",  domain: ["A", "B", "C"] },
  },
  axes: { x: { title: "age" }, y: { title: "belief" } },
  features: [
    point({
      onChange: (d) => console.log("elicited", d),
      data: [],   // start from nothing
      encoding: {
        x: { field: "age" }, y: { field: "belief" },
        fill: { field: "class" },
        size: { value: 7 }, stroke: { value: "#1f2733" }, strokeWidth: { value: 1 },
      },
      edits: [
        create({ trigger: "dblclick" }),
        drag({ channels: ["x", "y"] }),
        cycle({ channel: "fill", gesture: "click" }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'temporal',
            title: 'A temporal axis — same story',
            intro: 'type: "temporal" on a field. Dates place, drag, and invert like any continuous axis.',
            examples: [
                {
                    title: 'Beliefs over time',
                    blurb: 'A temporal domain drives a time scale; created points carry real Dates.',
                    try: '<b>Double-click</b> to record a belief at a point in time · <b>drag</b> to adjust.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 16, right: 16, bottom: 30, left: 36 },
  schema: {
    when:   { type: "temporal", domain: ["2020-01-01", "2026-01-01"] },
    belief: { type: "quantitative", domain: [0, 1], default: 0.5 },
  },
  axes: { x: { title: "when" }, y: { title: "belief" } },
  features: [
    point({
      data: [],
      encoding: {
        x: { field: "when" }, y: { field: "belief" },
        size: { value: 7 }, fill: { value: "#0d9488" },
        stroke: { value: "#0f5c53" }, strokeWidth: { value: 1 },
      },
      edits: [
        create({ trigger: "dblclick" }),
        drag({ channels: ["x", "y"] }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
