import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Elicit({ responsive, width, height, … })",
    summary: (
      <>
        One option on the <code className="inline">ElicitSpec</code>. Everything else about a chart is unchanged — marks, edits and scales all read the (possibly resized) inner dimensions, so the whole scene reflows for free.
      </>
    ),
    options: [
      {
        name: "responsive",
        type: "'fixed' | 'scale' | 'reflow' | true",
        default: "'fixed'",
        desc: (
          <>
            <code className="inline">'fixed'</code>: draw at the pixel width/height. <code className="inline">'scale'</code>: viewBox, SVG fills the parent width (aspect kept). <code className="inline">'reflow'</code> (or <code className="inline">true</code>): re-draw at the parent's measured width on resize.
          </>
        ),
      },
      {
        name: "width / height",
        type: "number",
        default: "600 / 400",
        desc: (
          <>
            The design size — the exact pixels in <code className="inline">"fixed"</code>, the viewBox in <code className="inline">"scale"</code>, and the initial width + fixed height in <code className="inline">"reflow"</code>.
          </>
        ),
      },
    ],
    returns: (
      <>
        The same <b>ElicitElement</b>. A <code className="inline">"reflow"</code> chart also wires a <code className="inline">ResizeObserver</code>; call <code className="inline">el.destroy()</code> when you unmount it to detach the observer (a no-op in the other modes).
      </>
    ),
  },
];
