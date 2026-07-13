'use client';

import code from './tentative-dot-on-hover-probe.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Tentative dot on hover (probe)",
  blurb: "create({ pick: \"probe\" }) shows the token before it is real; the click commits it.",
  try: "hover a bin — a dot appears but is not counted until you click. Alt-click removes.",
};

export { code };

export default function TentativeDotOnHoverProbe({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
