'use client';

import code from './a-curve-that-only-rises.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A curve that can only rise",
  blurb: "monotonic({ field: \"p\", along: \"year\" }) — the rule behind every CDF.",
  try: "<b>Drag</b> a middle point up hard: the points to its right rise to meet it, because “it reaches this level by here” says something about later years too. Drag it down and the left-hand points give way instead.",
};

export { code };

export default function ACurveThatOnlyRises({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
