export const meta = {
  title: "Fruit counts",
  blurb: "Static waffle; y domain 0–320, one cell = 10 fruit (32 cells tall), multiple auto-picked square.",
  try: "",
};

export const code = "const cats = [\"apples\",\"bananas\",\"oranges\",\"pears\"];\nmount(Elicit({\n  width: 460, height: 300,\n  margins: { top: 16, right: 12, bottom: 28, left: 34 },\n  data: [\n    { cat: \"apples\", value: 210 }, { cat: \"bananas\", value: 200 },\n    { cat: \"oranges\", value: 310 }, { cat: \"pears\", value: 40 },\n  ],\n  schema: {\n    cat:   { type: \"categorical\", domain: cats },\n    value: { type: \"quantitative\", domain: [0, 320] },\n  },\n  scales: { x: { type: \"band\" } },\n  features: [\n    waffleY({\n      fill: \"#4f46e5\",\n      channels: {\n        x: { field: \"cat\" },\n        y: { field: \"value\" },\n      },\n      unit: 10,\n    }),\n  ],\n}));";
