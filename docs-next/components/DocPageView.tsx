'use client';

import { ApiReference } from './ApiReference';
import { DocShell } from './DocShell';
import { ExampleLive } from './ExampleLive';
import type { DocPage, ExampleModule } from '../lib/types';

type Props = {
  page: DocPage;
  examples: Record<string, ExampleModule>;
};

export function DocPageView({ page, examples }: Props) {
  return (
    <DocShell page={page}>
      <h1>{page.title}</h1>
      {page.lead ? (
        <p className="lead" dangerouslySetInnerHTML={{ __html: page.lead }} />
      ) : null}
      {page.api?.length ? <ApiReference entries={page.api} /> : null}
      {page.sections.map((sec) => (
        <section id={sec.id} key={sec.id}>
          <h2 className="section">{sec.title}</h2>
          {sec.intro ? <p className="intro">{sec.intro}</p> : null}
          <div className="grid">
            {sec.examples.map((key) => {
              const mod = examples[key];
              if (!mod) {
                return (
                  <div className="card" key={key}>
                    <p>Missing example: {key}</p>
                  </div>
                );
              }
              return <ExampleLive key={key} code={mod.code} meta={mod.meta} />;
            })}
          </div>
        </section>
      ))}
    </DocShell>
  );
}
