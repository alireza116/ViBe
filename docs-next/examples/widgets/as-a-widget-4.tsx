'use client';

import code from './as-a-widget-4.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "As a widget",
  blurb: "Crosshair frame and high/low variable labels are guides.",
  try: "move, click, move, click.",
};

export { code };

export default function AsAWidget4({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
