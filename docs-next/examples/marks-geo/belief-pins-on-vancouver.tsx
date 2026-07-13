'use client';

import code from './belief-pins-on-vancouver.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Belief pins on Vancouver",
  blurb: "Seeded near Downtown & Kitsilano; click elsewhere to add more.",
  try: "<b>Click</b> to place a pin; <b>drag</b> an existing one.",
};

export { code };

export default function BeliefPinsOnVancouver({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
