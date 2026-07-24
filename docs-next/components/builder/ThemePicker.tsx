'use client';

import type { Dispatch } from 'react';
import type { ApiOption } from '../../lib/types';
import type { BuilderAction, BuilderState, ThemeState } from '../../lib/builder/types';
import { OptionField } from './OptionField';

const COMMON_OVERRIDES: ApiOption[] = [
  { name: 'ink', type: 'string', default: '—', desc: 'The primary mark colour.' },
  { name: 'accent', type: 'string', default: '—', desc: 'Draggable handles, the committed answer.' },
  { name: 'muted', type: 'string', default: '—', desc: 'Secondary chrome / de-emphasised marks.' },
  { name: 'background', type: 'string', default: '—', desc: 'Chart backdrop (null = transparent).' },
];

type Props = { state: BuilderState; dispatch: Dispatch<BuilderAction> };

export function ThemePicker({ state, dispatch }: Props) {
  const { theme } = state;
  return (
    <div className="settings-section">
      <div className="opt-field">
        <span className="opt-name">preset</span>
        <select
          value={theme.preset}
          onChange={(e) =>
            dispatch({ type: 'SET_THEME_PRESET', preset: e.target.value as ThemeState['preset'] })
          }
        >
          <option value="default">default</option>
          <option value="survey">survey</option>
          <option value="dark">dark</option>
        </select>
      </div>

      <div className="settings-subhead">Common overrides</div>
      {COMMON_OVERRIDES.map((opt) => (
        <OptionField
          key={opt.name}
          option={opt}
          value={theme.overrides[opt.name]}
          onChange={(value) => dispatch({ type: 'SET_THEME_OVERRIDE', name: opt.name, value })}
        />
      ))}

      <div className="settings-subhead">Advanced (JSON)</div>
      <p className="settings-hint">
        Any other <code>Theme</code> token (font, axis, guide, widget, per-mark…) — merged on top of the
        preset and the overrides above.
      </p>
      <textarea
        className="theme-advanced"
        rows={6}
        placeholder={'{\n  "font": { "size": 12 }\n}'}
        value={theme.advancedJson}
        onChange={(e) => dispatch({ type: 'SET_THEME_ADVANCED', json: e.target.value })}
      />
    </div>
  );
}
