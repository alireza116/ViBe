export const meta = {
  title: "Formatted numeric labels",
  blurb: "format is display-only (a d3-format string or a helper from format.*). The field stays the raw number, so a later drag still inverts correctly.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 360, height: 240,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { cat: \"A\", n: 0.42 },\n    { cat: \"B\", n: 0.75 },\n    { cat: \"C\", n: 0.18 },\n  ],\n  schema: {\n    cat: { type: \"categorical\", domain: [\"A\", \"B\", \"C\"] },\n    n:   { type: \"quantitative\", domain: [0, 1] },\n  },\n  features: [\n    barY({ fill: \"#0d9488\",\n      channels: { x: { field: \"cat\" }, y: { field: \"n\" } } }),\n    text({ fontSize: 12, dy: -6, lineAnchor: \"bottom\",\n      format: format.percent(\".0%\"),\n      channels: {\n        x: { field: \"cat\" }, y: { field: \"n\" },\n        text: { field: \"n\" },\n      } }),\n  ],\n}))";
