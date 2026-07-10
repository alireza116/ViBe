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
        ],
    },
    {
        group: 'Marks',
        pages: [
            { path: 'marks/bar.html', title: 'Bar' },
            { path: 'marks/tick.html', title: 'Tick' },
            { path: 'marks/point.html', title: 'Point & Dot' },
            { path: 'marks/line.html', title: 'Line' },
            { path: 'marks/composite.html', title: 'Composite' },
            { path: 'marks/dotstack.html', title: 'Stacked dots' },
            { path: 'marks/waffle.html', title: 'Waffle' },
            { path: 'marks/cone.html', title: 'Line + Cone' },
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
            { path: 'editing/existence.html', title: 'Create · Remove · Anchors' },
            { path: 'editing/probe.html', title: 'Probe (hover · click)' },
            { path: 'editing/stages.html', title: 'Stages (multi-step)' },
        ],
    },
    {
        group: 'Widgets',
        pages: [
            { path: 'widgets.html', title: 'Likert · Choice · Slider · Matrix' },
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
