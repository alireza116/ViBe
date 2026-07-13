'use client';

import code from './named-pins-you-can-rename.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Named pins you can rename",
  blurb: "geoPoint carries the drag; geoText carries the label. editText() opens an inline editor on double-click and writes the string back to the row.",
  try: "<b>Double-click</b> a name to retype it · <b>drag</b> a dot (the label follows) · <b>click</b> the map to add a pin.",
};

export { code };

export default function NamedPinsYouCanRename({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
