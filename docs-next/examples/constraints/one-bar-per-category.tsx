'use client';

import code from './one-bar-per-category.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "One bar per category",
  blurb: "create mints wherever you click, but unique({ field: \"x\" }) rejects a filled slot.",
  try: "<b>Click</b> an empty column to fill it · a filled column rejects.",
};

export { code };

export default function OneBarPerCategory({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
