import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/sizing",
  "title": "Responsive sizing",
  "lead": "By default a chart is drawn at the exact <code class=\"inline\">width</code> / <code class=\"inline\">height</code> you give it (in pixels). The <code class=\"inline\">responsive</code> option lets a chart fit its parent instead: <code class=\"inline\">\"scale\"</code> wraps the SVG in a <b>viewBox</b> so the browser stretches it to the container (one draw, aspect ratio preserved), while <code class=\"inline\">\"reflow\"</code> measures the parent and <b>redraws at native pixels</b> on resize (crisp text, the width tracks the container, the height stays the value you set). The <code class=\"inline\">width</code> / <code class=\"inline\">height</code> you pass are still the design size — the viewBox for <code class=\"inline\">\"scale\"</code>, and the starting / aspect basis for <code class=\"inline\">\"reflow\"</code>.",
  "api": [
    {
      "name": "Elicit({ responsive, width, height, … })",
      "summary": "One option on the <code class=\"inline\">ElicitSpec</code>. Everything else about a chart is unchanged — marks, edits and scales all read the (possibly resized) inner dimensions, so the whole scene reflows for free.",
      "options": [
        {
          "name": "responsive",
          "type": "'fixed' | 'scale' | 'reflow' | true",
          "default": "'fixed'",
          "desc": "<code class=\"inline\">'fixed'</code>: draw at the pixel width/height. <code class=\"inline\">'scale'</code>: viewBox, SVG fills the parent width (aspect kept). <code class=\"inline\">'reflow'</code> (or <code class=\"inline\">true</code>): re-draw at the parent's measured width on resize."
        },
        {
          "name": "width / height",
          "type": "number",
          "default": "600 / 400",
          "desc": "The design size — the exact pixels in <code class=\"inline\">\"fixed\"</code>, the viewBox in <code class=\"inline\">\"scale\"</code>, and the initial width + fixed height in <code class=\"inline\">\"reflow\"</code>."
        }
      ],
      "returns": "The same <b>ElicitElement</b>. A <code class=\"inline\">\"reflow\"</code> chart also wires a <code class=\"inline\">ResizeObserver</code>; call <code class=\"inline\">el.destroy()</code> when you unmount it to detach the observer (a no-op in the other modes)."
    }
  ],
  "sections": [
    {
      "id": "scale",
      "title": "Scale (viewBox)",
      "intro": "responsive: \"scale\" — the chart keeps its 480×300 aspect ratio but stretches to fill the column. Everything scales together (text and strokes included). Best when you want a chart to shrink/grow with its container and drift in aspect is fine.",
      "examples": [
        "sizing/fills-the-parent-width"
      ]
    },
    {
      "id": "reflow",
      "title": "Reflow (ResizeObserver)",
      "intro": "responsive: \"reflow\" — the chart measures this card and redraws at native pixels; the width tracks the container while the height stays 300. Resize the browser window and the bars re-lay-out crisply (no scaling blur). Call el.destroy() on unmount.",
      "examples": [
        "sizing/redraws-to-the-parent-width"
      ]
    },
    {
      "id": "fixed",
      "title": "Fixed (default)",
      "intro": "No responsive option (or responsive: \"fixed\") — the chart is exactly 320×240 pixels regardless of the container. Use it when a chart must be a precise size.",
      "examples": [
        "sizing/exact-pixels"
      ]
    }
  ]
};

export default page;
