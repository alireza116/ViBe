import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/authoring",
  "title": "Authoring SDK",
  "lead": "How to build new elicitation devices without forking the engine. Marks use <code class=\"inline\">encodeChannel</code> / <code class=\"inline\">resolveStyle</code>; edits use <code class=\"inline\">makeEdit</code> + <code class=\"inline\">invertChannel</code>; multi-event lifecycles register via <code class=\"inline\">edit.registerDriver</code>. Attach edits on a channel (<code class=\"inline\">y: { field, edit: drag() }</code>) or at mark level (<code class=\"inline\">edits: [drag({ channels: [\"x\",\"y\"] })]</code>) — never as a fake <code class=\"inline\">channels.edit</code> key.",
  "api": [
    {
      "name": "Mark SDK (vibe.plot)",
      "summary": "Shared foundation every mark factory uses.",
      "signatures": [
        "encodeChannel(scales, channels, name, datum, fallback) → number",
        "resolveStyle(scales, channels, datum, defaults) → style",
        "normalizeMarkOptions(options) → options"
      ],
      "options": [
        {
          "name": "build(data, scales, width, height)",
          "type": "required",
          "default": "—",
          "desc": "Return FeatureNode[] (circle/rect/line/path/text)."
        },
        {
          "name": "discreteScale",
          "type": "'band' | 'point'",
          "default": "—",
          "desc": "What the mark needs for discrete data."
        },
        {
          "name": "channels / edits / constraints",
          "type": "—",
          "default": "—",
          "desc": "Pass through from factory options; never drop them."
        }
      ],
      "returns": "A feature object the engine consumes."
    },
    {
      "name": "Edit SDK (vibe.edit)",
      "summary": "Build descriptors and register drivers.",
      "signatures": [
        "makeEdit(spec) → Edit",
        "invertChannel(ch, pointer) → value",
        "recenterSpan(node, chA, chB, pointer) → { a, b }",
        "nearestMark(marks, x, y, threshold) → index | null",
        "registerDriver({ name, wants, onEvent })",
        "edit.custom(fn, options) → Edit",
        "edit.rank(options) → Edit",
        "edit.legend(options) → Edit"
      ],
      "options": [
        {
          "name": "Edit.pick",
          "type": "string",
          "default": "'direct'",
          "desc": "Built-in or a custom driver name registered with registerDriver."
        },
        {
          "name": "Edit.apply(ctx)",
          "type": "fn",
          "default": "—",
          "desc": "Return a datum, a full array, or undefined (no-op). Never mutate ctx.data."
        }
      ],
      "returns": "Descriptors the engine routes; drivers own multi-event state."
    }
  ],
  "sections": [
    {
      "id": "custom-edit",
      "title": "A custom edit with makeEdit",
      "intro": "Prefer makeEdit (or edit.custom) so defaults for pick/gesture/constrain stay consistent.",
      "examples": [
        "authoring/snap-drag-via-custom-apply"
      ]
    },
    {
      "id": "rank",
      "title": "Rank / reorder",
      "intro": "edit.rank() swaps rank slots along a discrete axis as you drag.",
      "examples": [
        "authoring/drag-to-reorder"
      ]
    }
  ]
};

export default page;
