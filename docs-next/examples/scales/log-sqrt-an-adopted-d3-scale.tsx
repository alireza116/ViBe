'use client';

import code from './log-sqrt-an-adopted-d3-scale.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "log · sqrt · an adopted d3 scale",
  blurb: "x is logarithmic, size ramps by sqrt, and the categorical fill uses a d3 ordinal scale.",
  try: "<b>Drag</b> a dot vertically — an adopted scale inverts like any other.",
};

export { code };

export default function LogSqrtAnAdoptedD3Scale({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
