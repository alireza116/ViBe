import type { NavGroup } from './types';

/** Sidebar sitemap — mirrors docs/_nav.js with Next routes (no .html). */
export const SITE: NavGroup[] = [
  {
    group: 'Getting started',
    pages: [
      { href: '/', title: 'Overview' },
      { href: '/concepts', title: 'Core concepts' },
      { href: '/sizing', title: 'Responsive sizing' },
      { href: '/authoring', title: 'Authoring SDK' },
    ],
  },
  {
    group: 'Marks',
    pages: [
      { href: '/marks/bar', title: 'Bar' },
      { href: '/marks/rect', title: 'Rect' },
      { href: '/marks/area', title: 'Area' },
      { href: '/marks/tick', title: 'Tick' },
      { href: '/marks/point', title: 'Point & Dot' },
      { href: '/marks/text', title: 'Text' },
      { href: '/marks/line', title: 'Line' },
      { href: '/marks/composite', title: 'Composite' },
      { href: '/marks/dotstack', title: 'Stacked dots' },
      { href: '/marks/waffle', title: 'Waffle' },
      { href: '/marks/cone', title: 'Line + Cone' },
      { href: '/marks/needle', title: 'Needle' },
      { href: '/marks/axis-radial', title: 'Radial axis' },
      { href: '/marks/arc', title: 'Arc · Pie · Donut' },
      { href: '/marks/geo', title: 'Geo' },
      { href: '/marks/trend', title: 'Trend line' },
      { href: '/marks/axes', title: 'Axis, Grid & Rule' },
    ],
  },
  {
    group: 'Editing',
    pages: [
      { href: '/editing', title: 'Overview' },
      { href: '/editing/gestures', title: 'Drag · Resize · Cycle · Custom' },
      { href: '/editing/sweep', title: 'Sweep (you-draw-it)' },
      { href: '/editing/lock', title: 'Locked rows (read-only)' },
      { href: '/editing/existence', title: 'Create · Remove · Anchors' },
      { href: '/editing/probe', title: 'Probe (hover · click)' },
      { href: '/editing/stages', title: 'Stages (multi-step)' },
      { href: '/editing/axis', title: 'Editable axes (domain)' },
    ],
  },
  {
    group: 'Widgets',
    pages: [{ href: '/widgets', title: 'Survey instruments' }],
  },
  {
    group: 'Scales & data',
    pages: [
      { href: '/scales', title: 'Scales & channels' },
      { href: '/schema', title: 'Data schema' },
      { href: '/constraints', title: 'Constraints' },
    ],
  },
  {
    group: 'Feedback',
    pages: [
      { href: '/effects', title: 'Interaction effects' },
      { href: '/guides', title: 'Guides' },
    ],
  },
  {
    group: 'Playground',
    pages: [{ href: '/playground', title: 'Composition playground' }],
  },
];
