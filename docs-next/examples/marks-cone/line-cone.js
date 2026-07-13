export const meta = {
  title: "Line + Cone",
  blurb: "Move to aim, click to set. Move to open the cone, click to set that too.",
  try: "move the mouse, click, move again, click.",
};

export const code = "mount(Elicit({\n  width: 360, height: 320,\n  margins: { top: 20, right: 20, bottom: 20, left: 20 },\n  axes: false,\n  data: [{ r: 0, spread: 0 }],\n  onChange: (d) => console.log(d[0]),\n  schema: {\n    r:      { type: \"quantitative\", domain: [-1, 1] },\n    spread: { type: \"quantitative\", domain: [0, 1] },\n  },\n  features: [\n    cone({\n      channels: {\n        // Schema owns the domain (r units); the scale owns the range (degrees).\n        angle: { field: \"r\", scale: { range: [-45, 45] },\n                 edit: rotate({ pick: \"probe\", stage: 0 }) },\n        spread: { field: \"spread\", scale: { range: [0, 45] },\n                  edit: rotate({ pick: \"probe\", stage: 1,\n                                 relativeTo: \"angle\" }) },\n      },\n      samples: 60, wedge: true,\n    }),\n  ],\n}));";
