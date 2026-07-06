// Overview — the anatomy of a chart.
export default {
    path: 'index.html',
    title: 'VibeJS documentation',
    lead:
        'A chart is a declarative <code class="inline">Elicit(spec)</code>: a list of ' +
        '<b>marks</b>, each with an <b>encoding</b> that maps data to visuals. Every ' +
        'example on these pages shows the <b>exact code that drew the chart beside it</b> — ' +
        'the snippet is run verbatim. This page is the 30-second tour; the sidebar goes deep ' +
        'on each mark and feature.',
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
  features: [
    bar({
      data: [
        { cat: "A", n: 30 }, { cat: "B", n: 55 },
        { cat: "C", n: 22 }, { cat: "D", n: 44 },
      ],
      fill: "#4f46e5",
      encoding: {
        x: { field: "cat", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "n",   type: "linear", domain: [0, 60] },
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
  features: [
    bar({
      fill: "#4f46e5",
      data: [
        { cat: "A", n: 30 }, { cat: "B", n: 55 },
        { cat: "C", n: 22 }, { cat: "D", n: 44 },
      ],
      encoding: {
        x: { field: "cat", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "n", type: "linear", domain: [0, 60], edit: drag() },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
