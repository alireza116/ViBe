import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/editing/gestures",
  "title": "Drag · Resize · Cycle · Custom",
  "lead": "Different channels take different gestures. <code class=\"inline\">drag</code> moves a position, <code class=\"inline\">resize</code> inverts a radius into a magnitude, <code class=\"inline\">cycle</code> clicks through a category, and <code class=\"inline\">custom</code> is the escape hatch for anything else. Several edits can share one mark, separated by <code class=\"inline\">when</code>.",
  "api": [
    {
      "name": "drag(options)",
      "summary": "Position edit — inverts the pointer on each positional channel. On x+y a 2D move; on y alone a bar drag.",
      "signature": "drag({ channel, channels, pick, threshold, when, guide, constrain }) → Edit",
      "options": [
        {
          "name": "channel",
          "type": "string",
          "default": "injected",
          "desc": "A single channel to govern (co-located edits inject their own)."
        },
        {
          "name": "channels",
          "type": "string[]",
          "default": "—",
          "desc": "Multiple channels for a joint move (e.g. <code class=\"inline\">[\"x\",\"y\"]</code>)."
        },
        {
          "name": "pick",
          "type": "'direct'|'nearest'|'sweep'",
          "default": "'direct'",
          "desc": "Target selection; <code class=\"inline\">nearest</code> grabs from anywhere within <code class=\"inline\">threshold</code>."
        },
        {
          "name": "guide",
          "type": "boolean",
          "default": "—",
          "desc": "Draw the constraint bounds + snap ring while dragging."
        },
        {
          "name": "when, threshold, constrain",
          "type": "—",
          "default": "—",
          "desc": "Shared Edit fields (see the Editing overview)."
        }
      ],
      "returns": "An <b>Edit</b>. <code class=\"inline\">apply</code> returns the datum with each governed field rewritten from the pointer."
    },
    {
      "name": "resize(options)",
      "summary": "Magnitude edit — the gesture radius from the mark centre inverts back to the channel value.",
      "signature": "resize({ channel }) → Edit",
      "options": [
        {
          "name": "channel",
          "type": "string",
          "default": "injected",
          "desc": "The magnitude channel, usually <code class=\"inline\">size</code>. Its scale must be invertible."
        }
      ],
      "returns": "An <b>Edit</b> returning the datum with the channel field set from the pointer radius."
    },
    {
      "name": "cycle(options)",
      "summary": "Discrete edit — a click advances the channel to the next value in its domain. Needs a stable ordinal domain.",
      "signature": "cycle({ channel }) → Edit",
      "options": [
        {
          "name": "channel",
          "type": "string",
          "default": "injected",
          "desc": "The ordinal channel to advance (usually <code class=\"inline\">color</code>/<code class=\"inline\">fill</code>)."
        }
      ],
      "returns": "An <b>Edit</b> (gesture <code class=\"inline\">click</code>) returning the datum with the field stepped to the next domain entry."
    },
    {
      "name": "custom(fn, options)",
      "summary": "The escape hatch — an arbitrary edit. <code class=\"inline\">fn</code> is the body of <code class=\"inline\">apply</code>; the descriptor still declares which gesture fires it.",
      "signature": "custom((datum, event, ctx) => datum | data[] | undefined, options?) → Edit",
      "options": [
        {
          "name": "fn",
          "type": "(datum, event, ctx) => …",
          "default": "—",
          "desc": "<code class=\"inline\">datum</code> is <code class=\"inline\">ctx.datum</code>, <code class=\"inline\">event</code> is the raw DOM event (<code class=\"inline\">ctx.event</code>), <code class=\"inline\">ctx</code> is the full <b>EditContext</b> (see Editing overview). Return a new datum, a full dataset, or <code class=\"inline\">undefined</code> to no-op — whatever fields you put on the datum become data."
        },
        {
          "name": "options.gesture",
          "type": "'drag'|'click'|…",
          "default": "'drag'",
          "desc": "Which gesture runs this edit. The engine matches <code class=\"inline\">event.type</code> to this; <code class=\"inline\">fn</code> itself does not choose the gesture."
        },
        {
          "name": "options.pick, when, …",
          "type": "—",
          "default": "—",
          "desc": "Any shared Edit fields (see the Editing overview)."
        }
      ],
      "returns": "An <b>Edit</b>. Default <code class=\"inline\">gesture: \"drag\"</code>, <code class=\"inline\">pick: \"direct\"</code>. Full <code class=\"inline\">ctx</code> field list lives on the Editing overview under <b>EditContext</b>."
    }
  ],
  "sections": [
    {
      "id": "resize",
      "title": "Resize a magnitude",
      "intro": "size: { edit: resize() } — the drag radius from the dot centre inverts to the value, mirroring how size encodes it. The stroke survives the resize.",
      "examples": [
        "editing-gestures/drag-outward-to-grow"
      ]
    },
    {
      "id": "multi",
      "title": "One mark, three gestures",
      "intro": "Move, resize, and recolour on a single mark — separated by when. Plain drag moves, Shift-drag resizes, click cycles the category.",
      "examples": [
        "editing-gestures/move-shift-resize-click-cycle"
      ]
    },
    {
      "id": "custom",
      "title": "Custom — the escape hatch",
      "intro": "custom(fn) wraps fn as apply. The edit still declares its gesture (default drag) — the engine only calls fn when that gesture fires. fn receives (datum, event, ctx): datum is the touched row, event the raw DOM event, ctx the EditContext (pointer, scales, data, … — see the Editing overview). Return a new datum (or array); every field you set is written into the belief store.",
      "examples": [
        "editing-gestures/invert-y-yourself"
      ]
    }
  ]
};

export default page;
