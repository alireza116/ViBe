'use client';

import code from './1d-centered-slider-axis.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "1D centered slider axis",
  blurb: "One point channel; the axis is pinned to the vertical center via transform, and y is dropped.",
  try: "<b>Drag</b> a dot along the axis.",
};

export { code };

export default function Example1dCenteredSliderAxis({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
