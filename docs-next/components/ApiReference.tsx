'use client';

import type { ApiEntry, ApiOption } from '../lib/types';

function OptionsTable({
  label,
  cols,
  rows,
  keys,
}: {
  label: string;
  cols: string[];
  rows: ApiOption[];
  keys: Array<'name' | 'type' | 'default' | 'desc'>;
}) {
  return (
    <>
      <div className="api-label">{label}</div>
      <div className="api-table-wrap">
        <table className="api-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                {keys.map((key) => {
                  if (key === 'name') {
                    return (
                      <td key={key}>
                        <code className="api-name">{r.name}</code>
                      </td>
                    );
                  }
                  if (key === 'type') {
                    return (
                      <td key={key}>
                        {r.type != null ? <code className="api-type">{r.type}</code> : null}
                      </td>
                    );
                  }
                  if (key === 'default') {
                    return (
                      <td key={key}>
                        {r.default != null ? <code className="api-def">{r.default}</code> : null}
                      </td>
                    );
                  }
                  return (
                    <td key={key} dangerouslySetInnerHTML={{ __html: r.desc ?? '' }} />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ApiReference({ entries }: { entries: ApiEntry[] }) {
  if (!entries.length) return null;
  return (
    <section id="api" className="api">
      <h2 className="section">API reference</h2>
      {entries.map((entry, i) => {
        const sigs = entry.signatures || (entry.signature ? [entry.signature] : []);
        return (
          <div className="api-entry" key={entry.name ?? i}>
            {entry.name ? <h3 className="api-heading">{entry.name}</h3> : null}
            {entry.summary ? (
              <p className="api-summary" dangerouslySetInnerHTML={{ __html: entry.summary }} />
            ) : null}
            {sigs.length ? (
              <pre className="code sig">
                <code>{sigs.join('\n')}</code>
              </pre>
            ) : null}
            {entry.options?.length ? (
              <OptionsTable
                label="Options"
                cols={['Option', 'Type', 'Default', 'Description']}
                rows={entry.options}
                keys={['name', 'type', 'default', 'desc']}
              />
            ) : null}
            {entry.channels?.length ? (
              <OptionsTable
                label="Channels"
                cols={['Channel', 'Type', 'Description']}
                rows={entry.channels}
                keys={['name', 'type', 'desc']}
              />
            ) : null}
            {entry.returns ? (
              <>
                <div className="api-label">Returns / emits</div>
                <p className="api-returns" dangerouslySetInnerHTML={{ __html: entry.returns }} />
              </>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
