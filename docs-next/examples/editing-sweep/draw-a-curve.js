export const meta = {
  title: "Draw a curve",
  blurb: "edit: drag({ pick: \"sweep\" }) on the value channel; the x positions stay fixed.",
  try: "<b>Sweep</b> left-to-right across the chart.",
};

export const code = "mount(Elicit({\n  width: 420, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: 0, y: 50 }, { x: 1, y: 50 }, { x: 2, y: 50 }, { x: 3, y: 50 },\n    { x: 4, y: 50 }, { x: 5, y: 50 }, { x: 6, y: 50 }, { x: 7, y: 50 },\n  ],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 7] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    lineY({\n      stroke: \"#4f46e5\", strokeWidth: 3, curve: \"catmullRom\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\",\n             edit: drag({ pick: \"sweep\", guide: true }) },\n      },\n    }),\n  ],\n}))";
