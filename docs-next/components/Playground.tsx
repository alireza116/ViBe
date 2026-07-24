'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DocShell } from './DocShell';
import { ExampleLive } from './ExampleLive';
import { SpecBuilder } from './builder/SpecBuilder';
import type { PlaygroundPreset } from '../lib/types';

export type { PlaygroundPreset };

type Props = {
  presets: PlaygroundPreset[];
};

type Mode = 'build' | 'code';

/** The composition playground: a `Build` dashboard (mark catalog, channel /
 * edit / constraint / scale / theme panels) that renders live as you edit, and
 * a `Code` tab — the preset-picker + free-form live editor — for hand-typing
 * anything the form doesn't cover. Runs chromeless so the dashboard gets the
 * full width instead of sharing it with the site sidebar. */
export function Playground({ presets }: Props) {
  const [mode, setMode] = useState<Mode>('build');
  const [presetId, setPresetId] = useState(presets[0]?.id ?? '');
  const active = useMemo(
    () => presets.find((p) => p.id === presetId) ?? presets[0],
    [presets, presetId]
  );

  return (
    <DocShell chromeless>
      <div className="playground-page">
        <div className="playground-bar">
          <Link href="/" className="playground-brand">
            ← VibeJS docs
          </Link>
          <div className="playground-mode-tabs">
            <button
              type="button"
              className={`playground-mode-tab${mode === 'build' ? ' active' : ''}`}
              onClick={() => setMode('build')}
            >
              Build
            </button>
            <button
              type="button"
              className={`playground-mode-tab${mode === 'code' ? ' active' : ''}`}
              onClick={() => setMode('code')}
            >
              Code
            </button>
          </div>
        </div>

        {mode === 'build' ? (
          <SpecBuilder />
        ) : (
          <div className="playground-code-mode">
            <h1>Composition playground — code</h1>
            <p className="lead">
              Edit a full <code className="inline">Elicit(spec)</code> live. Pick a preset to
              load a starter, tweak the code, and hit <b>Reset</b> to restore that preset&apos;s
              default.
            </p>
            {active ? (
              <>
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
              </>
            ) : (
              <p className="lead">No presets available.</p>
            )}
          </div>
        )}
      </div>
    </DocShell>
  );
}
