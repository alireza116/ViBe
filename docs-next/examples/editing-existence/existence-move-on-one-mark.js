export const meta = {
  title: "Existence + move on one mark",
  blurb: "dblclick adds, Alt-click removes, drag moves.",
  try: "<b>Double-click</b> to add · <b><kbd>Alt</kbd>+click</b> a dot to delete · <b>Drag</b> to move.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [{ x: 30, y: 40 }, { x: 65, y: 65 }],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      fill: \"#0d9488\",\n      size: 8,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [\n        drag({ channels: [\"x\", \"y\"] }),\n        create({ trigger: \"dblclick\" }),\n        remove({ when: when.alt }),\n      ],\n    }),\n  ],\n}))";
