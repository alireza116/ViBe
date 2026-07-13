export const meta = {
  title: "Ticks over a band axis",
  blurb: "One tick per category, spanning the band at its y value.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 380, height: 240,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: \"A\", y: 20 }, { x: \"B\", y: 45 },\n    { x: \"C\", y: 30 }, { x: \"D\", y: 60 },\n  ],\n  schema: {\n    x: { type: \"categorical\", domain: [\"A\", \"B\", \"C\", \"D\"] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    tickY({\n      stroke: \"#4f46e5\", strokeWidth: 3,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n    }),\n  ],\n}))";
