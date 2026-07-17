import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "create(options)",
    summary: (
      <>
        A plane gesture that mints a datum — the clicked pixel is inverted through each positional channel, plus <code className="inline">defaults</code> for the rest.
      </>
    ),
    signatures: [
      "create({ channels, defaults, trigger }) → Edit",
    ],
    options: [
      {
        name: "channels",
        type: "string[]",
        default: "['x','y']",
        desc: "Positional channels to place from the pointer (missing ones are dropped).",
      },
      {
        name: "defaults",
        type: "object",
        default: "{}",
        desc: "Seed values for the non-positional fields (group, mag, …).",
      },
      {
        name: "trigger",
        type: "'click' | 'dblclick'",
        default: "'click'",
        desc: "The plane gesture that creates.",
      },
    ],
    returns: (
      <>
        An <b>Edit</b> (<code className="inline">pick: "plane"</code>) whose <code className="inline">apply</code> returns <code className="inline">[...data, datum]</code>.
      </>
    ),
  },
  {
    name: "remove(options)",
    summary: (
      <>
        Deletes the targeted datum. Pair with <code className="inline">when</code> when another click edit shares the mark.
      </>
    ),
    signatures: [
      "remove({ pick, threshold, when, trigger }) → Edit",
    ],
    options: [
      {
        name: "pick",
        type: "'direct' | 'nearest'",
        default: "'direct'",
        desc: (
          <>
            The mark clicked, or the closest within <code className="inline">threshold</code> (deletable from empty space).
          </>
        ),
      },
      {
        name: "when",
        type: "(ctx) => boolean",
        default: "—",
        desc: (
          <>
            e.g. <code className="inline">when.alt</code> so Alt-click deletes while plain click recolours.
          </>
        ),
      },
      {
        name: "trigger / gesture",
        type: "string",
        default: "'click'",
        desc: "The gesture that removes.",
      },
    ],
    returns: (
      <>
        An <b>Edit</b> whose <code className="inline">apply</code> returns the dataset without the target index.
      </>
    ),
  },
  {
    name: "edit.line.anchor(options)",
    summary: (
      <>
        Line-scoped. Adds one point to a connected path — the proximity-aware inverse of <code className="inline">remove</code>.
      </>
    ),
    signatures: [
      "edit.line.anchor({ into, threshold, channels, trigger }) → Edit",
    ],
    options: [
      {
        name: "into",
        type: "'nearest' | 'new'",
        default: "'nearest'",
        desc: (
          <>
            Attach to the closest line within <code className="inline">threshold</code> (empty space starts a fresh series), or always start new.
          </>
        ),
      },
      {
        name: "threshold",
        type: "number",
        default: "40",
        desc: "Proximity radius for the nearest-line resolution.",
      },
      {
        name: "trigger",
        type: "string",
        default: "'click'",
        desc: "The gesture that adds a point.",
      },
    ],
    returns: (
      <>
        An <b>Edit</b> appending one datum (its series set to the resolved line).
      </>
    ),
  },
  {
    name: "edit.line.newSeries(options)",
    summary: "Seeds a whole flat line at once — one anchor per sampled domain position, at the clicked value.",
    signatures: [
      "edit.line.newSeries({ along, value, samples, trigger }) → Edit",
    ],
    options: [
      {
        name: "along / value",
        type: "'x' | 'y'",
        default: "'x' / 'y'",
        desc: "The positional axes — the independent axis to sample along, and the value axis.",
      },
      {
        name: "samples",
        type: "number | any[]",
        default: "ticks",
        desc: "Domain positions to seed (see resolveSamples).",
      },
      {
        name: "trigger",
        type: "string",
        default: "'dblclick'",
        desc: "The gesture that seeds a line.",
      },
    ],
    returns: (
      <>
        An <b>Edit</b> appending a full flat series you then shape with <code className="inline">sweep</code>/<code className="inline">draw</code>.
      </>
    ),
  },
  {
    name: "edit.line.removeSeries(options)",
    summary: "Deletes a whole line — reads the target’s series key and filters out every datum sharing it.",
    signatures: [
      "edit.line.removeSeries({ trigger, when }) → Edit",
    ],
    options: [
      {
        name: "trigger",
        type: "string",
        default: "'click'",
        desc: (
          <>
            The gesture; pair with <code className="inline">when</code> to distinguish from removing one point.
          </>
        ),
      },
    ],
    returns: (
      <>
        An <b>Edit</b> removing every datum in the targeted series (falls back to one datum if the line has no series field).
      </>
    ),
  },
];
