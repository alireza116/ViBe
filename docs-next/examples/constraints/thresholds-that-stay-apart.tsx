'use client';

import code from './thresholds-that-stay-apart.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Thresholds that stay apart",
  blurb: "spacing({ field: \"at\", min: 8 }) — no two boundaries closer than 8 points.",
  try: "<b>Drag</b> one threshold into its neighbour: it pushes rather than overlaps, and the shove carries down the line. Pushing apart preserves the order, so this field needs no <code class=\"inline\">ordering</code> as well.",
};

export { code };

export default function ThresholdsThatStayApart({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
