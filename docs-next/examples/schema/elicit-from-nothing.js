export const meta = {
  title: "Elicit from nothing",
  blurb: "schema declares age / belief / class; create mints fully-formed data.",
  try: "<b>Double-click</b> to create · <b>drag</b> to move · <b>click</b> to cycle the class colour.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 16, right: 16, bottom: 30, left: 36 },\n  schema: {\n    age:    { type: \"quantitative\", domain: [0, 100] },\n    belief: { type: \"quantitative\", domain: [0, 1], default: 0.5 },\n    class:  { type: \"categorical\",  domain: [\"A\", \"B\", \"C\"] },\n  },\n  axes: { x: { title: \"age\" }, y: { title: \"belief\" } },\n  data: [],   // start from nothing\n  onChange: (d) => console.log(\"elicited\", d),\n  features: [\n    point({\n      size: 7, stroke: \"#1f2733\", strokeWidth: 1,\n      channels: {\n        x: { field: \"age\" }, y: { field: \"belief\" },\n        fill: { field: \"class\" },\n      },\n      edits: [\n        create({ trigger: \"dblclick\" }),\n        drag({ channels: [\"x\", \"y\"] }),\n        cycle({ channel: \"fill\", gesture: \"click\" }),\n      ],\n    }),\n  ],\n}))";
