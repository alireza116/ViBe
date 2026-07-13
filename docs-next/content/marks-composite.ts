import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/composite",
  "title": "Composite",
  "lead": "A <b>composite</b> mark is a glyph: a named <b>group of ordinary marks</b> over the chart’s one dataset. Each part encodes some columns of the same rows; a part whose channel carries an <code class=\"inline\">edit</code> is a handle. Drag a handle and it writes its field; on the next render every other part re-derives from the changed rows — the same reactive model the guide layer uses. Composite is a <b>desugaring</b>, not a new kind of feature: it returns its parts as plain features and <code class=\"inline\">Elicit</code> flattens them, exactly as the <code class=\"inline\">axes</code> convenience desugars into axis marks. Because each handle is its own mark, dragging one <i>cannot</i> move another — dispatch already routes a gesture to the feature owning the node you touched.",
  "api": [
    {
      "name": "composite(options)",
      "summary": "A glyph: a group of marks over the shared dataset. Import from <code class=\"inline\">vibe.plot</code>. Returns an <b>array of features</b>, which <code class=\"inline\">Elicit</code> flattens into its <code class=\"inline\">features</code> list.",
      "signature": "composite({ parts, constraints, discreteScale, id }) → Feature[]",
      "options": [
        {
          "name": "parts",
          "type": "Mark[]",
          "default": "[]",
          "desc": "The sub-marks, in z-order (visual parts first, handles last). Ordinary mark instances — a <code class=\"inline\">ruleX</code> whisker, a <code class=\"inline\">point</code> dot, a <code class=\"inline\">tick</code> cap. A part with an <code class=\"inline\">edit</code> on a channel is a handle; a part without one is inert and the engine makes it <code class=\"inline\">pointerEvents:\"none\"</code> so it can’t swallow a sibling’s drag."
        },
        {
          "name": "constraints",
          "type": "Constraint[]",
          "default": "—",
          "desc": "Group-level data invariants. Promoted into the <b>dataset’s</b> constraint set, so they gate and repair every edit — including one made through a different part. See <b>Constraints</b>."
        },
        {
          "name": "discreteScale",
          "type": "'band' | 'point'",
          "default": "'band'",
          "desc": "Stamped onto any part that doesn’t declare its own. A glyph usually sits in a band slot."
        },
        {
          "name": "id",
          "type": "string",
          "default": "'composite'",
          "desc": "Prefix for the parts’ generated ids (<code class=\"inline\">id/0</code>, <code class=\"inline\">id/1</code>, …), so each part keeps a stable identity across renders."
        }
      ],
      "returns": "An <b>array of features</b> — the parts, with ids assigned and the group’s constraints attached. Nothing about the glyph reaches the engine: it sees four ordinary marks reading the one dataset."
    }
  ],
  "sections": [
    {
      "id": "lollipop",
      "title": "Lollipop — drag the tip",
      "intro": "A stem (a span rule from the baseline to the value) plus a draggable tip. Two marks: the <code class=\"inline\">ruleX</code> draws the stem and carries no edit, so it is inert; the <code class=\"inline\">point</code> is the handle and edits <code class=\"inline\">value</code>. Drag a tip and its stem re-derives, because both marks read the same row.",
      "examples": [
        "marks-composite/one-editable-field-the-tip"
      ]
    },
    {
      "id": "error-bar",
      "title": "Error bar — move the dot, resize the interval",
      "intro": "Three editable fields on one row: <code class=\"inline\">mean</code> (the dot), <code class=\"inline\">lo</code> and <code class=\"inline\">hi</code> (the caps). Each is a separate mark, so each edits a plain <code class=\"inline\">y</code> channel and dragging a cap moves only that end — no handle arbitration to write. The whisker is a <code class=\"inline\">ruleX</code> spanning lo..hi; it follows the caps because it reads the same rows.",
      "examples": [
        "marks-composite/independent-handles-per-field",
        "marks-composite/coupled-move-center-within-ends"
      ]
    }
  ]
};

export default page;
