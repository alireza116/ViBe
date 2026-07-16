// Tick mark — tick / tickX / tickY.
export default {
    path: 'marks/tick.html',
    title: 'Tick',
    lead:
        'A tick is bar’s zero-thickness sibling: a thin line marking a value on the linear ' +
        'axis and spanning the other axis. Over a category band it reads as a value marker ' +
        '(like a bar without the fill); over a full continuous extent it reads as a rug / strip. ' +
        '<code class="inline">inset</code> shrinks each end, <code class="inline">length</code> ' +
        'fixes a centered length.',
    api: [
        {
            name: 'tick(options) · tickY(options) · tickX(options)',
            summary:
                'Import from <code class="inline">vibe.plot</code>. <code class="inline">tick</code> ' +
                'infers the value axis from which axis is a band; <code class="inline">tickY</code> ' +
                'marks a value on y (spans the x band), <code class="inline">tickX</code> on x.',
            signatures: [
                'tick({ channels, inset, length, edits, constraints, id }) → Feature',
                'tickY(options) → Feature   // value on y',
                'tickX(options) → Feature   // value on x',
            ],
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'One band axis (span) + one linear axis (the marked value). See <b>Channels</b>.' },
                { name: 'inset', type: 'number', default: '0', desc: 'Pixels to shrink each end of the span.' },
                { name: 'length', type: 'number', default: '—', desc: 'Explicit centered span length in pixels. On a band axis it centres in the band; when the span axis also has a channel (e.g. scatter x+y), it centres on that channel’s encoded position so a short tick sits on the datum.' },
                { name: 'edits', type: 'Edit[]', default: '—', desc: 'Mark-level edits; per-channel edits live in the channels map.' },
                { name: 'constraints', type: 'Constraint[]', default: '—', desc: 'Data invariants. Sugar — promoted to the dataset, so they hold for every edit from every mark.' },
                { name: 'stroke, strokeWidth, …', type: 'style', default: "stroke:'steelblue'", desc: 'Style shorthands / channels.' },
            ],
            channels: [
                { name: 'x', type: 'band | linear', desc: 'Category (band) or value (linear), per orientation.' },
                { name: 'y', type: 'band | linear', desc: 'The other axis; the value axis carries <code class="inline">edit: drag()</code> to drag the tick.' },
                { name: 'stroke, strokeWidth, opacity', type: 'const | field', desc: 'Standard style surface.' },
            ],
            returns: 'A <b>feature</b> emitting one <code class="inline">line</code> per datum (a bar with zero thickness).',
        },
    ],
    sections: [
        {
            id: 'value-marker',
            title: 'A value marker across bands',
            intro:
                'tickY marks a y value spanning each category’s band — the same channel/edit ' +
                'model as a bar, so it drags identically.',
            examples: [
                {
                    title: 'Ticks over a band axis',
                    blurb: 'One tick per category, spanning the band at its y value.',
                    code:
`mount(Elicit({
  width: 380, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: "A", y: 20 }, { x: "B", y: 45 },
    { x: "C", y: 30 }, { x: "D", y: 60 },
  ],
  schema: {
    x: { type: "categorical", domain: ["A", "B", "C", "D"] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    tickY({
      stroke: "#4f46e5", strokeWidth: 3,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Drag a value (ticks)',
                    blurb: 'Same y edit as a bar; pick: "nearest" grabs the tick from anywhere in its column.',
                    try: '<b>Drag</b> a tick up or down — from anywhere in its column.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: "A", y: 20 }, { x: "B", y: 45 },
    { x: "C", y: 30 }, { x: "D", y: 60 },
  ],
  schema: {
    x: { type: "categorical", domain: ["A", "B", "C", "D"] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    tickY({
      stroke: "#4f46e5", strokeWidth: 3,
      channels: {
        x: { field: "x" },
        y: { field: "y",
             edit: drag({ pick: "nearest" }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'rug',
            title: 'A rug / strip plot',
            intro:
                'With no band on the other axis, a tick spans the full extent — a strip of marks ' +
                'at each datum’s position. inset trims the ends so the strip floats off the frame.',
            examples: [
                {
                    title: 'tickX — a distribution strip',
                    blurb: 'Values along x, each drawn as a vertical mark spanning y. inset shortens them.',
                    code:
`mount(Elicit({
  width: 400, height: 200,
  margins: { top: 16, right: 16, bottom: 28, left: 16 },
  data: [
    { v: 12 }, { v: 18 }, { v: 21 }, { v: 34 }, { v: 39 },
    { v: 41 }, { v: 55 }, { v: 58 }, { v: 63 }, { v: 71 }, { v: 84 },
  ],
  schema: {
    v: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    tickX({
      stroke: "#0d9488", strokeWidth: 2, inset: 10,
      channels: {
        x: { field: "v" },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
