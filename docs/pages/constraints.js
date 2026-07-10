// Constraints — data-layer invariants.
export default {
    path: 'constraints.html',
    title: 'Constraints',
    lead:
        'A constraint is a pure rule over <b>the dataset</b>. It holds no matter which edit ' +
        'fired it, or which <i>mark</i> that edit was declared on — so an invariant written ' +
        'once gates a drag on a bar and a click on a dot alike. It can both <b>reject</b> a ' +
        'proposal and <b>repair</b> it (return the corrected rows), and because every mark ' +
        'reads those rows, a repair shows up everywhere on the next render. Declare it on the ' +
        '<code class="inline">Elicit</code> spec (<code class="inline">constraints: [...]</code>); ' +
        'declaring it on a mark is sugar — the engine promotes it to the dataset either way. ' +
        '<code class="inline">clamp</code> bounds a field, ' +
        '<code class="inline">maintainSum</code> fixes a total, ' +
        '<code class="inline">count</code> caps the size, and ' +
        '<code class="inline">unique</code> forbids duplicate keys.',
    api: [
        {
            name: 'Built-in constraints',
            summary:
                'Import from <code class="inline">vibe.constraints</code> and pass on the ' +
                '<code class="inline">Elicit</code> spec’s <code class="inline">constraints: [...]</code> ' +
                '(a mark accepts them too, as sugar, and the engine promotes them). All are pure data ' +
                'invariants — they run on every commit and never see pixels.',
            signatures: [
                'clamp({ min, max, field }) → Constraint',
                'maintainSum({ targetSum, field }) → Constraint',
                'count({ max, strategy }) → Constraint',
                'unique({ field, max, strategy }) → Constraint',
            ],
            options: [
                { name: 'clamp.min / max', type: 'number', default: 'field domain', desc: 'Bounds the active datum’s field to [min, max]; an omitted bound falls back to the field’s declared domain.' },
                { name: 'clamp.field', type: 'string', default: "'y'", desc: 'The data field to bound.' },
                { name: 'maintainSum.targetSum', type: 'number', default: '—', desc: 'Caps the field total — the touched datum can rise only to the remaining budget.' },
                { name: 'count.max', type: 'number', default: '∞', desc: 'Maximum number of data rows.' },
                { name: 'count.strategy', type: "'replace' | 'reject'", default: "'replace'", desc: 'Over the limit: drop the oldest (keep newest max) or refuse the interaction.' },
                { name: 'unique.field', type: 'string | string[]', default: "'x'", desc: 'Category key(s); an array makes a composite (per-cell) key.' },
                { name: 'unique.max / strategy', type: 'number / string', default: "1 / 'reject'", desc: 'How many may share a key, and whether to reject or replace the resident.' },
            ],
            returns: 'Each returns a <b>Constraint</b> — a reducer the engine runs on the proposed dataset after every edit.',
        },
        {
            name: 'constraints.define(reducer, meta?)',
            summary:
                'Author your own (aliased <code class="inline">constraints.custom</code>). The reducer gets a ' +
                'pure-data context and returns the shape that’s natural.',
            signature: 'constraints.define(({ data, oldData, activeIndex, active, field, value, domain }) => result, meta?) → Constraint',
            options: [
                { name: 'return number', type: '—', default: '—', desc: 'The constrained value for the active datum’s <code class="inline">field</code>.' },
                { name: 'return object', type: '—', default: '—', desc: 'Fields merged into the active datum.' },
                { name: 'return array', type: '—', default: '—', desc: 'A full replacement dataset (cross-datum rules: sum, unique, count).' },
                { name: 'return false', type: '—', default: '—', desc: 'Reject the whole interaction.' },
                { name: 'return true / undefined', type: '—', default: '—', desc: 'Accept unchanged.' },
                { name: 'meta.field', type: 'string', default: "'y'", desc: 'The field the invariant governs (for value rules + guides).' },
                { name: 'meta.guide', type: 'function', default: '—', desc: 'Optional drawer so an edit with <code class="inline">guide:true</code> can show this constraint’s bounds.' },
            ],
            returns: 'A <b>Constraint</b>. The <code class="inline">ctx.active</code> is the datum the gesture touched; <code class="inline">domain</code> is that field’s declared data range.',
        },
    ],
    sections: [
        {
            id: 'sum',
            title: 'maintainSum — a total held at 100',
            intro:
                'The sum rule is a dataset invariant, so it holds for every edit from every mark. Bars give ' +
                'way to keep the total at 100; guide: true draws the live bound.',
            examples: [
                {
                    title: 'Bars that compensate',
                    blurb: 'maintainSum bounds the touched bar so the total stays 100; a rule guide marks the even split.',
                    try: '<b>Drag</b> any bar — the others compensate.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  guides: [ guides.rule({ y: 25, label: "even split (25)" }) ],
  data: ["A", "B", "C", "D"].map((c) => ({ x: c, y: 25 })),
  // Invariants on the DATA — they gate every edit, from every mark.
  constraints: [
    clamp({ field: "y", min: 0 }),
    maintainSum({ field: "y", targetSum: 100 }),
  ],
  schema: {
    x: { type: "categorical", domain: ["A", "B", "C", "D"] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    bar({
      fill: "#6366f1",
      channels: {
        x: { field: "x" },
        y: { field: "y", edit: drag({ guide: true }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'clamp',
            title: 'clamp — bound a field',
            intro:
                'clamp holds a field inside [min, max]. Pair it with a nearest pick and a self-drawn ' +
                'guide to make the bounds visible while dragging.',
            examples: [
                {
                    title: 'Clamped drag with a guide',
                    blurb: 'The y edit is clamped to 0–90; guide: true draws the bounds and the snap ring.',
                    try: '<b>Drag</b> from anywhere in a column (clamped to 0–90).',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: "A", y: 20 }, { x: "B", y: 45 },
    { x: "C", y: 30 }, { x: "D", y: 60 },
  ],
  constraints: [ clamp({ field: "y", min: 0, max: 90 }) ],
  schema: {
    x: { type: "categorical", domain: ["A", "B", "C", "D"] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    bar({
      fill: "#2563eb",
      channels: {
        x: { field: "x" },
        y: { field: "y",
             edit: drag({ pick: "nearest", threshold: 40, guide: true }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'unique',
            title: 'unique — one per key',
            intro:
                'unique forbids two data with the same key. A single field guards one axis; an ' +
                'array is a composite key — at most one mark per cell, for both create and move.',
            examples: [
                {
                    title: 'One bar per category',
                    blurb: 'create mints wherever you click, but unique({ field: "x" }) rejects a filled slot.',
                    try: '<b>Click</b> an empty column to fill it · a filled column rejects.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [{ x: "A", y: 40 }, { x: "C", y: 60 }],
  constraints: [ unique({ field: "x", max: 1 }) ],
  schema: {
    x: { type: "categorical", domain: ["A", "B", "C", "D"] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    bar({
      fill: "#0d9488",
      channels: {
        x: { field: "x" },
        y: { field: "y", edit: drag() },
      },
      edits: [ create({ defaults: { y: 20 } }) ],
    }),
  ],
}))`,
                },
                {
                    title: 'Composite key — a band × band grid',
                    blurb: 'unique({ field: ["x","y"] }) allows at most one mark per (x, y) cell.',
                    try: '<b>Drag</b> to another cell · <b>Click</b> an empty cell to add · <b><kbd>Alt</kbd>+click</b> to delete.',
                    code:
`mount(Elicit({
  width: 400, height: 320,
  data: [
    { x: "A", y: "Low", group: "alpha" },
    { x: "B", y: "Mid", group: "beta" },
    { x: "C", y: "High", group: "gamma" },
  ],
  constraints: [ unique({ field: ["x", "y"], max: 1 }) ],
  schema: {
    x:     { domain: ["A", "B", "C"] },
    y:     { domain: ["Low", "Mid", "High"] },
    group: { type: "ordinal", domain: ["alpha", "beta", "gamma"] },
  },
  features: [
    point({
      size: 12,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
        fill: { field: "group" },
      },
      edits: [
        drag({ channels: ["x", "y"] }),
        create({ defaults: { group: "alpha" } }),
        remove({ when: when.alt }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
