import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "anyEdit({ pick: \"probe\", stage, advance })",
    summary: (
      <>
        Not a new edit — a <b>pick</b>, i.e. a driver (<code className="inline">src/edit/drivers/probe.js</code>). It runs the edit you gave it twice through one shared code path: on <code className="inline">hover</code> the proposal is parked as a preview, on <code className="inline">click</code> the identical proposal is committed. The preview therefore <i>is</i> what the click writes — it cannot drift.
      </>
    ),
    signatures: [
      "rotate({ pick: \"probe\", stage: 0 })          // line follows the pointer; click sets it",
      "drag({ pick: \"probe\", advance: false })      // a knob that tracks then settles",
      "create({ pick: \"probe\", advance: false })    // a tentative dot, made real on click",
      "toggle({ pick: \"probe\", channels: [\"x\",\"y\"] })  // preview a cell being (un)picked",
    ],
    options: [
      {
        name: "stage",
        type: "number",
        default: "null",
        desc: "Active only in this stage. A click settling it advances the chart to the next stage, freezing the field.",
      },
      {
        name: "advance",
        type: "boolean",
        default: "true",
        desc: (
          <>
            Set <code className="inline">false</code> so a click commits without advancing — the edit stays live for repeated answers.
          </>
        ),
      },
    ],
    returns: (
      <>
        Previews never reach <code className="inline">onChange</code>, <code className="inline">getData</code> or the belief store; leaving the plot discards the proposal. Constraints run on the preview too, so a rejected value never even previews.
      </>
    ),
  },
];
