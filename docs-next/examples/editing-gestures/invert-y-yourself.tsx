'use client';

import code from './invert-y-yourself.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Invert y yourself",
  blurb: "gesture defaults to drag. ctx.pointer is plot pixels; scales.y.invertValue maps them back to data. touched: true is just another field on the returned datum — it shows up in getData() because you put it there.",
  try: "<b>Drag</b> a dot — y follows the pointer; the data panel gains <code class=\"inline\">touched: true</code>.",
};

export { code };

export default function InvertYYourself({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
