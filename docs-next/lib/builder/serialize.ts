import type { BuilderState, OptionValue } from './types';
import { markByFamily } from './marks.manifest';

/** A pre-formatted source fragment (a function call, an identifier, a `new
 * Date(...)`) that `jsLiteral` emits verbatim instead of quoting. */
type Raw = { __raw: string };
const raw = (source: string): Raw => ({ __raw: source });
function isRaw(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && '__raw' in v;
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const key = (k: string) => (IDENTIFIER.test(k) ? k : JSON.stringify(k));

/** Pretty-prints a plain JS value (numbers/strings/booleans/arrays/objects,
 * plus `Raw` fragments) as source text — the one literal-builder every
 * section (schema/data/mark/edits/constraints/scales/theme) shares. */
function jsLiteral(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const pad1 = '  '.repeat(indent + 1);
  if (isRaw(value)) return value.__raw;
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => pad1 + jsLiteral(v, indent + 1));
    return `[\n${items.join(',\n')}\n${pad}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined
    );
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => `${pad1}${key(k)}: ${jsLiteral(v, indent + 1)}`);
    return `{\n${lines.join(',\n')}\n${pad}}`;
  }
  return 'null';
}

function cleanOptions(options: Record<string, OptionValue>): Record<string, OptionValue> {
  return Object.fromEntries(
    Object.entries(options).filter(([, v]) => v !== undefined && v !== '')
  );
}

function callLiteral(callPath: string, options: Record<string, OptionValue>): Raw {
  const cleaned = cleanOptions(options);
  if (Object.keys(cleaned).length === 0) return raw(`${callPath}()`);
  return raw(`${callPath}(${jsLiteral(cleaned)})`);
}

function schemaLiteral(state: BuilderState): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of state.schema) {
    if (!f.name.trim()) continue;
    const tokens = f.domain.split(',').map((t) => t.trim()).filter(Boolean);
    const isNumeric = f.type === 'quantitative';
    const isTemporal = f.type === 'temporal';
    const domain = tokens.length
      ? tokens.map((t) =>
          isNumeric ? Number(t) : isTemporal ? raw(`new Date(${JSON.stringify(t)})`) : t
        )
      : undefined;
    const def = f.default.trim()
      ? isNumeric
        ? Number(f.default)
        : isTemporal
          ? raw(`new Date(${JSON.stringify(f.default)})`)
          : f.default
      : undefined;
    out[f.name] = { type: f.type, domain, default: def };
  }
  return out;
}

function dataLiteral(state: BuilderState): Raw {
  try {
    const parsed = JSON.parse(state.dataJson);
    return raw(jsLiteral(parsed));
  } catch {
    return raw('[] /* fix the JSON below the chart, then Generate again */');
  }
}

function markCallLiteral(state: BuilderState): Raw {
  const entry = markByFamily(state.mark.family);
  const factory =
    state.mark.orientation === 'x'
      ? entry.factoryNames.x || entry.factoryNames.auto
      : state.mark.orientation === 'y'
        ? entry.factoryNames.y || entry.factoryNames.auto
        : entry.factoryNames.auto;

  const channels: Record<string, unknown> = {};
  for (const ch of entry.channels) {
    const binding = state.mark.channels[ch];
    if (binding?.field) channels[ch] = { field: binding.field };
  }

  const editCalls = state.edits.map((e) => callLiteral(e.name, e.options));
  const constraintCalls = state.constraints.map((c) => callLiteral(c.name, c.options));

  const args: Record<string, unknown> = {
    channels,
    ...cleanOptions(state.mark.options),
    ...cleanOptions(state.mark.style),
  };
  if (editCalls.length) args.edits = editCalls;
  if (constraintCalls.length) args.constraints = constraintCalls;

  return raw(`${factory}(${jsLiteral(args)})`);
}

function scalesLiteral(state: BuilderState): Record<string, unknown> | undefined {
  const channels = Object.keys(state.scales);
  if (!channels.length) return undefined;
  const out: Record<string, unknown> = {};
  for (const ch of channels) {
    const s = state.scales[ch];
    out[ch] = { type: s.type, ...cleanOptions(s.options) };
  }
  return out;
}

function themeLiteral(state: BuilderState): Raw | undefined {
  const { theme } = state;
  const overrides = cleanOptions(theme.overrides);
  let advanced: Record<string, unknown> = {};
  if (theme.advancedJson.trim()) {
    try {
      advanced = JSON.parse(theme.advancedJson);
    } catch {
      // ignored — the advanced textarea is a best-effort escape hatch
    }
  }
  const merged: Record<string, unknown> = { ...overrides, ...advanced };
  const hasMerged = Object.keys(merged).length > 0;

  if (theme.preset === 'default') {
    return hasMerged ? raw(jsLiteral(merged)) : undefined;
  }
  const presetRef = `themes.${theme.preset}`;
  if (!hasMerged) return raw(presetRef);

  const lines = [
    `  ...${presetRef}`,
    ...Object.entries(merged).map(([k, v]) => `  ${key(k)}: ${jsLiteral(v, 1)}`),
  ];
  return raw(`{\n${lines.join(',\n')}\n}`);
}

/** Turns a `BuilderState` into the same `mount(Elicit({...}))` harness-script
 * shape every `.example.txt` on the site already uses, so it drops straight
 * into `ExampleLive`. */
export function buildSpecCode(state: BuilderState): string {
  const schema = schemaLiteral(state);
  const scales = scalesLiteral(state);
  const theme = themeLiteral(state);

  const specEntries: Record<string, unknown> = {
    schema,
    data: dataLiteral(state),
    marks: [markCallLiteral(state)],
  };
  if (scales) specEntries.scales = scales;
  if (theme) specEntries.theme = theme;

  return `mount(Elicit(${jsLiteral(specEntries)}));\n`;
}
