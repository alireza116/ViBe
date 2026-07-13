export const meta = {
  title: "Region boxes",
  blurb: "x1/x2 and y1/y2 place each rect; fill by a field.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 360, height: 260,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { x1: 1, x2: 4, y1: 1, y2: 3, kind: \"a\" },\n    { x1: 5, x2: 8, y1: 4, y2: 7, kind: \"b\" },\n    { x1: 3, x2: 6, y1: 6, y2: 9, kind: \"a\" },\n  ],\n  schema: {\n    x1: { type: \"quantitative\", domain: [0, 10] },\n    x2: { type: \"quantitative\", domain: [0, 10] },\n    y1: { type: \"quantitative\", domain: [0, 10] },\n    y2: { type: \"quantitative\", domain: [0, 10] },\n    kind: { type: \"categorical\", domain: [\"a\", \"b\"] },\n  },\n  features: [\n    rect({\n      fillOpacity: 0.6,\n      channels: {\n        x1: { field: \"x1\" }, x2: { field: \"x2\" },\n        y1: { field: \"y1\" }, y2: { field: \"y2\" },\n        fill: { field: \"kind\" },\n      },\n    }),\n  ],\n}))";
