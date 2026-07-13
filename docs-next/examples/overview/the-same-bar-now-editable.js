export const meta = {
  title: "The same bar, now editable",
  blurb: "y carries edit: drag(). Dragging a bar writes its value back to the data.",
  try: "<b>Drag</b> a bar up or down.",
};

export const code = "mount(Elicit({\n  width: 380, height: 240,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { cat: \"A\", n: 30 }, { cat: \"B\", n: 55 },\n    { cat: \"C\", n: 22 }, { cat: \"D\", n: 44 },\n  ],\n  schema: {\n    cat: { type: \"categorical\", domain: [\"A\", \"B\", \"C\", \"D\"] },\n    n:   { type: \"quantitative\", domain: [0, 60] },\n  },\n  features: [\n    bar({\n      fill: \"#4f46e5\",\n      channels: {\n        x: { field: \"cat\" },\n        y: { field: \"n\", edit: drag() },\n      },\n    }),\n  ],\n}))";
