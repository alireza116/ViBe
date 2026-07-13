'use client';

import code from './pins-on-openstreetmap.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Pins on OpenStreetMap",
  blurb: "geoTile() replaces geoBasemap entirely — no GeoJSON needed. The projection still needs a domain to know where to look; a bbox works when you have no topology to fit.",
  try: "<b>Click</b> to drop a pin; <b>drag</b> it. Lon/lat come back as data.",
};

export { code };

export default function PinsOnOpenstreetmap({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
