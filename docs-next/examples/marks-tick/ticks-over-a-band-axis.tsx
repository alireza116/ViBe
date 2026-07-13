'use client';

import code from './ticks-over-a-band-axis.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Ticks over a band axis",
  blurb: "One tick per category, spanning the band at its y value.",
};

export { code };

export default function TicksOverABandAxis({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
