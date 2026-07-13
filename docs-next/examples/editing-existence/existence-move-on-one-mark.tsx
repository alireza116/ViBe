'use client';

import code from './existence-move-on-one-mark.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Existence + move on one mark",
  blurb: "dblclick adds, Alt-click removes, drag moves.",
  try: "<b>Double-click</b> to add · <b><kbd>Alt</kbd>+click</b> a dot to delete · <b>Drag</b> to move.",
};

export { code };

export default function ExistenceMoveOnOneMark({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
