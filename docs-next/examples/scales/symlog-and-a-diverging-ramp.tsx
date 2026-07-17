'use client';

import code from './symlog-and-a-diverging-ramp.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "symlog position, diverging colour",
  blurb: "A domain that crosses zero — where log has no answer and a sequential ramp has no reference.",
  try: "<b>Drag</b> a dot across zero: the position stays readable at ±3 and at ±400 alike, and the colour turns as it passes the pivot.",
};

export { code };

export default function SymlogAndADivergingRamp({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
