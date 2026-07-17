import type { Prose } from './types';

/**
 * Props for rendering `Prose` into a host element, spread onto the element
 * itself rather than wrapped in a component — a wrapper would add a node and
 * break the DOM the CSS and the browser gate both depend on.
 *
 * Transitional: a legacy `content/*.ts` page hands over an HTML string, a
 * migrated `api.tsx` / `page.mdx` hands over JSX. Once every route is MDX this
 * helper and the string branch disappear (see Prose in types.ts).
 */
export function proseProps(value: Prose) {
  return typeof value === 'string'
    ? { dangerouslySetInnerHTML: { __html: value } }
    : { children: value };
}
