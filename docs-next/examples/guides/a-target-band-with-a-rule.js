export const meta = {
  title: "A target band with a rule",
  blurb: "guides.region shades 40–60; guides.rule marks the midpoint. Drag the dots across them.",
  try: "<b>Drag</b> a dot in and out of the target band.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  guides: [\n    guides.region({ y: [40, 60], fill: \"#0d9488\", opacity: 0.14 }),\n    guides.rule({ y: 50, label: \"target 50\" }),\n  ],\n  data: [{ x: 20, y: 30 }, { x: 50, y: 55 }, { x: 80, y: 70 }],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      fill: \"#0d9488\",\n      size: 9,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [ drag({ channels: [\"x\", \"y\"] }) ],\n    }),\n  ],\n}))";
