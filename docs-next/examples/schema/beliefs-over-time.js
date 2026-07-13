export const meta = {
  title: "Beliefs over time",
  blurb: "A temporal domain drives a time scale; created points carry real Dates.",
  try: "<b>Double-click</b> to record a belief at a point in time · <b>drag</b> to adjust.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 16, right: 16, bottom: 30, left: 36 },\n  schema: {\n    when:   { type: \"temporal\", domain: [\"2020-01-01\", \"2026-01-01\"] },\n    belief: { type: \"quantitative\", domain: [0, 1], default: 0.5 },\n  },\n  axes: { x: { title: \"when\" }, y: { title: \"belief\" } },\n  data: [],\n  features: [\n    point({\n      size: 7, fill: \"#0d9488\", stroke: \"#0f5c53\", strokeWidth: 1,\n      channels: {\n        x: { field: \"when\" }, y: { field: \"belief\" },\n      },\n      edits: [\n        create({ trigger: \"dblclick\" }),\n        drag({ channels: [\"x\", \"y\"] }),\n      ],\n    }),\n  ],\n}))";
