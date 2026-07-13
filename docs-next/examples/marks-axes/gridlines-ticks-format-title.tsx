'use client';

import code from './gridlines-ticks-format-title.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Gridlines, ticks, format & title",
  blurb: "y gets a grid and percent formatting; x a tick count and a title.",
};

export { code };

export default function GridlinesTicksFormatTitle({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
