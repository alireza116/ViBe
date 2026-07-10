// @ts-check
// waffle.js (edit) — the cell-native fill edit for the waffle mark.
//
// A waffle is a 2D grid, so the generic `drag`/click edits (which invert the
// pointer through the 1D value scale) can't target an individual cell: they see
// only the vertical pixel, round it to a whole row, and ignore the column. The
// result is a fill that lands above or below the cell you pointed at.
//
// `waffleFill` instead reads the grid geometry the waffle stamps on every cell
// node (`node.grid`) and resolves the pointer to the exact cell under it — row
// AND column — then sets the value to that cell's COUNT: `value = dlo + count *
// unit`. So a click (or drag) fills every cell up to and INCLUDING the one you
// touched, and the next render's `filled` count equals that count exactly. The
// same apply serves both gestures, so click and drag stay consistent.

import { makeEdit } from './shared.js';

/**
 * Which 1-based cell the pointer is over → the number of cells to fill.
 * @param {{ x: number, y: number }} pointer
 * @param {any} grid
 * @returns {number}
 */
function countAt(pointer, grid) {
    const p = grid.axis === 'y' ? pointer.y : pointer.x; // value-axis coord
    const q = grid.axis === 'y' ? pointer.x : pointer.y; // band-axis coord
    const alongValue = grid.sign * (p - grid.baseline);  // pixels into the block
    if (alongValue <= 0) return 0;                       // before the baseline → empty
    const row = Math.floor(alongValue / grid.cellSize);
    if (row >= grid.rows) return grid.totalCells;        // past the top → full
    let col = Math.floor((q - (grid.bandStart + grid.bandInset)) / grid.cellSize);
    col = Math.max(0, Math.min(grid.multiple - 1, col));
    const count = row * grid.multiple + col + 1;
    return Math.max(0, Math.min(grid.totalCells, count));
}

/**
 * waffleFill — fill a waffle up to (and including) the cell under the pointer.
 * Works for both `gesture: 'drag'` (fill as you drag) and `gesture: 'click'`
 * (fill on a single tap). No-op on any mark that doesn't stamp `node.grid`.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function waffleFill(options = {}) {
    const { channel, channels, ...rest } = options;
    return makeEdit({
        type: 'waffleFill',
        gesture: 'drag',
        channels: channels || (channel ? [channel] : null),
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const grid = ctx.node && ctx.node.grid;
            const ch = ctx.channels && ctx.channels[0];
            if (!grid || !ch || !ch.field) return undefined;
            const count = countAt(ctx.pointer, grid);
            const value = Math.max(grid.dlo, Math.min(grid.dhi, grid.dlo + count * grid.unit));
            return { ...ctx.datum, [ch.field]: value };
        }
    });
}
