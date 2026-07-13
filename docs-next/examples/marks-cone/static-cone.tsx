'use client';

import code from './static-cone.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Static cone",
  blurb: "Without edits it is just a display of a belief — r = 0.6, envelope ±0.25.",
};

export { code };

export default function StaticCone({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
