'use client';

import type { Dispatch } from 'react';
import type { BuilderAction, BuilderState } from '../../lib/builder/types';
import { CONSTRAINTS } from '../../lib/builder/constraints.manifest';
import { InstanceList } from './InstanceList';

type Props = { state: BuilderState; dispatch: Dispatch<BuilderAction> };

export function ConstraintList({ state, dispatch }: Props) {
  const available = CONSTRAINTS.map((c) => ({
    name: c.name,
    label: c.label,
    docHref: c.docHref,
    options: c.options,
  }));

  return (
    <InstanceList
      emptyHint="No constraints — every edit is accepted as proposed."
      available={available}
      instances={state.constraints}
      onAdd={(name) => dispatch({ type: 'ADD_CONSTRAINT', name })}
      onRemove={(id) => dispatch({ type: 'REMOVE_CONSTRAINT', id })}
      onOptionChange={(id, name, value) => dispatch({ type: 'SET_CONSTRAINT_OPTION', id, name, value })}
    />
  );
}
