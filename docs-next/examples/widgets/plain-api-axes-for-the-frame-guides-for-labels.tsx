'use client';

import code from './plain-api-axes-for-the-frame-guides-for-labels.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Plain API — axes for the frame, guides for labels",
  blurb: "Axes draw only the crossing spines (no ticks). Labels stay a small guide — useful when you want wrapped / multi-line copy the axis tickFormat cannot do.",
  try: "same flow; spines from axes, labels from a guide.",
};

export { code };

export default function PlainApiAxesForTheFrameGuidesForLabels({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
