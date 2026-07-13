export const meta = {
  title: "A tentative token",
  blurb: "create({ pick: \"probe\" }) shows the dot before it is real. Alt-click removes one.",
  try: "hover a bin, click to drop; alt-click to take back.",
};

export const code = "const bins = [0, 0.2, 0.4, 0.6, 0.8, 1];\nmount(Elicit({\n  width: 420, height: 220,\n  margins: { top: 16, right: 20, bottom: 28, left: 20 },\n  axes: { x: {}, y: false },\n  data: [],\n  schema: {\n    bin: { type: \"categorical\", domain: bins },\n  },\n  scales: { x: { type: \"point\" } },\n  features: [\n    dotStack({\n      channels: { x: { field: \"bin\" } },\n      edits: [\n        create({ pick: \"probe\", channels: [\"x\"], advance: false, when: when.noAlt }),\n        remove({ pick: \"nearest\", when: when.alt }),\n      ],\n      constraints: [ count({ max: 10, strategy: \"reject\" }) ],\n    }),\n  ],\n}));";
