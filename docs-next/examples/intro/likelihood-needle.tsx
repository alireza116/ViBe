'use client';

import code from './likelihood-needle.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Likelihood gauge",
  blurb: "A dial you can turn — drag the needle to pick how likely something feels.",
  try: "<b>Drag</b> the needle left or right.",
};

export { code };

export default function LikelihoodNeedle({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
