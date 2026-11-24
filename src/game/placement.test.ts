import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, SHIP_LENGTHS, rowOf } from './board';
import { placeShips } from './placement';
import { type Rng, createRng } from './rng';

const SEEDS = [1, 2, 3, 42, 1234];

/** Replays fixed values. Each placement attempt reads orientation, then start index. */
function scriptedRng(values: number[]): Rng {
  let i = 0;
  return {
    next() {
      if (i >= values.length) throw new Error('scripted RNG exhausted');
      return values[i++];
    },
    state: () => i,
  };
}

const HORIZONTAL = 0;
const VERTICAL = 0.5;
/** RNG value that makes randomInt(rng, 100) return `index`. */
const at = (index: number) => (index + 0.5) / 100;

describe('placeShips', () => {
  it.each(SEEDS)('places one ship per configured length (seed %i)', (seed) => {
    const board = placeShips(createRng(seed));
    const lengths = board.ships.map((ship) => ship.cells.length).sort();
    expect(lengths).toEqual([...SHIP_LENGTHS].sort());
  });

  it.each(SEEDS)('never overlaps ships (seed %i)', (seed) => {
    const board = placeShips(createRng(seed));
    const all = board.ships.flatMap((ship) => ship.cells);
    expect(new Set(all).size).toBe(all.length);
    expect(board.cells.filter((cell) => cell.shipId !== null)).toHaveLength(17);
  });

  it.each(SEEDS)('lays each ship out in a straight line (seed %i)', (seed) => {
    const board = placeShips(createRng(seed));
    for (const ship of board.ships) {
      const step = ship.cells[1] - ship.cells[0];
      expect([1, BOARD_SIZE]).toContain(step);
      for (let i = 1; i < ship.cells.length; i++) {
        expect(ship.cells[i] - ship.cells[i - 1]).toBe(step);
      }
    }
  });

  it.each([2, 3, 4, 5])('allows a horizontal ship of length %i ending in the last column', (length) => {
    const start = BOARD_SIZE - length;
    const board = placeShips(scriptedRng([HORIZONTAL, at(start)]), [length]);
    expect(board.ships[0].cells).toEqual(Array.from({ length }, (_, i) => start + i));
  });

  it.each([2, 3, 4, 5])(
    'rejects a horizontal ship of length %i that would run past the last column',
    (length) => {
      const overflowStart = BOARD_SIZE - length + 1;
      const legalStart = BOARD_SIZE - length;
      const board = placeShips(
        scriptedRng([HORIZONTAL, at(overflowStart), HORIZONTAL, at(legalStart)]),
        [length],
      );
      expect(board.ships[0].cells).toEqual(Array.from({ length }, (_, i) => legalStart + i));
    },
  );

  it('still allows a vertical ship ending in the last row', () => {
    const start = 5 * BOARD_SIZE + 9;
    const board = placeShips(scriptedRng([VERTICAL, at(start)]), [5]);
    expect(board.ships[0].cells).toEqual([59, 69, 79, 89, 99]);
  });

  it('keeps every horizontal ship within a single row across many seeds', () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const board = placeShips(createRng(seed));
      for (const ship of board.ships) {
        if (ship.cells[1] - ship.cells[0] !== 1) continue;
        const rows = new Set(ship.cells.map(rowOf));
        expect(rows.size, `seed ${seed}, ship ${ship.cells.join(',')}`).toBe(1);
      }
    }
  });

  it('is deterministic for a given seed', () => {
    expect(placeShips(createRng(77))).toEqual(placeShips(createRng(77)));
  });

  it('differs between seeds', () => {
    expect(placeShips(createRng(77))).not.toEqual(placeShips(createRng(78)));
  });
});
