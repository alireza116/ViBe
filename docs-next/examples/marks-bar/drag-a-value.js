export const meta = {
  title: "Drag a value",
  blurb: "y carries edit: drag(). Dragging writes y back through the same scale.",
  try: "<b>Drag</b> a bar up or down.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: \"A\", y: 20 }, { x: \"B\", y: 45 },\n    { x: \"C\", y: 30 }, { x: \"D\", y: 60 },\n  ],\n  schema: {\n    x: { type: \"categorical\", domain: [\"A\", \"B\", \"C\", \"D\"] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    bar({\n      fill: \"#4f46e5\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\", edit: drag() },\n      },\n    }),\n  ],\n}))";
