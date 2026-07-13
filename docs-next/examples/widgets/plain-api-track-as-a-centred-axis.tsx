'use client';

import code from './plain-api-track-as-a-centred-axis.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Plain API — track as a centred axis",
  blurb: "Same mark/edit/constraints. axisX with transform pins the spine to mid-height; tickValues at the domain ends are the labels; tickSize draws the end caps. Usually the simpler path when the chrome is an axis.",
  try: "same interaction — chrome comes from axes, not guides.",
};

export { code };

export default function PlainApiTrackAsACentredAxis({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
