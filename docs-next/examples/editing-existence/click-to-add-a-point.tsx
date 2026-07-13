'use client';

import code from './click-to-add-a-point.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Click to add a point",
  blurb: "create({ defaults }) mints a datum at the pointer; count({ max }) caps the dataset.",
  try: "<b>Click</b> empty space to add a point · <b>drag</b> to move it.",
};

export { code };

export default function ClickToAddAPoint({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
