'use client';

import code from './sequential-fill-size-from-a-number.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Sequential fill + size from a number",
  blurb: "A numeric field drives both the continuous colour ramp and the radius.",
};

export { code };

export default function SequentialFillSizeFromANumber({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
