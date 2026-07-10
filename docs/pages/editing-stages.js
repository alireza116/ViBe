// Stages — multi-step elicitation.
export default {
    path: 'editing/stages.html',
    title: 'Stages',
    lead:
        'Multi-step elicitation: "first do X, then do Y". An edit may carry a numeric ' +
        '<code class="inline">stage</code>; it is active only when it equals the chart\'s ' +
        'current stage (edits with no stage are always active). This is a uniform gate applied ' +
        'to every edit — the same shape as gesture matching, not a new interaction mode — so ' +
        'stages compose with every mark and edit. Advance from the container: ' +
        '<code class="inline">nextStage()</code>, <code class="inline">setStage(n)</code>, ' +
        '<code class="inline">getStage()</code>, <code class="inline">on("stage", cb)</code>.',
    api: [
        {
            name: 'edit({ stage }) · container.setStage / nextStage / getStage',
            summary:
                'Add <code class="inline">stage</code> to any edit factory. The engine filters ' +
                'edits by the current stage in dispatch, cursor, plane-on-top, and guides — one gate everywhere.',
            signatures: [
                'drag({ stage: 1 })            // active only in stage 1',
                'const el = Elicit({ stage: 0, ... });',
                'el.getStage() → number',
                'el.setStage(n)               // set, emit "stage", re-render',
                'el.nextStage()               // setStage(current + 1)',
                'el.on("stage", (n) => …)     // subscribe; returns an unsubscribe fn',
            ],
        },
    ],
    sections: [
        {
            id: 'basics',
            title: 'Place, then size',
            intro: 'Stage 0 drags the point along x (where); stage 1 resizes it (how confident). Only one edit is live at a time.',
            examples: [
                {
                    title: 'Two-stage point',
                    blurb: 'Same mark, two staged edits, a Next button.',
                    try: 'drag horizontally; press Next; drag outward to resize.',
                    code:
`const chart = Elicit({
  width: 380, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 16 },
  x: { type: "linear", domain: [0, 10] },
  axes: { x: {}, y: false },
  stage: 0,
  data: [{ x: 5, mag: 12 }],
  onChange: (d) => console.log(d[0]),
  features: [
    point({
      encoding: {
        x:    { field: "x",   type: "linear", domain: [0, 10], edit: drag({ stage: 0 }) },
        size: { field: "mag", edit: resize({ stage: 1 }) },
      },
    }),
  ],
});
mount(chart);
const label = document.createElement("div");
const render = () => { label.textContent = "stage: " + chart.getStage(); };
chart.on("stage", render); render();
const btn = document.createElement("button");
btn.textContent = "Next";
btn.onclick = () => chart.nextStage();
const controls = document.createElement("div");
controls.style.cssText = "margin-top:8px;display:flex;gap:10px;align-items:center";
controls.append(btn, label);
mount(controls);`,
                },
            ],
        },
    ],
};
