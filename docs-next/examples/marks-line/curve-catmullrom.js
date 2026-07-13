export const meta = {
  title: "curve: \"catmullRom\"",
  blurb: "A smooth line through the points. Try \"linear\" or \"step\" for other shapes.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 400, height: 240,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: 0, y: 40 }, { x: 1, y: 62 }, { x: 2, y: 48 },\n    { x: 3, y: 78 }, { x: 4, y: 60 }, { x: 5, y: 84 },\n  ],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x: { type: \"quantitative\", domain: [0, 5] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    lineY({\n      stroke: \"#4f46e5\", strokeWidth: 3, curve: \"catmullRom\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n    }),\n  ],\n}))";
