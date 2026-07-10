// Data schema — declare what you elicit.
export default {
    path: 'schema.html',
    title: 'Data schema',
    lead:
        'A <code class="inline">schema</code> declares the output dataset: each field’s ' +
        'measurement type (quantitative / categorical / ordinal / temporal), range, and ' +
        'creation default. It is the source of truth for a field’s scale, so a chart resolves ' +
        'scales, draws axes, and mints data with <b>zero starter data</b>.',
    api: [
        {
            name: 'schema — Record<field, FieldSchema>',
            summary:
                'Declared on a feature (or on <code class="inline">Elicit</code>). Each field maps to a spec ' +
                'that fixes its measurement type, range and creation default — the source of truth a ' +
                'scale and a minted datum both read.',
            signature: 'schema: { [field]: { type, domain?, default? } }',
            options: [
                { name: 'type', type: "'quantitative'|'categorical'|'ordinal'|'temporal'", default: '—', desc: 'The field’s measurement type — picks the scale family (quantitative→linear, categorical→band/ordinal, temporal→time).' },
                { name: 'domain', type: 'any[]', default: '—', desc: 'The field’s data range or category list; feeds the resolved scale and the axis.' },
                { name: 'default', type: 'any', default: 'null', desc: 'The value a newly-created datum gets for this field (<code class="inline">null</code> = present but unset, editable later).' },
            ],
            returns:
                'With a schema, a feature resolves scales and draws axes from <b>no starter data</b>; ' +
                '<code class="inline">create</code> seeds every declared field before the pointer places the positional ones.',
        },
    ],
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
  data: [],   // start from nothing
  onChange: (d) => console.log("elicited", d),
  features: [
    point({
      size: 7, stroke: "#1f2733", strokeWidth: 1,
      channels: {
        x: { field: "age" }, y: { field: "belief" },
        fill: { field: "class" },
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
  data: [],
  features: [
    point({
      size: 7, fill: "#0d9488", stroke: "#0f5c53", strokeWidth: 1,
      channels: {
        x: { field: "when" }, y: { field: "belief" },
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
