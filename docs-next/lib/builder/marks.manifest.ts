import type { ApiEntry } from '../types';
import type { MarkFamilyId } from './types';

import { api as barApi } from '../../app/marks/bar/api';
import { api as rectApi } from '../../app/marks/rect/api';
import { api as areaApi } from '../../app/marks/area/api';
import { api as tickApi } from '../../app/marks/tick/api';
import { api as pointApi } from '../../app/marks/point/api';
import { api as lineApi } from '../../app/marks/line/api';
import { api as textApi } from '../../app/marks/text/api';
import { api as dotstackApi } from '../../app/marks/dotstack/api';
import { api as waffleApi } from '../../app/marks/waffle/api';
import { api as arcApi } from '../../app/marks/arc/api';
import { api as needleApi } from '../../app/marks/needle/api';
import { api as axisRadialApi } from '../../app/marks/axis-radial/api';
import { api as coneApi } from '../../app/marks/cone/api';
import { api as trendApi } from '../../app/marks/trend/api';
import { api as legendApi } from '../../app/marks/legend/api';
import { api as axesApi } from '../../app/marks/axes/api';
import { api as compositeApi } from '../../app/marks/composite/api';
import { api as faceApi } from '../../app/marks/face/api';
import { api as symbolApi } from '../../app/marks/symbol/api';
import { api as geoApi } from '../../app/marks/geo/api';

export type MarkManifestEntry = {
  family: MarkFamilyId;
  label: string;
  category: string;
  docHref: string;
  api: ApiEntry[];
  /** Bare/X/Y (or equivalent) factory names, exactly as they exist on `vibe.plot`. */
  factoryNames: { auto: string; x?: string; y?: string };
  /** Buildable marks get a full form (position + style channels). Non-buildable
   * marks (polar geometry, nested parts, projections) stay in the catalog for
   * discovery but link out to their doc page instead of faking a form. */
  buildable: boolean;
  /** Field-bound channels the form offers, in order. Every buildable mark
   * encodes `x`/`y`; a few need one more (text's label content). */
  channels: string[];
  supportsSeries?: boolean;
};

export const MARKS: MarkManifestEntry[] = [
  {
    family: 'bar', label: 'Bar', category: 'Bars & rects', docHref: '/marks/bar',
    api: barApi, factoryNames: { auto: 'bar', x: 'barX', y: 'barY' },
    buildable: true, channels: ['x', 'y'],
  },
  {
    family: 'rect', label: 'Rect', category: 'Bars & rects', docHref: '/marks/rect',
    api: rectApi, factoryNames: { auto: 'rect', x: 'rectX', y: 'rectY' },
    buildable: true, channels: ['x', 'y'],
  },
  {
    family: 'area', label: 'Area', category: 'Lines & areas', docHref: '/marks/area',
    api: areaApi, factoryNames: { auto: 'area', x: 'areaX', y: 'areaY' },
    buildable: true, channels: ['x', 'y'], supportsSeries: true,
  },
  {
    family: 'line', label: 'Line', category: 'Lines & areas', docHref: '/marks/line',
    api: lineApi, factoryNames: { auto: 'line', x: 'lineX', y: 'lineY' },
    buildable: true, channels: ['x', 'y'], supportsSeries: true,
  },
  {
    family: 'point', label: 'Point', category: 'Points & ticks', docHref: '/marks/point',
    api: pointApi, factoryNames: { auto: 'point' },
    buildable: true, channels: ['x', 'y'],
  },
  {
    family: 'tick', label: 'Tick', category: 'Points & ticks', docHref: '/marks/tick',
    api: tickApi, factoryNames: { auto: 'tick', x: 'tickX', y: 'tickY' },
    buildable: true, channels: ['x', 'y'],
  },
  {
    family: 'rule', label: 'Rule', category: 'Points & ticks', docHref: '/marks/axes',
    api: axesApi, factoryNames: { auto: 'rule', x: 'ruleX', y: 'ruleY' },
    buildable: true, channels: ['x', 'y'],
  },
  {
    family: 'text', label: 'Text', category: 'Text', docHref: '/marks/text',
    api: textApi, factoryNames: { auto: 'text', x: 'textX', y: 'textY' },
    buildable: true, channels: ['x', 'y', 'text'],
  },
  {
    family: 'dotStack', label: 'Stacked dots', category: 'Distributions', docHref: '/marks/dotstack',
    api: dotstackApi, factoryNames: { auto: 'dotStack', x: 'dotStackX', y: 'dotStackY' },
    buildable: true, channels: ['x', 'y'],
  },
  {
    family: 'waffle', label: 'Waffle', category: 'Distributions', docHref: '/marks/waffle',
    api: waffleApi, factoryNames: { auto: 'waffle', x: 'waffleX', y: 'waffleY' },
    buildable: true, channels: ['x', 'y'],
  },
  // Polar / gauge geometry — real shapes, but their channels aren't a plain x/y
  // encoding (angle spans, radii, wedges). Catalogued, not form-built.
  {
    family: 'arc', label: 'Arc · Pie · Donut', category: 'Polar & gauges', docHref: '/marks/arc',
    api: arcApi, factoryNames: { auto: 'arc' }, buildable: false, channels: [],
  },
  {
    family: 'needle', label: 'Needle', category: 'Polar & gauges', docHref: '/marks/needle',
    api: needleApi, factoryNames: { auto: 'needle' }, buildable: false, channels: [],
  },
  {
    family: 'axisRadial', label: 'Radial axis', category: 'Polar & gauges', docHref: '/marks/axis-radial',
    api: axisRadialApi, factoryNames: { auto: 'axisRadial' }, buildable: false, channels: [],
  },
  {
    family: 'cone', label: 'Line + Cone', category: 'Polar & gauges', docHref: '/marks/cone',
    api: coneApi, factoryNames: { auto: 'cone' }, buildable: false, channels: [],
  },
  // Chrome / derived — read another channel's scale rather than encoding fresh data.
  {
    family: 'trend', label: 'Trend line', category: 'Chrome', docHref: '/marks/trend',
    api: trendApi, factoryNames: { auto: 'trend' }, buildable: false, channels: [],
  },
  {
    family: 'legend', label: 'Legend', category: 'Chrome', docHref: '/marks/legend',
    api: legendApi, factoryNames: { auto: 'legend' }, buildable: false, channels: [],
  },
  {
    family: 'axis', label: 'Axis & Grid', category: 'Chrome', docHref: '/marks/axes',
    api: axesApi, factoryNames: { auto: 'axis' }, buildable: false, channels: [],
  },
  // Glyphs / nested — need composed sub-marks or fixed emotion/symbol channels.
  {
    family: 'composite', label: 'Composite', category: 'Composite & glyphs', docHref: '/marks/composite',
    api: compositeApi, factoryNames: { auto: 'composite' }, buildable: false, channels: [],
  },
  {
    family: 'face', label: 'Face (emotion)', category: 'Composite & glyphs', docHref: '/marks/face',
    api: faceApi, factoryNames: { auto: 'face' }, buildable: false, channels: [],
  },
  {
    family: 'symbol', label: 'Symbol & Emoji', category: 'Composite & glyphs', docHref: '/marks/symbol',
    api: symbolApi, factoryNames: { auto: 'point' }, buildable: false, channels: [],
  },
  // Geo — channels are lon/lat or GeoJSON, and the chart needs `projection`.
  {
    family: 'geo', label: 'Geo', category: 'Geo', docHref: '/marks/geo',
    api: geoApi, factoryNames: { auto: 'geoPoint' }, buildable: false, channels: [],
  },
];

export const MARK_CATEGORIES = Array.from(new Set(MARKS.map((m) => m.category)));

export function markByFamily(family: MarkFamilyId): MarkManifestEntry {
  const found = MARKS.find((m) => m.family === family);
  if (!found) throw new Error(`Unknown mark family: ${family}`);
  return found;
}
