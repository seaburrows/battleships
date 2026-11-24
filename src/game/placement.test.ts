import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, SHIP_LENGTHS } from './board';
import { placeShips } from './placement';
import { createRng } from './rng';

const SEEDS = [1, 2, 3, 42, 1234];

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

  it('is deterministic for a given seed', () => {
    expect(placeShips(createRng(77))).toEqual(placeShips(createRng(77)));
  });

  it('differs between seeds', () => {
    expect(placeShips(createRng(77))).not.toEqual(placeShips(createRng(78)));
  });
});
