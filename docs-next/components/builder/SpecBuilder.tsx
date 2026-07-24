'use client';

import { useEffect, useMemo, useReducer, useState, type Dispatch } from 'react';
import { ExampleLive } from '../ExampleLive';
import { MarkPicker } from './MarkPicker';
import { ChannelFields } from './ChannelFields';
import { EditList } from './EditList';
import { SchemaEditor } from './SchemaEditor';
import { SecondaryPanel } from './SecondaryPanel';
import { builderReducer, defaultStarter } from '../../lib/builder/state';
import { buildSpecCode } from '../../lib/builder/serialize';
import { markByFamily } from '../../lib/builder/marks.manifest';
import type { BuilderAction, BuilderState, MarkFamilyId } from '../../lib/builder/types';

/** Delay a value so a burst of form edits (typing a colour, editing the data
 * JSON) re-evaluates the chart once things settle, not on every keystroke. */
function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return v;
}

type PanelProps = { state: BuilderState; dispatch: Dispatch<BuilderAction> };

function Panel({
  area,
  title,
  badge,
  flush,
  action,
  children,
}: {
  area: string;
  title: string;
  badge?: string;
  flush?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={`builder-panel area-${area}`}>
      <div className="panel-head">
        <span>{title}</span>
        {badge && <span className="panel-badge">{badge}</span>}
        {action && <span className="panel-action">{action}</span>}
      </div>
      <div className={`panel-body${flush ? ' flush' : ''}`}>{children}</div>
    </section>
  );
}

/** The Build dashboard: mark catalog + mark/channel config (left), a live
 * central preview (reactive — no Generate step), and the data + interaction
 * controls (right/bottom). Schema & data and Edits are primary, always-open
 * panels; constraints, scales and theme sit behind one secondary tab strip. */
export function SpecBuilder() {
  const [state, dispatch] = useReducer(builderReducer, undefined, defaultStarter);
  const code = useMemo(() => buildSpecCode(state), [state]);
  const liveCode = useDebounced(code, 250);
  const markLabel = markByFamily(state.mark.family).label;

  return (
    <div className="spec-builder">
      <Panel
        area="marks"
        title="Marks"
        flush
        action={
          <button type="button" className="reset-btn" onClick={() => dispatch({ type: 'RESET' })} title="Reset the whole builder">
            Reset
          </button>
        }
      >
        <MarkPicker
          active={state.mark.family}
          onSelect={(family: MarkFamilyId) => dispatch({ type: 'SET_MARK_FAMILY', family })}
        />
      </Panel>

      <Panel area="markcfg" title="Mark & channels">
        <ChannelFields state={state} dispatch={dispatch} />
      </Panel>

      <section className="builder-panel area-viz">
        <ExampleLive
          key="builder-live"
          code={liveCode}
          meta={{ title: `${markLabel} preview`, blurb: 'Live — every panel edits update the chart.' }}
          codeMode="collapsed"
        />
      </section>

      <Panel area="edits" title="Edits" badge="primary">
        <EditList state={state} dispatch={dispatch} />
      </Panel>

      <Panel area="schema" title="Schema & data" badge="primary">
        <SchemaEditor state={state} dispatch={dispatch} />
      </Panel>

      <section className="builder-panel area-secondary">
        <div className="panel-head">
          <span>More</span>
          <span className="panel-badge muted">constraints · scales · theme</span>
        </div>
        <SecondaryPanel state={state} dispatch={dispatch} />
      </section>
    </div>
  );
}
