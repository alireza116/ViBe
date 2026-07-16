// Composite — glyphs built by grouping existing marks over the shared dataset.
export default {
    path: 'marks/composite.html',
    title: 'Composite',
    lead:
        'A <b>composite</b> mark is a glyph: a named <b>group of ordinary marks</b> over ' +
        'the chart’s one dataset. Group-level <code class="inline">channels</code> (and ' +
        'style / <code class="inline">angle</code> shorthands) <b>trickle into every part</b> ' +
        'at desugar time — declare a shared orientation or position once; a part’s own ' +
        'channel for the same name wins; inherited <code class="inline">edit</code>s attach ' +
        'to the <b>last</b> part only (visuals first, handles last). Each part encodes some ' +
        'columns of the same rows; a part whose channel carries an ' +
        '<code class="inline">edit</code> is a handle. Drag a handle and it writes its field; ' +
        'on the next render every other part re-derives from the changed rows. ' +
        'Composite is a <b>desugaring</b>, not a new kind of feature: it returns its parts ' +
        'as plain features and <code class="inline">Elicit</code> flattens them. ' +
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
                'composite({ parts, channels, constraints, discreteScale, id }) → Feature[]',
            options: [
                { name: 'parts', type: 'Mark[]', default: '[]', desc: 'The sub-marks, in z-order (visual parts first, handles last). Each part is an ordinary mark with its <b>own</b> <code class="inline">channels</code> / style shorthands (arm geometry, per-part stroke, a tip’s <code class="inline">size</code>). A part with an <code class="inline">edit</code> is a handle; a part without one is inert and the engine makes it <code class="inline">pointerEvents:"none"</code> so it can’t swallow a sibling’s drag.' },
                { name: 'channels', type: 'object', default: '{}', desc: 'Shared channel map merged into every part. Use it for glyph-wide bindings (<code class="inline">x</code>/<code class="inline">y</code>/<code class="inline">angle</code>/<code class="inline">fill</code>). A part’s own channel for the same name <b>wins</b> (shallow replace). Inherited <code class="inline">edit</code>s land on the last part only.' },
                { name: 'fill, angle, …', type: 'shorthand', default: '—', desc: 'Constant shorthands desugared into <b>group</b> channels (shared by every part unless a part overrides). Parts keep their own shorthands too — e.g. group <code class="inline">angle</code>, per-part <code class="inline">stroke</code>.' },
                { name: 'constraints', type: 'Constraint[]', default: '—', desc: 'Group-level data invariants. Promoted into the <b>dataset’s</b> constraint set, so they gate and repair every edit — including one made through a different part. See <b>Constraints</b>.' },
                { name: 'discreteScale', type: "'band' | 'point'", default: "'band'", desc: 'Stamped onto any part that doesn’t declare its own. A glyph usually sits in a band slot.' },
                { name: 'id', type: 'string', default: "'composite'", desc: 'Prefix for the parts’ generated ids (<code class="inline">id/0</code>, <code class="inline">id/1</code>, …), so each part keeps a stable identity across renders.' },
            ],
            returns:
                'An <b>array of features</b> — the parts, with ids assigned, group channels ' +
                'merged in, and the group’s constraints attached. Nothing about the glyph ' +
                'reaches the engine: it sees ordinary marks reading the one dataset.',
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
  schema: {
    g:     { type: "categorical" },
    value: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    composite({
      id: "lollipop",
      parts: [
        ruleX({
          stroke: "#94a3b8", strokeWidth: 2,
          channels: { x: { field: "g" }, y2: { field: "value" } },
        }),
        point({
          fill: "steelblue", size: 7,
          channels: {
            x: { field: "g" },
            y: { field: "value", edit: drag() },
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
  data: [
    { g: "A", mean: 50, lo: 35, hi: 65 },
    { g: "B", mean: 62, lo: 55, hi: 72 },
    { g: "C", mean: 44, lo: 28, hi: 58 },
  ],
  // lo, mean and hi all land on the y axis. The axis spans the UNION of their
  // declared domains, so no chart-level y scale is needed.
  schema: {
    g:    { type: "categorical",  domain: ["A", "B", "C"] },
    lo:   { type: "quantitative", domain: [0, 60] },
    mean: { type: "quantitative", domain: [0, 80] },
    hi:   { type: "quantitative", domain: [20, 100] },
  },
  features: [
    composite({
      id: "errorbar",
      parts: [
        // Inert visual: no edit, so the engine makes it pointer-transparent.
        ruleX({
          stroke: "#64748b", strokeWidth: 1.5,
          channels: { x: { field: "g" }, y1: { field: "lo" }, y2: { field: "hi" } },
        }),
        point({
          fill: "steelblue", size: 6,
          channels: {
            x: { field: "g" },
            y: { field: "mean", edit: drag() },
          },
        }),
        tick({
          stroke: "#334155", strokeWidth: 2,
          channels: { x: { field: "g" }, y: { field: "lo", edit: drag() } },
        }),
        tick({
          stroke: "#334155", strokeWidth: 2,
          channels: { x: { field: "g" }, y: { field: "hi", edit: drag() } },
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
  data: [
    { g: "A", mean: 50, lo: 35, hi: 65 },
    { g: "B", mean: 62, lo: 55, hi: 72 },
  ],
  schema: {
    g:    { type: "categorical",  domain: ["A", "B"] },
    lo:   { type: "quantitative", domain: [0, 100] },
    mean: { type: "quantitative", domain: [0, 100] },
    hi:   { type: "quantitative", domain: [0, 100] },
  },
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
          channels: { x: { field: "g" }, y1: { field: "lo" }, y2: { field: "hi" } },
        }),
        point({
          fill: "steelblue", size: 6,
          channels: {
            x: { field: "g" },
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
          channels: { x: { field: "g" }, y: { field: "lo", edit: drag() } },
        }),
        tick({
          stroke: "#334155", strokeWidth: 2,
          channels: { x: { field: "g" }, y: { field: "hi", edit: drag() } },
        }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'plus',
            title: 'Group channels + per-part channels',
            intro:
                'Two layers of binding. <b>Group</b> <code class="inline">channels</code> ' +
                '(here <code class="inline">x</code>, <code class="inline">y</code>, ' +
                '<code class="inline">angle</code>) trickle into every part so the glyph ' +
                'shares one position and one orientation. <b>Each part</b> still declares ' +
                'its own channels and shorthands — arm length, stroke colour, a hub’s ' +
                '<code class="inline">fill</code> / <code class="inline">size</code>. A part ' +
                'key wins on conflict. Inherited <code class="inline">edit</code>s attach to ' +
                'the last part only, so one <code class="inline">rotate()</code> spins the ' +
                'whole glyph without double-applying.',
            examples: [
                {
                    title: 'Shared x/y/angle; per-part stroke on crossing ticks',
                    blurb:
                        'A + from tickY (horizontal) + tickX (vertical). Group channels bind ' +
                        'position and angle once; each tick keeps its own stroke / length. ' +
                        'The last part holds the inherited rotate() edit.',
                    try: '<b>Drag</b> the darker (vertical) arm of a + to spin it.',
                    code:
`mount(Elicit({
  width: 380, height: 280,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: 25, y: 35, theta: -15 },
    { x: 55, y: 60, theta: 40 },
    { x: 78, y: 28, theta: 75 },
    { x: 40, y: 78, theta: -50 },
  ],
  schema: {
    x:     { type: "quantitative", domain: [0, 100] },
    y:     { type: "quantitative", domain: [0, 100] },
    theta: { type: "quantitative", domain: [-180, 180] },
  },
  features: [
    composite({
      id: "plus",
      discreteScale: "point",
      // Glyph-wide: every part inherits these (unless it overrides).
      channels: {
        x: { field: "x" },
        y: { field: "y" },
        angle: {
          field: "theta",
          scale: { range: [-180, 180] },
          edit: rotate({ pivot: "mark", fold: false, pick: "direct" }),
        },
      },
      parts: [
        // Horizontal arm — own stroke/length; inherits x/y/angle (edit stripped).
        tickY({ length: 28, stroke: "#93c5fd", strokeWidth: 5 }),
        // Vertical arm — own stroke; last part keeps the inherited rotate().
        tickX({ length: 28, stroke: "#1d4ed8", strokeWidth: 5 }),
      ],
    }),
  ],
}))`,
                },
                {
                    title: 'Same group angle; hub point with its own fill/size',
                    blurb:
                        'Add a square hub as a third part. It inherits x/y/angle from the ' +
                        'group but sets its own shape, fill, and size — part channels win ' +
                        'for those names. rotate() still lives on the last part.',
                    try: '<b>Drag</b> the hub (last part) to spin the whole glyph.',
                    code:
`mount(Elicit({
  width: 380, height: 280,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: 30, y: 40, theta: 20 },
    { x: 60, y: 65, theta: -35 },
    { x: 75, y: 25, theta: 55 },
  ],
  schema: {
    x:     { type: "quantitative", domain: [0, 100] },
    y:     { type: "quantitative", domain: [0, 100] },
    theta: { type: "quantitative", domain: [-180, 180] },
  },
  features: [
    composite({
      id: "crosshair",
      discreteScale: "point",
      channels: {
        x: { field: "x" },
        y: { field: "y" },
        angle: {
          field: "theta",
          scale: { range: [-180, 180] },
          edit: rotate({ pivot: "mark", fold: false, pick: "direct" }),
        },
      },
      parts: [
        tickY({ length: 32, stroke: "#94a3b8", strokeWidth: 3 }),
        tickX({ length: 32, stroke: "#94a3b8", strokeWidth: 3 }),
        // Hub: own shape/fill/size; inherits x/y/angle; keeps rotate() (last).
        point({
          shape: "square",
          size: 6,
          fill: "#fbbf24",
          stroke: "#92400e",
          strokeWidth: 1,
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
