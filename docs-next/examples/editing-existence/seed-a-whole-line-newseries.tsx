'use client';

import code from './seed-a-whole-line-newseries.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Seed a whole line (newSeries)",
  blurb: "Double-click drops six evenly-spaced anchors at the click value; then sweep to shape.",
  try: "<b>Double-click</b> to drop a line, then <b>sweep</b> to shape it.",
};

export { code };

export default function SeedAWholeLineNewseries({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
