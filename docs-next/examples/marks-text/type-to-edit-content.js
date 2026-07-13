export const meta = {
  title: "Type to edit content",
  blurb: "editText() wires double-click-to-retype: an inline input opens, Enter commits, Esc cancels.",
  try: "<b>Double-click</b> a label, type, and press Enter.",
};

export const code = "mount(Elicit({\n  width: 360, height: 220,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { x: 3, y: 5, label: \"double-click\" },\n    { x: 7, y: 3, label: \"me too\" },\n  ],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 10] },\n    y: { type: \"quantitative\", domain: [0, 10] },\n    label: { type: \"categorical\" },\n  },\n  features: [\n    text({ fontSize: 14, fill: \"#7b2d8b\",\n      channels: {\n        x: { field: \"x\" }, y: { field: \"y\" },\n        text: { field: \"label\", edit: editText() },\n      } }),\n  ],\n}))";
