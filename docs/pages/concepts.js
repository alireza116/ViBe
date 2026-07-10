// Core concepts — the channel model shared by every mark.
export default {
    path: 'concepts.html',
    title: 'Core concepts',
    lead:
        '<b>One dataset.</b> A chart elicits exactly one dataset — even a slider elicits a ' +
        'one-row dataset — so <code class="inline">data</code> lives on the ' +
        '<code class="inline">Elicit</code> spec, never on a mark. Each mark is a <i>view</i> ' +
        'over those rows: it encodes some columns and, where a channel carries an ' +
        '<code class="inline">edit</code>, writes them back. Several marks over the same rows ' +
        'is the point, not a special case — they all re-derive from the committed data on the ' +
        'next render.<br><br>' +
        '<b>One schema.</b> What each field <i>is</i> — and its <b>domain</b> — is declared once, ' +
        'on the spec’s <code class="inline">schema</code>. A mark never carries a domain, because a ' +
        'domain describes the data, not one mark’s view of it. The scale follows from the two: a ' +
        'categorical field on a bar’s x is a band; on a dot’s x it is a point.<br><br>' +
        'Every mark reads the same <b>channel</b> surface. A channel is a constant ' +
        '(<code class="inline">fill: "red"</code>) or a data field through a scale ' +
        '(<code class="inline">fill: { field: "kind" }</code>). No accessor functions — ' +
        'specs stay serializable. Encoding maps data → visual; an edit on a channel maps a ' +
        'gesture → data, back through the same scale.',
    api: [
        {
            name: 'The channel forms',
            summary:
                'The four shapes a channel can take on any mark’s <code class="inline">channels</code>, plus the ' +
                'co-located <code class="inline">edit</code> that makes it writable. Full scale options live on the ' +
                '<b>Scales &amp; channels</b> page.',
            options: [
                { name: '{ field }', type: 'scaled', default: '—', desc: 'A data field mapped through the channel’s scale — <code class="inline">y: { field: "n" }</code>.' },
                { name: '{ value }', type: 'visual constant', default: '—', desc: 'A fixed visual, which <b>skips the scale</b> — <code class="inline">fill: { value: "red" }</code>. The top-level shorthand <code class="inline">fill: "red"</code> desugars to it.' },
                { name: '{ datum }', type: 'data constant', default: '—', desc: 'A constant in the field’s own units, mapped <b>through</b> the scale — <code class="inline">y: { datum: 25 }</code> lands where y = 25 is. (<code class="inline">{ value: 25 }</code> would be pixel 25.)' },
                { name: '{ field, scale: null }', type: 'raw', default: '—', desc: 'A field passed through unscaled (the datum already holds a literal colour / pixel).' },
                { name: '{ …, edit }', type: 'writable', default: '—', desc: 'Attach an edit so a gesture inverts back to <code class="inline">field</code> through the same scale.' },
            ],
            returns:
                'Encoding maps <b>data → visual</b>; an edit maps <b>gesture → data</b> through the same scale — the whole model.',
        },
    ],
    sections: [
        {
            id: 'channels',
            title: 'A channel is a constant or a field',
            intro:
                'Constant channels take a raw value. Field channels name a data field and ' +
                'resolve it through a scale — a category through the ordinal palette, a number ' +
                'through a ramp. The same surface (x, y, fill, stroke, size, opacity, …) is ' +
                'available on every mark, plus top-level style shorthands.',
            examples: [
                {
                    title: 'Field-driven colour (ordinal palette)',
                    blurb: 'channels: { fill: { field: "kind" } } — a category drives fill through the ordinal palette.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { cat: "A", n: 34, kind: "low" },  { cat: "B", n: 58, kind: "high" },
    { cat: "C", n: 22, kind: "low" },  { cat: "D", n: 47, kind: "high" },
  ],
  schema: {
    cat:  { type: "categorical", domain: ["A", "B", "C", "D"] },
    n:    { type: "quantitative", domain: [0, 60] },
    kind: { type: "categorical", domain: ["low", "high"] },
  },
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
                {
                    title: 'Constant style shorthands',
                    blurb: 'stroke, strokeWidth, opacity as top-level shorthands on a point — a constant channel needs no scale.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: 12, y: 40 }, { x: 30, y: 22 }, { x: 48, y: 55 },
    { x: 66, y: 33 }, { x: 80, y: 68 }, { x: 22, y: 60 },
  ],
  schema: {
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 80] },
  },
  features: [
    point({
      fill: "#fde68a", stroke: "#b45309", strokeWidth: 2, opacity: 0.85,
      size: 9,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
