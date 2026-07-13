'use client';

import code from './swap-the-affordance-guide.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Swap the affordance guide",
  blurb: "Replace rings with your own ticks — same mark/edit/constraint, different clothing. Guide nodes never capture the pointer.",
  try: "click a tick — interaction unchanged, look is yours.",
};

export { code };

export default function SwapTheAffordanceGuide({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
