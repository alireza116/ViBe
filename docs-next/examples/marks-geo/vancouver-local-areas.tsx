'use client';

import code from './vancouver-local-areas.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Vancouver local areas",
  blurb: "Pass any FeatureCollection: geoBasemap({ geojson }). Fit with projection.domain. In your app: const map = await fetch(\"…/my-map.geojson\").then(r => r.json()).",
};

export { code };

export default function VancouverLocalAreas({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
