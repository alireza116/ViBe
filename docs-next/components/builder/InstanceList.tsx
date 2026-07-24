'use client';

import type { ApiOption } from '../../lib/types';
import type { InstanceId, OptionValue } from '../../lib/builder/types';
import { OptionField } from './OptionField';

export type AvailableInstance = {
  name: string;
  label: string;
  docHref: string;
  options: ApiOption[];
};

export type Instance = { id: InstanceId; name: string; options: Record<string, OptionValue> };

type Props = {
  emptyHint: string;
  available: AvailableInstance[];
  instances: Instance[];
  onAdd: (name: string) => void;
  onRemove: (id: InstanceId) => void;
  onOptionChange: (id: InstanceId, name: string, value: OptionValue) => void;
};

/** Add/remove/configure a list of `{ name, options }` instances — the shared
 * shape edits and constraints both have, so one component drives both lists
 * instead of two near-identical ones. */
export function InstanceList({ emptyHint, available, instances, onAdd, onRemove, onOptionChange }: Props) {
  const byName = (name: string) => available.find((a) => a.name === name);

  return (
    <div className="settings-section">
      <div className="opt-field">
        <span className="opt-name">add</span>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) onAdd(e.target.value);
          }}
        >
          <option value="">— choose —</option>
          {available.map((a) => (
            <option key={a.name} value={a.name}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {instances.length === 0 && <p className="settings-hint">{emptyHint}</p>}

      {instances.map((inst) => {
        const def = byName(inst.name);
        return (
          <div className="instance-card" key={inst.id}>
            <div className="instance-head">
              <code>{inst.name}</code>
              {def?.docHref && (
                <a href={def.docHref} target="_blank" rel="noreferrer" className="instance-docs">
                  docs ↗
                </a>
              )}
              <button type="button" className="instance-remove" onClick={() => onRemove(inst.id)} title="Remove">
                ×
              </button>
            </div>
            {def?.options.map((opt) => (
              <OptionField
                key={opt.name}
                option={opt}
                value={inst.options[opt.name]}
                onChange={(value) => onOptionChange(inst.id, opt.name, value)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
