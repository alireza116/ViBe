export const meta = {
  title: "Composite key — a band × band grid",
  blurb: "unique({ field: [\"x\",\"y\"] }) allows at most one mark per (x, y) cell.",
  try: "<b>Drag</b> to another cell · <b>Click</b> an empty cell to add · <b><kbd>Alt</kbd>+click</b> to delete.",
};

export const code = "mount(Elicit({\n  width: 400, height: 320,\n  data: [\n    { x: \"A\", y: \"Low\", group: \"alpha\" },\n    { x: \"B\", y: \"Mid\", group: \"beta\" },\n    { x: \"C\", y: \"High\", group: \"gamma\" },\n  ],\n  constraints: [ unique({ field: [\"x\", \"y\"], max: 1 }) ],\n  schema: {\n    x:     { domain: [\"A\", \"B\", \"C\"] },\n    y:     { domain: [\"Low\", \"Mid\", \"High\"] },\n    group: { type: \"ordinal\", domain: [\"alpha\", \"beta\", \"gamma\"] },\n  },\n  features: [\n    point({\n      size: 12,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n        fill: { field: \"group\" },\n      },\n      edits: [\n        drag({ channels: [\"x\", \"y\"] }),\n        create({ defaults: { group: \"alpha\" } }),\n        remove({ when: when.alt }),\n      ],\n    }),\n  ],\n}))";
