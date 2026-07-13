export const meta = {
  title: "Draw, then reshape",
  blurb: "edit.line.draw({ samples: 8 }) on an empty line. First drag draws all eight points; a drag over the line reshapes it, a drag in empty space starts a new one.",
  try: "<b>Press and drag</b> to draw · <b>drag over the line</b> to reshape · <b>drag elsewhere</b> for a new line.",
};

export const code = "mount(Elicit({\n  width: 420, height: 300,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x: { type: \"quantitative\", domain: [0, 10] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    lineY({\n      stroke: \"#4f46e5\", strokeWidth: 3, curve: \"catmullRom\", series: \"s\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [ edit.line.draw({ along: \"x\", value: \"y\", series: \"s\", samples: 8 }) ],\n    }),\n  ],\n}))";
