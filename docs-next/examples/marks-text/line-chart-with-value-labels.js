export const meta = {
  title: "Line chart with value labels",
  blurb: "lineY draws the series; text sits on the same (x, y) with dy above each point.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 400, height: 260,\n  margins: { top: 20, right: 16, bottom: 28, left: 34 },\n  data: [\n    { t: 0, n: 40 }, { t: 1, n: 62 }, { t: 2, n: 48 },\n    { t: 3, n: 78 }, { t: 4, n: 60 }, { t: 5, n: 84 },\n  ],\n  schema: {\n    t: { type: \"quantitative\", domain: [0, 5] },\n    n: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    lineY({\n      stroke: \"#4f46e5\", strokeWidth: 2.5, curve: \"catmullRom\",\n      channels: { x: { field: \"t\" }, y: { field: \"n\" } },\n    }),\n    text({\n      fontSize: 11, dy: -10, lineAnchor: \"bottom\",\n      fill: \"#4f46e5\", format: \".0f\",\n      channels: {\n        x: { field: \"t\" }, y: { field: \"n\" },\n        text: { field: \"n\" },\n      },\n    }),\n  ],\n}))";
