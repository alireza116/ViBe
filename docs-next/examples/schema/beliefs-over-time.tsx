'use client';

import code from './beliefs-over-time.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Beliefs over time",
  blurb: "A temporal domain drives a time scale; created points carry real Dates.",
  try: "<b>Double-click</b> to record a belief at a point in time · <b>drag</b> to adjust.",
};

export { code };

export default function BeliefsOverTime({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
