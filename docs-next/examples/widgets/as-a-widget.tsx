'use client';

import code from './as-a-widget.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "As a widget",
  blurb: "Rings, track and labels come from the guide layer.",
  try: "hover across the scale, then click.",
};

export { code };

export default function AsAWidget({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
