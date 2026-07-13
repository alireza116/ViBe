import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/editing/axis",
  "title": "Editable axes (domain)",
  "lead": "An axis is normally inert. Give it an <code class=\"inline\">edit</code> and it becomes interactive — but where a mark edit rewrites a <b>datum</b>, an axis edit rewrites the field's <b>domain</b> on the schema. A numeric axis is <b>dragged</b> to grow or shrink its range; a categorical axis gains <b>add / rename / remove</b> affordances. Because the domain lives on the schema and scales re-resolve every render, the grid, guides and marks follow along automatically. Read the new domain with <code class=\"inline\">el.getSchema()</code> (the dataset is untouched, except that removing a category also deletes its rows).",
  "api": [
    {
      "name": "edit.axis.scale(options)",
      "summary": "Numeric / temporal axis — drag an end-handle to rescale the range. Runs through the axisDrag driver (the plane owns the gesture); apply writes the new [min,max].",
      "signature": "edit.axis.scale({ field, mode }) → Edit",
      "options": [
        {
          "name": "field",
          "type": "string",
          "default": "all on axis",
          "desc": "The schema field whose domain to write. Defaults to every field unioned onto the axis (e.g. an error bar's mean/lo/hi)."
        },
        {
          "name": "mode",
          "type": "'rescale'|'grow'",
          "default": "'rescale'",
          "desc": "<code class=\"inline\">rescale</code> keeps the chart size (marks compress); <code class=\"inline\">grow</code> holds the data's pixels-per-unit and resizes the chart instead."
        }
      ],
      "returns": "An <b>Edit</b> with <code class=\"inline\">target: \"domain\"</code>. apply returns <code class=\"inline\">{ domains, resize? }</code>; the engine writes the schema (and resizes in grow mode)."
    },
    {
      "name": "edit.axis.categories(options)",
      "summary": "Categorical / ordinal axis — add, rename and remove categories. Reuses the inline-typing lifecycle: double-click the \"＋\" to add, double-click a label to rename, click its \"×\" to remove.",
      "signature": "edit.axis.categories({ field, mode }) → Edit[]",
      "options": [
        {
          "name": "field",
          "type": "string",
          "default": "first on axis",
          "desc": "The categorical field whose domain (and rows, on rename/remove) to edit."
        },
        {
          "name": "mode",
          "type": "'rescale'|'grow'",
          "default": "'rescale'",
          "desc": "<code class=\"inline\">rescale</code> keeps the chart size (bands re-divide it — thinner as you add); <code class=\"inline\">grow</code> keeps each band the same pixel size and grows/shrinks the chart by a step per category (e.g. a 5-point Likert extended to 7)."
        }
      ],
      "returns": "An <b>array of Edits</b> (add / rename / remove), all <code class=\"inline\">target: \"domain\"</code>. Rename relabels matching rows; remove deletes them. In grow mode, add/remove also carry a chart <code class=\"inline\">resize</code>."
    }
  ],
  "sections": [
    {
      "id": "numeric",
      "title": "Drag a numeric axis to rescale",
      "intro": "axisX({ edit: edit.axis.scale() }) grows a draggable handle at each end of the axis. Drag the max handle inward to widen the range (data compresses into the same chart), outward to tighten it. The min stays anchored; the dataset never changes.",
      "examples": [
        "editing-axis/rescale-in-place",
        "editing-axis/grow-the-chart-instead"
      ]
    },
    {
      "id": "categorical",
      "title": "Add, rename & remove categories",
      "intro": "axisX({ edit: edit.axis.categories() }) turns each category label into a rename target (double-click to type), gives each an × to remove, and adds a ＋ at the end to append a new one. Renaming relabels matching rows; removing deletes them — schema and data stay in step.",
      "examples": [
        "editing-axis/edit-the-category-list",
        "editing-axis/grow-a-likert-scale"
      ]
    }
  ]
};

export default page;
