// _nav.js — the docs sitemap. Single source of truth for the sidebar: groups of
// pages, each `path` docs-relative (resolved to the current page's depth by the
// harness). Adding a page = add one line here + its shell + its pages/*.js module.
// The harness never needs editing for new content.

/** @typedef {{ path: string, title: string }} NavPage */
/** @typedef {{ group: string, pages: NavPage[] }} NavGroup */

/** @type {NavGroup[]} */
export const SITE = [
    {
        group: 'Getting started',
        pages: [
            { path: 'index.html', title: 'Overview' },
            { path: 'concepts.html', title: 'Core concepts' },
            { path: 'sizing.html', title: 'Responsive sizing' },
            { path: 'authoring.html', title: 'Authoring SDK' },
        ],
    },
    {
        group: 'Marks',
        pages: [
            { path: 'marks/bar.html', title: 'Bar' },
            { path: 'marks/rect.html', title: 'Rect' },
            { path: 'marks/area.html', title: 'Area' },
            { path: 'marks/tick.html', title: 'Tick' },
            { path: 'marks/point.html', title: 'Point & Dot' },
            { path: 'marks/symbol.html', title: 'Symbol & Emoji' },
            { path: 'marks/face.html', title: 'Face (emotion)' },
            { path: 'marks/text.html', title: 'Text' },
            { path: 'marks/line.html', title: 'Line' },
            { path: 'marks/composite.html', title: 'Composite' },
            { path: 'marks/dotstack.html', title: 'Stacked dots' },
            { path: 'marks/waffle.html', title: 'Waffle' },
            { path: 'marks/cone.html', title: 'Line + Cone' },
            { path: 'marks/needle.html', title: 'Needle' },
            { path: 'marks/axis-radial.html', title: 'Radial axis' },
            { path: 'marks/arc.html', title: 'Arc · Pie · Donut' },
            { path: 'marks/geo.html', title: 'Geo' },
            { path: 'marks/trend.html', title: 'Trend line' },
            { path: 'marks/axes.html', title: 'Axis, Grid & Rule' },
        ],
    },
    {
        group: 'Editing',
        pages: [
            { path: 'editing/index.html', title: 'Overview' },
            { path: 'editing/gestures.html', title: 'Drag · Resize · Cycle · Custom' },
            { path: 'editing/sweep.html', title: 'Sweep (you-draw-it)' },
            { path: 'editing/lock.html', title: 'Locked rows (read-only)' },
            { path: 'editing/existence.html', title: 'Create · Remove · Anchors' },
            { path: 'editing/probe.html', title: 'Probe (hover · click)' },
            { path: 'editing/stages.html', title: 'Stages (multi-step)' },
            { path: 'editing/axis.html', title: 'Editable axes (domain)' },
        ],
    },
    {
        group: 'Widgets',
        pages: [
            { path: 'widgets.html', title: 'Survey instruments' },
        ],
    },
    {
        group: 'Scales & data',
        pages: [
            { path: 'scales.html', title: 'Scales & channels' },
            { path: 'schema.html', title: 'Data schema' },
            { path: 'constraints.html', title: 'Constraints' },
        ],
    },
    {
        group: 'Feedback',
        pages: [
            { path: 'effects.html', title: 'Interaction effects' },
            { path: 'guides.html', title: 'Guides' },
        ],
    },
    {
        group: 'Playground',
        pages: [
            { path: 'playground.html', title: 'Composition playground' },
        ],
    },
];
