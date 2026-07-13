export const meta = {
  title: "Sequential ramp + size",
  blurb: "fill: { field } → ramp, size: { field } → radius, from one numeric field.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 340, height: 240,\n  margins: { top: 14, right: 14, bottom: 26, left: 34 },\n  schema: {\n    h:      { type: \"quantitative\", domain: [140, 200] },\n    weight: { type: \"quantitative\", domain: [40, 100] },\n  },\n  data: [\n    { h: 150, weight: 48 }, { h: 160, weight: 57 }, { h: 170, weight: 66 },\n    { h: 180, weight: 78 }, { h: 190, weight: 92 }, { h: 165, weight: 61 },\n  ],\n  features: [\n    point({\n      stroke: \"#334155\", strokeWidth: 1,\n      channels: {\n        x: { field: \"h\" },\n        y: { field: \"weight\" },\n        fill: { field: \"weight\" },                          // -> sequential ramp\n        size: { field: \"weight\", scale: { range: [4, 16] } }, // -> radius, in px\n      },\n    }),\n  ],\n}))";
