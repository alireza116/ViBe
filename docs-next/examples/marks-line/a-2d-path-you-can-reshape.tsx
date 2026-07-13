'use client';

import code from './a-2d-path-you-can-reshape.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A 2D path you can reshape",
  blurb: "connectedScatter defaults to order: \"sequence\"; a 2D drag moves points, anchor extends the one path in click order.",
  try: "<b>Drag</b> a point anywhere, or <b>click</b> empty space to add the next anchor.",
};

export { code };

export default function A2dPathYouCanReshape({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
