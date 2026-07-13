export const meta = {
  title: "Drag to reposition",
  blurb: "Mark-level drag({ channels: [\"x\",\"y\"] }) moves the label; writes x/y back through the scales. (Do not put <code class=\"inline\">edit</code> as a channel key — attach it on a channel or via <code class=\"inline\">edits</code>.)",
  try: "<b>Drag</b> a label to move it.",
};

export const code = "mount(Elicit({\n  width: 360, height: 240,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { x: 3, y: 4, label: \"drag me\" },\n    { x: 6, y: 7, label: \"and me\" },\n  ],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 10] },\n    y: { type: \"quantitative\", domain: [0, 10] },\n    label: { type: \"categorical\", domain: [\"drag me\", \"and me\"] },\n  },\n  features: [\n    text({ fontSize: 13, fill: \"#2563eb\",\n      channels: {\n        x: { field: \"x\" }, y: { field: \"y\" },\n        text: { field: \"label\" },\n      },\n      edits: [ drag({ channels: [\"x\", \"y\"] }) ],\n    }),\n  ],\n}))";
