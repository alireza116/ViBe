import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "ElicitSpec.lock",
    summary: (
      <>
        Which rows of the chart’s one dataset are read-only. A lock is a property of the <b>data</b> — not of a mark or an edit — so it lives on the spec beside <code className="inline">data</code> and <code className="inline">schema</code>, and holds for every edit from every mark.
      </>
    ),
    signatures: [
      "lock: \"seed\" | true | ((datum, index) => boolean)",
    ],
    options: [
      {
        name: "\"seed\" / true",
        type: "string | boolean",
        default: "—",
        desc: (
          <>
            The rows the chart was <b>seeded</b> with (its <code className="inline">data</code>) are fixed; anything an edit creates is free. <code className="inline">setData</code> re-seeds the chart, so it also re-takes the lock.
          </>
        ),
      },
      {
        name: "(datum, index) => boolean",
        type: "function",
        default: "—",
        desc: (
          <>
            Lock rows by what they <b>are</b> — <code className="inline">d ={'>'} d.kind === "actual"</code>, <code className="inline">d ={'>'} d.year {'<'}= 1990</code>. Re-evaluated every render, so a row can be locked by a field an edit writes.
          </>
        ),
      },
    ],
    returns: (
      <>
        Two things follow, and both are automatic. <b>Data:</b> a dataset invariant runs on every commit, <i>last</i>, so a lock outranks every other repair — a proposal that touched a locked row keeps its changes to the free rows and snaps the locked ones back (deleting one is rejected outright). <b>Pointer:</b> a locked row’s marks are not grabbable, show no editable cursor, and are skipped by proximity picking — so <code className="inline">nearest</code> / <code className="inline">sweep</code> / <code className="inline">draw</code> never even target one.
      </>
    ),
  },
];
