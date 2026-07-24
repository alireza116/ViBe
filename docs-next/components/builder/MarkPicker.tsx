'use client';

import { MARKS, MARK_CATEGORIES } from '../../lib/builder/marks.manifest';
import type { MarkFamilyId } from '../../lib/builder/types';

type Props = {
  active: MarkFamilyId;
  onSelect: (family: MarkFamilyId) => void;
};

/** The left-rail mark catalog — every mark family in the API, grouped the
 * same way `lib/nav.ts`'s Marks section is. Buildable marks (plain x/y
 * position + style) load into the form; the rest (polar geometry, nested
 * glyphs, geo projections) link out to their doc page instead of faking a
 * form for a shape the generic channel picker can't represent. */
export function MarkPicker({ active, onSelect }: Props) {
  return (
    <div className="mark-picker">
      {MARK_CATEGORIES.map((category) => (
        <div className="mark-picker-group" key={category}>
          <div className="mark-picker-group-title">{category}</div>
          {MARKS.filter((m) => m.category === category).map((m) =>
            m.buildable ? (
              <button
                key={m.family}
                type="button"
                className={`mark-card${m.family === active ? ' active' : ''}`}
                onClick={() => onSelect(m.family)}
              >
                {m.label}
              </button>
            ) : (
              <a
                key={m.family}
                href={m.docHref}
                target="_blank"
                rel="noreferrer"
                className="mark-card mark-card-docs"
                title="This shape needs code — opens its doc page"
              >
                {m.label} <span className="mark-card-badge">docs ↗</span>
              </a>
            )
          )}
        </div>
      ))}
    </div>
  );
}
