'use client';

import code from './draw-a-forecast.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Draw the trend you expect",
  blurb: "Sketch the line with your mouse — like drawing a forecast by hand.",
  try: "<b>Drag</b> left-to-right across the chart to reshape the line.",
};

export { code };

export default function DrawAForecast({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
