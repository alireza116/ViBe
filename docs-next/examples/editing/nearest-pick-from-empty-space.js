export const meta = {
  title: "Nearest pick from empty space",
  blurb: "A 2D nearest drag: move near a dot to select it, drag from empty space to grab the closest.",
  try: "<b>Drag</b> from anywhere near a dot to grab it.",
};

export const code = "mount(Elicit({\n  width: 340, height: 240,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [{ x: 25, y: 35 }, { x: 55, y: 68 }, { x: 78, y: 30 }],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      fill: \"#ffffff\", stroke: \"#334155\", strokeWidth: 2,\n      size: 10,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [ drag({ channels: [\"x\", \"y\"], pick: \"nearest\", threshold: 45, guide: true }) ],\n    }),\n  ],\n}))";
