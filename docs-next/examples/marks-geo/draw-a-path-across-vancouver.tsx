'use client';

import code from './draw-a-path-across-vancouver.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Draw a path across Vancouver",
  try: "<b>Drag</b> across the map to sketch a route.",
};

export { code };

export default function DrawAPathAcrossVancouver({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
