export const meta = {
  title: "Drag and retype together",
  blurb: "Mark-level drag plus editText on the text channel: drag repositions, double-click retypes.",
  try: "<b>Drag</b> to move; <b>double-click</b> to rename.",
};

export const code = "mount(Elicit({\n  width: 360, height: 220,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { x: 3, y: 5, label: \"move me\" },\n    { x: 7, y: 3, label: \"rename me\" },\n  ],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 10] },\n    y: { type: \"quantitative\", domain: [0, 10] },\n    label: { type: \"categorical\" },\n  },\n  features: [\n    text({ fontSize: 14, fill: \"#b45309\",\n      channels: {\n        x: { field: \"x\" }, y: { field: \"y\" },\n        text: { field: \"label\", edit: editText() },\n      },\n      edits: [ drag({ channels: [\"x\", \"y\"] }) ],\n    }),\n  ],\n}))";
