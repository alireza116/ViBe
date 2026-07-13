'use client';

import code from './study-areas-over-the-city.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Study areas over the city",
  blurb: "edit.geo.brush() resizes + moves; edit.geo.createRect() mints a new box on a click in open space (clicking an existing box grabs it instead). Pass move:false for resize-only, or { edgeInset } to widen the grab band.",
  try: "<b>Drag</b> a corner or edge to reshape · <b>drag</b> the middle to move · <b>click</b> empty map to add a box.",
};

export { code };

export default function StudyAreasOverTheCity({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
