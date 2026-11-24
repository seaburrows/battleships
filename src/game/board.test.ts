import { describe, expect, it } from 'vitest';
import { allSunk, boardWithShips, coordinate, fireAt, isSunk, unfiredCells } from './board';

describe('coordinate', () => {
  it('maps indices to row letters and column numbers', () => {
    expect(coordinate(0)).toBe('A1');
    expect(coordinate(9)).toBe('A10');
    expect(coordinate(23)).toBe('C4');
    expect(coordinate(99)).toBe('J10');
  });
});

describe('fireAt', () => {
  it('reports a miss on an empty cell', () => {
    const board = boardWithShips([[0, 1]]);
    const { board: next, result } = fireAt(board, 50);
    expect(result).toBe('miss');
    expect(next.cells[50].shot).toBe(true);
  });

  it('reports a hit when part of a ship remains afloat', () => {
    const board = boardWithShips([[0, 1]]);
    expect(fireAt(board, 0).result).toBe('hit');
  });

  it('does not mutate the original board', () => {
    const board = boardWithShips([[0, 1]]);
    fireAt(board, 0);
    expect(board.cells[0].shot).toBe(false);
  });
});

describe('sunk detection', () => {
  it('reports sunk when the last cell of a ship is hit', () => {
    let board = boardWithShips([[10, 20, 30]]);
    board = fireAt(board, 10).board;
    board = fireAt(board, 20).board;
    expect(isSunk(board, 0)).toBe(false);
    const { board: next, result } = fireAt(board, 30);
    expect(result).toBe('sunk');
    expect(isSunk(next, 0)).toBe(true);
  });

  it('tracks each ship independently', () => {
    let board = boardWithShips([[0, 1], [2, 3]]);
    board = fireAt(board, 0).board;
    board = fireAt(board, 1).board;
    expect(isSunk(board, 0)).toBe(true);
    expect(isSunk(board, 1)).toBe(false);
    expect(allSunk(board)).toBe(false);
  });

  it('reports all sunk only once every ship is sunk', () => {
    let board = boardWithShips([[0, 1], [2, 3]]);
    for (const index of [0, 1, 2]) board = fireAt(board, index).board;
    expect(allSunk(board)).toBe(false);
    board = fireAt(board, 3).board;
    expect(allSunk(board)).toBe(true);
  });
});

describe('unfiredCells', () => {
  it('lists every cell that has not been shot', () => {
    let board = boardWithShips([]);
    expect(unfiredCells(board)).toHaveLength(100);
    board = fireAt(board, 5).board;
    expect(unfiredCells(board)).toHaveLength(99);
    expect(unfiredCells(board)).not.toContain(5);
  });
});
