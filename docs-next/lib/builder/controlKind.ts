import type { ApiOption } from '../types';

export type ControlKind =
  | { kind: 'boolean' }
  | { kind: 'number' }
  | { kind: 'enum'; values: string[] }
  | { kind: 'string' }
  | { kind: 'unsupported' };

/** Option rows that belong to a dedicated tab (Channels/Edits/Constraints) or
 * name a JS value a form can't hold — skipped from the generic options list. */
const META_NAMES = new Set(['channels', 'edits', 'constraints', 'id']);

const UNSUPPORTED_TYPE = /Edit\[\]|Constraint\[\]|object|style|shorthand|Fn\b|=>|Function/i;

export function isFormOption(opt: ApiOption): boolean {
  if (META_NAMES.has(opt.name.trim())) return false;
  if (opt.name.includes(',')) return false; // combined rows, e.g. "fill, stroke, …"
  if (!opt.type || opt.type === '—') return false;
  if (UNSUPPORTED_TYPE.test(opt.type)) return false;
  return true;
}

/** Parse an `ApiOption.type` string into a control kind. Handles quoted-literal
 * unions (`'a' | 'b'`) as enums; loose unions with a bare identifier (`'domain' |
 * 'sequence' | field`) fall back to a free-text field since not every value is a
 * literal choice. */
export function inferControl(opt: ApiOption): ControlKind {
  const type = (opt.type || '').trim();
  if (!type) return { kind: 'string' };
  if (/^boolean$/i.test(type)) return { kind: 'boolean' };
  if (/^number$/i.test(type) || /^number\s*\|/i.test(type)) return { kind: 'number' };

  const literals = [...type.matchAll(/'([^']*)'/g)].map((m) => m[1]);
  const withoutLiterals = type.replace(/'[^']*'/g, '').replace(/\|/g, '').trim();
  if (literals.length && withoutLiterals === '') {
    return { kind: 'enum', values: literals };
  }

  if (/^string$/i.test(type)) return { kind: 'string' };
  if (UNSUPPORTED_TYPE.test(type)) return { kind: 'unsupported' };
  // A loose union with a bare identifier alongside literals ("'domain' | field") —
  // still editable as text, just not constrained to the literal set.
  return { kind: 'string' };
}

export function parseDefault(opt: ApiOption, control: ControlKind): OptionValueGuess {
  const raw = (opt.default || '').trim();
  if (control.kind === 'boolean') return raw === 'true';
  if (control.kind === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  if (control.kind === 'enum') {
    const stripped = raw.replace(/^'|'$/g, '');
    return control.values.includes(stripped) ? stripped : control.values[0];
  }
  if (raw && raw !== '—' && raw !== 'auto') return raw.replace(/^'|'$/g, '');
  return undefined;
}

type OptionValueGuess = string | number | boolean | undefined;
