export const meta = {
  title: "Ordinal palette",
  blurb: "fill: { field: \"kind\" } assigns palette colours across the category domain.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 340, height: 240,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  schema: {\n    cat:  { type: \"categorical\",  domain: [\"A\", \"B\", \"C\", \"D\"] },\n    n:    { type: \"quantitative\", domain: [0, 60] },\n    kind: { type: \"categorical\",  domain: [\"low\", \"high\"] },\n  },\n  data: [\n    { cat: \"A\", n: 34, kind: \"low\" },  { cat: \"B\", n: 58, kind: \"high\" },\n    { cat: \"C\", n: 22, kind: \"low\" },  { cat: \"D\", n: 47, kind: \"high\" },\n  ],\n  features: [\n    bar({\n      channels: {\n        x: { field: \"cat\" },\n        y: { field: \"n\" },\n        fill: { field: \"kind\" },\n      },\n    }),\n  ],\n}))";
