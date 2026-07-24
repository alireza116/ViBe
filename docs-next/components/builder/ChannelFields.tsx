'use client';

import type { Dispatch } from 'react';
import type { ApiOption } from '../../lib/types';
import type { BuilderAction, BuilderState } from '../../lib/builder/types';
import { markByFamily } from '../../lib/builder/marks.manifest';
import { isFormOption } from '../../lib/builder/controlKind';
import { OptionField } from './OptionField';

const STYLE_OPTIONS: ApiOption[] = [
  { name: 'fill', type: 'string', default: "'steelblue'", desc: 'Fill colour.' },
  { name: 'stroke', type: 'string', default: '—', desc: 'Stroke colour.' },
  { name: 'strokeWidth', type: 'number', default: '1', desc: 'Stroke width, in px.' },
  { name: 'opacity', type: 'number', default: '1', desc: 'Opacity, 0–1.' },
  { name: 'size', type: 'number', default: '—', desc: 'Radius, in px (point/dot-family marks).' },
];

type Props = {
  state: BuilderState;
  dispatch: Dispatch<BuilderAction>;
};

export function ChannelFields({ state, dispatch }: Props) {
  const entry = markByFamily(state.mark.family);
  // `orientation` gets its own explicit control below, so drop it from the
  // generic options list to avoid showing the field twice.
  const seen = new Set<string>(['orientation']);
  const uniqueMarkOptions = entry.api
    .flatMap((e) => e.options || [])
    .filter(isFormOption)
    .filter((o) => (seen.has(o.name) ? false : (seen.add(o.name), true)));

  return (
    <div className="settings-section">
      {(entry.factoryNames.x || entry.factoryNames.y) && (
        <div className="opt-field">
          <span className="opt-name">orientation</span>
          <select
            value={state.mark.orientation}
            onChange={(e) =>
              dispatch({ type: 'SET_ORIENTATION', orientation: e.target.value as 'auto' | 'x' | 'y' })
            }
          >
            <option value="auto">auto</option>
            {entry.factoryNames.x && <option value="x">horizontal</option>}
            {entry.factoryNames.y && <option value="y">vertical</option>}
          </select>
        </div>
      )}

      <div className="settings-subhead">Channels</div>
      {entry.channels.map((ch) => (
        <div className="opt-field" key={ch}>
          <span className="opt-name">{ch}</span>
          <select
            value={state.mark.channels[ch]?.field ?? ''}
            onChange={(e) => dispatch({ type: 'SET_CHANNEL', channel: ch, binding: { field: e.target.value } })}
          >
            <option value="">— choose a field —</option>
            {state.schema.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      ))}

      {uniqueMarkOptions.length > 0 && (
        <>
          <div className="settings-subhead">Options</div>
          {uniqueMarkOptions.map((opt) => (
            <OptionField
              key={opt.name}
              option={opt}
              value={state.mark.options[opt.name]}
              onChange={(value) => dispatch({ type: 'SET_MARK_OPTION', name: opt.name, value })}
            />
          ))}
        </>
      )}

      <div className="settings-subhead">Style</div>
      {STYLE_OPTIONS.map((opt) => (
        <OptionField
          key={opt.name}
          option={opt}
          value={state.mark.style[opt.name]}
          onChange={(value) => dispatch({ type: 'SET_STYLE', name: opt.name, value })}
        />
      ))}
    </div>
  );
}
