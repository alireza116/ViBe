import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/editing/probe",
  "title": "Probe",
  "lead": "The <b>hover / click</b> flow, with no drag: the pointer <b>probes</b> a value — the mark follows the cursor as an uncommitted preview — and a click <b>settles</b> it. Give any edit <code class=\"inline\">pick: \"probe\"</code> and it works this way, so the same primitive drives a correlation line, a slider knob, a Likert answer and a dot plot's tentative token. Add a <code class=\"inline\">stage</code> and each click commits that stage's field and advances to the next — \"set the line, now open the cone\".",
  "api": [
    {
      "name": "anyEdit({ pick: \"probe\", stage, advance })",
      "summary": "Not a new edit — a <b>pick</b>, i.e. a driver (<code class=\"inline\">src/edit/drivers/probe.js</code>). It runs the edit you gave it twice through one shared code path: on <code class=\"inline\">hover</code> the proposal is parked as a preview, on <code class=\"inline\">click</code> the identical proposal is committed. The preview therefore <i>is</i> what the click writes — it cannot drift.",
      "signatures": [
        "rotate({ pick: \"probe\", stage: 0 })          // line follows the pointer; click sets it",
        "drag({ pick: \"probe\", advance: false })      // a knob that tracks then settles",
        "create({ pick: \"probe\", advance: false })    // a tentative dot, made real on click",
        "toggle({ pick: \"probe\", channels: [\"x\",\"y\"] })  // preview a cell being (un)picked"
      ],
      "options": [
        {
          "name": "stage",
          "type": "number",
          "default": "null",
          "desc": "Active only in this stage. A click settling it advances the chart to the next stage, freezing the field."
        },
        {
          "name": "advance",
          "type": "boolean",
          "default": "true",
          "desc": "Set <code class=\"inline\">false</code> so a click commits without advancing — the edit stays live for repeated answers."
        }
      ],
      "returns": "Previews never reach <code class=\"inline\">onChange</code>, <code class=\"inline\">getData</code> or the belief store; leaving the plot discards the proposal. Constraints run on the preview too, so a rejected value never even previews."
    }
  ],
  "sections": [
    {
      "id": "twostep",
      "title": "Two questions, two clicks",
      "intro": "Stage 0 owns the angle, stage 1 owns the spread. The driver advances on each click; no app code, no buttons.",
      "examples": [
        "editing-probe/line-then-cone"
      ]
    },
    {
      "id": "preview",
      "title": "The preview is the commit",
      "intro": "A hover proposes; getData() still reports the last committed belief. The knob below tracks the pointer, but the readout only moves when you click.",
      "examples": [
        "editing-probe/probe-a-single-value",
        "editing-probe/a-tentative-token"
      ]
    }
  ]
};

export default page;
