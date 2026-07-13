'use client';

import code from './how-a-chart-is-built.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "One editable bar chart",
  blurb: "The chart on the left and the numbers on the right are the same thing — drag a bar and watch the data update.",
  try: "<b>Drag</b> a bar — the panel on the right is what your app would read.",
};

export { code };

export default function HowAChartIsBuilt({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
