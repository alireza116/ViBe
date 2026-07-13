export const meta = {
  title: "Line, then cone",
  blurb: "Move to aim the line, click. Move to open the cone, click. Both are then frozen.",
  try: "move the mouse, click, move again, click.",
};

export const code = "const chart = Elicit({\n  width: 360, height: 320,\n  margins: { top: 20, right: 20, bottom: 20, left: 20 },\n  axes: false,\n  data: [{ r: 0, spread: 0 }],\n  schema: {\n    r:      { type: \"quantitative\", domain: [-1, 1] },\n    spread: { type: \"quantitative\", domain: [0, 1] },\n  },\n  features: [\n    cone({\n      id: \"belief\",\n      channels: {\n        angle: { field: \"r\", scale: { range: [-45, 45] },\n                 edit: rotate({ pick: \"probe\", stage: 0 }) },\n        spread: { field: \"spread\", scale: { range: [0, 45] },\n                  edit: rotate({ pick: \"probe\", stage: 1, relativeTo: \"angle\" }) },\n      },\n      samples: 60, wedge: true,\n    }),\n  ],\n});\nmount(chart);\nconst out = document.createElement(\"div\");\nout.style.cssText = \"font:12px ui-monospace,monospace;margin-top:6px;color:#64748b\";\nconst show = () => {\n  const d = chart.getData()[0] || {};\n  out.textContent = \"stage \" + chart.getStage() +\n    \"  ·  committed r=\" + (d.r ?? 0).toFixed(2) + \" spread=\" + (d.spread ?? 0).toFixed(2);\n};\nchart.on(\"change\", show); chart.on(\"stage\", show); show();\nmount(out);";
