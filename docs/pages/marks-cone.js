// Line + Cone correlation elicitation — cone mark + rotate edit + probe driver.
export default {
    path: 'marks/cone.html',
    title: 'Line + Cone',
    lead:
        'A correlation belief in two clicks. The single datum <code class="inline">{ r, spread }' +
        '</code> is a relationship: <b>r</b> is the most-likely correlation — a line through the ' +
        'plot centre rotating from −45° to +45° as r goes −1 → +1 — and <b>spread</b> is the ' +
        'uncertainty, a fan of sample lines around it. Driven by <code class="inline">rotate</code> ' +
        '(the angular sibling of <code class="inline">resize</code>: a pointer angle inverted ' +
        'through the channel scale) on the <a href="probe.html">probe</a> driver, so the line ' +
        'follows the mouse and a click sets it.',
    api: [
        {
            name: 'cone(options)',
            summary: 'Import from <code class="inline">vibe.plot</code>. A single-datum glyph; all nodes are non-interactive (the whole plane is the gesture surface).',
            signatures: [
                'cone({ channels, samples, seed, wedge, sigma, id }) → Feature',
            ],
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'An <code class="inline">angle</code> channel (r → degrees) and a <code class="inline">spread</code> channel; put a <code class="inline">rotate</code> edit on each.' },
                { name: 'samples', type: 'number', default: '40', desc: 'Number of cone sample lines.' },
                { name: 'seed', type: 'number', default: '7', desc: 'PRNG seed — the fan is stable across re-renders, so a hover does not make it shimmer.' },
                { name: 'wedge', type: 'boolean', default: 'false', desc: 'Fill a translucent wedge spanning the envelope.' },
                { name: 'sigma', type: 'number', default: '1.96', desc: 'Samples are drawn from <code class="inline">Normal(r, spread / sigma)</code>, so ~95% land inside the envelope the reader pointed at.' },
            ],
            channels: [
                { name: 'angle', type: 'linear (deg range)', desc: 'The correlation r, mapped to degrees by its scale — <code class="inline">scale: { range: [-45, 45] }</code>. The domain <code class="inline">[-1, 1]</code> comes from the schema.' },
                { name: 'spread', type: 'linear (deg range)', desc: 'The <b>half-width</b> of the plausible envelope in r units — the quantity the pointer names, so the line under the cursor is the edge of the fan. <code class="inline">scale: { range: [0, 45] }</code>.' },
            ],
            returns: 'A <b>feature</b> emitting a mean <code class="inline">line</code>, sample lines, and an optional wedge <code class="inline">path</code>.',
        },
    ],
    sections: [
        {
            id: 'twostep',
            title: 'Relationship, then uncertainty',
            intro:
                'Stage 0 rotates the mean line; a click commits r and advances. Stage 1 opens the cone; a click ' +
                'commits the spread. No buttons — the probe driver advances on each click.',
            examples: [
                {
                    title: 'Line + Cone',
                    blurb: 'Move to aim, click to set. Move to open the cone, click to set that too.',
                    try: 'move the mouse, click, move again, click.',
                    code:
`mount(Elicit({
  width: 360, height: 320,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  axes: false,
  data: [{ r: 0, spread: 0 }],
  onChange: (d) => console.log(d[0]),
  schema: {
    r:      { type: "quantitative", domain: [-1, 1] },
    spread: { type: "quantitative", domain: [0, 1] },
  },
  features: [
    cone({
      channels: {
        // Schema owns the domain (r units); the scale owns the range (degrees).
        angle: { field: "r", scale: { range: [-45, 45] },
                 edit: rotate({ pick: "probe", stage: 0 }) },
        spread: { field: "spread", scale: { range: [0, 45] },
                  edit: rotate({ pick: "probe", stage: 1,
                                 relativeTo: "angle" }) },
      },
      samples: 60, wedge: true,
    }),
  ],
}));`,
                },
                {
                    title: 'Static cone',
                    blurb: 'Without edits it is just a display of a belief — r = 0.6, envelope ±0.25.',
                    code:
`mount(Elicit({
  width: 300, height: 280,
  margins: { top: 16, right: 16, bottom: 16, left: 16 },
  axes: false,
  data: [{ r: 0.6, spread: 0.25 }],
  schema: {
    r:      { type: "quantitative", domain: [-1, 1] },
    spread: { type: "quantitative", domain: [0, 1] },
  },
  features: [
    cone({
      channels: {
        angle: { field: "r", scale: { range: [-45, 45] } },
        spread: { field: "spread", scale: { range: [0, 45] } },
      },
      samples: 80, wedge: true, stroke: "#d33",
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
