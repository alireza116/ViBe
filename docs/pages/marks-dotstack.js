// Stacked dot plot — dotStack / dotStackY / dotStackX.
export default {
    path: 'marks/dotstack.html',
    title: 'Stacked dots',
    lead:
        'A <b>dot histogram</b> — the "drop tokens into slots" elicitation. Each datum is one ' +
        'token; tokens sharing a slot stack into a countable column. Click an empty slot to add ' +
        'a token (<code class="inline">create</code>), click a token to remove it ' +
        '(<code class="inline">remove</code>). The belief is just how many tokens sit in each ' +
        'slot — <code class="inline">data.filter(d => d.bin === b).length</code>.',
    api: [
        {
            name: 'dotStack(options) · dotStackY(options) · dotStackX(options)',
            summary:
                'Import from <code class="inline">vibe.plot</code>. The category axis is a ' +
                'band/point scale over the discrete slots. <code class="inline">dotStackY</code> ' +
                'stacks upward (category on x); <code class="inline">dotStackX</code> rightward ' +
                '(category on y); <code class="inline">dotStack</code> auto-detects.',
            signatures: [
                'dotStack({ encoding, r, gap, ghost, label, edits, constraints, id }) → Feature',
            ],
            options: [
                { name: 'encoding', type: 'object', default: '{}', desc: 'A band/point category axis whose <code class="inline">domain</code> is the slot list.' },
                { name: 'r', type: 'number', default: '7', desc: 'Token radius (fixed geometry — the stack offset is 2r + gap per token).' },
                { name: 'gap', type: 'number', default: '2', desc: 'Vertical gap between stacked tokens.' },
                { name: 'ghost', type: 'boolean', default: 'true', desc: 'Draw a faint open ring at each slot\'s next position (a droppable affordance).' },
                { name: 'label', type: 'boolean', default: 'false', desc: 'Draw the per-slot count above each column.' },
            ],
            channels: [
                { name: 'x / y', type: 'band | point', desc: 'The category (slot) axis; the other axis is a pure count of stacked tokens.' },
            ],
            returns: 'A <b>feature</b> emitting one <code class="inline">circle</code> per token, plus optional ghost rings and count labels.',
        },
    ],
    sections: [
        {
            id: 'basics',
            title: 'Dropping tokens',
            intro: 'Click to drop a token into the nearest slot; click a token to take it back. count() caps the budget.',
            examples: [
                {
                    title: 'Probability tokens over bins',
                    blurb: 'A discrete point scale of bins 0–1; 25-token budget.',
                    try: 'click the plane to add, click a dot to remove.',
                    code:
`const bins = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1];
mount(Elicit({
  width: 560, height: 260,
  margins: { top: 20, right: 16, bottom: 28, left: 16 },
  x: { type: "point", domain: bins },
  axes: { x: {}, y: false },
  data: [
    { bin: 0.3 }, { bin: 0.3 }, { bin: 0.3 },
    { bin: 0.4 }, { bin: 0.4 }, { bin: 0.5 },
  ],
  onChange: (d) => console.log("tokens:", d.length),
  features: [
    dotStack({
      encoding: { x: { field: "bin", type: "point", domain: bins } },
      edits: [ create({ trigger: "click", channels: ["x"] }), remove() ],
      constraints: [ count({ max: 25 }) ],
      label: true,
    }),
  ],
}));`,
                },
                {
                    title: 'Tentative dot on hover (probe)',
                    blurb: 'create({ pick: "probe" }) shows the token before it is real; the click commits it.',
                    try: 'hover a bin — a dot appears but is not counted until you click. Alt-click removes.',
                    code:
`const bins = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1];
const chart = Elicit({
  width: 560, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 16 },
  x: { type: "point", domain: bins },
  axes: { x: {}, y: false },
  data: [],
  features: [
    dotStack({
      id: "tokens",
      encoding: { x: { field: "bin", type: "point", domain: bins } },
      edits: [
        // Hover previews the drop; the click commits it. advance:false keeps the
        // edit live so you can keep dropping tokens.
        create({ pick: "probe", channels: ["x"], advance: false, when: when.noAlt }),
        // The plane owns the pointer in probe mode, so removal picks the nearest.
        remove({ pick: "nearest", when: when.alt }),
      ],
      constraints: [ count({ max: 20, strategy: "reject" }) ],
    }),
  ],
});
mount(chart);
const out = document.createElement("div");
out.style.cssText = "font:12px ui-monospace,monospace;color:#64748b";
const show = () => { out.textContent = "committed tokens: " + chart.getData().length + " / 20"; };
chart.on("change", show); show();
mount(out);`,
                },
                {
                    title: 'Per-slot cap with unique',
                    blurb: 'unique({ field, max }) limits the height of any one column.',
                    code:
`const cats = ["A","B","C","D"];
mount(Elicit({
  width: 420, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 16 },
  x: { type: "band", domain: cats },
  axes: { x: {}, y: false },
  data: [{ bin: "A" }, { bin: "B" }, { bin: "B" }],
  features: [
    dotStack({
      encoding: { x: { field: "bin", type: "band", domain: cats } },
      edits: [ create({ trigger: "click", channels: ["x"] }), remove() ],
      constraints: [ unique({ field: "bin", max: 5, strategy: "reject" }) ],
      label: true,
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
