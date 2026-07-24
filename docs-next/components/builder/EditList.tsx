'use client';

import type { Dispatch } from 'react';
import type { BuilderAction, BuilderState } from '../../lib/builder/types';
import { editsFor } from '../../lib/builder/edits.manifest';
import { markByFamily } from '../../lib/builder/marks.manifest';
import { InstanceList } from './InstanceList';

type Props = { state: BuilderState; dispatch: Dispatch<BuilderAction> };

export function EditList({ state, dispatch }: Props) {
  const entry = markByFamily(state.mark.family);
  const available = editsFor(!!entry.supportsSeries).map((e) => ({
    name: e.callPath,
    label: e.callPath,
    docHref: e.docHref,
    options: e.options,
  }));

  return (
    <InstanceList
      emptyHint="No edits yet — the chart renders but nothing responds to a gesture."
      available={available}
      instances={state.edits}
      onAdd={(name) => dispatch({ type: 'ADD_EDIT', name })}
      onRemove={(id) => dispatch({ type: 'REMOVE_EDIT', id })}
      onOptionChange={(id, name, value) => dispatch({ type: 'SET_EDIT_OPTION', id, name, value })}
    />
  );
}
