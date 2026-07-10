// Scales & channels — data types vs scale types, and the three scale forms.
export default {
    path: 'scales.html',
    title: 'Scales & channels',
    lead:
        'Two different words, kept apart. A <b>data type</b> says what a field <i>is</i> — ' +
        '<code class="inline">quantitative</code>, <code class="inline">categorical</code>, ' +
        '<code class="inline">ordinal</code>, <code class="inline">temporal</code> — and is declared ' +
        'once, on the <a href="schema.html">schema</a>. A <b>scale type</b> says how a channel ' +
        '<i>draws</i> it — <code class="inline">linear</code>, <code class="inline">log</code>, ' +
        '<code class="inline">band</code>, <code class="inline">ordinal</code>, … — and is normally ' +
        '<b>derived</b>: a categorical field on a bar’s x is a band (a bar needs the interval), on a ' +
        'dot’s x it is a point (a dot wants the tick). So you rarely name a scale at all. When you ' +
        'do, <code class="inline">scale</code> takes a name, a spec, or a live d3 scale. Every ' +
        'positional scale is invertible — that is what makes editing possible.',
    api: [
        {
            name: 'Channel spec',
            summary:
                'Each entry in a mark’s <code class="inline">channels</code> is one channel: a field, ' +
                'a constant, or a raw field — plus an optional co-located <code class="inline">edit</code>. ' +
                'No <code class="inline">domain</code> here; a domain belongs to the data, not to a ' +
                'mark’s view of it.',
            options: [
                { name: 'field', type: 'string', default: '—', desc: 'The data field to read and map through the channel’s scale.' },
                { name: 'value', type: 'any', default: '—', desc: 'A <b>visual-space</b> constant — it skips the scale. <code class="inline">fill: "red"</code> desugars to this.' },
                { name: 'datum', type: 'any', default: '—', desc: 'A <b>data-space</b> constant — it goes <i>through</i> the scale. <code class="inline">y: { datum: 25 }</code> lands where y = 25 is, not at pixel 25.' },
                { name: 'type', type: 'MeasureType', default: 'from schema', desc: 'The field’s <b>data</b> type. An override for a field the schema doesn’t cover — normally you declare it once on the schema instead.' },
                { name: 'scale', type: 'string | ScaleSpec | d3 scale | null', default: 'derived', desc: 'How to draw it. <code class="inline">null</code> passes the field through unscaled (a literal colour / pixel). See <b>Scale forms</b>.' },
                { name: 'edit', type: 'Edit', default: '—', desc: 'Co-locate an edit so a gesture writes this channel back through the same scale.' },
            ],
            returns:
                'The engine resolves <b>one global scale per channel</b>, unioning across marks and across ' +
                '<code class="inline">x/x1/x2</code> and <code class="inline">y/y1/y2</code> — including their ' +
                '<b>schema domains</b>, so an error bar’s <code class="inline">mean</code>, ' +
                '<code class="inline">lo</code> and <code class="inline">hi</code> share one y axis spanning all ' +
                'three. Scales reach <code class="inline">build</code> as <code class="inline">scales.x</code>, ' +
                '<code class="inline">scales.y</code>, ….',
        },
        {
            name: 'Scale forms',
            summary:
                'The three ways to name a scale, when the derived one isn’t what you want. A d3 scale is ' +
                'adopted as you built it; for a positional channel we hand it the plot’s pixel range (pixels ' +
                'are ours to know, palettes and radii are yours).',
            signatures: [
                'scale: "log"                                  // by name',
                'scale: { type: "sqrt", range: [4, 20] }       // by spec',
                'scale: d3.scaleBand().padding(0.3)            // a live d3 scale',
                'scale: null                                   // unscaled passthrough',
            ],
            options: [
                { name: 'ScaleSpec.type', type: 'ScaleType', default: 'derived', desc: '<code class="inline">linear</code>, <code class="inline">log</code>, <code class="inline">pow</code>, <code class="inline">sqrt</code>, <code class="inline">time</code>, <code class="inline">band</code>, <code class="inline">point</code>, <code class="inline">ordinal</code>, <code class="inline">sequential</code>.' },
                { name: 'ScaleSpec.range', type: 'any[]', default: 'from geometry', desc: 'The output extent — pixels, radii, colours. Positional ranges default to the plot size.' },
                { name: 'ScaleSpec.padding', type: 'number', default: '0.1 / 0.5', desc: 'Band / point padding.' },
                { name: 'ScaleSpec.nice / clamp', type: 'boolean', default: 'false', desc: 'Continuous-scale refinements.' },
                { name: 'ScaleSpec.base / exponent', type: 'number', default: '10 / 1', desc: 'For <code class="inline">log</code> and <code class="inline">pow</code>.' },
                { name: 'spec.scales', type: 'Record<channel, ScaleSpec>', default: '—', desc: 'The chart-level override, keyed by channel. Scales are global, so this is their honest home; it wins over a channel’s own <code class="inline">scale</code>.' },
            ],
            returns:
                'A scale carries what it can <b>do</b> — <code class="inline">kind</code> ' +
                '(<code class="inline">band</code> | <code class="inline">point</code> | ' +
                '<code class="inline">continuous</code> | <code class="inline">discrete</code>) and ' +
                '<code class="inline">invertible</code> — sniffed from the scale object itself. Marks and edits ' +
                'branch on that, never on a type name, which is why an adopted d3 scale drags exactly like a ' +
                'built-in one.',
        },
    ],
    sections: [
        {
            id: 'derived',
            title: 'The scale is derived from the data type',
            intro:
                'Nothing below names a scale. The schema says <code class="inline">cat</code> is categorical ' +
                'and <code class="inline">n</code> is quantitative; the bar says it needs an interval for ' +
                'discrete data. Band and linear fall out. Swap <code class="inline">bar</code> for ' +
                '<code class="inline">point</code> and x becomes a point scale, with no other change.',
            examples: [
                {
                    title: 'No scale named anywhere',
                    blurb: 'Data type (schema) + what the mark needs = the scale. Drag a bar to see it invert.',
                    try: '<b>Drag</b> a bar.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  schema: {
    cat: { type: "categorical",  domain: ["A", "B", "C", "D"] },
    n:   { type: "quantitative", domain: [0, 60] },
  },
  data: [
    { cat: "A", n: 34 }, { cat: "B", n: 58 },
    { cat: "C", n: 22 }, { cat: "D", n: 47 },
  ],
  features: [
    bar({
      fill: "#4f46e5",
      channels: {
        x: { field: "cat" },              // categorical + bar -> band
        y: { field: "n", edit: drag() },  // quantitative      -> linear
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'continuous',
            title: 'Continuous → colour & size',
            intro:
                'The same numeric field through a colour channel becomes a ramp, and through the size ' +
                'channel a radius. A size channel’s output <code class="inline">range</code> (radii, in px) ' +
                'is a property of the scale, so it rides on <code class="inline">scale</code>.',
            examples: [
                {
                    title: 'Sequential ramp + size',
                    blurb: 'fill: { field } → ramp, size: { field } → radius, from one numeric field.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 34 },
  schema: {
    h:      { type: "quantitative", domain: [140, 200] },
    weight: { type: "quantitative", domain: [40, 100] },
  },
  data: [
    { h: 150, weight: 48 }, { h: 160, weight: 57 }, { h: 170, weight: 66 },
    { h: 180, weight: 78 }, { h: 190, weight: 92 }, { h: 165, weight: 61 },
  ],
  features: [
    point({
      stroke: "#334155", strokeWidth: 1,
      channels: {
        x: { field: "h" },
        y: { field: "weight" },
        fill: { field: "weight" },                          // -> sequential ramp
        size: { field: "weight", scale: { range: [4, 16] } }, // -> radius, in px
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'override',
            title: 'Naming a scale: by name, by spec, by d3',
            intro:
                'A log x, a sqrt size range, and a d3 band with custom padding — three forms, one option. ' +
                'The d3 scale is adopted as built; because it is positional and named no range, it is given ' +
                'the plot’s pixel range. Its padding survives, and so does its invertibility: the drag works.',
            examples: [
                {
                    title: 'log · sqrt · an adopted d3 scale',
                    blurb: 'x is logarithmic, size ramps by sqrt, and the categorical fill uses a d3 ordinal scale.',
                    try: '<b>Drag</b> a dot vertically — an adopted scale inverts like any other.',
                    code:
`mount(Elicit({
  width: 380, height: 250,
  margins: { top: 14, right: 14, bottom: 30, left: 40 },
  schema: {
    t: { type: "quantitative", domain: [1, 1000] },
    w: { type: "quantitative", domain: [0, 100] },
    g: { type: "categorical",  domain: ["a", "b", "c"] },
  },
  data: [
    { t: 2, w: 20, g: "a" }, { t: 20, w: 55, g: "b" },
    { t: 120, w: 40, g: "c" }, { t: 700, w: 80, g: "a" },
  ],
  features: [
    point({
      stroke: "#1f2733",
      channels: {
        x:    { field: "t", scale: "log" },
        y:    { field: "w", edit: drag() },
        size: { field: "w", scale: { type: "sqrt", range: [5, 16] } },
        fill: { field: "g", scale: d3.scaleOrdinal(d3.schemeTableau10) },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'categorical',
            title: 'Categorical → ordinal palette',
            intro: 'A categorical field on a colour channel resolves through the ordinal palette — one hue per category.',
            examples: [
                {
                    title: 'Ordinal palette',
                    blurb: 'fill: { field: "kind" } assigns palette colours across the category domain.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  schema: {
    cat:  { type: "categorical",  domain: ["A", "B", "C", "D"] },
    n:    { type: "quantitative", domain: [0, 60] },
    kind: { type: "categorical",  domain: ["low", "high"] },
  },
  data: [
    { cat: "A", n: 34, kind: "low" },  { cat: "B", n: 58, kind: "high" },
    { cat: "C", n: 22, kind: "low" },  { cat: "D", n: 47, kind: "high" },
  ],
  features: [
    bar({
      channels: {
        x: { field: "cat" },
        y: { field: "n" },
        fill: { field: "kind" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'categorical-position',
            title: 'Categorical position → point scale',
            intro:
                'When a positional channel is categorical, a dot resolves it to a point scale — the mark ' +
                'sits on the category’s tick. Two categorical axes make a discrete grid. Note ' +
                '<code class="inline">ordinal</code> vs <code class="inline">categorical</code> on ' +
                '<code class="inline">y</code>: an ordinal domain’s <i>order</i> is meaningful.',
            examples: [
                {
                    title: 'A discrete grid',
                    blurb: 'Both positions are categories, so each dot lands on an (x, y) cell.',
                    code:
`mount(Elicit({
  width: 360, height: 300,
  schema: {
    x:     { type: "categorical", domain: ["A", "B", "C"] },
    y:     { type: "ordinal",     domain: ["Low", "Mid", "High"] },
    group: { type: "categorical", domain: ["alpha", "beta", "gamma"] },
  },
  data: [
    { x: "A", y: "Low", group: "alpha" },
    { x: "B", y: "Mid", group: "beta" },
    { x: "C", y: "High", group: "gamma" },
  ],
  features: [
    point({
      size: 12,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
        fill: { field: "group" },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
