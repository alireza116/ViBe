export const meta = {
  title: "Origin-crossing axes",
  blurb: "transform moves each axis to the zero line on the other scale.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 360, height: 300,\n  margins: { top: 16, right: 16, bottom: 24, left: 28 },\n  axes: {\n    x: { transform: ({ scales }) => ({ y: scales.y(0) }), ticks: 5 },\n    y: { transform: ({ scales }) => ({ x: scales.x(0) }), ticks: 5 },\n  },\n  data: [\n    { x: -8, y: 6 }, { x: 5, y: -3 }, { x: -4, y: -7 },\n    { x: 9, y: 4 }, { x: 2, y: 8 }, { x: -6, y: 2 },\n  ],\n  schema: {\n    x: { type: \"quantitative\", domain: [-10, 10] },\n    y: { type: \"quantitative\", domain: [-10, 10] },\n  },\n  features: [\n    point({\n      size: 5, fill: \"#4f46e5\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n    }),\n  ],\n}))";
