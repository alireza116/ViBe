'use client';

import code from './pick-a-weather.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Pick a weather",
  blurb: "A single-row belief whose glyph is set from the legend row.",
  try: "<b>Click</b> a glyph in the legend to set today's weather.",
};

export { code };

export default function ExamplePickAWeather({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
