'use client';

import code from './draw-the-line-for-the-missing-years.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Draw the line for the missing years",
  blurb: "edit.line.draw({ samples: years }) paints one point per year as the pointer crosses its column. Drag back over the record and it will not budge — the lock repairs those rows and keeps the rest of the stroke.",
  try: "<b>Drag</b> left-to-right across the empty half to draw 1991–2016, then <b>drag again</b> to refine it. Then press <b>Show me how I did</b>.",
};

export { code };

export default function DrawTheLineForTheMissingYears({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
