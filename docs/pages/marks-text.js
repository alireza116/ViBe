// Text mark — text / textX / textY.
export default {
    path: 'marks/text.html',
    title: 'Text',
    lead:
        'A per-datum <b>label</b> (Observable Plot’s text). It places a string at a ' +
        'positional (x, y); <code class="inline">text</code>/<code class="inline">fontSize</code>/' +
        '<code class="inline">textAnchor</code>/<code class="inline">lineAnchor</code>/' +
        '<code class="inline">dx</code>/<code class="inline">dy</code> are read RAW (a field or a constant), ' +
        '<code class="inline">angle</code> is degrees, and <code class="inline">format</code> is a ' +
        'd3-format string or function (display-only). A text mark is editable like any other: ' +
        'drag to reposition, drag a value to update a numeric readout, ' +
        '<code class="inline">cycle()</code> a label, <code class="inline">rotate()</code> it, or ' +
        '<code class="inline">editText()</code> to retype its content.',
    api: [
        {
            name: 'text(options) · textX(options) · textY(options)',
            summary:
                'Import from <code class="inline">vibe.plot</code>. <code class="inline">text</code> ' +
                'positions from x AND y; <code class="inline">textX</code> / <code class="inline">textY</code> ' +
                'are 1-D labels along one axis (the other parks at centre).',
            signatures: [
                'text({ channels, dx, dy, lineAnchor, format, edits, constraints, id }) → Feature',
                'textX(options) → Feature   // value on x',
                'textY(options) → Feature   // value on y',
            ],
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'Channel map. See <b>Channels</b>.' },
                { name: 'text, fontSize, textAnchor, lineAnchor, dx, dy', type: 'shorthand', default: '—', desc: 'Constant shorthands, e.g. <code class="inline">text({ dy: -8, lineAnchor: "bottom" })</code>.' },
                { name: 'format', type: 'string | fn', default: 'String', desc: 'Display formatter: a d3-format string (e.g. <code class="inline">".1f"</code>) or <code class="inline">(v) => string</code>. Display-only — the field stays raw. Helpers live on <code class="inline">format</code> (<code class="inline">format.number</code>, <code class="inline">format.percent</code>, …).' },
                { name: 'edits', type: 'Edit[]', default: '—', desc: 'Mark-level edits; per-channel edits live in <code class="inline">channels[ch].edit</code>.' },
            ],
            channels: [
                { name: 'x / y', type: 'linear | band', desc: 'Position. A missing axis parks the label at that dimension’s centre.' },
                { name: 'text', type: 'field | const', desc: 'The value to draw (raw — no scale; passed through <code class="inline">format</code>).' },
                { name: 'fontSize', type: 'field | const', desc: 'Size in px, raw.' },
                { name: 'textAnchor', type: 'field | const', desc: 'Horizontal anchor: <code class="inline">start</code>·<code class="inline">middle</code>·<code class="inline">end</code>.' },
                { name: 'lineAnchor', type: 'field | const', desc: 'Vertical anchor: <code class="inline">top</code>·<code class="inline">middle</code>·<code class="inline">bottom</code> (maps to SVG <code class="inline">dominant-baseline</code>).' },
                { name: 'dx / dy', type: 'field | const', desc: 'Pixel offsets from the encoded (x, y). Visual-only — drag still inverts the pointer through the scale.' },
                { name: 'angle', type: 'field | const', desc: 'Rotation in degrees (scaled when a scale is declared, so <code class="inline">rotate()</code> is an exact inverse).' },
                { name: 'fill, opacity', type: 'const | field', desc: 'Standard style surface.' },
            ],
            returns: 'A <b>feature</b> emitting one <code class="inline">text</code> per datum.',
        },
    ],
    sections: [
        {
            id: 'basics',
            title: 'Labels from data',
            intro: 'x/y position the label; text is its string. Offset and anchor keep it clear of the mark it labels.',
            examples: [
                {
                    title: 'A labelled scatter',
                    blurb: 'point for the dots, text for the labels above them — dy + lineAnchor park the string above the point.',
                    code:
`mount(Elicit({
  width: 360, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { gdp: 3, life: 6, name: "Ada" },
    { gdp: 6, life: 8, name: "Grace" },
    { gdp: 8, life: 4, name: "Alan" },
  ],
  schema: {
    gdp:  { type: "quantitative", domain: [0, 10] },
    life: { type: "quantitative", domain: [0, 10] },
    name: { type: "categorical", domain: ["Ada", "Grace", "Alan"] },
  },
  features: [
    point({ fill: "#4f46e5",
      channels: { x: { field: "gdp" }, y: { field: "life" } } }),
    text({ fontSize: 12, dy: -10, lineAnchor: "bottom",
      channels: {
        x: { field: "gdp" }, y: { field: "life" },
        text: { field: "name" },
      } }),
  ],
}))`,
                },
                {
                    title: 'Formatted numeric labels',
                    blurb: 'format is display-only (a d3-format string or a helper from format.*). The field stays the raw number, so a later drag still inverts correctly.',
                    code:
`mount(Elicit({
  width: 360, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { cat: "A", n: 0.42 },
    { cat: "B", n: 0.75 },
    { cat: "C", n: 0.18 },
  ],
  schema: {
    cat: { type: "categorical", domain: ["A", "B", "C"] },
    n:   { type: "quantitative", domain: [0, 1] },
  },
  features: [
    barY({ fill: "#0d9488",
      channels: { x: { field: "cat" }, y: { field: "n" } } }),
    text({ fontSize: 12, dy: -6, lineAnchor: "bottom",
      format: format.percent(".0%"),
      channels: {
        x: { field: "cat" }, y: { field: "n" },
        text: { field: "n" },
      } }),
  ],
}))`,
                },
                {
                    title: 'Line chart with value labels',
                    blurb: 'lineY draws the series; text sits on the same (x, y) with dy above each point.',
                    code:
`mount(Elicit({
  width: 400, height: 260,
  margins: { top: 20, right: 16, bottom: 28, left: 34 },
  data: [
    { t: 0, n: 40 }, { t: 1, n: 62 }, { t: 2, n: 48 },
    { t: 3, n: 78 }, { t: 4, n: 60 }, { t: 5, n: 84 },
  ],
  schema: {
    t: { type: "quantitative", domain: [0, 5] },
    n: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    lineY({
      stroke: "#4f46e5", strokeWidth: 2.5, curve: "catmullRom",
      channels: { x: { field: "t" }, y: { field: "n" } },
    }),
    text({
      fontSize: 11, dy: -10, lineAnchor: "bottom",
      fill: "#4f46e5", format: ".0f",
      channels: {
        x: { field: "t" }, y: { field: "n" },
        text: { field: "n" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'editing',
            title: 'Editing labels',
            intro:
                'A direct-pick edit makes a label interactive. Reuse the universal edits — nothing ' +
                'text-specific — or <code class="inline">editText()</code> to retype the content.',
            examples: [
                {
                    title: 'Drag to reposition',
                    blurb: 'Mark-level drag({ channels: ["x","y"] }) moves the label; writes x/y back through the scales. (Do not put <code class="inline">edit</code> as a channel key — attach it on a channel or via <code class="inline">edits</code>.)',
                    try: '<b>Drag</b> a label to move it.',
                    code:
`mount(Elicit({
  width: 360, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { x: 3, y: 4, label: "drag me" },
    { x: 6, y: 7, label: "and me" },
  ],
  schema: {
    x: { type: "quantitative", domain: [0, 10] },
    y: { type: "quantitative", domain: [0, 10] },
    label: { type: "categorical", domain: ["drag me", "and me"] },
  },
  features: [
    text({ fontSize: 13, fill: "#2563eb",
      channels: {
        x: { field: "x" }, y: { field: "y" },
        text: { field: "label" },
      },
      edits: [ drag({ channels: ["x", "y"] }) ],
    }),
  ],
}))`,
                },
                {
                    title: 'Draggable numeric readout',
                    blurb: 'The label IS the value: text and y read the same field, and drag() on y rewrites it — so the number updates as you drag. format keeps the display tidy.',
                    try: '<b>Drag</b> the number up or down.',
                    code:
`mount(Elicit({
  width: 360, height: 260,
  margins: { top: 16, right: 16, bottom: 28, left: 40 },
  data: [ { cat: "A", n: 40 }, { cat: "B", n: 70 } ],
  schema: {
    cat: { type: "categorical", domain: ["A", "B"] },
    n:   { type: "quantitative", domain: [0, 100] },
  },
  features: [
    text({ fontSize: 16, fill: "#0d9488", format: ".1f",
      channels: {
        x: { field: "cat" },
        y: { field: "n", edit: drag() },
        text: { field: "n" },
      } }),
  ],
}))`,
                },
                {
                    title: 'Type to edit content',
                    blurb: 'editText() wires double-click-to-retype: an inline input opens, Enter commits, Esc cancels.',
                    try: '<b>Double-click</b> a label, type, and press Enter.',
                    code:
`mount(Elicit({
  width: 360, height: 220,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { x: 3, y: 5, label: "double-click" },
    { x: 7, y: 3, label: "me too" },
  ],
  schema: {
    x: { type: "quantitative", domain: [0, 10] },
    y: { type: "quantitative", domain: [0, 10] },
    label: { type: "categorical" },
  },
  features: [
    text({ fontSize: 14, fill: "#7b2d8b",
      channels: {
        x: { field: "x" }, y: { field: "y" },
        text: { field: "label", edit: editText() },
      } }),
  ],
}))`,
                },
                {
                    title: 'Drag and retype together',
                    blurb: 'Mark-level drag plus editText on the text channel: drag repositions, double-click retypes.',
                    try: '<b>Drag</b> to move; <b>double-click</b> to rename.',
                    code:
`mount(Elicit({
  width: 360, height: 220,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { x: 3, y: 5, label: "move me" },
    { x: 7, y: 3, label: "rename me" },
  ],
  schema: {
    x: { type: "quantitative", domain: [0, 10] },
    y: { type: "quantitative", domain: [0, 10] },
    label: { type: "categorical" },
  },
  features: [
    text({ fontSize: 14, fill: "#b45309",
      channels: {
        x: { field: "x" }, y: { field: "y" },
        text: { field: "label", edit: editText() },
      },
      edits: [ drag({ channels: ["x", "y"] }) ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
