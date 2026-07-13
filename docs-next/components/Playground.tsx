'use client';

import { useMemo, useState } from 'react';
import { DocShell } from './DocShell';
import { ExampleLive } from './ExampleLive';
import type { ExampleModule } from '../lib/types';

export type PlaygroundPreset = {
  id: string;
  label: string;
  example: ExampleModule;
};

type Props = {
  presets: PlaygroundPreset[];
};

export function Playground({ presets }: Props) {
  const [presetId, setPresetId] = useState(presets[0]?.id ?? '');
  const active = useMemo(
    () => presets.find((p) => p.id === presetId) ?? presets[0],
    [presets, presetId]
  );

  if (!active) {
    return (
      <DocShell>
        <h1>Playground</h1>
        <p className="lead">No presets available.</p>
      </DocShell>
    );
  }

  return (
    <DocShell>
      <div className="playground-page">
        <h1>Composition playground</h1>
        <p className="lead">
          Edit a full <code className="inline">Elicit(spec)</code> live. Pick a preset to
          load a starter, tweak the code, and hit <b>Reset</b> to restore that preset&apos;s
          default.
        </p>
        <div className="playground-toolbar">
          <label htmlFor="preset">
            Preset{' '}
            <select
              id="preset"
              value={active.id}
              onChange={(e) => setPresetId(e.target.value)}
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ExampleLive
          key={active.id}
          code={active.example.code}
          meta={{
            title: active.example.meta.title || active.label,
            blurb: active.example.meta.blurb,
            try: active.example.meta.try,
          }}
          tall
        />
      </div>
    </DocShell>
  );
}
