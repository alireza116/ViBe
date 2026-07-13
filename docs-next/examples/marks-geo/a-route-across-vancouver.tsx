'use client';

import code from './a-route-across-vancouver.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A route across Vancouver",
  blurb: "Five stops connected in `stop` order. The dots are a geoPoint mark with edit.geo.drag() — the trail follows because both marks read the same dataset.",
  try: "<b>Drag</b> a stop to reroute; <b>click</b> the map to append one.",
};

export { code };

export default function ARouteAcrossVancouver({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
