'use client';

import code from './elicit-from-nothing.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Elicit from nothing",
  blurb: "schema declares age / belief / class; create mints fully-formed data.",
  try: "<b>Double-click</b> to create · <b>drag</b> to move · <b>click</b> to cycle the class colour.",
};

export { code };

export default function ElicitFromNothing({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
