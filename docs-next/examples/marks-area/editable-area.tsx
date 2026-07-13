'use client';

import code from './editable-area.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Editable area",
  blurb: "areaY with drag on y handles.",
  try: "<b>Drag</b> a handle to reshape the area.",
};

export { code };

export default function EditableArea({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
