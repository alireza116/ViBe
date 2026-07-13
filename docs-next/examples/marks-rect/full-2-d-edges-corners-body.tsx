'use client';

import code from './full-2-d-edges-corners-body.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Full 2-D: edges, corners, body",
  blurb: "Default brushRect(): every direction live.",
  try: "<b>Drag</b> an edge to resize a side, a corner to resize two extents, or the body to move.",
};

export { code };

export default function Full2DEdgesCornersBody({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
