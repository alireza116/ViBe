'use client';

import type { Dispatch } from 'react';
import type { BuilderAction, BuilderState, ScaleKind } from '../../lib/builder/types';
import { markByFamily } from '../../lib/builder/marks.manifest';
import { SCALES, scaleByType } from '../../lib/builder/scales.manifest';
import { OptionField } from './OptionField';

type Props = { state: BuilderState; dispatch: Dispatch<BuilderAction> };

/** Every scale type is offered on every bound channel — a mismatch (`band` on
 * a colour channel) is left for the chart's own live error, the same honesty
 * the free-form code editor already gives you. */
export function ScaleEditor({ state, dispatch }: Props) {
  const entry = markByFamily(state.mark.family);
  const boundChannels = entry.channels.filter((ch) => state.mark.channels[ch]?.field);

  if (boundChannels.length === 0) {
    return <p className="settings-hint">Bind a channel to a field first (see the Channels tab).</p>;
  }

  return (
    <div className="settings-section">
      {boundChannels.map((ch) => {
        const current = state.scales[ch];
        return (
          <div className="instance-card" key={ch}>
            <div className="instance-head">
              <code>{ch}</code>
              {current && (
                <button
                  type="button"
                  className="instance-remove"
                  onClick={() => dispatch({ type: 'CLEAR_SCALE', channel: ch })}
                  title="Use the default scale"
                >
                  ×
                </button>
              )}
            </div>
            <div className="opt-field">
              <span className="opt-name">type</span>
              <select
                value={current?.type ?? ''}
                onChange={(e) =>
                  dispatch({ type: 'SET_SCALE_TYPE', channel: ch, scaleType: e.target.value as ScaleKind })
                }
              >
                <option value="">default</option>
                {SCALES.map((s) => (
                  <option key={s.type} value={s.type}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            {current &&
              scaleByType(current.type).options.map((opt) => (
                <OptionField
                  key={opt.name}
                  option={opt}
                  value={current.options[opt.name]}
                  onChange={(value) => dispatch({ type: 'SET_SCALE_OPTION', channel: ch, name: opt.name, value })}
                />
              ))}
          </div>
        );
      })}
    </div>
  );
}
