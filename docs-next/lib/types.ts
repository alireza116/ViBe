import type { ComponentType } from 'react';

export type ApiOption = {
  name: string;
  type?: string;
  default?: string;
  desc?: string;
};

export type ApiEntry = {
  name?: string;
  summary?: string;
  signature?: string;
  signatures?: string[];
  options?: ApiOption[];
  channels?: ApiOption[];
  returns?: string;
};

export type ExampleMeta = {
  title: string;
  blurb?: string;
  try?: string;
};

/** How ExampleLive presents the source snippet. Default: editable. */
export type CodeMode = 'editable' | 'collapsed' | 'readonly';

export type ExampleComponentProps = {
  codeMode?: CodeMode;
  tall?: boolean;
};

export type ExampleModule = {
  meta: ExampleMeta;
  code: string;
  /**
   * Optional React wrapper from a migrated `.tsx` example.
   * DocPageView prefers this when present.
   */
  Component?: ComponentType<ExampleComponentProps>;
};

export type DocSection = {
  id: string;
  title: string;
  intro?: string;
  /** Keys into the page's examples map, e.g. "constraints/bars-that-compensate" */
  examples: string[];
  /** Presentation for examples in this section. Default: editable. */
  codeMode?: CodeMode;
};

export type DocPage = {
  route: string;
  title: string;
  lead?: string;
  api?: ApiEntry[];
  sections: DocSection[];
};

export type NavPage = { href: string; title: string };
export type NavGroup = { group: string; pages: NavPage[] };
