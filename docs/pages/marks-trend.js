// Intercept-then-slope line — trend mark.
export default {
    path: 'marks/trend.html',
    title: 'Trend line',
    lead:
        'An <b>intercept-then-slope</b> line. The single datum <code class="inline">{ intercept, ' +
        'slope }</code> is a linear belief; the mark draws <code class="inline">y = intercept + ' +
        'slope·x</code> across the plot (clipped to the plot rectangle) plus two handles — an ' +
        '<b>intercept</b> handle at <code class="inline">x = 0</code> that translates the line and a ' +
        '<b>slope</b> handle that rotates it about the anchor. By default the axes cross at the ' +
        'origin. Stage the two handles to elicit the level first, then the trend. Trend is the ' +
        'one mark whose <code class="inline">x</code>/<code class="inline">y</code> channels name ' +
        'the plot’s <i>axes</i> rather than columns of its datum: declare them in the schema ' +
        '(typically spanning negatives so the intercept sits in the middle of the frame).',
    api: [
        {
            name: 'trend(options)',
            summary: 'Import from <code class="inline">vibe.plot</code>. A single-datum glyph; the fitted line is non-interactive and each handle is a draggable circle scoped to its own field.',
            signatures: [
                'trend({ anchor, probe, interceptStage, slopeStage, handleSize, id }) → Feature',
            ],
            options: [
                { name: 'anchor', type: 'number', default: '0 (if in x domain), else min', desc: 'x position of the intercept handle and the slope-rotation pivot. 0 is the classic y-intercept.' },
                { name: 'probe', type: 'number', default: 'x-domain max', desc: 'x position of the slope handle.' },
                { name: 'interceptStage', type: 'number', default: 'null', desc: 'Stage in which the intercept handle is active (null = always).' },
                { name: 'slopeStage', type: 'number', default: 'null', desc: 'Stage in which the slope handle is active (null = always).' },
                { name: 'handleSize', type: 'number', default: '6', desc: 'Handle circle radius.' },
            ],
            returns:
                'A <b>feature</b> emitting the fitted <code class="inline">line</code> (edge-to-edge through the plot) ' +
                'plus two handle <code class="inline">circle</code>s. Sets <code class="inline">isTrend</code> so ' +
                'unspecified chart axes cross at the origin.',
        },
    ],
    sections: [
        {
            id: 'twostep',
            title: 'Intercept, then slope',
            intro:
                'Domains span both sides of zero so the intercept sits on the y-axis in the middle ' +
                'of the frame. Stage 0: drag the intercept handle to set the level. Stage 1: drag ' +
                'the slope handle to set the trend (rotating about the anchor).',
            examples: [
                {
                    title: 'Trend line',
                    blurb: 'Axes cross at the origin automatically; the line runs edge-to-edge through the plot.',
                    try: 'drag the centre (intercept) dot; press Next; drag the right (slope) dot.',
                    code:
`const chart = Elicit({
  width: 360, height: 300,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  schema: {
    x: { type: "quantitative", domain: [-10, 10] },
    y: { type: "quantitative", domain: [-10, 10] },
    intercept: { type: "quantitative" },
    slope:     { type: "quantitative" },
  },
  data: [{ intercept: 0, slope: 0.6 }],
  features: [
    trend({
      interceptStage: 0,
      slopeStage: 1,
    }),
  ],
});
mount(chart);
const btn = document.createElement("button");
btn.textContent = "Next: set the slope";
btn.style.marginTop = "8px";
btn.onclick = () => { chart.nextStage(); btn.disabled = true; };
mount(btn);`,
                },
                {
                    title: 'Both handles at once',
                    blurb: 'Omit the stages (default null) to leave both handles always active.',
                    code:
`mount(Elicit({
  width: 360, height: 300,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  schema: {
    x: { type: "quantitative", domain: [-10, 10] },
    y: { type: "quantitative", domain: [-10, 10] },
    intercept: { type: "quantitative" },
    slope:     { type: "quantitative" },
  },
  data: [{ intercept: 2, slope: 0.5 }],
  features: [
    trend(),
  ],
}));`,
                },
            ],
        },
    ],
};
