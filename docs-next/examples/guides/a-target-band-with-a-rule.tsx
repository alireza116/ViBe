'use client';

import code from './a-target-band-with-a-rule.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A target band with a rule",
  blurb: "guides.region shades 40–60; guides.rule marks the midpoint. Drag the dots across them.",
  try: "<b>Drag</b> a dot in and out of the target band.",
};

export { code };

export default function ATargetBandWithARule({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
