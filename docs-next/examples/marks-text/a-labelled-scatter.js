export const meta = {
  title: "A labelled scatter",
  blurb: "point for the dots, text for the labels above them — dy + lineAnchor park the string above the point.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 360, height: 260,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { gdp: 3, life: 6, name: \"Ada\" },\n    { gdp: 6, life: 8, name: \"Grace\" },\n    { gdp: 8, life: 4, name: \"Alan\" },\n  ],\n  schema: {\n    gdp:  { type: \"quantitative\", domain: [0, 10] },\n    life: { type: \"quantitative\", domain: [0, 10] },\n    name: { type: \"categorical\", domain: [\"Ada\", \"Grace\", \"Alan\"] },\n  },\n  features: [\n    point({ fill: \"#4f46e5\",\n      channels: { x: { field: \"gdp\" }, y: { field: \"life\" } } }),\n    text({ fontSize: 12, dy: -10, lineAnchor: \"bottom\",\n      channels: {\n        x: { field: \"gdp\" }, y: { field: \"life\" },\n        text: { field: \"name\" },\n      } }),\n  ],\n}))";
