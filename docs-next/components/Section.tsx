import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { Example } from './Example';
import type { CodeMode } from '../lib/types';

type Props = {
  /**
   * The section's anchor. LOAD-BEARING: scripts/verify-browser.mjs — the repo's
   * only regression gate — roots assertions at these ids with DESCENDANT
   * selectors (`#band .chart > div`, `#seed .chart svg circle`), so the id must
   * stay on an element that CONTAINS the examples. Don't move it to the <h2>.
   */
  id: string;
  title: string;
  /** Presentation for every example in this section. A part's own prop wins. */
  codeMode?: CodeMode;
  children?: ReactNode;
};

/**
 * A titled section of a docs page: prose, then a grid of live examples.
 *
 * Children are split by kind rather than by slot, so a page.mdx reads as prose
 * with examples sitting where the author put them. <Example>s go in the grid;
 * everything else is prose above it.
 */
export function Section({ id, title, codeMode, children }: Props) {
  const prose: ReactNode[] = [];
  const examples: ReactNode[] = [];

  Children.forEach(Children.toArray(children), (child) => {
    if (isValidElement(child) && child.type === Example) {
      const own = child.props as { codeMode?: CodeMode };
      examples.push(
        codeMode && own.codeMode === undefined
          ? cloneElement(child, { codeMode } as Partial<typeof own>)
          : child
      );
      return;
    }
    // MDX emits a classless <p> for a paragraph; `.intro` is what docs.css styles.
    if (isValidElement(child) && child.type === 'p') {
      const own = child.props as { className?: string };
      prose.push(
        cloneElement(child, { className: own.className ?? 'intro' } as Partial<typeof own>)
      );
      return;
    }
    prose.push(child);
  });

  return (
    <section id={id}>
      <h2 className="section">{title}</h2>
      {prose}
      {examples.length ? <div className="grid">{examples}</div> : null}
    </section>
  );
}
