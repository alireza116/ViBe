export const meta = {
  title: "2D move (scatter)",
  blurb: "Both x and y carry edit: drag(), so a dot moves anywhere.",
  try: "<b>Drag</b> a dot anywhere.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [{ x: 20, y: 30 }, { x: 50, y: 62 }, { x: 78, y: 40 }],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      fill: \"#2563eb\", stroke: \"#1f2733\", strokeWidth: 1, opacity: 0.85,\n      size: 9,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [ drag({ channels: [\"x\", \"y\"] }) ],\n    }),\n  ],\n}))";
