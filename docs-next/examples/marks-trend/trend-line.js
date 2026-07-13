export const meta = {
  title: "Trend line",
  blurb: "Axes cross at the origin automatically; the line runs edge-to-edge through the plot.",
  try: "drag the centre (intercept) dot; press Next; drag the right (slope) dot.",
};

export const code = "const chart = Elicit({\n  width: 360, height: 300,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  schema: {\n    x: { type: \"quantitative\", domain: [-10, 10] },\n    y: { type: \"quantitative\", domain: [-10, 10] },\n    intercept: { type: \"quantitative\" },\n    slope:     { type: \"quantitative\" },\n  },\n  data: [{ intercept: 0, slope: 0.6 }],\n  features: [\n    trend({\n      interceptStage: 0,\n      slopeStage: 1,\n    }),\n  ],\n});\nmount(chart);\nconst btn = document.createElement(\"button\");\nbtn.textContent = \"Next: set the slope\";\nbtn.style.marginTop = \"8px\";\nbtn.onclick = () => { chart.nextStage(); btn.disabled = true; };\nmount(btn);";
