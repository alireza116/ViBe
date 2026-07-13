'use client';

import code from './allocate-a-budget.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Allocate a budget",
  blurb: "Drag the bars to split 100% across categories. Raising one lowers the others.",
  try: "<b>Drag</b> any bar. The shares always add up to 100.",
};

export { code };

export default function AllocateABudget({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
