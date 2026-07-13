'use client';

import code from './the-same-bar-now-editable.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "The same bar, now editable",
  blurb: "y carries edit: drag(). Dragging a bar writes its value back to the data.",
  try: "<b>Drag</b> a bar up or down.",
};

export { code };

export default function TheSameBarNowEditable({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
