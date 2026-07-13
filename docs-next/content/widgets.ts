import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/widgets",
  "title": "Widgets",
  "lead": "Opinionated <b>survey instruments</b> — option rings, cell grids, tracks — each a pure recipe over the core API. They add no interaction surface: the look lives entirely in the <a href=\"guides.html\">guide</a> layer, and the behaviour is a normal mark + a normal edit on the <a href=\"editing/probe.html\">probe</a> driver + a normal constraint. Every example below is shown twice — once as the widget, once as a <b>self-contained</b> plain-API twin that draws the same look with inline <code class=\"inline\">guides.custom</code> helpers, so you can see every line to change. Each factory returns an <b>ElicitSpec</b>: render with <code class=\"inline\">Elicit(widgets.likert({…}))</code>.",
  "api": [
    {
      "name": "widgets.likert · multipleChoice · slider · matrix · lineCone · ranking · allocation · …",
      "summary": "Import from <code class=\"inline\">vibe.widgets</code>. Each returns an ElicitSpec; pass it straight to <code class=\"inline\">Elicit</code>. The chart elicits one dataset, so <code class=\"inline\">getData()</code> reads the answer.",
      "signatures": [
        "likert({ question, options, value, onChange }) → ElicitSpec",
        "multipleChoice({ question, options, max, value, onChange }) → ElicitSpec",
        "slider({ question, domain, step, value, format, onChange }) → ElicitSpec",
        "matrix({ question, questions, options, value, onChange }) → ElicitSpec",
        "lineCone({ question, x, y, r, spread, wedge, onChange }) → ElicitSpec",
        "ranking({ question, items, onChange }) → ElicitSpec",
        "allocation({ question, categories, targetSum, onChange }) → ElicitSpec",
        "probabilityTokens({ question, bins, maxTokens, onChange }) → ElicitSpec",
        "interval / ci({ question, mean, lo, hi, domain, onChange }) → ElicitSpec",
        "histogram({ question, bins, max, onChange }) → ElicitSpec",
        "region({ question, xDomain, yDomain, onChange }) → ElicitSpec",
        "thermometer({ question, domain, step, value, onChange }) → ElicitSpec",
        "labeledValue({ question, mode, value, domain, onChange }) → ElicitSpec"
      ],
      "options": [
        {
          "name": "options",
          "type": "any[]",
          "default": "[]",
          "desc": "Response choices (a band scale) for likert / choice / matrix."
        },
        {
          "name": "max",
          "type": "number",
          "default": "∞",
          "desc": "multipleChoice: cap on picks (<code class=\"inline\">count</code>, reject)."
        },
        {
          "name": "domain / step",
          "type": "number",
          "default": "—",
          "desc": "slider: value range and optional snap increment."
        },
        {
          "name": "questions",
          "type": "any[]",
          "default": "[]",
          "desc": "matrix: the rows (band y)."
        },
        {
          "name": "x / y",
          "type": "string",
          "default": "'x' / 'y'",
          "desc": "lineCone: the two variable names, labelled high/low on the crosshair."
        },
        {
          "name": "onChange",
          "type": "(data) => void",
          "default": "—",
          "desc": "Called with the committed answer(s). Hover previews never fire it."
        }
      ],
      "returns": "An <b>ElicitSpec</b>. The widget package also exports the same affordance helpers (<code class=\"inline\">THEME</code>, <code class=\"inline\">optionRings</code>, …) if you want to reuse them — the plain-API twins below define those helpers inline instead, so each block stands alone."
    }
  ],
  "sections": [
    {
      "id": "likert",
      "title": "Likert scale",
      "intro": "A point on a band of options + create (probe) + count({ max: 1, replace }). Hover to preview the answer, click to fill it.",
      "examples": [
        "widgets/as-a-widget",
        "widgets/the-same-thing-plain-api"
      ]
    },
    {
      "id": "choice",
      "title": "Multiple choice",
      "intro": "toggle() folds create and remove into one gesture: click an empty option to pick it, click your pick to take it back. count() caps the total.",
      "examples": [
        "widgets/as-a-widget-pick-2",
        "widgets/the-same-thing-plain-api-2"
      ]
    },
    {
      "id": "slider",
      "title": "Slider",
      "intro": "A single knob that tracks the pointer and settles on click — drag({ pick: \"probe\" }). snap() lands it on steps. The track can be a guide or a centred axisX — same instrument, two ways to draw the chrome.",
      "examples": [
        "widgets/as-a-widget-2",
        "widgets/plain-api-track-as-a-guide",
        "widgets/plain-api-track-as-a-centred-axis"
      ]
    },
    {
      "id": "matrix",
      "title": "Question matrix",
      "intro": "Band y of questions × band x of options. toggle() on the (x, y) tuple names a cell; unique({ field: \"question\", replace }) keeps one answer per row.",
      "examples": [
        "widgets/as-a-widget-3",
        "widgets/the-same-thing-plain-api-3"
      ]
    },
    {
      "id": "linecone",
      "title": "Line + Cone",
      "intro": "The two-step correlation instrument: aim the line and click, open the cone and click. getData() → [{ r, spread }]. The crosshair frame can be a guide, or two centred axes with ticks only at the ends — same idea, axis usually simpler.",
      "examples": [
        "widgets/as-a-widget-4",
        "widgets/plain-api-crosshair-as-a-guide",
        "widgets/plain-api-crosshair-as-centred-axes",
        "widgets/plain-api-axes-for-the-frame-guides-for-labels"
      ]
    },
    {
      "id": "styles",
      "title": "Customizing styles",
      "intro": "The instrument look is just guides + mark paint. Change colours in the inline guide helpers, paint the answer mark differently, or replace the affordance entirely with your own <code class=\"inline\">guides.custom</code>. Behaviour (edits / constraints) stays put.",
      "examples": [
        "widgets/override-just-the-answer-mark",
        "widgets/swap-the-affordance-guide",
        "widgets/retheme-in-the-guide-helpers"
      ]
    },
    {
      "id": "more",
      "title": "More instruments",
      "intro": "Ranking, allocation, tokens, intervals, histograms, regions, thermometers, and labeled values — each a recipe over marks + edits + constraints.",
      "examples": [
        "widgets/ranking",
        "widgets/allocation",
        "widgets/region",
        "widgets/interval-ci"
      ]
    }
  ]
};

export default page;
