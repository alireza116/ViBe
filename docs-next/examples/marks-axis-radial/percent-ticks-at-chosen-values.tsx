'use client';

import code from './percent-ticks-at-chosen-values.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Percent ticks at chosen values",
  blurb: "Explicit tickValues, a percent tickFormat, and a custom label colour.",
};

export { code };

export default function PercentTicksAtChosenValues({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
