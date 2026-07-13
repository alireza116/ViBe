'use client';

import code from './probe-a-single-value.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Probe a single value",
  blurb: "drag({ pick: \"probe\" }) — no dragging involved, just move and click.",
  try: "move across the track, then click.",
};

export { code };

export default function ProbeASingleValue({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
