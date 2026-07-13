export const meta = {
  title: "As a widget",
  blurb: "Crosshair frame and high/low variable labels are guides.",
  try: "move, click, move, click.",
};

export const code = "const chart = Elicit(widgets.lineCone({\n  question: \"What is the relationship?\",\n  x: \"Exercise amount\", y: \"Body weight\",\n}));\nmount(chart);\nconst out = document.createElement(\"div\");\nout.style.cssText = \"font:12px ui-monospace,monospace;color:#64748b\";\nconst show = () => {\n  const d = chart.getData()[0];\n  out.textContent = \"stage \" + chart.getStage() +\n    \"  ·  r=\" + d.r.toFixed(2) + \"  spread=\" + d.spread.toFixed(2);\n};\nchart.on(\"change\", show); chart.on(\"stage\", show); show();\nmount(out);";
