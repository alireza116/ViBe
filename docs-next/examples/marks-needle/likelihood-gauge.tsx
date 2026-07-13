'use client';

import code from './likelihood-gauge.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Likelihood gauge",
  blurb: "Seven ordered categories across a top-facing arc.",
  try: "<b>Drag</b> the needle across categories.",
};

export { code };

export default function LikelihoodGauge({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
