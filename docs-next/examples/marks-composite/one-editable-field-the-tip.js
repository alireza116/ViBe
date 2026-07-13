export const meta = {
  title: "One editable field (the tip)",
  blurb: "The stem is a span ruleX (baseline → value); the tip point edits value.",
  try: "<b>Drag</b> a lollipop tip up or down.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { g: \"A\", value: 40 }, { g: \"B\", value: 62 },\n    { g: \"C\", value: 48 }, { g: \"D\", value: 75 },\n  ],\n  schema: {\n    g:     { type: \"categorical\" },\n    value: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    composite({\n      id: \"lollipop\",\n      parts: [\n        ruleX({\n          stroke: \"#94a3b8\", strokeWidth: 2,\n          channels: { x: { field: \"g\" }, y2: { field: \"value\" } },\n        }),\n        point({\n          fill: \"steelblue\", size: 7,\n          channels: {\n            x: { field: \"g\" },\n            y: { field: \"value\", edit: drag() },\n          },\n        }),\n      ],\n    }),\n  ],\n}))";
