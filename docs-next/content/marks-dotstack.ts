import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/dotstack",
  "title": "Stacked dots",
  "lead": "A <b>dot histogram</b> — the \"drop tokens into slots\" elicitation. Each datum is one token; tokens sharing a slot stack into a countable column. Click an empty slot to add a token (<code class=\"inline\">create</code>), click a token to remove it (<code class=\"inline\">remove</code>). The belief is just how many tokens sit in each slot — <code class=\"inline\">data.filter(d => d.bin === b).length</code>.",
  "api": [
    {
      "name": "dotStack(options) · dotStackY(options) · dotStackX(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. The category axis is a band/point scale over the discrete slots. <code class=\"inline\">dotStackY</code> stacks upward (category on x); <code class=\"inline\">dotStackX</code> rightward (category on y); <code class=\"inline\">dotStack</code> auto-detects.",
      "signatures": [
        "dotStack({ channels, size, gap, ghost, label, edits, constraints, id }) → Feature"
      ],
      "options": [
        {
          "name": "channels",
          "type": "object",
          "default": "{}",
          "desc": "A band/point category axis whose <code class=\"inline\">domain</code> is the slot list."
        },
        {
          "name": "size",
          "type": "number",
          "default": "7",
          "desc": "Token radius (fixed geometry — the stack offset is 2·size + gap per token)."
        },
        {
          "name": "gap",
          "type": "number",
          "default": "2",
          "desc": "Vertical gap between stacked tokens."
        },
        {
          "name": "ghost",
          "type": "boolean",
          "default": "true",
          "desc": "Draw a faint open ring at each slot's next position (a droppable affordance)."
        },
        {
          "name": "label",
          "type": "boolean",
          "default": "false",
          "desc": "Draw the per-slot count above each column."
        }
      ],
      "channels": [
        {
          "name": "x / y",
          "type": "band | point",
          "desc": "The category (slot) axis; the other axis is a pure count of stacked tokens."
        }
      ],
      "returns": "A <b>feature</b> emitting one <code class=\"inline\">circle</code> per token, plus optional ghost rings and count labels."
    }
  ],
  "sections": [
    {
      "id": "basics",
      "title": "Dropping tokens",
      "intro": "Click to drop a token into the nearest slot; click a token to take it back. count() caps the budget.",
      "examples": [
        "marks-dotstack/probability-tokens-over-bins",
        "marks-dotstack/tentative-dot-on-hover-probe",
        "marks-dotstack/per-slot-cap-with-unique"
      ]
    }
  ]
};

export default page;
