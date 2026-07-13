'use client';

import code from './tiles-under-the-neighborhood-outlines.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Tiles under the neighborhood outlines",
  blurb: "Raster and vector chrome compose: geoTile() lays the imagery, geoBasemap() draws the boundaries over it (fill \"none\"), and the elicited marks sit on top of both. Dim the tiles with opacity so your data still reads.",
  try: "<b>Drag</b> a study box; <b>click</b> open map to add one.",
};

export { code };

export default function TilesUnderTheNeighborhoodOutlines({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
