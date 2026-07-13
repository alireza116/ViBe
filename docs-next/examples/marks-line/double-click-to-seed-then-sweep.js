export const meta = {
  title: "Double-click to seed, then sweep",
  blurb: "edit.line.newSeries({ samples: 6 }) drops six evenly-spaced anchors at the click’s value.",
  try: "<b>Double-click</b> to drop a line, then <b>sweep</b> to shape it.",
};

export const code = "mount(Elicit({\n  width: 420, height: 300,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x: { type: \"quantitative\", domain: [0, 10] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    lineY({\n      stroke: \"#4f46e5\", strokeWidth: 3, curve: \"catmullRom\", series: \"s\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\",\n             edit: drag({ pick: \"sweep\", guide: true }) },\n      },\n      edits: [ edit.line.newSeries({ along: \"x\", value: \"y\", series: \"s\", samples: 6 }) ],\n    }),\n  ],\n}))";
