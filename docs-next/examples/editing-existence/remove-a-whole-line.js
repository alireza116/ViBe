export const meta = {
  title: "Remove a whole line",
  blurb: "remove deletes one anchor; edit.line.removeSeries() deletes the whole line — click any point on a line to remove it. The delete counterpart to anchor / newSeries / draw.",
  try: "<b>Alt-click</b> a point to delete just that anchor · <b>click</b> a point to remove its entire line.",
};

export const code = "mount(Elicit({\n  width: 420, height: 300,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { s: 0, x: 20, y: 30 }, { s: 0, x: 45, y: 70 }, { s: 0, x: 75, y: 40 },\n    { s: 1, x: 30, y: 80 }, { s: 1, x: 60, y: 20 }, { s: 1, x: 85, y: 60 },\n  ],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    connectedScatter({\n      stroke: \"#0d9488\", strokeWidth: 3, series: \"s\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [\n        remove({ when: when.alt }),                        // Alt-click: one anchor\n        edit.line.removeSeries({ series: \"s\", when: when.noAlt }), // click: whole line\n      ],\n    }),\n  ],\n}))";
