export const meta = {
  title: "Constant style shorthands",
  blurb: "stroke, strokeWidth, opacity as top-level shorthands on a point — a constant channel needs no scale.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 340, height: 240,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: 12, y: 40 }, { x: 30, y: 22 }, { x: 48, y: 55 },\n    { x: 66, y: 33 }, { x: 80, y: 68 }, { x: 22, y: 60 },\n  ],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 80] },\n  },\n  features: [\n    point({\n      fill: \"#fde68a\", stroke: \"#b45309\", strokeWidth: 2, opacity: 0.85,\n      size: 9,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n    }),\n  ],\n}))";
