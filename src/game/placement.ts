import { BOARD_SIZE, CELL_COUNT, SHIP_LENGTHS, type Board, boardWithShips, colOf } from './board';
import { type Rng, randomInt } from './rng';

const MAX_ATTEMPTS = 1000;

function shipCells(start: number, length: number, horizontal: boolean): number[] {
  const step = horizontal ? 1 : BOARD_SIZE;
  return Array.from({ length }, (_, i) => start + i * step);
}

function fitsOnBoard(start: number, length: number, horizontal: boolean): boolean {
  if (horizontal) {
    const lastCol = colOf(start) + length - 1;
    return lastCol <= BOARD_SIZE;
  }
  return start + (length - 1) * BOARD_SIZE < CELL_COUNT;
}

/** Places every ship in SHIP_LENGTHS at random, non-overlapping positions. */
export function placeShips(rng: Rng, lengths: readonly number[] = SHIP_LENGTHS): Board {
  const occupied = new Set<number>();
  const placed: number[][] = [];

  for (const length of lengths) {
    let attempts = 0;
    for (;;) {
      if (++attempts > MAX_ATTEMPTS) {
        throw new Error(`Could not place a ship of length ${length}`);
      }
      const horizontal = rng.next() < 0.5;
      const start = randomInt(rng, CELL_COUNT);
      if (!fitsOnBoard(start, length, horizontal)) continue;

      const cells = shipCells(start, length, horizontal);
      if (cells.some((index) => index >= CELL_COUNT || occupied.has(index))) continue;

      cells.forEach((index) => occupied.add(index));
      placed.push(cells);
      break;
    }
  }

  return boardWithShips(placed);
}
