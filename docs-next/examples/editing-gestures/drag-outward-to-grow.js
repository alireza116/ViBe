export const meta = {
  title: "Drag outward to grow",
  blurb: "resize() maps the gesture radius back to the size field.",
  try: "<b>Drag</b> a dot outward or inward to grow/shrink it.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: 25, y: 50, mag: 3 }, { x: 55, y: 50, mag: 7 }, { x: 82, y: 50, mag: 11 },\n  ],\n  schema: {\n    x:   { type: \"quantitative\", domain: [0, 100] },\n    y:   { type: \"quantitative\", domain: [0, 100] },\n    mag: { domain: [0, 14] },\n  },\n  features: [\n    point({\n      fill: \"#ede9fe\", stroke: \"#7c3aed\", strokeWidth: 2,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n        size: { field: \"mag\", edit: resize() },\n      },\n      constraints: [ clamp({ field: \"mag\", min: 1, max: 14 }) ],\n    }),\n  ],\n}))";
