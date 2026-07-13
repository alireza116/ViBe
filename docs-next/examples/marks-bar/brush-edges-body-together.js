export const meta = {
  title: "Brush: edges + body together",
  blurb: "brushSpan() combines both: grab near an edge to resize just that end, grab the body to move the whole span. Drag an edge past the other and release — the fields re-sort (start stays ≤ end) with no visual jump.",
  try: "<b>Drag</b> an edge to resize it, the body to move the whole bar, or drag one edge past the other to see it flip.",
};

export const code = "mount(Elicit({\n  width: 380, height: 220,\n  margins: { top: 14, right: 16, bottom: 26, left: 60 },\n  data: [\n    { person: \"Ada\",   start: 1830, end: 1852 },\n    { person: \"Grace\", start: 1930, end: 1992 },\n    { person: \"Alan\",  start: 1931, end: 1954 },\n  ],\n  schema: {\n    person: { type: \"categorical\", domain: [\"Ada\", \"Grace\", \"Alan\"] },\n    start:  { type: \"quantitative\", domain: [1820, 2000] },\n    end:    { type: \"quantitative\", domain: [1840, 2000] },\n  },\n  features: [\n    barX({\n      fill: \"#2563eb\",\n      channels: {\n        y: { field: \"person\" },\n        x1: { field: \"start\" },\n        x2: { field: \"end\" },\n      },\n      edits: [\n        brushSpan({ channels: [\"x1\", \"x2\"], threshold: 40,\n                    edgeInset: 10, guide: true }),\n      ],\n    }),\n  ],\n}))";
