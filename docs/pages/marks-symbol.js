// The `symbol` channel — categorical glyphs (emoji / unicode shapes).
export default {
    path: 'marks/symbol.html',
    title: 'Symbol & Emoji',
    lead:
        'The <code class="inline">symbol</code> channel maps a category to a <b>glyph</b> — an emoji ' +
        'or a unicode shape — exactly the way <code class="inline">fill</code> maps a category to a ' +
        'colour. It is not a mark: any shape mark (<code class="inline">point</code>, ' +
        '<code class="inline">dotStack</code>, <code class="inline">waffle</code>) renders the glyph ' +
        'in place of its circle/rect. The elicited value is still the <i>category</i>; the glyph is ' +
        'its encoding, edited with <code class="inline">cycle()</code> / <code class="inline">legend()</code>.',
    api: [
        {
            name: 'channels.symbol',
            summary:
                'A category → glyph map through an ordinal scale. Add it to any shape mark. Give it ' +
                'glyphs with <code class="inline">scale: { range: [...] }</code> or a named ' +
                '<code class="inline">scale: { scheme: \'faces\' }</code>. Non-positional and ' +
                'non-invertible — a drag can\'t set a glyph, so it\'s edited via cycle/legend/create.',
            signature: "symbol: { field, scale: { range | scheme }, edit? }",
            channels: [
                { name: 'symbol', type: 'ordinal', desc: 'Field → glyph. Range is a glyph array (<code class="inline">scale: { range: ["😢","😐","😊"] }</code>) or a scheme.' },
            ],
            options: [
                { name: 'scale.range', type: 'string[]', default: 'unicode shapes', desc: 'The glyph palette. Defaults to ●■▲◆★… when omitted.' },
                { name: 'scale.scheme', type: 'string', default: '—', desc: "Named glyph set: 'faces', 'faces5', 'hearts', 'weather', 'arrows', 'shapes'." },
                { name: 'size', type: 'number', default: 'mark default', desc: 'The mark\'s radius still sets the glyph\'s px extent, so a glyph point and a circle point match.' },
            ],
            returns: 'Nothing on its own — it changes how a host mark draws each datum.',
        },
    ],
    sections: [
        {
            id: 'point',
            title: 'Emoji points — click to cycle',
            intro:
                'A mood scatter: the y position and the glyph both encode <code class="inline">mood</code>. ' +
                'A <code class="inline">cycle()</code> on the symbol channel advances the category on click — ' +
                'the face changes and the point hops to its new row, because an edit is the inverse of encoding.',
            examples: [
                {
                    title: 'Mood over the week',
                    blurb: 'symbol maps the ordinal mood to a face; cycle() advances it on click.',
                    try: '<b>Click</b> a face to cycle its mood.',
                    code:
`mount(Elicit({
  width: 380, height: 250,
  margins: { top: 16, right: 16, bottom: 30, left: 64 },
  data: [
    { day: "Mon", mood: "ok" },   { day: "Tue", mood: "good" },
    { day: "Wed", mood: "bad" },  { day: "Thu", mood: "good" },
    { day: "Fri", mood: "great" },
  ],
  schema: {
    day:  { type: "categorical", domain: ["Mon","Tue","Wed","Thu","Fri"] },
    mood: { type: "ordinal", domain: ["bad","ok","good","great"] },
  },
  features: [
    point({
      size: 15,
      channels: {
        x: { field: "day" },
        y: { field: "mood" },
        symbol: {
          field: "mood",
          scale: { range: ["😢","😐","🙂","😄"] },
          edit: cycle(),
        },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'tokens',
            title: 'Emoji tokens — drop and remove',
            intro:
                'A constant <code class="inline">symbol</code> shorthand makes every token the same glyph. ' +
                'Because the glyph is just how the token draws, <code class="inline">create</code> / ' +
                '<code class="inline">remove</code> work unchanged — a ⭐ star-rating counter.',
            examples: [
                {
                    title: 'Star tokens',
                    blurb: 'dotStack of ⭐ tokens; click a slot to add, click a star to remove.',
                    try: '<b>Click</b> a column to add a ⭐, <b>click</b> a ⭐ to remove it.',
                    code:
`mount(Elicit({
  width: 380, height: 240,
  margins: { top: 16, right: 16, bottom: 30, left: 30 },
  data: [ { rating: 3 }, { rating: 3 }, { rating: 5 }, { rating: 4 } ],
  schema: { rating: { type: "ordinal", domain: [1, 2, 3, 4, 5] } },
  features: [
    dotStack({
      symbol: "⭐", size: 12,
      channels: { x: { field: "rating" } },
      edits: [ create({ trigger: "click", channels: ["x"] }), remove() ],
      constraints: [ count({ max: 24 }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'waffle',
            title: 'Emoji waffle — count in glyphs',
            intro:
                'A <code class="inline">symbol</code> channel turns every waffle cell into that category\'s ' +
                'glyph, so a quantity is literally countable in 🍎. Drag to fill; the empty cells stay faint ' +
                'but grabbable.',
            examples: [
                {
                    title: 'Fruit basket',
                    blurb: 'Each category\'s cells render its emoji; edit.waffle.fill drags the count.',
                    try: '<b>Drag</b> up a column to change its count.',
                    code:
`mount(Elicit({
  width: 380, height: 280,
  margins: { top: 16, right: 16, bottom: 30, left: 30 },
  data: [
    { fruit: "apples",   n: 6 },
    { fruit: "bananas",  n: 4 },
    { fruit: "cherries", n: 9 },
  ],
  schema: {
    fruit: { type: "categorical", domain: ["apples","bananas","cherries"] },
    n:     { type: "quantitative", domain: [0, 12] },
  },
  features: [
    waffleY({
      channels: {
        x: { field: "fruit" },
        y: { field: "n", edit: edit.waffle.fill() },
        symbol: { field: "fruit", scale: { range: ["🍎","🍌","🍒"] } },
      },
      constraints: [ snap({ step: 1 }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'legend',
            title: 'A glyph legend / picker',
            intro:
                'Pair <code class="inline">guides.legend({ channel: \'symbol\' })</code> with ' +
                '<code class="inline">legend()</code> for a glyph swatch row you click to set the ' +
                'category — the same as a colour legend, drawn with the glyphs themselves.',
            examples: [
                {
                    title: 'Pick a weather',
                    blurb: "A single-row belief whose glyph is set from the legend row.",
                    try: '<b>Click</b> a glyph in the legend to set today\'s weather.',
                    code:
`mount(Elicit({
  width: 360, height: 220,
  margins: { top: 60, right: 16, bottom: 20, left: 16 },
  data: [ { sky: "cloudy" } ],
  schema: { sky: { type: "ordinal", domain: ["sunny","partly","cloudy","rain","storm"] } },
  features: [
    point({
      size: 40,
      channels: {
        symbol: { field: "sky", scale: { scheme: "weather" } },
      },
      edits: [ legend({ channel: "symbol", x: 8, y: 8, size: 22, labelWidth: 8 }) ],
    }),
  ],
  guides: [ guides.legend({ channel: "symbol", x: 8, y: 8, size: 22, labelWidth: 8 }) ],
}))`,
                },
            ],
        },
    ],
};
