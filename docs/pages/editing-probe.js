// Probe — the hover-preview / click-commit interaction.
export default {
    path: 'editing/probe.html',
    title: 'Probe',
    lead:
        'The <b>hover / click</b> flow, with no drag: the pointer <b>probes</b> a value — the mark ' +
        'follows the cursor as an uncommitted preview — and a click <b>settles</b> it. Give any ' +
        'edit <code class="inline">pick: "probe"</code> and it works this way, so the same ' +
        'primitive drives a correlation line, a slider knob, a Likert answer and a dot plot\'s ' +
        'tentative token. Add a <code class="inline">stage</code> and each click commits that ' +
        'stage\'s field and advances to the next — "set the line, now open the cone".',
    api: [
        {
            name: 'anyEdit({ pick: "probe", stage, advance })',
            summary:
                'Not a new edit — a <b>pick</b>, i.e. a driver (<code class="inline">src/edit/drivers/probe.js' +
                '</code>). It runs the edit you gave it twice through one shared code path: on ' +
                '<code class="inline">hover</code> the proposal is parked as a preview, on ' +
                '<code class="inline">click</code> the identical proposal is committed. The preview ' +
                'therefore <i>is</i> what the click writes — it cannot drift.',
            signatures: [
                'rotate({ pick: "probe", stage: 0 })          // line follows the pointer; click sets it',
                'drag({ pick: "probe", advance: false })      // a knob that tracks then settles',
                'create({ pick: "probe", advance: false })    // a tentative dot, made real on click',
                'toggle({ pick: "probe", channels: ["x","y"] })  // preview a cell being (un)picked',
            ],
            options: [
                { name: 'stage', type: 'number', default: 'null', desc: 'Active only in this stage. A click settling it advances the chart to the next stage, freezing the field.' },
                { name: 'advance', type: 'boolean', default: 'true', desc: 'Set <code class="inline">false</code> so a click commits without advancing — the edit stays live for repeated answers.' },
            ],
            returns:
                'Previews never reach <code class="inline">onChange</code>, <code class="inline">getData</code> ' +
                'or the belief store; leaving the plot discards the proposal. Constraints run on the preview too, ' +
                'so a rejected value never even previews.',
        },
    ],
    sections: [
        {
            id: 'twostep',
            title: 'Two questions, two clicks',
            intro: 'Stage 0 owns the angle, stage 1 owns the spread. The driver advances on each click; no app code, no buttons.',
            examples: [
                {
                    title: 'Line, then cone',
                    blurb: 'Move to aim the line, click. Move to open the cone, click. Both are then frozen.',
                    try: 'move the mouse, click, move again, click.',
                    code:
`const chart = Elicit({
  width: 360, height: 320,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  axes: false,
  data: [{ r: 0, spread: 0 }],
  schema: {
    r:      { type: "quantitative", domain: [-1, 1] },
    spread: { type: "quantitative", domain: [0, 1] },
  },
  features: [
    cone({
      id: "belief",
      channels: {
        angle: { field: "r", scale: { range: [-45, 45] },
                 edit: rotate({ pick: "probe", stage: 0 }) },
        spread: { field: "spread", scale: { range: [0, 45] },
                  edit: rotate({ pick: "probe", stage: 1, relativeTo: "angle" }) },
      },
      samples: 60, wedge: true,
    }),
  ],
});
mount(chart);
const out = document.createElement("div");
out.style.cssText = "font:12px ui-monospace,monospace;margin-top:6px;color:#64748b";
const show = () => {
  const d = chart.getData()[0] || {};
  out.textContent = "stage " + chart.getStage() +
    "  ·  committed r=" + (d.r ?? 0).toFixed(2) + " spread=" + (d.spread ?? 0).toFixed(2);
};
chart.on("change", show); chart.on("stage", show); show();
mount(out);`,
                },
            ],
        },
        {
            id: 'preview',
            title: 'The preview is the commit',
            intro:
                'A hover proposes; getData() still reports the last committed belief. The knob below tracks ' +
                'the pointer, but the readout only moves when you click.',
            examples: [
                {
                    title: 'Probe a single value',
                    blurb: 'drag({ pick: "probe" }) — no dragging involved, just move and click.',
                    try: 'move across the track, then click.',
                    code:
`const chart = Elicit({
  width: 380, height: 130,
  margins: { top: 20, right: 24, bottom: 34, left: 24 },
  axes: { x: {}, y: false },
  data: [{ v: 20 }],
  schema: {
    v: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      id: "belief",
      size: 9, fill: "#2563eb",
      channels: { x: { field: "v",
                       edit: drag({ pick: "probe", advance: false }) },},
      constraints: [ clamp({ min: 0, max: 100, field: "v" }) ],
    }),
  ],
});
mount(chart);
const out = document.createElement("div");
out.style.cssText = "font:12px ui-monospace,monospace;color:#64748b";
const show = () => { out.textContent = "committed: " + chart.getData()[0].v.toFixed(0); };
chart.on("change", show); show();
mount(out);`,
                },
                {
                    title: 'A tentative token',
                    blurb: 'create({ pick: "probe" }) shows the dot before it is real. Alt-click removes one.',
                    try: 'hover a bin, click to drop; alt-click to take back.',
                    code:
`const bins = [0, 0.2, 0.4, 0.6, 0.8, 1];
mount(Elicit({
  width: 420, height: 220,
  margins: { top: 16, right: 20, bottom: 28, left: 20 },
  axes: { x: {}, y: false },
  data: [],
  schema: {
    bin: { type: "categorical", domain: bins },
  },
  scales: { x: { type: "point" } },
  features: [
    dotStack({
      channels: { x: { field: "bin" } },
      edits: [
        create({ pick: "probe", channels: ["x"], advance: false, when: when.noAlt }),
        remove({ pick: "nearest", when: when.alt }),
      ],
      constraints: [ count({ max: 10, strategy: "reject" }) ],
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
