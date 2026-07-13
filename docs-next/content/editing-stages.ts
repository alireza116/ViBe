import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/editing/stages",
  "title": "Stages",
  "lead": "Multi-step elicitation: \"first do X, then do Y\". An edit may carry a numeric <code class=\"inline\">stage</code>; it is active only when it equals the chart's current stage (edits with no stage are always active). This is a uniform gate applied to every edit — the same shape as gesture matching, not a new interaction mode — so stages compose with every mark and edit. Advance from the container: <code class=\"inline\">nextStage()</code>, <code class=\"inline\">setStage(n)</code>, <code class=\"inline\">getStage()</code>, <code class=\"inline\">on(\"stage\", cb)</code>.",
  "api": [
    {
      "name": "edit({ stage }) · container.setStage / nextStage / getStage",
      "summary": "Add <code class=\"inline\">stage</code> to any edit factory. The engine filters edits by the current stage in dispatch, cursor, plane-on-top, and guides — one gate everywhere.",
      "signatures": [
        "drag({ stage: 1 })            // active only in stage 1",
        "const el = Elicit({ stage: 0, ... });",
        "el.getStage() → number",
        "el.setStage(n)               // set, emit \"stage\", re-render",
        "el.nextStage()               // setStage(current + 1)",
        "el.on(\"stage\", (n) => …)     // subscribe; returns an unsubscribe fn"
      ]
    }
  ],
  "sections": [
    {
      "id": "basics",
      "title": "Place, then size",
      "intro": "Stage 0 drags the point along x (where); stage 1 resizes it (how confident). Only one edit is live at a time.",
      "examples": [
        "editing-stages/two-stage-point"
      ]
    }
  ]
};

export default page;
