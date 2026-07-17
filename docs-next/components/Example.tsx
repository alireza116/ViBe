'use client';

import { ExampleLive } from './ExampleLive';
import type { CodeMode, Prose } from '../lib/types';

export type ExampleProps = {
  /** Raw chart body, imported from a co-located `_examples/*.example.txt`. */
  code: string;
  title: string;
  blurb?: string;
  /**
   * The `Try: …` affordance. JSX, so a hint keeps its own markup — `.try b` in
   * docs.css colours a <b> specifically.
   */
  try?: Prose;
  /** Set by the enclosing <Section>; an explicit prop here wins. */
  codeMode?: CodeMode;
  tall?: boolean;
};

/**
 * A live example on a docs page. Thin: it exists so `page.mdx` can name an
 * example's prose (title / blurb / try) next to the prose around it, while the
 * chart body stays a plain `.example.txt` that the editor evals verbatim.
 */
export function Example({ code, title, blurb, try: tryHint, codeMode, tall }: ExampleProps) {
  return (
    <ExampleLive
      code={code}
      meta={{ title, blurb, try: tryHint }}
      codeMode={codeMode}
      tall={tall}
    />
  );
}
