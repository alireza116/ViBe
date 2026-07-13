export const meta = {
  title: "Two-stage point",
  blurb: "Same mark, two staged edits, a Next button.",
  try: "drag horizontally; press Next; drag outward to resize.",
};

export const code = "const chart = Elicit({\n  width: 380, height: 240,\n  margins: { top: 16, right: 16, bottom: 28, left: 16 },\n  axes: { x: {}, y: false },\n  stage: 0,\n  data: [{ x: 5, mag: 12 }],\n  onChange: (d) => console.log(d[0]),\n  schema: {\n    x:   { type: \"quantitative\", domain: [0, 10] },\n    mag: { type: \"quantitative\", domain: [0, 14] },\n  },\n  features: [\n    point({\n      channels: {\n        x: { field: \"x\", edit: drag({ stage: 0 }) },\n        size: { field: \"mag\", edit: resize({ stage: 1 }) },\n      },\n    }),\n  ],\n});\nmount(chart);\nconst label = document.createElement(\"div\");\nconst render = () => { label.textContent = \"stage: \" + chart.getStage(); };\nchart.on(\"stage\", render); render();\nconst btn = document.createElement(\"button\");\nbtn.textContent = \"Next\";\nbtn.onclick = () => chart.nextStage();\nconst controls = document.createElement(\"div\");\ncontrols.style.cssText = \"margin-top:8px;display:flex;gap:10px;align-items:center\";\ncontrols.append(btn, label);\nmount(controls);";
