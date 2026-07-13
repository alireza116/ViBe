'use client';

import code from './type-to-edit-content.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Type to edit content",
  blurb: "editText() wires double-click-to-retype: an inline input opens, Enter commits, Esc cancels.",
  try: "<b>Double-click</b> a label, type, and press Enter.",
};

export { code };

export default function TypeToEditContent({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
