'use client';

import code from './coupled-move-center-within-ends.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Coupled move + center-within-ends",
  blurb: "Two behaviours, two layers. The dot uses a joint edit (edit.custom): its new value comes from the pointer and it shifts lo/hi by the same delta, so moving the centre carries the whole bar. The invariant \"centre stays within the ends\" is a CONSTRAINT — a pure data rule on the DATASET. Declared once on the group, it runs on every commit from every part, so a cap can never cross the centre no matter which handle you grabbed.",
  try: "<b>Drag the dot</b> — the whole bar travels. <b>Drag a cap</b> past the dot — it stops at the centre.",
};

export { code };

export default function CoupledMoveCenterWithinEnds({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
