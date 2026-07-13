'use client';

import code from './as-a-widget-2.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "As a widget",
  blurb: "Track, end caps and value labels are guides.",
  try: "move across the track, then click.",
};

export { code };

export default function AsAWidget2({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
