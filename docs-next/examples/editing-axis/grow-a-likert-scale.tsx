'use client';

import code from './grow-a-likert-scale.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Grow a Likert scale",
  blurb: "mode: 'grow' keeps each band the same width and grows the chart by a step per point added — extend a 5-point scale to 7 without cramming.",
  try: "<b>Double-click</b> ＋ to add points — the chart widens instead of the bars shrinking · <b>click</b> × to shrink it back.",
};

export { code };

export default function GrowALikertScale({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
