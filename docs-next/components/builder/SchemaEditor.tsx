'use client';

import type { Dispatch } from 'react';
import type { BuilderAction, BuilderState, MeasureType } from '../../lib/builder/types';

type Props = { state: BuilderState; dispatch: Dispatch<BuilderAction> };

const MEASURE_TYPES: MeasureType[] = ['quantitative', 'categorical', 'ordinal', 'temporal'];

export function SchemaEditor({ state, dispatch }: Props) {
  return (
    <div className="settings-section">
      <div className="settings-subhead">Fields</div>
      {state.schema.map((f) => (
        <div className="schema-row" key={f.id}>
          <input
            type="text"
            className="schema-name"
            placeholder="field name"
            value={f.name}
            onChange={(e) => dispatch({ type: 'SET_SCHEMA_FIELD', id: f.id, patch: { name: e.target.value } })}
          />
          <select
            value={f.type}
            onChange={(e) =>
              dispatch({ type: 'SET_SCHEMA_FIELD', id: f.id, patch: { type: e.target.value as MeasureType } })
            }
          >
            {MEASURE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="schema-domain"
            placeholder={f.type === 'quantitative' || f.type === 'temporal' ? 'min, max' : 'a, b, c'}
            value={f.domain}
            onChange={(e) => dispatch({ type: 'SET_SCHEMA_FIELD', id: f.id, patch: { domain: e.target.value } })}
          />
          <button
            type="button"
            className="instance-remove"
            onClick={() => dispatch({ type: 'REMOVE_SCHEMA_FIELD', id: f.id })}
            title="Remove field"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="reset-btn" onClick={() => dispatch({ type: 'ADD_SCHEMA_FIELD' })}>
        + field
      </button>

      <div className="settings-subhead">Data (JSON rows)</div>
      <textarea
        className="theme-advanced"
        rows={10}
        value={state.dataJson}
        onChange={(e) => dispatch({ type: 'SET_DATA_JSON', json: e.target.value })}
      />
    </div>
  );
}
