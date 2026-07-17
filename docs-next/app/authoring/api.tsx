import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Mark SDK (vibe.plot)",
    summary: "Shared foundation every mark factory uses.",
    signatures: [
      "encodeChannel(scales, channels, name, datum, fallback) → number",
      "resolveStyle(scales, channels, datum, defaults) → style",
      "normalizeMarkOptions(options) → options",
    ],
    options: [
      {
        name: "build(data, scales, width, height)",
        type: "required",
        default: "—",
        desc: "Return FeatureNode[] (circle/rect/line/path/text).",
      },
      {
        name: "discreteScale",
        type: "'band' | 'point'",
        default: "—",
        desc: "What the mark needs for discrete data.",
      },
      {
        name: "channels / edits / constraints",
        type: "—",
        default: "—",
        desc: "Pass through from factory options; never drop them.",
      },
    ],
    returns: "A feature object the engine consumes.",
  },
  {
    name: "Edit SDK (vibe.edit)",
    summary: "Build descriptors and register drivers.",
    signatures: [
      "makeEdit(spec) → Edit",
      "invertChannel(ch, pointer) → value",
      "recenterSpan(node, chA, chB, pointer) → { a, b }",
      "nearestMark(marks, x, y, threshold) → index | null",
      "registerDriver({ name, wants, onEvent })",
      "edit.custom(fn, options) → Edit",
      "edit.rank(options) → Edit",
      "edit.legend(options) → Edit",
    ],
    options: [
      {
        name: "Edit.pick",
        type: "string",
        default: "'direct'",
        desc: "Built-in or a custom driver name registered with registerDriver.",
      },
      {
        name: "Edit.apply(ctx)",
        type: "fn",
        default: "—",
        desc: "Return a datum, a full array, or undefined (no-op). Never mutate ctx.data.",
      },
    ],
    returns: "Descriptors the engine routes; drivers own multi-event state.",
  },
];
