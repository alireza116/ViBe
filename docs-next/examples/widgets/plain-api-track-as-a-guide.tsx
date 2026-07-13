'use client';

import code from './plain-api-track-as-a-guide.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Plain API — track as a guide",
  blurb: "Hand-rolled sliderTrack via guides.custom (full control over caps and stroke).",
  try: "same look as the widget.",
};

export { code };

export default function PlainApiTrackAsAGuide({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
