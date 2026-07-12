// Editable axes — reshape a field's DOMAIN by dragging an axis or editing its
// categories. Unlike every other edit, edit.axis.* writes the SCHEMA, not the
// dataset: grids, guides and marks then reflow from the new domain.
export default {
    path: 'editing/axis.html',
    title: 'Editable axes (domain)',
    lead:
        'An axis is normally inert. Give it an <code class="inline">edit</code> and it becomes ' +
        'interactive — but where a mark edit rewrites a <b>datum</b>, an axis edit rewrites the ' +
        'field\'s <b>domain</b> on the schema. A numeric axis is <b>dragged</b> to grow or shrink ' +
        'its range; a categorical axis gains <b>add / rename / remove</b> affordances. Because the ' +
        'domain lives on the schema and scales re-resolve every render, the grid, guides and marks ' +
        'follow along automatically. Read the new domain with ' +
        '<code class="inline">el.getSchema()</code> (the dataset is untouched, except that removing ' +
        'a category also deletes its rows).',
    api: [
        {
            name: 'edit.axis.scale(options)',
            summary:
                'Numeric / temporal axis — drag an end-handle to rescale the range. Runs through the ' +
                'axisDrag driver (the plane owns the gesture); apply writes the new [min,max].',
            signature: "edit.axis.scale({ field, mode }) → Edit",
            options: [
                { name: 'field', type: 'string', default: 'all on axis', desc: 'The schema field whose domain to write. Defaults to every field unioned onto the axis (e.g. an error bar\'s mean/lo/hi).' },
                { name: 'mode', type: "'rescale'|'grow'", default: "'rescale'", desc: '<code class="inline">rescale</code> keeps the chart size (marks compress); <code class="inline">grow</code> holds the data\'s pixels-per-unit and resizes the chart instead.' },
            ],
            returns: 'An <b>Edit</b> with <code class="inline">target: "domain"</code>. apply returns <code class="inline">{ domains, resize? }</code>; the engine writes the schema (and resizes in grow mode).',
        },
        {
            name: 'edit.axis.categories(options)',
            summary:
                'Categorical / ordinal axis — add, rename and remove categories. Reuses the inline-typing ' +
                'lifecycle: double-click the "＋" to add, double-click a label to rename, click its "×" to remove.',
            signature: "edit.axis.categories({ field, mode }) → Edit[]",
            options: [
                { name: 'field', type: 'string', default: 'first on axis', desc: 'The categorical field whose domain (and rows, on rename/remove) to edit.' },
                { name: 'mode', type: "'rescale'|'grow'", default: "'rescale'", desc: "<code class=\"inline\">rescale</code> keeps the chart size (bands re-divide it — thinner as you add); <code class=\"inline\">grow</code> keeps each band the same pixel size and grows/shrinks the chart by a step per category (e.g. a 5-point Likert extended to 7)." },
            ],
            returns: 'An <b>array of Edits</b> (add / rename / remove), all <code class="inline">target: "domain"</code>. Rename relabels matching rows; remove deletes them. In grow mode, add/remove also carry a chart <code class="inline">resize</code>.',
        },
    ],
    sections: [
        {
            id: 'numeric',
            title: 'Drag a numeric axis to rescale',
            intro:
                'axisX({ edit: edit.axis.scale() }) grows a draggable handle at each end of the axis. ' +
                'Drag the max handle inward to widen the range (data compresses into the same chart), ' +
                'outward to tighten it. The min stays anchored; the dataset never changes.',
            examples: [
                {
                    title: 'Rescale in place',
                    blurb: 'Dragging the end-handle rewrites x\'s schema domain; the grid follows.',
                    try: '<b>Drag</b> the blue handle at either end of the x-axis.',
                    code:
`mount(Elicit({
  width: 420, height: 280,
  margins: { top: 16, right: 18, bottom: 40, left: 44 },
  data: [{ x: 20, y: 30 }, { x: 55, y: 65 }, { x: 90, y: 20 }],
  schema: {
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  axes: false,
  features: [
    gridX(), axisY(),
    axisX({ title: "x", grid: true, edit: edit.axis.scale() }),
    point({ fill: "#7c3aed", size: 7,
      channels: { x: { field: "x" }, y: { field: "y" } } }),
  ],
}))`,
                },
                {
                    title: 'Grow the chart instead',
                    blurb: "mode: 'grow' holds the data's scale constant and resizes the chart.",
                    try: '<b>Drag</b> the x-axis max handle — the chart itself grows/shrinks.',
                    code:
`mount(Elicit({
  width: 360, height: 260,
  margins: { top: 16, right: 18, bottom: 40, left: 44 },
  data: [{ x: 20, y: 30 }, { x: 90, y: 55 }],
  schema: {
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  axes: false,
  features: [
    axisY(),
    axisX({ title: "x", edit: edit.axis.scale({ mode: "grow" }) }),
    point({ fill: "#059669", size: 7,
      channels: { x: { field: "x" }, y: { field: "y" } } }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'categorical',
            title: 'Add, rename & remove categories',
            intro:
                'axisX({ edit: edit.axis.categories() }) turns each category label into a rename target ' +
                '(double-click to type), gives each an × to remove, and adds a ＋ at the end to append a ' +
                'new one. Renaming relabels matching rows; removing deletes them — schema and data stay in step.',
            examples: [
                {
                    title: 'Edit the category list',
                    blurb: 'Double-click ＋ to add · double-click a label to rename · click × to remove.',
                    try: '<b>Double-click</b> ＋ to add a bar · <b>double-click</b> a label to rename · <b>click</b> × to remove.',
                    code:
`mount(Elicit({
  width: 420, height: 280,
  margins: { top: 16, right: 18, bottom: 48, left: 44 },
  data: [
    { cat: "Apples", v: 6 },
    { cat: "Pears", v: 9 },
    { cat: "Plums", v: 4 },
  ],
  schema: {
    cat: { type: "categorical", domain: ["Apples", "Pears", "Plums"] },
    v:   { type: "quantitative", domain: [0, 12] },
  },
  axes: false,
  features: [
    axisY(),
    axisX({ edit: edit.axis.categories() }),
    bar({ fill: "#2563eb",
      channels: { x: { field: "cat" }, y: { field: "v" } } }),
  ],
}))`,
                },
                {
                    title: 'Grow a Likert scale',
                    blurb: "mode: 'grow' keeps each band the same width and grows the chart by a step per point added — extend a 5-point scale to 7 without cramming.",
                    try: '<b>Double-click</b> ＋ to add points — the chart widens instead of the bars shrinking · <b>click</b> × to shrink it back.',
                    code:
`mount(Elicit({
  width: 320, height: 240,
  margins: { top: 16, right: 18, bottom: 46, left: 40 },
  data: [
    { step: "1", n: 3 }, { step: "2", n: 6 }, { step: "3", n: 9 },
    { step: "4", n: 5 }, { step: "5", n: 2 },
  ],
  schema: {
    step: { type: "ordinal", domain: ["1", "2", "3", "4", "5"] },
    n:    { type: "quantitative", domain: [0, 12] },
  },
  axes: false,
  features: [
    axisY(),
    axisX({ edit: edit.axis.categories({ mode: "grow" }) }),
    bar({ fill: "#0ea5e9",
      channels: { x: { field: "step" }, y: { field: "n" } } }),
  ],
}))`,
                },
            ],
        },
    ],
};
