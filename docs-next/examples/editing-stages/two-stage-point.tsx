'use client';

import code from './two-stage-point.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Two-stage point",
  blurb: "Same mark, two staged edits, a Next button.",
  try: "drag horizontally; press Next; drag outward to resize.",
};

export { code };

export default function TwoStagePoint({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
