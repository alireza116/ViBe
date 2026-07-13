'use client';

import code from './plain-api-crosshair-as-centred-axes.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Plain API — crosshair as centred axes",
  blurb: "Declare frame scales x/y (not elicited). Centre each axis with transform; tickValues at the ends + tickFormat are the high/low labels. Tick data from the scale; drawing still goes through the renderer (no d3.axis).",
  try: "same two-step flow — labels are end ticks.",
};

export { code };

export default function PlainApiCrosshairAsCentredAxes({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
