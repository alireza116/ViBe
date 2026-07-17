'use client';

import code from './an-editable-confidence-band.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "An editable confidence band",
  blurb: "areaY with a y1/y2 pair; ordering keeps lo ≤ hi.",
  try: "<b>Drag</b> either edge — push the low edge past the high one and the band moves rather than turning inside-out.",
};

export { code };

export default function AnEditableConfidenceBand({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
