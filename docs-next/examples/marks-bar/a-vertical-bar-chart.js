export const meta = {
  title: "A vertical bar chart",
  blurb: "x band of categories, y linear value.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 380, height: 240,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { cat: \"A\", n: 30 }, { cat: \"B\", n: 55 },\n    { cat: \"C\", n: 22 }, { cat: \"D\", n: 44 },\n  ],\n  schema: {\n    cat: { type: \"categorical\", domain: [\"A\", \"B\", \"C\", \"D\"] },\n    n:   { type: \"quantitative\", domain: [0, 60] },\n  },\n  features: [\n    bar({\n      fill: \"#4f46e5\",\n      channels: {\n        x: { field: \"cat\" },\n        y: { field: \"n\" },\n      },\n    }),\n  ],\n}))";
