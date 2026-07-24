import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "anyEdit({ pick: \"probe\", stage, advance })",
    summary: (
      <>
        Not a new edit — a <b>pick</b>, i.e. a driver (<code className="inline">src/edit/drivers/probe.js</code>). It runs the edit you gave it twice through one shared code path: on <code className="inline">hover</code>/<code className="inline">drag</code> the proposal is parked as a preview and drawn as an inert <b>ghost</b>, and on <code className="inline">click</code>/<code className="inline">dragend</code> the identical proposal is committed. The ghost therefore <i>is</i> what a commit writes — it cannot drift. Both gestures settle, so a knob can be dragged as well as clicked.
      </>
    ),
    signatures: [
      "rotate({ pick: \"probe\", stage: 0 })          // line follows the pointer; click sets it",
      "move({ pick: \"probe\", advance: false })      // a knob that tracks then settles",
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
