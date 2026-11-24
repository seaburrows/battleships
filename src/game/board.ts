export const BOARD_SIZE = 10;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
export const SHIP_LENGTHS = [5, 4, 3, 3, 2] as const;

export interface Cell {
  shipId: number | null;
  shot: boolean;
}

export interface Ship {
  id: number;
  cells: number[];
}

export interface Board {
  cells: Cell[];
  ships: Ship[];
}

export type ShotResult = 'miss' | 'hit' | 'sunk';

export function rowOf(index: number): number {
  return Math.floor(index / BOARD_SIZE);
}

export function colOf(index: number): number {
  return index % BOARD_SIZE;
}

/** Human-readable coordinate, e.g. index 0 is "A1" and index 99 is "J10". */
export function coordinate(index: number): string {
  return `${String.fromCharCode(65 + rowOf(index))}${colOf(index) + 1}`;
}

export function emptyBoard(): Board {
  return {
    cells: Array.from({ length: CELL_COUNT }, () => ({ shipId: null, shot: false })),
    ships: [],
  };
}

/** Builds a board from explicit ship cell lists. Each list becomes one ship. */
export function boardWithShips(shipCells: number[][]): Board {
  const board = emptyBoard();
  shipCells.forEach((cells, id) => {
    board.ships.push({ id, cells: [...cells] });
    for (const index of cells) {
      board.cells[index] = { shipId: id, shot: false };
    }
  });
  return board;
}

export function isSunk(board: Board, shipId: number): boolean {
  const ship = board.ships.find((s) => s.id === shipId);
  return ship !== undefined && ship.cells.every((index) => board.cells[index].shot);
}

export function allSunk(board: Board): boolean {
  return board.ships.every((ship) => isSunk(board, ship.id));
}

export function unfiredCells(board: Board): number[] {
  const result: number[] = [];
  board.cells.forEach((cell, index) => {
    if (!cell.shot) result.push(index);
  });
  return result;
}

/** Returns a new board with `index` marked as shot, plus the outcome. */
export function fireAt(board: Board, index: number): { board: Board; result: ShotResult } {
  const cells = board.cells.slice();
  const target = cells[index];
  cells[index] = { ...target, shot: true };
  const next: Board = { cells, ships: board.ships };

  if (target.shipId === null) return { board: next, result: 'miss' };
  return { board: next, result: isSunk(next, target.shipId) ? 'sunk' : 'hit' };
}
