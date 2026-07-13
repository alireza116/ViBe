'use client';

import code from './nearest-pick-self-drawn-guide.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Nearest pick + self-drawn guide",
  blurb: "pick: \"nearest\" grabs a bar from anywhere in its column; guide: true draws the snap ring.",
  try: "<b>Drag</b> from anywhere in a column to grab that bar.",
};

export { code };

export default function NearestPickSelfDrawnGuide({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
