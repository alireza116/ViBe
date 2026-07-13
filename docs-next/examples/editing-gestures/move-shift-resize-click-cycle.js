export const meta = {
  title: "Move · Shift-resize · click-cycle",
  blurb: "when.noShift / when.shift split the drag; cycle() advances the fill category.",
  try: "<b>Drag</b> to move · <b><kbd>Shift</kbd>+drag</b> to resize · <b>Click</b> to recolour.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: 24, y: 70, mag: 5, team: \"A\" },\n    { x: 55, y: 34, mag: 9, team: \"B\" },\n    { x: 80, y: 60, mag: 12, team: \"C\" },\n  ],\n  schema: {\n    x:    { type: \"quantitative\", domain: [0, 100] },\n    y:    { type: \"quantitative\", domain: [0, 100] },\n    mag:  { domain: [0, 14] },\n    team: { domain: [\"A\", \"B\", \"C\"] },\n  },\n  features: [\n    point({\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n        size: { field: \"mag\" },\n        fill: { field: \"team\", edit: cycle() },\n      },\n      edits: [\n        drag({ channels: [\"x\", \"y\"], when: when.noShift }),  // plain drag = move\n        resize({ channel: \"size\", when: when.shift }),        // shift-drag = resize\n      ],\n      constraints: [ clamp({ field: \"mag\", min: 1, max: 14 }) ],\n    }),\n  ],\n}))";
