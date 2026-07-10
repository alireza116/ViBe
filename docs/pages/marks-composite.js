// Composite — glyphs built by grouping existing marks over the shared dataset.
export default {
    path: 'marks/composite.html',
    title: 'Composite',
    lead:
        'A <b>composite</b> mark is a glyph: a named <b>group of ordinary marks</b> over ' +
        'the chart’s one dataset. Each part encodes some columns of the same rows; a part ' +
        'whose channel carries an <code class="inline">edit</code> is a handle. Drag a ' +
        'handle and it writes its field; on the next render every other part re-derives ' +
        'from the changed rows — the same reactive model the guide layer uses. ' +
        'Composite is a <b>desugaring</b>, not a new kind of feature: it returns its parts ' +
        'as plain features and <code class="inline">Elicit</code> flattens them, exactly as ' +
        'the <code class="inline">axes</code> convenience desugars into axis marks. ' +
        'Because each handle is its own mark, dragging one <i>cannot</i> move another — ' +
        'dispatch already routes a gesture to the feature owning the node you touched.',
    api: [
        {
            name: 'composite(options)',
            summary:
                'A glyph: a group of marks over the shared dataset. Import from ' +
                '<code class="inline">vibe.plot</code>. Returns an <b>array of features</b>, ' +
                'which <code class="inline">Elicit</code> flattens into its ' +
                '<code class="inline">features</code> list.',
            signature:
                'composite({ parts, constraints, categoricalScale, id }) → Feature[]',
            options: [
                { name: 'parts', type: 'Mark[]', default: '[]', desc: 'The sub-marks, in z-order (visual parts first, handles last). Ordinary mark instances — a <code class="inline">ruleX</code> whisker, a <code class="inline">point</code> dot, a <code class="inline">tick</code> cap. A part with an <code class="inline">edit</code> on a channel is a handle; a part without one is inert and the engine makes it <code class="inline">pointerEvents:"none"</code> so it can’t swallow a sibling’s drag.' },
                { name: 'constraints', type: 'Constraint[]', default: '—', desc: 'Group-level data invariants. Promoted into the <b>dataset’s</b> constraint set, so they gate and repair every edit — including one made through a different part. See <b>Constraints</b>.' },
                { name: 'categoricalScale', type: "'band' | 'point'", default: "'band'", desc: 'Stamped onto any part that doesn’t declare its own. A glyph usually sits in a band slot.' },
                { name: 'id', type: 'string', default: "'composite'", desc: 'Prefix for the parts’ generated ids (<code class="inline">id/0</code>, <code class="inline">id/1</code>, …), so each part keeps a stable identity across renders.' },
            ],
            returns:
                'An <b>array of features</b> — the parts, with ids assigned and the group’s ' +
                'constraints attached. Nothing about the glyph reaches the engine: it sees ' +
                'four ordinary marks reading the one dataset.',
        },
    ],
    sections: [
        {
            id: 'lollipop',
            title: 'Lollipop — drag the tip',
            intro:
                'A stem (a span rule from the baseline to the value) plus a draggable tip. ' +
                'Two marks: the <code class="inline">ruleX</code> draws the stem and carries ' +
                'no edit, so it is inert; the <code class="inline">point</code> is the handle ' +
                'and edits <code class="inline">value</code>. Drag a tip and its stem ' +
                're-derives, because both marks read the same row.',
            examples: [
                {
                    title: 'One editable field (the tip)',
                    blurb: 'The stem is a span ruleX (baseline → value); the tip point edits value.',
                    try: '<b>Drag</b> a lollipop tip up or down.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { g: "A", value: 40 }, { g: "B", value: 62 },
    { g: "C", value: 48 }, { g: "D", value: 75 },
  ],
  features: [
    composite({
      id: "lollipop",
      parts: [
        ruleX({
          stroke: "#94a3b8", strokeWidth: 2,
          encoding: { x: { field: "g" }, y2: { field: "value" } },
        }),
        point({
          fill: "steelblue", size: { value: 7 },
          encoding: {
            x: { field: "g", type: "band" },
            y: { field: "value", type: "linear", domain: [0, 100], edit: drag() },
          },
        }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'error-bar',
            title: 'Error bar — move the dot, resize the interval',
            intro:
                'Three editable fields on one row: <code class="inline">mean</code> (the dot), ' +
                '<code class="inline">lo</code> and <code class="inline">hi</code> (the caps). ' +
                'Each is a separate mark, so each edits a plain <code class="inline">y</code> ' +
                'channel and dragging a cap moves only that end — no handle arbitration to ' +
                'write. The whisker is a <code class="inline">ruleX</code> spanning ' +
                'lo..hi; it follows the caps because it reads the same rows.',
            examples: [
                {
                    title: 'Independent handles per field',
                    blurb: 'Each handle is its own mark. The whisker spans lo..hi and follows the caps.',
                    try: '<b>Drag</b> the centre dot to move the mean, or a cap to move an end.',
                    code:
`mount(Elicit({
  width: 380, height: 280,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  y: { type: "linear", domain: [0, 100] },
  data: [
    { g: "A", mean: 50, lo: 35, hi: 65 },
    { g: "B", mean: 62, lo: 55, hi: 72 },
    { g: "C", mean: 44, lo: 28, hi: 58 },
  ],
  features: [
    composite({
      id: "errorbar",
      parts: [
        // Inert visual: no edit, so the engine makes it pointer-transparent.
        ruleX({
          stroke: "#64748b", strokeWidth: 1.5,
          encoding: { x: { field: "g" }, y1: { field: "lo" }, y2: { field: "hi" } },
        }),
        point({
          fill: "steelblue", size: { value: 6 },
          encoding: {
            x: { field: "g", type: "band" },
            y: { field: "mean", edit: drag() },
          },
        }),
        tick({
          stroke: "#334155", strokeWidth: 2,
          encoding: { x: { field: "g" }, y: { field: "lo", edit: drag() } },
        }),
        tick({
          stroke: "#334155", strokeWidth: 2,
          encoding: { x: { field: "g" }, y: { field: "hi", edit: drag() } },
        }),
      ],
    }),
  ],
}))`,
                },
                {
                    title: 'Coupled move + center-within-ends',
                    blurb:
                        'Two behaviours, two layers. The dot uses a joint edit ' +
                        '(edit.custom): its new value comes from the pointer and it shifts ' +
                        'lo/hi by the same delta, so moving the centre carries the whole bar. ' +
                        'The invariant "centre stays within the ends" is a CONSTRAINT — a pure ' +
                        'data rule on the DATASET. Declared once on the group, it runs on every ' +
                        'commit from every part, so a cap can never cross the centre no matter ' +
                        'which handle you grabbed.',
                    try: '<b>Drag the dot</b> — the whole bar travels. <b>Drag a cap</b> past the dot — it stops at the centre.',
                    code:
`mount(Elicit({
  width: 380, height: 280,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  y: { type: "linear", domain: [0, 100] },
  data: [
    { g: "A", mean: 50, lo: 35, hi: 65 },
    { g: "B", mean: 62, lo: 55, hi: 72 },
  ],
  features: [
    composite({
      id: "errorbar",
      // Invariant on the DATA: the centre stays within the ends. A cap drag and a
      // dot drag are different marks, but one rule gates both.
      constraints: [
        defineConstraint(({ active }) => active
          ? { hi: Math.max(active.hi, active.mean), lo: Math.min(active.lo, active.mean) }
          : undefined),
      ],
      parts: [
        ruleX({
          stroke: "#64748b", strokeWidth: 1.5,
          encoding: { x: { field: "g" }, y1: { field: "lo" }, y2: { field: "hi" } },
        }),
        point({
          fill: "steelblue", size: { value: 6 },
          encoding: {
            x: { field: "g", type: "band" },
            // Coupled move: the dot shifts lo/hi by the mean's delta.
            y: { field: "mean",
                 edit: edit.custom((d, e, ctx) => {
                   const s = ctx.channels[0].scale;
                   const mean = s.invertValue(ctx.pointer.y);
                   const delta = mean - d.mean;
                   return { ...d, mean, lo: d.lo + delta, hi: d.hi + delta };
                 }) },
          },
        }),
        tick({
          stroke: "#334155", strokeWidth: 2,
          encoding: { x: { field: "g" }, y: { field: "lo", edit: drag() } },
        }),
        tick({
          stroke: "#334155", strokeWidth: 2,
          encoding: { x: { field: "g" }, y: { field: "hi", edit: drag() } },
        }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
