'use client';

import code from './double-click-to-seed-then-sweep.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Double-click to seed, then sweep",
  blurb: "edit.line.newSeries({ samples: 6 }) drops six evenly-spaced anchors at the click’s value.",
  try: "<b>Double-click</b> to drop a line, then <b>sweep</b> to shape it.",
};

export { code };

export default function DoubleClickToSeedThenSweep({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
