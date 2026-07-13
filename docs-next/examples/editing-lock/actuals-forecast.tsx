'use client';

import code from './actuals-forecast.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Actuals + forecast",
  blurb: "lock: (d) => d.kind === \"actual\". The two grey bars are reported; only the forecast bars take a drag.",
  try: "<b>Drag</b> Q3 / Q4 (blue). Q1 and Q2 are reported — they don’t budge.",
};

export { code };

export default function ActualsForecast({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
