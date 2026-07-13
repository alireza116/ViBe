'use client';

import code from './formatted-numeric-labels.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Formatted numeric labels",
  blurb: "format is display-only (a d3-format string or a helper from format.*). The field stays the raw number, so a later drag still inverts correctly.",
};

export { code };

export default function FormattedNumericLabels({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
