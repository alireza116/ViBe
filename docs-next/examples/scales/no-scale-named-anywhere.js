export const meta = {
  title: "No scale named anywhere",
  blurb: "Data type (schema) + what the mark needs = the scale. Drag a bar to see it invert.",
  try: "<b>Drag</b> a bar.",
};

export const code = "mount(Elicit({\n  width: 340, height: 240,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  schema: {\n    cat: { type: \"categorical\",  domain: [\"A\", \"B\", \"C\", \"D\"] },\n    n:   { type: \"quantitative\", domain: [0, 60] },\n  },\n  data: [\n    { cat: \"A\", n: 34 }, { cat: \"B\", n: 58 },\n    { cat: \"C\", n: 22 }, { cat: \"D\", n: 47 },\n  ],\n  features: [\n    bar({\n      fill: \"#4f46e5\",\n      channels: {\n        x: { field: \"cat\" },              // categorical + bar -> band\n        y: { field: \"n\", edit: drag() },  // quantitative      -> linear\n      },\n    }),\n  ],\n}))";
