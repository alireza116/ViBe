'use client';

import { useState, type Dispatch } from 'react';
import type { BuilderAction, BuilderState } from '../../lib/builder/types';
import { ConstraintList } from './ConstraintList';
import { ScaleEditor } from './ScaleEditor';
import { ThemePicker } from './ThemePicker';

const TABS = ['Constraints', 'Scales', 'Theme'] as const;
type Tab = (typeof TABS)[number];

type Props = { state: BuilderState; dispatch: Dispatch<BuilderAction> };

/** The secondary controls — constraints, scales, theme. Grouped behind one
 * compact tab strip so they stay out of the way of the primary Schema & Data
 * and Edits panels, but every one is a click away. */
export function SecondaryPanel({ state, dispatch }: Props) {
  const [tab, setTab] = useState<Tab>('Constraints');
  return (
    <div className="secondary-panel">
      <div className="settings-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`settings-tab${t === tab ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="settings-body">
        {tab === 'Constraints' && <ConstraintList state={state} dispatch={dispatch} />}
        {tab === 'Scales' && <ScaleEditor state={state} dispatch={dispatch} />}
        {tab === 'Theme' && <ThemePicker state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}
