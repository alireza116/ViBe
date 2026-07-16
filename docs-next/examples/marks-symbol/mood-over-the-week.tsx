'use client';

import code from './mood-over-the-week.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Mood over the week",
  blurb: "symbol maps the ordinal mood to a face; cycle() advances it on click.",
  try: "<b>Click</b> a face to cycle its mood.",
};

export { code };

export default function ExampleMoodOverTheWeek({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
