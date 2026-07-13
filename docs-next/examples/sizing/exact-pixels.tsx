"use client";

import code from "./exact-pixels.example.txt";
import { ExampleLive } from "../../components/ExampleLive";
import type { CodeMode, ExampleMeta } from "../../lib/types";

export const meta: ExampleMeta = {
  title: "Exact pixels",
  blurb: "the default: a 320×240 chart that ignores the parent width.",
};

export { code };

export default function ExactPixels({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return (
    <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />
  );
}
