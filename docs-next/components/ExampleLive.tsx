'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { themes } from 'prism-react-renderer';
import { Editor } from 'react-live';
import type { ExampleMeta } from '../lib/types';
import { createVibeScope } from '../lib/vibeScope';

function esc(c: string) {
  return c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtValue(v: unknown): string {
  if (v == null) return `<span class="key">${v}</span>`;
  if (typeof v === 'number') {
    return `<span class="num">${Number.isInteger(v) ? v : v.toFixed(2)}</span>`;
  }
  if (v instanceof Date) {
    return `<span class="str">${v.toISOString().slice(0, 10)}</span>`;
  }
  if (typeof v === 'string') return `<span class="str">"${esc(v)}"</span>`;
  return `<span class="num">${esc(JSON.stringify(v))}</span>`;
}

function fmtRow(d: Record<string, unknown>, i: number, pad: number) {
  return (
    `<span class="idx">${String(i).padStart(pad, ' ')}</span>  { ` +
    Object.entries(d)
      .map(([k, v]) => `<span class="key">${esc(k)}:</span> ${fmtValue(v)}`)
      .join(', ') +
    ' }'
  );
}

type ElicitEl = HTMLElement & {
  getData: () => Record<string, unknown>[];
  on: (ev: string, cb: () => void) => () => void;
  destroy?: () => void;
};

function DataPanel({ chart }: { chart: ElicitEl | null }) {
  const [html, setHtml] = useState('<span class="empty">no rows</span>');
  const [count, setCount] = useState('0 rows');

  useEffect(() => {
    if (!chart) return;
    const render = () => {
      const rows = chart.getData();
      setCount(rows.length === 1 ? '1 row' : `${rows.length} rows`);
      const pad = String(Math.max(rows.length - 1, 0)).length;
      setHtml(
        rows.length
          ? rows.map((d, i) => fmtRow(d, i, pad)).join('\n')
          : '<span class="empty">no rows</span>'
      );
    };
    const unsub = chart.on('change', render);
    render();
    return unsub;
  }, [chart]);

  if (!chart) return null;
  return (
    <div className="data">
      <div className="data-head">
        <span>getData()</span>
        <span className="data-count">{count}</span>
      </div>
      <pre className="data-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

type Props = {
  code: string;
  meta: ExampleMeta;
  /** Wider editor (playground). */
  tall?: boolean;
};

/**
 * Editable example: react-live-style editor + harness-style `mount(Elicit(…))` eval.
 * Reset restores the module's default `code`.
 */
export function ExampleLive({ code: initialCode, meta, tall }: Props) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [elicited, setElicited] = useState<ElicitEl | null>(null);
  const [fluid, setFluid] = useState(false);
  const [resultWidth, setResultWidth] = useState<string | undefined>();
  const chartRef = useRef<HTMLDivElement>(null);
  const scope = useMemo(() => createVibeScope(), []);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.replaceChildren();
    setError(null);
    setElicited(null);
    setFluid(false);
    setResultWidth(undefined);

    let active: ElicitEl | null = null;
    const mount = (node: HTMLElement) => {
      chart.appendChild(node);
      if (
        !active &&
        node &&
        typeof (node as ElicitEl).getData === 'function' &&
        typeof (node as ElicitEl).on === 'function'
      ) {
        active = node as ElicitEl;
      }
      return node;
    };

    try {
      const names = Object.keys(scope);
      const vals = Object.values(scope);
      // eslint-disable-next-line no-new-func
      new Function(...names, 'mount', code)(...vals, mount);
      // `active` is assigned inside `mount`, which TS cannot see through `new Function`.
      const chartEl = active as ElicitEl | null;
      setElicited(chartEl);
      if (chartEl) {
        if (chartEl.style.width && chartEl.style.width.endsWith('px')) {
          setResultWidth(chartEl.style.width);
        } else {
          setFluid(true);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error('Example failed:', meta.title, err);
    }

    return () => {
      (active as ElicitEl | null)?.destroy?.();
      chart.replaceChildren();
    };
  }, [code, scope, meta.title]);

  return (
    <div className={`card${tall ? ' card-tall' : ''}`}>
      <div className="card-head">
        <div>
          <h3>{meta.title}</h3>
          {meta.blurb ? <p>{meta.blurb}</p> : null}
        </div>
        <button
          type="button"
          className="reset-btn"
          onClick={() => setCode(initialCode)}
          title="Restore the default example"
        >
          Reset
        </button>
      </div>
      <div className="body">
        <div className={`code-wrap${tall ? ' tall' : ''}`}>
          <Editor
            className="live-editor"
            code={code}
            language="jsx"
            theme={themes.nightOwl}
            onChange={setCode}
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12.5,
              minHeight: tall ? 420 : 200,
            }}
          />
        </div>
        <div
          className={`result${fluid ? ' fluid' : ''}`}
          style={resultWidth ? { width: resultWidth } : undefined}
        >
          <div className="chart" ref={chartRef} />
          {error ? (
            <pre className="live-error">⚠ {error}</pre>
          ) : null}
          {meta.try ? (
            <span className="try" dangerouslySetInnerHTML={{ __html: `Try: ${meta.try}` }} />
          ) : null}
          <DataPanel chart={elicited} />
        </div>
      </div>
    </div>
  );
}
