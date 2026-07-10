// Overview — the anatomy of a chart.
export default {
    path: 'index.html',
    title: 'VibeJS documentation',
    lead:
        'A chart is a declarative <code class="inline">Elicit(spec)</code>: a list of ' +
        '<b>marks</b>, each with <b>channels</b> that map data fields to visuals. Every ' +
        'example on these pages shows the <b>exact code that drew the chart beside it</b> — ' +
        'the snippet is run verbatim. This page is the 30-second tour; the sidebar goes deep ' +
        'on each mark and feature.',
    api: [
        {
            name: 'Elicit(spec)',
            summary:
                'The entry point (<code class="inline">vibe.Elicit</code>). Returns a DOM element you append. ' +
                'The spec is a chart: a list of <code class="inline">features</code> (marks) plus size, margins ' +
                'and global axes/guides.',
            signature: 'Elicit({ width, height, margins, features, axes, guides, effects, renderer }) → HTMLElement',
            options: [
                { name: 'width / height', type: 'number', default: '600 / 400', desc: 'Outer pixel size of the chart element.' },
                { name: 'margins', type: '{top,right,bottom,left}', default: '{20,20,30,40}', desc: 'Inset around the inner plot (leaves room for axes).' },
                { name: 'features', type: 'Feature[]', default: '[]', desc: 'The marks — <code class="inline">bar(...)</code>, <code class="inline">point(...)</code>, <code class="inline">composite(...)</code>, … drawn in order.' },
                { name: 'x / y', type: 'ScaleSpec', default: 'from marks', desc: 'Optional top-level positional scale specs (a shared domain across marks).' },
                { name: 'axes', type: 'object | false', default: 'auto', desc: 'Global axis convenience — desugars into axis/grid marks; <code class="inline">false</code> drops them.' },
                { name: 'guides', type: 'Guide[]', default: '[]', desc: 'Non-interactive annotations rebuilt every render.' },
                { name: 'effects', type: 'object', default: 'defaults', desc: 'Interaction-feedback layer (grab / select), kept off mark paint channels.' },
                { name: 'renderer', type: 'Renderer', default: 'D3Renderer', desc: 'The scene-graph renderer; swappable for Canvas/WebGL.' },
            ],
            returns:
                'An <b>HTMLElement</b> (a positioned container). The engine deep-copies each feature’s ' +
                '<code class="inline">data</code>, resolves one global scale per channel, and re-renders on every edit commit.',
        },
    ],
    sections: [
        {
            id: 'anatomy',
            title: 'A minimal chart',
            intro:
                'An Elicit spec is a renderer plus a list of features (marks). A mark binds ' +
                'channels (x, y, fill, size, …) to data fields through scales. That is the ' +
                'whole model: encode (data → visual) one way, edit (gesture → data) the other.',
            examples: [
                {
                    title: 'A bar mark',
                    blurb:
                        'x is a band of categories, y a linear value, fill a constant. ' +
                        'This is a complete, static Elicit spec.',
                    code:
`mount(Elicit({
  width: 380, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { cat: "A", n: 30 }, { cat: "B", n: 55 },
    { cat: "C", n: 22 }, { cat: "D", n: 44 },
  ],
  schema: {
    cat: { type: "categorical", domain: ["A", "B", "C", "D"] },
    n:   { type: "quantitative", domain: [0, 60] },
  },
  features: [
    bar({
      fill: "#4f46e5",
      channels: {
        x: { field: "cat" },
        y: { field: "n" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'encode-edit',
            title: 'Encoding, and its inverse',
            intro:
                'Attach an edit to a channel and a gesture writes that channel back to the ' +
                'data through the same scale. The bar below is identical to the one above, ' +
                'except y now carries edit: drag() — so encoding (data → bar height) gains ' +
                'its inverse (drag → data).',
            examples: [
                {
                    title: 'The same bar, now editable',
                    blurb: 'y carries edit: drag(). Dragging a bar writes its value back to the data.',
                    try: '<b>Drag</b> a bar up or down.',
                    code:
`mount(Elicit({
  width: 380, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  data: [
    { cat: "A", n: 30 }, { cat: "B", n: 55 },
    { cat: "C", n: 22 }, { cat: "D", n: 44 },
  ],
  schema: {
    cat: { type: "categorical", domain: ["A", "B", "C", "D"] },
    n:   { type: "quantitative", domain: [0, 60] },
  },
  features: [
    bar({
      fill: "#4f46e5",
      channels: {
        x: { field: "cat" },
        y: { field: "n", edit: drag() },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
