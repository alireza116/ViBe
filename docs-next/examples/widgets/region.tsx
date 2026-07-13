'use client';

import code from './region.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Region",
  blurb: "rect + brushRect for a 2-D belief box.",
  try: "<b>Drag</b> edges, corners, or the body.",
};

export { code };

export default function Region({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
