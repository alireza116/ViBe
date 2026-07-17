import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "edit({ stage }) · container.setStage / nextStage / getStage",
    summary: (
      <>
        Add <code className="inline">stage</code> to any edit factory. The engine filters edits by the current stage in dispatch, cursor, plane-on-top, and guides — one gate everywhere.
      </>
    ),
    signatures: [
      "drag({ stage: 1 })            // active only in stage 1",
      "const el = Elicit({ stage: 0, ... });",
      "el.getStage() → number",
      "el.setStage(n)               // set, emit \"stage\", re-render",
      "el.nextStage()               // setStage(current + 1)",
      "el.on(\"stage\", (n) => …)     // subscribe; returns an unsubscribe fn",
    ],
  },
];
