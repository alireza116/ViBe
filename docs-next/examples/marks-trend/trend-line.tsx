'use client';

import code from './trend-line.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Trend line",
  blurb: "Axes cross at the origin automatically; the line runs edge-to-edge through the plot.",
  try: "drag the centre (intercept) dot; press Next; drag the right (slope) dot.",
};

export { code };

export default function TrendLine({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
