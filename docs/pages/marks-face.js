// Face mark — an expressive, parametric emotion glyph (Chernoff-style).
export default {
    path: 'marks/face.html',
    title: 'Face (emotion)',
    lead:
        '<code class="inline">face</code> encodes emotion — a datum\'s fields — into a face, and lets you ' +
        '<b>directly manipulate the features</b> to write them back: grab the mouth and pull it into a smile, ' +
        'drag an eye wider, tilt a brow. A face has seven parameters; each is only editable when you ' +
        '<b>bind it to a field</b>, so you turn on exactly the expressions you want to elicit.',
    api: [
        {
            name: 'face(options)',
            summary:
                'Import from <code class="inline">vibe.plot</code>. A single-datum glyph (like ' +
                '<code class="inline">trend</code>): the parts derive from the params, and the bound ones ' +
                'are their own drag targets — grab the feature itself, no floating handles. Its centre is ' +
                'placed by the x/y channels when present, else parked at the plot centre.',
            signature: 'face({ channels, size, handles, edits, constraints, id }) → Feature',
            options: [
                { name: 'channels', type: 'FaceChannels', default: 'emotion preset', desc: 'The channel map. The <b>seven face params are channels</b> — bind a field with <code class="inline">mouthCurve: { field: \'joy\' }</code> (editable), or pin a constant with <code class="inline">{ value: 0.8 }</code>. Bind none for the emotion preset (mouthCurve ← valence, eyeScale ← arousal); binding any one replaces it.' },
                { name: 'size', type: 'number', default: 'min(w,h)·0.35', desc: 'Face radius in px. Set it when drawing many faces so they don\'t overlap.' },
                { name: 'handles', type: 'boolean', default: 'true', desc: 'Show the small eyelid/lip grab dots (squint & open). false keeps them grabbable but invisible.' },
                { name: 'channels.x / .y', type: 'ChannelSpec', default: '—', desc: 'Optional: place the face centre in a plot (small-multiples, or an emotion-space scatter).' },
                { name: 'fill, stroke', type: 'style', default: "'#FFD666' / '#B7791F'", desc: 'The face colour.' },
            ],
            channels: [
                { name: 'mouthCurve', type: 'linear', desc: 'Mouth curvature — deep frown ↔ deep smile. Drag the mouth ↕. (Preset: ← <code class="inline">valence</code>.)' },
                { name: 'mouthOpen', type: 'linear', desc: 'Mouth openness — closed line ↔ wide cavity. Drag the lower-lip dot ↓.' },
                { name: 'mouthAsym', type: 'linear', desc: 'Mouth asymmetry — centred ↔ smirk. Drag the mouth ↔.' },
                { name: 'eyeScale', type: 'linear', desc: 'Eye aperture — pinpricks ↔ huge. Drag an eye ↕. (Preset: ← <code class="inline">arousal</code>.)' },
                { name: 'eyeSquint', type: 'linear', desc: 'Eye squint — round ↔ flat. Drag the eyelid dot ↓.' },
                { name: 'browHeight', type: 'linear', desc: 'Brow height — slammed ↔ high arch. Drag a brow ↕.' },
                { name: 'browTilt', type: 'linear', desc: 'Brow tilt — sad (outer-down) ↔ angry (inner-down). Drag a brow ↔.' },
                { name: 'x, y', type: 'linear | band', desc: 'Face centre; omitted parks it at the plot centre.' },
            ],
            returns: 'A <b>feature</b> emitting a face per datum (outline, eyes, brows, mouth, and eyelid/lip dots for the pull params).',
        },
    ],
    sections: [
        {
            id: 'emotion',
            title: 'One face — drag to feel',
            intro:
                'The emotion preset binds <code class="inline">mouthCurve</code> to ' +
                '<code class="inline">valence</code> and <code class="inline">eyeScale</code> to ' +
                '<code class="inline">arousal</code>. Grab the mouth and pull it up to smile, or drag an eye ' +
                'to widen it — each gesture inverts through the field\'s scale, and the whole face re-derives.',
            examples: [
                {
                    title: 'Valence × arousal',
                    blurb: 'The two-field emotion preset. The mouth and eyes are the drag targets themselves.',
                    try: '<b>Drag the mouth</b> up/down (valence) or <b>drag an eye</b> up/down (arousal).',
                    code:
`mount(Elicit({
  width: 320, height: 320,
  margins: { top: 12, right: 12, bottom: 12, left: 12 },
  data: [ { valence: 0.3, arousal: 0.1 } ],
  schema: {
    valence: { type: "quantitative", domain: [-1, 1] },
    arousal: { type: "quantitative", domain: [-1, 1] },
  },
  features: [ face() ],
}))`,
                },
            ],
        },
        {
            id: 'expressive',
            title: 'Turn on more expressions',
            intro:
                'Bind any subset of the seven params in <code class="inline">channels</code>, each a plain ' +
                '<code class="inline">{ field }</code> — the binding both drives the geometry and makes that ' +
                'feature draggable. Unbound params stay ' +
                'neutral. Here every param is live: mouth (↕ curve, ↔ smirk), eyes (↕ aperture), the eyelid ' +
                'dot (↓ squint), the lip dot (↓ open), and the brows (↕ height, ↔ tilt).',
            examples: [
                {
                    title: 'Full Chernoff face',
                    blurb: 'All seven parameters bound to fields; grab any feature to sculpt the expression.',
                    try: '<b>Drag</b> the mouth, eyes, brows, or the eyelid / lip dots.',
                    code:
`mount(Elicit({
  width: 340, height: 340,
  margins: { top: 12, right: 12, bottom: 12, left: 12 },
  data: [ {
    curve: 0.7, open: 0.2, smirk: 0.5,
    aperture: 0.6, squint: 0.2, browH: 0.5, browT: 0.4,
  } ],
  schema: {
    curve:    { type: "quantitative", domain: [0, 1] },
    open:     { type: "quantitative", domain: [0, 1] },
    smirk:    { type: "quantitative", domain: [0, 1] },
    aperture: { type: "quantitative", domain: [0, 1] },
    squint:   { type: "quantitative", domain: [0, 1] },
    browH:    { type: "quantitative", domain: [0, 1] },
    browT:    { type: "quantitative", domain: [0, 1] },
  },
  features: [
    face({
      channels: {
        mouthCurve: { field: "curve" }, mouthOpen: { field: "open" }, mouthAsym: { field: "smirk" },
        eyeScale: { field: "aperture" }, eyeSquint: { field: "squint" },
        browHeight: { field: "browH" }, browTilt: { field: "browT" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'multiples',
            title: 'Many faces in a plot',
            intro:
                'Give the face an <code class="inline">x</code> (or <code class="inline">y</code>) channel ' +
                'and it is placed like a <code class="inline">point</code> — one editable face per row. ' +
                'Set <code class="inline">x: { field: \'valence\' }, y: { field: \'arousal\' }</code> instead ' +
                'and the faces become an emotion-space scatter that moves as you edit them.',
            examples: [
                {
                    title: 'A mood per person',
                    blurb: 'Faces positioned along a categorical x; drag each one\'s mouth or eyes to set that person\'s emotion.',
                    try: '<b>Drag</b> any face\'s mouth or an eye.',
                    code:
`mount(Elicit({
  width: 540, height: 260,
  margins: { top: 16, right: 20, bottom: 34, left: 20 },
  axes: { x: {}, y: false },
  data: [
    { who: "Ana", valence: 0.6, arousal: 0.4 },
    { who: "Ben", valence: -0.5, arousal: -0.2 },
    { who: "Cy",  valence: 0.1, arousal: 0.8 },
  ],
  schema: {
    who:     { type: "categorical", domain: ["Ana", "Ben", "Cy"] },
    valence: { type: "quantitative", domain: [-1, 1] },
    arousal: { type: "quantitative", domain: [-1, 1] },
  },
  features: [
    face({ size: 46, channels: { x: { field: "who" } } }),
  ],
}))`,
                },
            ],
        },
    ],
};
