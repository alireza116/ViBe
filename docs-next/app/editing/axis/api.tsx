import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "edit.axis.scale(options)",
    summary: "Numeric / temporal axis — drag an end-handle to rescale the range. Runs through the axisDrag driver (the plane owns the gesture); apply writes the new [min,max].",
    signatures: [
      "edit.axis.scale({ field, mode }) → Edit",
    ],
    options: [
      {
        name: "field",
        type: "string",
        default: "all on axis",
        desc: "The schema field whose domain to write. Defaults to every field unioned onto the axis (e.g. an error bar's mean/lo/hi).",
      },
      {
        name: "mode",
        type: "'rescale'|'grow'",
        default: "'rescale'",
        desc: (
          <>
            <code className="inline">rescale</code> keeps the chart size (marks compress); <code className="inline">grow</code> holds the data's pixels-per-unit and resizes the chart instead.
          </>
        ),
      },
    ],
    returns: (
      <>
        An <b>Edit</b> with <code className="inline">target: "domain"</code>. apply returns <code className="inline">{'{'} domains, resize? {'}'}</code>; the engine writes the schema (and resizes in grow mode).
      </>
    ),
  },
  {
    name: "edit.axis.categories(options)",
    summary: "Categorical / ordinal axis — add, rename and remove categories. Reuses the inline-typing lifecycle: double-click the \"＋\" to add, double-click a label to rename, click its \"×\" to remove.",
    signatures: [
      "edit.axis.categories({ field, mode }) → Edit[]",
    ],
    options: [
      {
        name: "field",
        type: "string",
        default: "first on axis",
        desc: "The categorical field whose domain (and rows, on rename/remove) to edit.",
      },
      {
        name: "mode",
        type: "'rescale'|'grow'",
        default: "'rescale'",
        desc: (
          <>
            <code className="inline">rescale</code> keeps the chart size (bands re-divide it — thinner as you add); <code className="inline">grow</code> keeps each band the same pixel size and grows/shrinks the chart by a step per category (e.g. a 5-point Likert extended to 7).
          </>
        ),
      },
    ],
    returns: (
      <>
        An <b>array of Edits</b> (add / rename / remove), all <code className="inline">target: "domain"</code>. Rename relabels matching rows; remove deletes them. In grow mode, add/remove also carry a chart <code className="inline">resize</code>.
      </>
    ),
  },
];
