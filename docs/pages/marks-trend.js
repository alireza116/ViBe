// Intercept-then-slope line — trend mark.
export default {
    path: 'marks/trend.html',
    title: 'Trend line',
    lead:
        'An <b>intercept-then-slope</b> line. The single datum <code class="inline">{ intercept, ' +
        'slope }</code> is a linear belief; the mark draws <code class="inline">y = intercept + ' +
        'slope·x</code> across the x domain plus two handles — an <b>intercept</b> handle that ' +
        'translates the line and a <b>slope</b> handle that rotates it about the anchor. Stage ' +
        'the two handles to elicit the level first, then the trend.',
    api: [
        {
            name: 'trend(options)',
            summary: 'Import from <code class="inline">vibe.plot</code>. A single-datum glyph; the fitted line is non-interactive and each handle is a draggable circle scoped to its own field.',
            signatures: [
                'trend({ anchor, probe, interceptStage, slopeStage, handleRadius, id }) → Feature',
            ],
            options: [
                { name: 'anchor', type: 'number', default: 'x-domain min', desc: 'x position of the intercept handle and the slope-rotation pivot.' },
                { name: 'probe', type: 'number', default: 'x-domain max', desc: 'x position of the slope handle.' },
                { name: 'interceptStage', type: 'number', default: 'null', desc: 'Stage in which the intercept handle is active (null = always).' },
                { name: 'slopeStage', type: 'number', default: 'null', desc: 'Stage in which the slope handle is active (null = always).' },
                { name: 'handleRadius', type: 'number', default: '6', desc: 'Handle circle radius.' },
            ],
            returns: 'A <b>feature</b> emitting the fitted <code class="inline">line</code> plus two handle <code class="inline">circle</code>s (tagged <code class="inline">intercept</code> / <code class="inline">slope</code>).',
        },
    ],
    sections: [
        {
            id: 'twostep',
            title: 'Intercept, then slope',
            intro: 'Stage 0: drag the left handle to set the level. Stage 1: drag the right handle to set the trend (rotating about the anchor).',
            examples: [
                {
                    title: 'Trend line',
                    blurb: 'The plot x/y scales come from spec.x / spec.y.',
                    try: 'drag the left dot; press Next; drag the right dot.',
                    code:
`const chart = Elicit({
  width: 360, height: 300,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  x: { type: "linear", domain: [0, 10] },
  y: { type: "linear", domain: [-10, 10] },
  data: [{ intercept: 0, slope: 1 }],
  onChange: (d) => console.log(d[0]),
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
  x: { type: "linear", domain: [0, 10] },
  y: { type: "linear", domain: [0, 20] },
  data: [{ intercept: 4, slope: 1 }],
  features: [
    trend(),
  ],
}));`,
                },
            ],
        },
    ],
};
