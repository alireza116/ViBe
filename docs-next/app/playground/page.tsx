import { Playground } from '../../components/Playground';
import { meta as barMeta, code as barCode } from '../../examples/overview/a-bar-mark';
import { meta as sumMeta, code as sumCode } from '../../examples/constraints/bars-that-compensate';
import { meta as sweepMeta, code as sweepCode } from '../../examples/editing-sweep/draw-a-curve';
import { meta as geoMeta, code as geoCode } from '../../examples/marks-geo/belief-pins-on-vancouver';
import { meta as widgetMeta, code as widgetCode } from '../../examples/widgets/as-a-widget';
import { meta as lineMeta, code as lineCode } from '../../examples/marks-line/draw-then-reshape';

const presets = [
  { id: 'bar', label: 'Bar chart', example: { meta: barMeta, code: barCode } },
  { id: 'sum', label: 'Bars + maintainSum', example: { meta: sumMeta, code: sumCode } },
  { id: 'sweep', label: 'Sweep (you-draw-it)', example: { meta: sweepMeta, code: sweepCode } },
  { id: 'line', label: 'Draw a line', example: { meta: lineMeta, code: lineCode } },
  { id: 'geo', label: 'Geo points', example: { meta: geoMeta, code: geoCode } },
  { id: 'widget', label: 'Survey widget', example: { meta: widgetMeta, code: widgetCode } },
];

export default function PlaygroundPage() {
  return <Playground presets={presets} />;
}
