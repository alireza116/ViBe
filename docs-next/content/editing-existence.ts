import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/editing/existence",
  "title": "Create · Remove · Anchors",
  "lead": "Creating and deleting data are edits like any other. <code class=\"inline\">create</code> is a plane gesture that inverts the pointer through the positional channels to mint a datum; <code class=\"inline\">remove</code> deletes the target. For connected paths, <code class=\"inline\">edit.line.anchor</code> adds one point to the nearest line, <code class=\"inline\">edit.line.newSeries</code> seeds a whole line, <code class=\"inline\">edit.line.draw</code> lays a line down as you drag, and <code class=\"inline\">edit.line.removeSeries</code> deletes a whole line. Multiple edits on one gesture are arbitrated by <code class=\"inline\">when</code>. <b>Declare a whole-dataset edit on exactly one mark.</b> A plane gesture carries no node, so it fans out to <i>every</i> mark’s plane-pick edits — put <code class=\"inline\">create</code> on two marks and one click appends two rows. (Direct-pick edits like <code class=\"inline\">drag</code> are immune: they route to the mark you actually touched.) The engine warns in dev builds if you do this.",
  "api": [
    {
      "name": "create(options)",
      "summary": "A plane gesture that mints a datum — the clicked pixel is inverted through each positional channel, plus <code class=\"inline\">defaults</code> for the rest.",
      "signature": "create({ channels, defaults, trigger }) → Edit",
      "options": [
        {
          "name": "channels",
          "type": "string[]",
          "default": "['x','y']",
          "desc": "Positional channels to place from the pointer (missing ones are dropped)."
        },
        {
          "name": "defaults",
          "type": "object",
          "default": "{}",
          "desc": "Seed values for the non-positional fields (group, mag, …)."
        },
        {
          "name": "trigger",
          "type": "'click' | 'dblclick'",
          "default": "'click'",
          "desc": "The plane gesture that creates."
        }
      ],
      "returns": "An <b>Edit</b> (<code class=\"inline\">pick: \"plane\"</code>) whose <code class=\"inline\">apply</code> returns <code class=\"inline\">[...data, datum]</code>."
    },
    {
      "name": "remove(options)",
      "summary": "Deletes the targeted datum. Pair with <code class=\"inline\">when</code> when another click edit shares the mark.",
      "signature": "remove({ pick, threshold, when, trigger }) → Edit",
      "options": [
        {
          "name": "pick",
          "type": "'direct' | 'nearest'",
          "default": "'direct'",
          "desc": "The mark clicked, or the closest within <code class=\"inline\">threshold</code> (deletable from empty space)."
        },
        {
          "name": "when",
          "type": "(ctx) => boolean",
          "default": "—",
          "desc": "e.g. <code class=\"inline\">when.alt</code> so Alt-click deletes while plain click recolours."
        },
        {
          "name": "trigger / gesture",
          "type": "string",
          "default": "'click'",
          "desc": "The gesture that removes."
        }
      ],
      "returns": "An <b>Edit</b> whose <code class=\"inline\">apply</code> returns the dataset without the target index."
    },
    {
      "name": "edit.line.anchor(options)",
      "summary": "Line-scoped. Adds one point to a connected path — the proximity-aware inverse of <code class=\"inline\">remove</code>.",
      "signature": "edit.line.anchor({ into, threshold, channels, trigger }) → Edit",
      "options": [
        {
          "name": "into",
          "type": "'nearest' | 'new'",
          "default": "'nearest'",
          "desc": "Attach to the closest line within <code class=\"inline\">threshold</code> (empty space starts a fresh series), or always start new."
        },
        {
          "name": "threshold",
          "type": "number",
          "default": "40",
          "desc": "Proximity radius for the nearest-line resolution."
        },
        {
          "name": "trigger",
          "type": "string",
          "default": "'click'",
          "desc": "The gesture that adds a point."
        }
      ],
      "returns": "An <b>Edit</b> appending one datum (its series set to the resolved line)."
    },
    {
      "name": "edit.line.newSeries(options)",
      "summary": "Seeds a whole flat line at once — one anchor per sampled domain position, at the clicked value.",
      "signature": "edit.line.newSeries({ along, value, samples, trigger }) → Edit",
      "options": [
        {
          "name": "along / value",
          "type": "'x' | 'y'",
          "default": "'x' / 'y'",
          "desc": "The positional axes — the independent axis to sample along, and the value axis."
        },
        {
          "name": "samples",
          "type": "number | any[]",
          "default": "ticks",
          "desc": "Domain positions to seed (see resolveSamples)."
        },
        {
          "name": "trigger",
          "type": "string",
          "default": "'dblclick'",
          "desc": "The gesture that seeds a line."
        }
      ],
      "returns": "An <b>Edit</b> appending a full flat series you then shape with <code class=\"inline\">sweep</code>/<code class=\"inline\">draw</code>."
    },
    {
      "name": "edit.line.removeSeries(options)",
      "summary": "Deletes a whole line — reads the target’s series key and filters out every datum sharing it.",
      "signature": "edit.line.removeSeries({ trigger, when }) → Edit",
      "options": [
        {
          "name": "trigger",
          "type": "string",
          "default": "'click'",
          "desc": "The gesture; pair with <code class=\"inline\">when</code> to distinguish from removing one point."
        }
      ],
      "returns": "An <b>Edit</b> removing every datum in the targeted series (falls back to one datum if the line has no series field)."
    }
  ],
  "sections": [
    {
      "id": "create",
      "title": "Create — click to add",
      "intro": "create is its own edit: a plane click inverts the pointer through the positional channels and appends a datum. Constraints still apply — count(max) caps the total.",
      "examples": [
        "editing-existence/click-to-add-a-point"
      ]
    },
    {
      "id": "existence",
      "title": "Create, remove & move together",
      "intro": "Mark-level create (dblclick) + remove (Alt-click) + a move drag, all on one mark. When two edits share a gesture, when decides which claims the event.",
      "examples": [
        "editing-existence/existence-move-on-one-mark",
        "editing-existence/arbitration-click-recolours-alt-click-deletes"
      ]
    },
    {
      "id": "anchors",
      "title": "Anchors — building a connected path",
      "intro": "On a line, edit.line.anchor() adds a point to the nearest series (or starts a new one from empty space), and edit.line.newSeries() seeds a whole line from sampled positions. Order is tracked so the path stays reproducible.",
      "examples": [
        "editing-existence/click-to-add-an-anchor",
        "editing-existence/seed-a-whole-line-newseries",
        "editing-existence/freehand-draw-a-path-as-you-drag",
        "editing-existence/remove-a-whole-line"
      ]
    }
  ]
};

export default page;
