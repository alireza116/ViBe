'use client';

import code from './place-beliefs.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Age vs immigration attitude",
  blurb: "An empty scatter plot. Double-click to place people; drag to move them. Color runs from red (anti) to green (pro).",
  try: "<b>Double-click</b> to add a person · <b>drag</b> to move them.",
};

export { code };

export default function PlaceBeliefs({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
