"use client";

import { useEffect, useRef, useState } from "react";
import { DocShell } from "../../components/DocShell";
import { Elicit, plot, edit } from "@elicit";
import { legend } from "../../../src/plot";

const { bar, tickX, tickY } = plot;
const { move } = edit;

/**
 * Build the chart here. Fast Refresh re-runs this module on save; we remount
 * whenever `buildChart`'s identity changes (see effect deps below).
 */
function buildChart() {
  return Elicit({
    width: 380,
    height: 250,
    margins: { top: 16, right: 16, bottom: 30, left: 64 },
    data: [
      { day: "Mon", mood: "ok" },
      { day: "Tue", mood: "good" },
      { day: "Wed", mood: "bad" },
      { day: "Thu", mood: "good" },
      { day: "Fri", mood: "great" },
    ],
    schema: {
      day: { type: "categorical", domain: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
      mood: { type: "ordinal", domain: ["bad", "ok", "good", "great"] },
      angle: { type: "quantitative", domain: [0, 360] },
    },
    marks: [
      plot.point({
        size: 15,
        channels: {
          x: { field: "day" },
          y: { field: "mood" },
          angle: {
            field: "angle",
            scale: { range: [-180, 180] },
            edit: edit.rotate({ pivot: "mark", fold: false, pick: "direct" }),
          },
          symbol: {
            field: "mood",
            scale: { range: ["😢", "😐", "🙂", "😄"] },
            edit: edit.cycle(),
          },
        },
      }),
    ],
  });
}

export default function TestPage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  // `buildChart` is a new function each Fast Refresh → effect re-runs → chart remounts.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const chart = buildChart();
    host.replaceChildren(chart);
    setRows(chart.getData());
    const unsub = chart.on("change", () => setRows(chart.getData()));

    return () => {
      unsub();
      chart.destroy?.();
      host.replaceChildren();
    };
  }, [buildChart]);

  return (
    <DocShell>
      <h1>Test</h1>
      <p>
        Direct API — <code>Elicit</code> mounted into a ref. Edit{" "}
        <code>buildChart</code> and save; the chart remounts on Fast Refresh.
      </p>
      <div ref={hostRef} />
      <pre style={{ marginTop: 16, fontSize: 12 }}>
        {JSON.stringify(rows, null, 2)}
      </pre>
    </DocShell>
  );
}
