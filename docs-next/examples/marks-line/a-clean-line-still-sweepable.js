export const meta = {
  title: "A clean line, still sweepable",
  blurb: "handles: false hides the dots; the sweep edit still works.",
  try: "<b>Sweep</b> across — no handles, but the line still responds.",
};

export const code = "mount(Elicit({\n  width: 400, height: 240,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: 0, y: 50 }, { x: 1, y: 50 }, { x: 2, y: 50 }, { x: 3, y: 50 },\n    { x: 4, y: 50 }, { x: 5, y: 50 }, { x: 6, y: 50 }, { x: 7, y: 50 },\n  ],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x: { type: \"quantitative\", domain: [0, 7] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    lineY({\n      stroke: \"#7c3aed\", strokeWidth: 3, curve: \"catmullRom\",\n      handles: false,   // hide the anchor dots (still editable)\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\",\n             edit: drag({ pick: \"sweep\", guide: true }) },\n      },\n    }),\n  ],\n}))";
