'use client';

import code from './an-interval-that-stays-in-order.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "An interval that can’t invert",
  blurb: "ordering({ fields: [\"lo\", \"mean\", \"hi\"] }) — one rule across three marks.",
  try: "<b>Drag</b> the low cap up past the mean: the mean and the high cap are carried along rather than the cap sticking. The handle you grabbed is the one you meant.",
};

export { code };

export default function AnIntervalThatStaysInOrder({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
