'use client';

import code from './explicit-gridy-axisx-axisy-ruley.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Explicit gridY + axisX/axisY + ruleY",
  blurb: "A gridline layer under the dots, a dashed rule at y = 50, and two titled axes — all as features.",
};

export { code };

export default function ExplicitGridyAxisxAxisyRuley({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
