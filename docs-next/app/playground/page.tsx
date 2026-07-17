import { Playground } from '../../components/Playground';
import barCode from '../overview/_examples/a-bar-mark.example.txt';
import sumCode from '../constraints/_examples/bars-that-compensate.example.txt';
import sweepCode from '../editing/sweep/_examples/draw-a-curve.example.txt';
import geoCode from '../marks/geo/_examples/belief-pins-on-vancouver.example.txt';
import widgetCode from '../widgets/_examples/as-a-widget.example.txt';
import lineCode from '../marks/line/_examples/draw-then-reshape.example.txt';

// Chart bodies are shared with the pages that document them; the prose is inlined
// here because a preset's framing belongs to the playground, not to those pages.
const presets = [
  {
    id: 'bar',
    label: 'Bar chart',
    example: {
      code: barCode,
      meta: {
        title: 'A bar mark',
        blurb:
          'x is a band of categories, y a linear value, fill a constant. This is a complete, static Elicit spec.',
      },
    },
  },
  {
    id: 'sum',
    label: 'Bars + maintainSum',
    example: {
      code: sumCode,
      meta: {
        title: 'Bars that compensate',
        blurb:
          'maintainSum bounds the touched bar so the total stays 100; a rule guide marks the even split.',
        try: (
          <>
            <b>Drag</b> any bar — the others compensate.
          </>
        ),
      },
    },
  },
  {
    id: 'sweep',
    label: 'Sweep (you-draw-it)',
    example: {
      code: sweepCode,
      meta: {
        title: 'Draw a curve',
        blurb: 'edit: drag({ pick: "sweep" }) on the value channel; the x positions stay fixed.',
        try: (
          <>
            <b>Sweep</b> left-to-right across the chart.
          </>
        ),
      },
    },
  },
  {
    id: 'line',
    label: 'Draw a line',
    example: {
      code: lineCode,
      meta: {
        title: 'Draw, then reshape',
        blurb:
          'edit.line.draw({ samples: 8 }) on an empty line. First drag draws all eight points; a drag over the line reshapes it, a drag in empty space starts a new one.',
        try: (
          <>
            <b>Press and drag</b> to draw · <b>drag over the line</b> to reshape ·{' '}
            <b>drag elsewhere</b> for a new line.
          </>
        ),
      },
    },
  },
  {
    id: 'geo',
    label: 'Geo points',
    example: {
      code: geoCode,
      meta: {
        title: 'Belief pins on Vancouver',
        blurb: 'Seeded near Downtown & Kitsilano; click elsewhere to add more.',
        try: (
          <>
            <b>Click</b> to place a pin; <b>drag</b> an existing one.
          </>
        ),
      },
    },
  },
  {
    id: 'widget',
    label: 'Survey widget',
    example: {
      code: widgetCode,
      meta: {
        title: 'As a widget',
        blurb: 'Rings, track and labels come from the guide layer.',
        try: 'hover across the scale, then click.',
      },
    },
  },
];

export default function PlaygroundPage() {
  return <Playground presets={presets} />;
}
