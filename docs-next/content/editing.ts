import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/editing",
  "title": "Editing — the inverse of encoding",
  "lead": "Attach an edit to a channel and a gesture writes that channel back to the data through the same scale. An edit is a small descriptor — <code class=\"inline\">gesture</code> (drag / click / dblclick), <code class=\"inline\">pick</code> (direct / nearest / plane), <code class=\"inline\">when</code> (arbitration), <code class=\"inline\">constrain</code>, and <code class=\"inline\">guide</code>. Place it on a channel (<code class=\"inline\">channels.y.edit</code>) or at mark level (<code class=\"inline\">edits: [...]</code>).",
  "api": [
    {
      "name": "The Edit descriptor",
      "summary": "Every edit factory (<code class=\"inline\">vibe.edit.*</code>) returns this shape. <code class=\"inline\">apply(ctx)</code> is pure: given the context it returns a datum (direct edit), a full array (whole-dataset edit), or <code class=\"inline\">undefined</code> (no-op).",
      "options": [
        {
          "name": "gesture",
          "type": "'drag'|'click'|'dblclick'",
          "default": "'drag'",
          "desc": "The raw gesture that triggers the edit."
        },
        {
          "name": "channels",
          "type": "string[] | null",
          "default": "null",
          "desc": "Channel names it governs; <code class=\"inline\">null</code> injects the channel it was placed on."
        },
        {
          "name": "when",
          "type": "(ctx) => boolean",
          "default": "null",
          "desc": "Arbitration — whether this edit claims the gesture (e.g. only on Shift). See <code class=\"inline\">vibe.when</code>."
        },
        {
          "name": "pick",
          "type": "'direct'|'nearest'|'plane'|driver",
          "default": "'direct'",
          "desc": "How the gesture selects its target. <code class=\"inline\">nearest</code>/<code class=\"inline\">sweep</code>/<code class=\"inline\">draw</code>/<code class=\"inline\">brush</code> route through drivers."
        },
        {
          "name": "threshold",
          "type": "number",
          "default": "0",
          "desc": "Proximity radius (px) for <code class=\"inline\">nearest</code>-style picks."
        },
        {
          "name": "scope",
          "type": "null | 'line'",
          "default": "null",
          "desc": "Universal, or line-scoped (needs a series-grouping mark)."
        },
        {
          "name": "constrain",
          "type": "Constraint[]",
          "default": "[]",
          "desc": "Per-edit constraint sugar; the canonical home is the spec’s <code class=\"inline\">constraints</code> (the dataset’s invariants)."
        },
        {
          "name": "guide",
          "type": "boolean",
          "default": "null",
          "desc": "Self-draw this edit’s guide (constraint bounds + snap ring)."
        },
        {
          "name": "apply",
          "type": "(ctx) => datum | data[] | undefined",
          "default": "—",
          "desc": "The edit itself — maps the gesture to data through the same scale. Never mutate <code class=\"inline\">ctx.data</code>; return a new datum or array."
        }
      ],
      "returns": "An <b>Edit</b>. The engine matches <code class=\"inline\">gesture</code> + <code class=\"inline\">pick</code>, builds an <code class=\"inline\">EditContext</code>, then calls <code class=\"inline\">apply(ctx)</code>."
    },
    {
      "name": "EditContext (ctx)",
      "summary": "The object handed to <code class=\"inline\">apply(ctx)</code> and <code class=\"inline\">when(ctx)</code> — and to the third argument of <code class=\"inline\">custom(fn)</code>. It is the gesture already resolved into plot space plus the mark/scale state needed to invert it. Built once per edit invocation in the engine; read it, don’t mutate it.",
      "options": [
        {
          "name": "pointer",
          "type": "{ x, y }",
          "default": "—",
          "desc": "Pointer position in <b>plot pixels</b> (origin at the plot’s top-left, inside the margins). Invert with <code class=\"inline\">ctx.scales.y.invertValue(ctx.pointer.y)</code>."
        },
        {
          "name": "datum",
          "type": "object | undefined",
          "default": "—",
          "desc": "The row being edited. Set for direct/nearest picks; absent for plane creates that append."
        },
        {
          "name": "index",
          "type": "number | null",
          "default": "—",
          "desc": "Index of <code class=\"inline\">datum</code> in <code class=\"inline\">data</code>. Returning a plain object splices it back at this index."
        },
        {
          "name": "data",
          "type": "Datum[]",
          "default": "—",
          "desc": "The full current dataset (read-only). Return a new array from <code class=\"inline\">apply</code> for whole-dataset edits (create/remove)."
        },
        {
          "name": "scales",
          "type": "ScaleMap",
          "default": "—",
          "desc": "Live scales by channel name (<code class=\"inline\">ctx.scales.x</code>, <code class=\"inline\">.y</code>, …). Each has <code class=\"inline\">invertValue(pixel)</code> / <code class=\"inline\">encode(value)</code>."
        },
        {
          "name": "channels",
          "type": "ResolvedChannel[]",
          "default": "—",
          "desc": "This edit’s governed channels, each <code class=\"inline\">{ name, field, scale }</code>. Empty when the edit named none (typical for bare <code class=\"inline\">custom</code>)."
        },
        {
          "name": "markChannels",
          "type": "object",
          "default": "—",
          "desc": "The mark’s full channel map (name → ChannelSpec). Use to look up a sibling field the edit didn’t declare."
        },
        {
          "name": "event",
          "type": "Event",
          "default": "—",
          "desc": "The raw DOM event (for modifiers like <code class=\"inline\">shiftKey</code>). Prefer <code class=\"inline\">vibe.when</code> for arbitration when you can."
        },
        {
          "name": "node",
          "type": "FeatureNode | null",
          "default": "—",
          "desc": "The scene node under the pointer (direct pick), or null on the plane."
        },
        {
          "name": "value",
          "type": "any",
          "default": "—",
          "desc": "Non-pixel gesture payload — e.g. the typed string from <code class=\"inline\">editText</code>’s <code class=\"inline\">commit</code>. Undefined for pointer gestures."
        },
        {
          "name": "schema, width, height",
          "type": "—",
          "default": "—",
          "desc": "Dataset schema (for minting rows) and the plot’s inner pixel size (for plane-relative geometry like rotate)."
        }
      ],
      "returns": "See <code class=\"inline\">EditContext</code> in <code class=\"inline\">src/types.d.ts</code> for the full shape (including line-scoped fields like <code class=\"inline\">seriesKey</code> / <code class=\"inline\">drawState</code>)."
    },
    {
      "name": "Edit catalogue",
      "summary": "Universal edits import bare (<code class=\"inline\">vibe.edit.drag</code>); line-scoped ones live under <code class=\"inline\">vibe.edit.line.*</code> so their scope shows in the name.",
      "options": [
        {
          "name": "drag",
          "type": "drag",
          "default": "gestures",
          "desc": "Move — invert the pointer on each positional channel."
        },
        {
          "name": "resize",
          "type": "drag",
          "default": "gestures",
          "desc": "Magnitude — the radius from the mark centre inverts to a value (usually <code class=\"inline\">size</code>)."
        },
        {
          "name": "cycle",
          "type": "click",
          "default": "gestures",
          "desc": "Advance a discrete channel to its next domain value."
        },
        {
          "name": "custom",
          "type": "drag",
          "default": "gestures",
          "desc": "Escape hatch — an arbitrary <code class=\"inline\">(datum, event, ctx) => …</code>."
        },
        {
          "name": "dragSpan / brushSpan",
          "type": "drag",
          "default": "bar",
          "desc": "Move / resize a two-endpoint span (x1·x2 or y1·y2)."
        },
        {
          "name": "create / remove",
          "type": "click",
          "default": "existence",
          "desc": "Mint a datum from the pointer / delete the target."
        },
        {
          "name": "line.anchor / newSeries / draw / sweep / removeSeries",
          "type": "line",
          "default": "existence · sweep",
          "desc": "Author and reshape connected paths."
        }
      ],
      "returns": "See the <b>Gestures</b>, <b>Sweep</b> and <b>Existence</b> pages for each factory’s own options."
    }
  ],
  "sections": [
    {
      "id": "drag",
      "title": "Drag a value",
      "intro": "The canonical edit: drag() inverts the pointer on each positional channel it governs. On a bar’s y, a drag rewrites the value.",
      "examples": [
        "editing/drag-a-value-bars"
      ]
    },
    {
      "id": "pick",
      "title": "Pick — how an edit finds its target",
      "intro": "pick: \"direct\" uses the mark under the pointer; pick: \"nearest\" grabs the closest mark within a pixel threshold, so small marks are reachable from nearby empty space. guide: true self-draws the snap ring.",
      "examples": [
        "editing/nearest-pick-from-empty-space"
      ]
    }
  ]
};

export default page;
