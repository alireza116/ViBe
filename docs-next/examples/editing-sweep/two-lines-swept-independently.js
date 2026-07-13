export const meta = {
  title: "Two lines, swept independently",
  blurb: "The sweep touches only the line it started nearest to.",
  try: "<b>Sweep</b> over one line to reshape it; the other stays put.",
};

export const code = "mount(Elicit({\n  width: 420, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { g: \"plan\",   x: 0, y: 30 }, { g: \"plan\",   x: 1, y: 45 }, { g: \"plan\",   x: 2, y: 40 }, { g: \"plan\",   x: 3, y: 60 },\n    { g: \"actual\", x: 0, y: 70 }, { g: \"actual\", x: 1, y: 62 }, { g: \"actual\", x: 2, y: 75 }, { g: \"actual\", x: 3, y: 68 },\n  ],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 3] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n    g: { type: \"ordinal\" },\n  },\n  features: [\n    lineY({\n      strokeWidth: 3, curve: \"catmullRom\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\",\n             edit: drag({ pick: \"sweep\", guide: true }) },\n        stroke: { field: \"g\" },\n      },\n    }),\n  ],\n}))";
