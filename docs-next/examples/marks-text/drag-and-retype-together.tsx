'use client';

import code from './drag-and-retype-together.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Drag and retype together",
  blurb: "Mark-level drag plus editText on the text channel: drag repositions, double-click retypes.",
  try: "<b>Drag</b> to move; <b>double-click</b> to rename.",
};

export { code };

export default function DragAndRetypeTogether({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
