'use client';

import code from './click-a-dot-to-set-the-count.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Click a dot to set the count",
  blurb: "circle cells, one = 5; uniform dots pack tightly (gap: 0). Click any dot to fill up to and including it, or drag.",
  try: "click a dot, or drag up/down.",
};

export { code };

export default function ClickADotToSetTheCount({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
