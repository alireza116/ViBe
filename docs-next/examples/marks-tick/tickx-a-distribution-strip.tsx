'use client';

import code from './tickx-a-distribution-strip.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "tickX — a distribution strip",
  blurb: "Values along x, each drawn as a vertical mark spanning y. inset shortens them.",
};

export { code };

export default function TickxADistributionStrip({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
