import { Children, cloneElement, isValidElement, type ReactNode } from 'react';

/**
 * A page's standfirst — the paragraph under the <h1>.
 *
 * MDX parses a JSX block's children either as phrasing (all on one line) or as
 * blocks (separated by a blank line), and the block form already hands us a <p>.
 * Wrapping that would nest <p> inside <p>, which the HTML parser unnests — so
 * take over the existing paragraph when there is one instead.
 */
export function Lead({ children }: { children?: ReactNode }) {
  const only = Children.toArray(children);
  if (only.length === 1 && isValidElement(only[0]) && only[0].type === 'p') {
    const child = only[0];
    return cloneElement(child, { className: 'lead' } as Partial<typeof child.props>);
  }
  return <p className="lead">{children}</p>;
}
