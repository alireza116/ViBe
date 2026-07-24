'use client';

import type { ApiOption } from '../../lib/types';
import type { OptionValue } from '../../lib/builder/types';
import { inferControl } from '../../lib/builder/controlKind';

type Props = {
  option: ApiOption;
  value: OptionValue;
  onChange: (value: OptionValue) => void;
};

/** One form control for one `ApiOption` — reused for mark options, edit
 * options, constraint options, and scale options alike, so the whole builder
 * shares one field renderer instead of five near-duplicates. */
export function OptionField({ option, value, onChange }: Props) {
  const control = inferControl(option);

  if (control.kind === 'unsupported') {
    return (
      <label className="opt-field opt-unsupported" title={option.desc ? String(option.desc) : undefined}>
        <span className="opt-name">{option.name}</span>
        <span className="opt-note">set in code — {option.type}</span>
      </label>
    );
  }

  if (control.kind === 'boolean') {
    return (
      <label className="opt-field opt-boolean">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="opt-name">{option.name}</span>
      </label>
    );
  }

  if (control.kind === 'number') {
    return (
      <label className="opt-field">
        <span className="opt-name">{option.name}</span>
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          placeholder={option.default}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
      </label>
    );
  }

  if (control.kind === 'enum') {
    return (
      <label className="opt-field">
        <span className="opt-name">{option.name}</span>
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value || undefined)}
        >
          <option value="">{option.default || 'default'}</option>
          {control.values.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="opt-field">
      <span className="opt-name">{option.name}</span>
      <input
        type="text"
        value={typeof value === 'string' ? value : ''}
        placeholder={option.default}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
    </label>
  );
}
