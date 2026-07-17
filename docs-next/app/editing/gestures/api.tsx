import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "drag(options)",
    summary: "Position edit — inverts the pointer on each positional channel. On x+y a 2D move; on y alone a bar drag.",
    signatures: [
      "drag({ channel, channels, pick, threshold, when, guide, constrain }) → Edit",
    ],
    options: [
      {
        name: "channel",
        type: "string",
        default: "injected",
        desc: "A single channel to govern (co-located edits inject their own).",
      },
      {
        name: "channels",
        type: "string[]",
        default: "—",
        desc: (
          <>
            Multiple channels for a joint move (e.g. <code className="inline">["x","y"]</code>).
          </>
        ),
      },
      {
        name: "pick",
        type: "'direct'|'nearest'|'sweep'",
        default: "'direct'",
        desc: (
          <>
            Target selection; <code className="inline">nearest</code> grabs from anywhere within <code className="inline">threshold</code>.
          </>
        ),
      },
      {
        name: "guide",
        type: "boolean",
        default: "—",
        desc: "Draw the constraint bounds + snap ring while dragging.",
      },
      {
        name: "when, threshold, constrain",
        type: "—",
        default: "—",
        desc: "Shared Edit fields (see the Editing overview).",
      },
    ],
    returns: (
      <>
        An <b>Edit</b>. <code className="inline">apply</code> returns the datum with each governed field rewritten from the pointer.
      </>
    ),
  },
  {
    name: "resize(options)",
    summary: "Magnitude edit — the gesture radius from the mark centre inverts back to the channel value.",
    signatures: [
      "resize({ channel }) → Edit",
    ],
    options: [
      {
        name: "channel",
        type: "string",
        default: "injected",
        desc: (
          <>
            The magnitude channel, usually <code className="inline">size</code>. Its scale must be invertible.
          </>
        ),
      },
    ],
    returns: (
      <>
        An <b>Edit</b> returning the datum with the channel field set from the pointer radius.
      </>
    ),
  },
  {
    name: "cycle(options)",
    summary: "Discrete edit — a click advances the channel to the next value in its domain. Needs a stable ordinal domain.",
    signatures: [
      "cycle({ channel }) → Edit",
    ],
    options: [
      {
        name: "channel",
        type: "string",
        default: "injected",
        desc: (
          <>
            The ordinal channel to advance (usually <code className="inline">color</code>/<code className="inline">fill</code>).
          </>
        ),
      },
    ],
    returns: (
      <>
        An <b>Edit</b> (gesture <code className="inline">click</code>) returning the datum with the field stepped to the next domain entry.
      </>
    ),
  },
  {
    name: "custom(fn, options)",
    summary: (
      <>
        The escape hatch — an arbitrary edit. <code className="inline">fn</code> is the body of <code className="inline">apply</code>; the descriptor still declares which gesture fires it.
      </>
    ),
    signatures: [
      "custom((datum, event, ctx) => datum | data[] | undefined, options?) → Edit",
    ],
    options: [
      {
        name: "fn",
        type: "(datum, event, ctx) => …",
        default: "—",
        desc: (
          <>
            <code className="inline">datum</code> is <code className="inline">ctx.datum</code>, <code className="inline">event</code> is the raw DOM event (<code className="inline">ctx.event</code>), <code className="inline">ctx</code> is the full <b>EditContext</b> (see Editing overview). Return a new datum, a full dataset, or <code className="inline">undefined</code> to no-op — whatever fields you put on the datum become data.
          </>
        ),
      },
      {
        name: "options.gesture",
        type: "'drag'|'click'|…",
        default: "'drag'",
        desc: (
          <>
            Which gesture runs this edit. The engine matches <code className="inline">event.type</code> to this; <code className="inline">fn</code> itself does not choose the gesture.
          </>
        ),
      },
      {
        name: "options.pick, when, …",
        type: "—",
        default: "—",
        desc: "Any shared Edit fields (see the Editing overview).",
      },
    ],
    returns: (
      <>
        An <b>Edit</b>. Default <code className="inline">gesture: "drag"</code>, <code className="inline">pick: "direct"</code>. Full <code className="inline">ctx</code> field list lives on the Editing overview under <b>EditContext</b>.
      </>
    ),
  },
];
