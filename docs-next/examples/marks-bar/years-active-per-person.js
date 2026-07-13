export const meta = {
  title: "Years active per person",
  blurb: "barX with x1/x2 spans; y is the category band.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 380, height: 220,\n  margins: { top: 14, right: 16, bottom: 26, left: 60 },\n  data: [\n    { person: \"Ada\",   start: 1830, end: 1852 },\n    { person: \"Grace\", start: 1930, end: 1992 },\n    { person: \"Alan\",  start: 1931, end: 1954 },\n  ],\n  schema: {\n    person: { type: \"categorical\", domain: [\"Ada\", \"Grace\", \"Alan\"] },\n    start:  { type: \"quantitative\", domain: [1820, 2000] },\n    end:    { type: \"quantitative\", domain: [1840, 2000] },\n  },\n  features: [\n    barX({\n      fill: \"#7b2d8b\",\n      channels: {\n        y: { field: \"person\" },\n        x1: { field: \"start\" },\n        x2: { field: \"end\" },\n      },\n    }),\n  ],\n}))";
