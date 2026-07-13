export const meta = {
  title: "Draggable numeric readout",
  blurb: "The label IS the value: text and y read the same field, and drag() on y rewrites it — so the number updates as you drag. format keeps the display tidy.",
  try: "<b>Drag</b> the number up or down.",
};

export const code = "mount(Elicit({\n  width: 360, height: 260,\n  margins: { top: 16, right: 16, bottom: 28, left: 40 },\n  data: [ { cat: \"A\", n: 40 }, { cat: \"B\", n: 70 } ],\n  schema: {\n    cat: { type: \"categorical\", domain: [\"A\", \"B\"] },\n    n:   { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    text({ fontSize: 16, fill: \"#0d9488\", format: \".1f\",\n      channels: {\n        x: { field: \"cat\" },\n        y: { field: \"n\", edit: drag() },\n        text: { field: \"n\" },\n      } }),\n  ],\n}))";
