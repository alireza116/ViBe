import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/needle",
  "title": "Needle",
  "lead": "A pivoted <b>needle</b> (NYT-style gauge or software dial). It encodes a value on the <code class=\"inline\">angle</code> channel — degrees via the channel’s scale — and draws a tapered pointer + hub. The default semicircle is <b>horizontal</b> (left → right through the top, like a speedometer). Use <code class=\"inline\">orient</code> (<code class=\"inline\">top</code>·<code class=\"inline\">right</code>·<code class=\"inline\">bottom</code>·<code class=\"inline\">left</code>), <code class=\"inline\">arc: \"full\"</code>, or explicit <code class=\"inline\">start</code>/<code class=\"inline\">end</code> — and keep <code class=\"inline\">scale.range</code> in sync. Optional <code class=\"inline\">x</code>/<code class=\"inline\">y</code> place the pivot on categorical or linear axes (many small needles in one chart).",
  "api": [
    {
      "name": "needle(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. One needle (+ hub) per datum.",
      "signatures": [
        "needle({ channels, length, handleSize, baseWidth, orient, arc, start, end, id }) → Feature"
      ],
      "options": [
        {
          "name": "channels",
          "type": "object",
          "default": "{}",
          "desc": "Must include <code class=\"inline\">angle</code>. Optional <code class=\"inline\">x</code>/<code class=\"inline\">y</code> place the pivot (default: plot centre)."
        },
        {
          "name": "length",
          "type": "number",
          "default": "40% of min(w,h)",
          "desc": "Needle length in px. Or drive via the <code class=\"inline\">size</code> channel."
        },
        {
          "name": "handleSize",
          "type": "number",
          "default": "5",
          "desc": "Pivot circle radius in px."
        },
        {
          "name": "baseWidth",
          "type": "number",
          "default": "10",
          "desc": "Width of the needle base in px."
        },
        {
          "name": "orient",
          "type": "'top' | 'right' | 'bottom' | 'left'",
          "default": "'top'",
          "desc": "Semicircle facing that side. <code class=\"inline\">top</code> = NYT / speedometer (range <code class=\"inline\">[180, 0]</code>). Match with <code class=\"inline\">scale.range</code>."
        },
        {
          "name": "arc",
          "type": "'semi' | 'full'",
          "default": "'semi'",
          "desc": "<code class=\"inline\">full</code> → <code class=\"inline\">[-180, 180]</code>. Otherwise same as <code class=\"inline\">orient</code> (default top)."
        },
        {
          "name": "start / end",
          "type": "number",
          "default": "—",
          "desc": "Explicit degree span (overrides <code class=\"inline\">orient</code> / <code class=\"inline\">arc</code>)."
        }
      ],
      "channels": [
        {
          "name": "angle",
          "type": "linear | point (deg)",
          "desc": "The elicited value, mapped to degrees by its scale. Default range <code class=\"inline\">[180, 0]</code>."
        },
        {
          "name": "x / y",
          "type": "linear | point",
          "desc": "Optional pivot position — categorical or quantitative."
        },
        {
          "name": "fill / stroke",
          "type": "style",
          "desc": "Needle colour."
        }
      ],
      "returns": "A <b>feature</b> emitting a filled needle <code class=\"inline\">path</code> and hub <code class=\"inline\">circle</code> per datum."
    }
  ],
  "sections": [
    {
      "id": "gauge",
      "title": "Semicircle gauge + center text",
      "intro": "A composite of <code class=\"inline\">axisRadial</code> (ticks), <code class=\"inline\">needle</code>, and <code class=\"inline\">text</code>. Default orient is top: 0 on the left, max on the right.",
      "examples": [
        "marks-needle/quantitative-gauge",
        "marks-needle/right-facing-orient-right"
      ]
    },
    {
      "id": "grid",
      "title": "Many needles on x × y",
      "intro": "Each row is a pivot: <code class=\"inline\">x</code> categorical, <code class=\"inline\">y</code> quantitative, <code class=\"inline\">angle</code> a third numeric belief. Drag any needle — direct-pick writes that row only.",
      "examples": [
        "marks-needle/small-needles-in-a-scatter-of-pivots"
      ]
    },
    {
      "id": "dial",
      "title": "Full-circle dial",
      "intro": "A knob: full 360° with <code class=\"inline\">fold: false</code>.",
      "examples": [
        "marks-needle/quantitative-dial"
      ]
    },
    {
      "id": "categorical",
      "title": "Categorical needle",
      "intro": "A discrete <code class=\"inline\">angle</code> field uses a point scale — drag snaps to the nearest category. Colored bands come from <code class=\"inline\">axisRadial({ bands: true })</code>.",
      "examples": [
        "marks-needle/likelihood-gauge"
      ]
    }
  ]
};

export default page;
