import type { ReactNode } from 'react';

/**
 * Rendered prose. JSX, not an HTML string — pages author it as markdown in
 * `app/**\/page.mdx` and reference tables as JSX in the sibling `api.tsx`.
 */
export type Prose = ReactNode;

export type ApiOption = {
  name: string;
  type?: string;
  default?: string;
  desc?: Prose;
};

export type ApiEntry = {
  name?: string;
  summary?: Prose;
  signature?: string;
  signatures?: string[];
  options?: ApiOption[];
  channels?: ApiOption[];
  returns?: Prose;
};

export type ExampleMeta = {
  title: string;
  blurb?: string;
  try?: Prose;
};

/** How ExampleLive presents the source snippet. Default: editable. */
export type CodeMode = 'editable' | 'collapsed' | 'readonly';

/** A live example: the raw chart body plus the prose that frames it. */
export type ExampleModule = {
  meta: ExampleMeta;
  code: string;
};

export type NavPage = { href: string; title: string };
export type NavGroup = { group: string; pages: NavPage[] };
