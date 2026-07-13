'use client';

import code from './click-to-add-an-anchor.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Click to add an anchor",
  blurb: "edit.line.anchor({ into: \"nearest\" }) extends the connected path in click order — near or far, it stays one line (into: \"new\" starts a fresh one).",
  try: "<b>Drag</b> a point, or <b>click</b> empty space to add the next anchor.",
};

export { code };

export default function ClickToAddAnAnchor({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
