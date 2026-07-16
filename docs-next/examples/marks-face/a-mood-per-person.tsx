'use client';

import code from './a-mood-per-person.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A mood per person",
  blurb: "Faces positioned along a categorical x; drag each one's mouth or eyes to set that person's emotion.",
  try: "<b>Drag</b> any face's mouth or an eye.",
};

export { code };

export default function ExampleAMoodPerPerson({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
