'use client';

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Editor } from 'react-live';
import type { CodeMode, ExampleMeta, Prose } from '../lib/types';
import { createVibeScope } from '../lib/vibeScope';

const EVAL_DEBOUNCE_MS = 280;

const EDITOR_STYLE_BASE: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12.5,
};

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
      try {
        const rows = chart.getData();
        setCount(rows.length === 1 ? '1 row' : `${rows.length} rows`);
        const pad = String(Math.max(rows.length - 1, 0)).length;
        setHtml(
          rows.length
            ? rows.map((d, i) => fmtRow(d, i, pad)).join('\n')
            : '<span class="empty">no rows</span>'
        );
      } catch {
        setHtml('<span class="empty">unavailable</span>');
      }
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

/**
 * `Try: …` affordance under a chart. The hint keeps its own markup (`.try b` in
 * docs.css colours a <b> specifically), so a legacy HTML string and JSX from a
 * migrated page both land in the same single <span class="try">.
 */
function TryHint({ hint }: { hint: Prose }) {
  if (typeof hint === 'string') {
    return (
      <span className="try" dangerouslySetInnerHTML={{ __html: `Try: ${hint}` }} />
    );
  }
  return <span className="try">Try: {hint}</span>;
}

function formatEvalError(err: unknown): string {
  if (err instanceof SyntaxError) return `Syntax error: ${err.message}`;
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Coerce imported chart body to a plain string; strip dev HMR preamble/suffix if present. */
function normalizeExampleCode(code: unknown): string {
  const raw =
    typeof code === 'string'
      ? code
      : code != null &&
          typeof code === 'object' &&
          'default' in code &&
          typeof (code as { default: unknown }).default === 'string'
        ? (code as { default: string }).default
        : String(code ?? '');

  if (!raw.includes('import.meta') && !raw.includes('__webpack')) return raw;

  // Dev bundles sometimes wrap the chart body in a hot-reload IIFE — keep only the harness script.
  const cut =
    raw.search(/\n\s*import\.meta\b/) >= 0
      ? raw.search(/\n\s*import\.meta\b/)
      : raw.search(/\n\s*__webpack/) >= 0
        ? raw.search(/\n\s*__webpack/)
        : raw.search(/\$RefreshHelpers\$/) >= 0
          ? raw.search(/\$RefreshHelpers\$/)
          : -1;
  if (cut >= 0) return raw.slice(0, cut).trimEnd();

  const mountIdx = raw.search(/\bmount\s*\(/);
  if (mountIdx > 0) return raw.slice(mountIdx).trimEnd();

  return raw;
}

/**
 * Isolated from chart/error state so parent re-renders (after debounce eval)
 * do not remount the editor and jump the caret.
 */
const CodePane = memo(function CodePane({
  source,
  tall,
  onDraftChange,
}: {
  source: string;
  tall?: boolean;
  onDraftChange: (value: string) => void;
}) {
  const [value, setValue] = useState(source);
  const style = useMemo(
    () => ({
      ...EDITOR_STYLE_BASE,
      minHeight: tall ? 420 : 200,
    }),
    [tall]
  );

  // Remount when `source` identity changes (Reset / new preset) via key on parent.
  useEffect(() => {
    setValue(source);
  }, [source]);

  return (
    <Editor
      className="live-editor"
      code={value}
      language="jsx"
      theme={themes.nightOwl}
      onChange={(next) => {
        setValue(next);
        onDraftChange(next);
      }}
      style={style}
    />
  );
});

const ReadOnlyCode = memo(function ReadOnlyCode({ code }: { code: string }) {
  return (
    <Highlight theme={themes.nightOwl} code={code.trimEnd()} language="jsx">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`readonly-code ${className}`} style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
});

type Props = {
  code: string;
  meta: ExampleMeta;
  /** Wider editor (playground). */
  tall?: boolean;
  /** How to present the source. Default: editable. */
  codeMode?: CodeMode;
};

/**
 * Live example: harness-style `mount(Elicit(…))` eval with chart + getData panel.
 * `codeMode` controls whether source is editable, always-visible read-only, or
 * collapsed behind a toggle (intro gallery).
 */
export function ExampleLive({
  code: initialCode,
  meta,
  tall,
  codeMode = 'editable',
}: Props) {
  const baseCode = useMemo(() => normalizeExampleCode(initialCode), [initialCode]);
  const [source, setSource] = useState(baseCode);
  const [evalCode, setEvalCode] = useState(baseCode);
  const [editorKey, setEditorKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elicited, setElicited] = useState<ElicitEl | null>(null);
  const [fluid, setFluid] = useState(false);
  const [resultWidth, setResultWidth] = useState<string | undefined>();
  const [codeOpen, setCodeOpen] = useState(codeMode === 'readonly');
  const chartRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<ElicitEl | null>(null);
  const debounceRef = useRef<number | null>(null);
  const scope = useMemo(() => createVibeScope(), []);

  const isEditable = codeMode === 'editable';
  const isVisual = codeMode === 'collapsed' || codeMode === 'readonly';
  const showCode = isEditable || codeMode === 'readonly' || codeOpen;

  useEffect(() => {
    setSource(baseCode);
    setEvalCode(baseCode);
    setEditorKey((k) => k + 1);
    setCodeOpen(codeMode === 'readonly');
  }, [baseCode, codeMode]);

  const onDraftChange = useCallback((value: string) => {
    if (debounceRef.current != null) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setEvalCode(value);
      debounceRef.current = null;
    }, EVAL_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current != null) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setSource(baseCode);
    setEvalCode(baseCode);
    setEditorKey((k) => k + 1);
  }, [baseCode]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    let cancelled = false;

    activeRef.current?.destroy?.();
    activeRef.current = null;
    chart.replaceChildren();
    setElicited(null);
    setFluid(false);
    setResultWidth(undefined);

    // Mutable box so assignments inside `mount` (called via new Function) stay visible to TS.
    const mounted: { el: ElicitEl | null } = { el: null };
    const mount = (node: HTMLElement) => {
      chart.appendChild(node);
      if (
        !mounted.el &&
        node &&
        typeof (node as ElicitEl).getData === 'function' &&
        typeof (node as ElicitEl).on === 'function'
      ) {
        mounted.el = node as ElicitEl;
      }
      return node;
    };

    try {
      const names = Object.keys(scope);
      const vals = Object.values(scope);
      // eslint-disable-next-line no-new-func
      const run = new Function(...names, 'mount', evalCode);
      run(...vals, mount);
      if (cancelled) {
        mounted.el?.destroy?.();
        chart.replaceChildren();
        return;
      }
      activeRef.current = mounted.el;
      setError(null);
      setElicited(mounted.el);
      if (mounted.el) {
        if (mounted.el.style.width && mounted.el.style.width.endsWith('px')) {
          setResultWidth(mounted.el.style.width);
        } else {
          setFluid(true);
        }
      }
    } catch (err) {
      if (cancelled) return;
      mounted.el?.destroy?.();
      chart.replaceChildren();
      activeRef.current = null;
      setElicited(null);
      setError(formatEvalError(err));
    }

    return () => {
      cancelled = true;
      activeRef.current?.destroy?.();
      activeRef.current = null;
    };
  }, [evalCode, scope]);

  const cardClass = [
    'card',
    tall ? 'card-tall' : '',
    isVisual ? 'card-visual' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass}>
      <div className="card-head">
        <div>
          <h3>{meta.title}</h3>
          {meta.blurb ? <p>{meta.blurb}</p> : null}
        </div>
        <div className="card-actions">
          {codeMode === 'collapsed' ? (
            <button
              type="button"
              className="reset-btn"
              onClick={() => setCodeOpen((o) => !o)}
              title={codeOpen ? 'Hide the source' : 'Show the source'}
            >
              {codeOpen ? 'Hide code' : 'Show code'}
            </button>
          ) : null}
          <button
            type="button"
            className="reset-btn"
            onClick={reset}
            title="Restore the default example"
          >
            Reset
          </button>
        </div>
      </div>
      <div className={`body${isVisual ? ' body-visual' : ''}`}>
        {showCode && isEditable ? (
          <div className={`code-wrap${tall ? ' tall' : ''}`}>
            <CodePane
              key={editorKey}
              source={source}
              tall={tall}
              onDraftChange={onDraftChange}
            />
          </div>
        ) : null}
        {isVisual ? (
          <div className="visual-row">
            <div
              className={`result${fluid ? ' fluid' : ''}`}
              style={resultWidth ? { width: resultWidth } : undefined}
            >
              <div className="chart" ref={chartRef} />
              {error ? <pre className="live-error">⚠ {error}</pre> : null}
              {!error && meta.try ? (
                <span
                  className="try"
                  dangerouslySetInnerHTML={{ __html: `Try: ${meta.try}` }}
                />
              ) : null}
            </div>
            <div className="visual-data">
              {!error ? <DataPanel chart={elicited} /> : null}
            </div>
          </div>
        ) : (
          <div
            className={`result${fluid ? ' fluid' : ''}`}
            style={resultWidth ? { width: resultWidth } : undefined}
          >
            <div className="chart" ref={chartRef} />
            {error ? <pre className="live-error">⚠ {error}</pre> : null}
            {!error && meta.try ? <TryHint hint={meta.try} /> : null}
            {!error ? <DataPanel chart={elicited} /> : null}
          </div>
        )}
        {showCode && !isEditable ? (
          <div className={`code-wrap code-below${tall ? ' tall' : ''}`}>
            <ReadOnlyCode code={source} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
