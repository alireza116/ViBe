'use client';

import code from './drag-to-reposition.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Drag to reposition",
  blurb: "Mark-level drag({ channels: [\"x\",\"y\"] }) moves the label; writes x/y back through the scales. (Do not put <code class=\"inline\">edit</code> as a channel key — attach it on a channel or via <code class=\"inline\">edits</code>.)",
  try: "<b>Drag</b> a label to move it.",
};

export { code };

export default function DragToReposition({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
