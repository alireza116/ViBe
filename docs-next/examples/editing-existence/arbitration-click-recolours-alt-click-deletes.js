export const meta = {
  title: "Arbitration — click recolours, Alt-click deletes",
  blurb: "cycle and remove share the click gesture; when (noAlt vs alt) decides which one claims it.",
  try: "<b>Click</b> a dot to recolour · <b><kbd>Alt</kbd>+click</b> to delete · <b>Drag</b> to move.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: 25, y: 40, group: \"alpha\" },\n    { x: 55, y: 65, group: \"beta\" },\n    { x: 80, y: 30, group: \"gamma\" },\n  ],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x:     { type: \"quantitative\", domain: [0, 100] },\n    y:     { type: \"quantitative\", domain: [0, 100] },\n    group: { type: \"ordinal\", domain: [\"alpha\", \"beta\", \"gamma\"] },\n  },\n  features: [\n    point({\n      size: 10,\n      channels: {\n        x: { field: \"x\", edit: drag() },\n        y: { field: \"y\", edit: drag() },\n        fill: { field: \"group\", edit: cycle({ when: when.noAlt }) },\n      },\n      edits: [ remove({ when: when.alt }) ],\n    }),\n  ],\n}))";
