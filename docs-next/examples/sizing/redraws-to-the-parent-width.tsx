'use client';

import code from './redraws-to-the-parent-width.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Redraws to the parent width",
  blurb: "responsive: \"reflow\"; drag a bar, then resize the window — layout recomputes.",
  try: "resize the window; drag a bar.",
};

export { code };

export default function RedrawsToTheParentWidth({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
