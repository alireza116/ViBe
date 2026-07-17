import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "effects (on Elicit)",
    summary: (
      <>
        The interaction-feedback layer, passed as <code className="inline">effects</code> on <code className="inline">Elicit</code>. Partial sub-objects merge over the defaults, so you override just the part you care about.
      </>
    ),
    signatures: [
      "effects: { grab, select }",
    ],
    options: [
      {
        name: "grab",
        type: "false | string | { filter }",
        default: "brightness(0.82)",
        desc: (
          <>
            Element effect applied to a mark while it is dragged. A string is shorthand for <code className="inline">{'{'} filter {'}'}</code>; <code className="inline">false</code> disables it.
          </>
        ),
      },
      {
        name: "select",
        type: "false | object",
        default: "enabled",
        desc: (
          <>
            Overlay for proximity/nearest selection; <code className="inline">false</code> turns it off.
          </>
        ),
      },
      {
        name: "select.color",
        type: "string",
        default: "accent",
        desc: "Colour of the ring + highlight.",
      },
      {
        name: "select.ring",
        type: "object",
        default: "—",
        desc: "The snap-zone ring at the pointer (radius / stroke config).",
      },
      {
        name: "select.highlight",
        type: "object",
        default: "—",
        desc: "The outline drawn around the currently-selected mark.",
      },
    ],
    returns: (
      <>
        Feedback draws in its own layer — never on a mark’s <code className="inline">fill</code>/<code className="inline">stroke</code> — so it can’t clobber data-driven style.
      </>
    ),
  },
];
