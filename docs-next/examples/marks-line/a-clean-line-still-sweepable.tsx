'use client';

import code from './a-clean-line-still-sweepable.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A clean line, still sweepable",
  blurb: "handles: false hides the dots; the sweep edit still works.",
  try: "<b>Sweep</b> across — no handles, but the line still responds.",
};

export { code };

export default function ACleanLineStillSweepable({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
