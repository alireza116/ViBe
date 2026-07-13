'use client';

import code from './per-slot-cap-with-unique.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Per-slot cap with unique",
  blurb: "unique({ field, max }) limits the height of any one column.",
};

export { code };

export default function PerSlotCapWithUnique({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
