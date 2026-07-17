import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "widgets.likert · multipleChoice · slider · matrix · lineCone · ranking · allocation · …",
    summary: (
      <>
        Import from <code className="inline">vibe.widgets</code>. Each returns an ElicitSpec; pass it straight to <code className="inline">Elicit</code>. The chart elicits one dataset, so <code className="inline">getData()</code> reads the answer.
      </>
    ),
    signatures: [
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
      "labeledValue({ question, mode, value, domain, onChange }) → ElicitSpec",
    ],
    options: [
      {
        name: "options",
        type: "any[]",
        default: "[]",
        desc: "Response choices (a band scale) for likert / choice / matrix.",
      },
      {
        name: "max",
        type: "number",
        default: "∞",
        desc: (
          <>
            multipleChoice: cap on picks (<code className="inline">count</code>, reject).
          </>
        ),
      },
      {
        name: "domain / step",
        type: "number",
        default: "—",
        desc: "slider: value range and optional snap increment.",
      },
      {
        name: "questions",
        type: "any[]",
        default: "[]",
        desc: "matrix: the rows (band y).",
      },
      {
        name: "x / y",
        type: "string",
        default: "'x' / 'y'",
        desc: "lineCone: the two variable names, labelled high/low on the crosshair.",
      },
      {
        name: "onChange",
        type: "(data) => void",
        default: "—",
        desc: "Called with the committed answer(s). Hover previews never fire it.",
      },
    ],
    returns: (
      <>
        An <b>ElicitSpec</b>. The widget package also exports the same affordance helpers (<code className="inline">THEME</code>, <code className="inline">optionRings</code>, …) if you want to reuse them — the plain-API twins below define those helpers inline instead, so each block stands alone.
      </>
    ),
  },
];
