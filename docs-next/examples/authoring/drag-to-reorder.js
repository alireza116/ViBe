export const meta = {
  title: "Drag to reorder",
  blurb: "Point scale over ranks; drag swaps with the nearest slot.",
  try: "<b>Drag</b> a point to another rank.",
};

export const code = "mount(Elicit({\n  width: 360, height: 260,\n  margins: { top: 16, right: 16, bottom: 28, left: 80 },\n  data: [\n    { item: \"A\", rank: 1 },\n    { item: \"B\", rank: 2 },\n    { item: \"C\", rank: 3 },\n  ],\n  schema: {\n    item: { type: \"categorical\", domain: [\"A\", \"B\", \"C\"] },\n    rank: { type: \"ordinal\", domain: [1, 2, 3] },\n  },\n  features: [\n    point({\n      fill: \"#0d9488\", size: 9,\n      channels: {\n        x: { value: 40 },\n        y: { field: \"rank\", edit: rank() },\n      },\n    }),\n    text({\n      fontSize: 13,\n      channels: {\n        x: { value: 56 },\n        y: { field: \"rank\" },\n        text: { field: \"item\" },\n        textAnchor: { value: \"start\" },\n      },\n    }),\n  ],\n}));";
