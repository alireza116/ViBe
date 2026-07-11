// Authoring SDK — extending VibeJS with custom marks, edits, and drivers.
export default {
    path: 'authoring.html',
    title: 'Authoring SDK',
    lead:
        'How to build new elicitation devices without forking the engine. Marks use ' +
        '<code class="inline">encodeChannel</code> / <code class="inline">resolveStyle</code>; ' +
        'edits use <code class="inline">makeEdit</code> + <code class="inline">invertChannel</code>; ' +
        'multi-event lifecycles register via <code class="inline">edit.registerDriver</code>. ' +
        'Attach edits on a channel (<code class="inline">y: { field, edit: drag() }</code>) or at ' +
        'mark level (<code class="inline">edits: [drag({ channels: ["x","y"] })]</code>) — never as a ' +
        'fake <code class="inline">channels.edit</code> key.',
    api: [
        {
            name: 'Mark SDK (vibe.plot)',
            summary: 'Shared foundation every mark factory uses.',
            signatures: [
                'encodeChannel(scales, channels, name, datum, fallback) → number',
                'resolveStyle(scales, channels, datum, defaults) → style',
                'normalizeMarkOptions(options) → options',
            ],
            options: [
                { name: 'build(data, scales, width, height)', type: 'required', default: '—', desc: 'Return FeatureNode[] (circle/rect/line/path/text).' },
                { name: 'discreteScale', type: "'band' | 'point'", default: '—', desc: 'What the mark needs for discrete data.' },
                { name: 'channels / edits / constraints', type: '—', default: '—', desc: 'Pass through from factory options; never drop them.' },
            ],
            returns: 'A feature object the engine consumes.',
        },
        {
            name: 'Edit SDK (vibe.edit)',
            summary: 'Build descriptors and register drivers.',
            signatures: [
                'makeEdit(spec) → Edit',
                'invertChannel(ch, pointer) → value',
                'recenterSpan(node, chA, chB, pointer) → { a, b }',
                'nearestMark(marks, x, y, threshold) → index | null',
                'registerDriver({ name, wants, onEvent })',
                'edit.custom(fn, options) → Edit',
                'edit.rank(options) → Edit',
                'edit.legend(options) → Edit',
            ],
            options: [
                { name: 'Edit.pick', type: 'string', default: "'direct'", desc: 'Built-in or a custom driver name registered with registerDriver.' },
                { name: 'Edit.apply(ctx)', type: 'fn', default: '—', desc: 'Return a datum, a full array, or undefined (no-op). Never mutate ctx.data.' },
            ],
            returns: 'Descriptors the engine routes; drivers own multi-event state.',
        },
    ],
    sections: [
        {
            id: 'custom-edit',
            title: 'A custom edit with makeEdit',
            intro: 'Prefer makeEdit (or edit.custom) so defaults for pick/gesture/constrain stay consistent.',
            examples: [
                {
                    title: 'Snap-drag via custom apply',
                    blurb: 'Invert y, then round to the nearest 10.',
                    try: '<b>Drag</b> the point — it lands on multiples of 10.',
                    code:
`const snapDrag = edit.makeEdit({
  type: "snapDrag",
  gesture: "drag",
  channels: ["y"],
  apply: (ctx) => {
    const ch = ctx.channels[0];
    const v = edit.invertChannel(ch, ctx.pointer);
    if (v === undefined || !ctx.datum) return undefined;
    return { ...ctx.datum, [ch.field]: Math.round(v / 10) * 10 };
  },
});
mount(Elicit({
  width: 360, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [ { cat: "A", n: 40 } ],
  schema: {
    cat: { type: "categorical", domain: ["A"] },
    n: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      fill: "#2563eb", size: 10,
      channels: { x: { field: "cat" }, y: { field: "n" } },
      edits: [ snapDrag ],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'rank',
            title: 'Rank / reorder',
            intro: 'edit.rank() swaps rank slots along a discrete axis as you drag.',
            examples: [
                {
                    title: 'Drag to reorder',
                    blurb: 'Point scale over ranks; drag swaps with the nearest slot.',
                    try: '<b>Drag</b> a point to another rank.',
                    code:
`mount(Elicit({
  width: 360, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 80 },
  data: [
    { item: "A", rank: 1 },
    { item: "B", rank: 2 },
    { item: "C", rank: 3 },
  ],
  schema: {
    item: { type: "categorical", domain: ["A", "B", "C"] },
    rank: { type: "ordinal", domain: [1, 2, 3] },
  },
  features: [
    point({
      fill: "#0d9488", size: 9,
      channels: {
        x: { value: 40 },
        y: { field: "rank", edit: rank() },
      },
    }),
    text({
      fontSize: 13,
      channels: {
        x: { value: 56 },
        y: { field: "rank" },
        text: { field: "item" },
        textAnchor: { value: "start" },
      },
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
