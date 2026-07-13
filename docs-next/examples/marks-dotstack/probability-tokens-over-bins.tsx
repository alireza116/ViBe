'use client';

import code from './probability-tokens-over-bins.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Probability tokens over bins",
  blurb: "A discrete point scale of bins 0–1; 25-token budget.",
  try: "click the plane to add, click a dot to remove.",
};

export { code };

export default function ProbabilityTokensOverBins({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
