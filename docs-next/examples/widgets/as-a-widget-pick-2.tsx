'use client';

import code from './as-a-widget-pick-2.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "As a widget (pick ≤ 2)",
  blurb: "The hover shows whether a click will pick or un-pick.",
  try: "pick two, then click one again.",
};

export { code };

export default function AsAWidgetPick2({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
