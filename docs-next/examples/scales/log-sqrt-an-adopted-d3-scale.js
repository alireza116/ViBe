export const meta = {
  title: "log · sqrt · an adopted d3 scale",
  blurb: "x is logarithmic, size ramps by sqrt, and the categorical fill uses a d3 ordinal scale.",
  try: "<b>Drag</b> a dot vertically — an adopted scale inverts like any other.",
};

export const code = "mount(Elicit({\n  width: 380, height: 250,\n  margins: { top: 14, right: 14, bottom: 30, left: 40 },\n  schema: {\n    t: { type: \"quantitative\", domain: [1, 1000] },\n    w: { type: \"quantitative\", domain: [0, 100] },\n    g: { type: \"categorical\",  domain: [\"a\", \"b\", \"c\"] },\n  },\n  data: [\n    { t: 2, w: 20, g: \"a\" }, { t: 20, w: 55, g: \"b\" },\n    { t: 120, w: 40, g: \"c\" }, { t: 700, w: 80, g: \"a\" },\n  ],\n  features: [\n    point({\n      stroke: \"#1f2733\",\n      channels: {\n        x:    { field: \"t\", scale: \"log\" },\n        y:    { field: \"w\", edit: drag() },\n        size: { field: \"w\", scale: { type: \"sqrt\", range: [5, 16] } },\n        fill: { field: \"g\", scale: d3.scaleOrdinal(d3.schemeTableau10) },\n      },\n    }),\n  ],\n}))";
