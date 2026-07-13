'use client';

import code from './sequential-ramp-size.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Sequential ramp + size",
  blurb: "fill: { field } → ramp, size: { field } → radius, from one numeric field.",
};

export { code };

export default function SequentialRampSize({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
