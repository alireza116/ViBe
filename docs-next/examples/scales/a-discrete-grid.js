export const meta = {
  title: "A discrete grid",
  blurb: "Both positions are categories, so each dot lands on an (x, y) cell.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 360, height: 300,\n  schema: {\n    x:     { type: \"categorical\", domain: [\"A\", \"B\", \"C\"] },\n    y:     { type: \"ordinal\",     domain: [\"Low\", \"Mid\", \"High\"] },\n    group: { type: \"categorical\", domain: [\"alpha\", \"beta\", \"gamma\"] },\n  },\n  data: [\n    { x: \"A\", y: \"Low\", group: \"alpha\" },\n    { x: \"B\", y: \"Mid\", group: \"beta\" },\n    { x: \"C\", y: \"High\", group: \"gamma\" },\n  ],\n  features: [\n    point({\n      size: 12,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n        fill: { field: \"group\" },\n      },\n    }),\n  ],\n}))";
