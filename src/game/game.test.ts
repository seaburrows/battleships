import { describe, expect, it } from 'vitest';
import { boardWithShips, unfiredCells } from './board';
import { type GameState, START_MESSAGE, createGame, gameReducer } from './game';

function shotCount(state: GameState, side: 'player' | 'computer'): number {
  return state[side].cells.filter((cell) => cell.shot).length;
}

function withBoards(player: number[][], computer: number[][], seed = 5): GameState {
  return {
    ...createGame(seed),
    player: boardWithShips(player),
    computer: boardWithShips(computer),
  };
}

function fireEverywhereExcept(state: GameState, skip: number[]): GameState {
  for (const index of unfiredCells(state.computer)) {
    if (skip.includes(index)) continue;
    state = gameReducer(state, { type: 'fire', index });
    if (state.phase !== 'playing') break;
  }
  return state;
}

describe('createGame', () => {
  it('starts a fresh game in the playing phase', () => {
    const state = createGame(10);
    expect(state.phase).toBe('playing');
    expect(state.message).toBe(START_MESSAGE);
    expect(shotCount(state, 'player')).toBe(0);
    expect(shotCount(state, 'computer')).toBe(0);
    expect(state.player.ships).toHaveLength(5);
    expect(state.computer.ships).toHaveLength(5);
  });
});

describe('gameReducer: fire', () => {
  it('marks the target cell and lets the computer fire exactly once', () => {
    const state = gameReducer(createGame(10), { type: 'fire', index: 0 });
    expect(state.computer.cells[0].shot).toBe(true);
    expect(shotCount(state, 'computer')).toBe(1);
    expect(shotCount(state, 'player')).toBe(1);
  });

  it('reports hits and misses in the status message', () => {
    const base = withBoards([[90, 91]], [[0, 1]]);
    expect(gameReducer(base, { type: 'fire', index: 0 }).message).toMatch(/^You hit at A1!/);
    expect(gameReducer(base, { type: 'fire', index: 55 }).message).toMatch(/^You missed at F6\./);
  });

  it('reports when a ship is sunk', () => {
    let state = withBoards([[90, 91]], [[0, 1], [50, 51]]);
    state = gameReducer(state, { type: 'fire', index: 0 });
    state = gameReducer(state, { type: 'fire', index: 1 });
    expect(state.message).toMatch(/^You sank a ship at A2!/);
    expect(state.phase).toBe('playing');
  });

  it('ignores a cell that has already been fired at', () => {
    const once = gameReducer(createGame(10), { type: 'fire', index: 0 });
    const twice = gameReducer(once, { type: 'fire', index: 0 });
    expect(twice).toBe(once);
  });

  it('ignores out-of-range indices', () => {
    const state = createGame(10);
    expect(gameReducer(state, { type: 'fire', index: -1 })).toBe(state);
    expect(gameReducer(state, { type: 'fire', index: 100 })).toBe(state);
  });

  it('lets the computer fire at a new cell every turn', () => {
    let state = withBoards([[0, 1]], [[98, 99]]);
    let turns = 0;
    for (const index of unfiredCells(state.computer).slice(0, 60)) {
      state = gameReducer(state, { type: 'fire', index });
      turns++;
      expect(shotCount(state, 'player')).toBe(turns);
      if (state.phase !== 'playing') break;
    }
  });
});

describe('win and loss detection', () => {
  it('declares a win when the last enemy ship is sunk', () => {
    let state = withBoards([[90, 91]], [[0, 1]]);
    state = gameReducer(state, { type: 'fire', index: 0 });
    const computerShotsBefore = shotCount(state, 'player');
    state = gameReducer(state, { type: 'fire', index: 1 });
    expect(state.phase).toBe('won');
    expect(state.message).toMatch(/You win!/);
    expect(shotCount(state, 'player')).toBe(computerShotsBefore);
  });

  it('declares a loss when the computer sinks the last player ship', () => {
    const state = fireEverywhereExcept(withBoards([[0]], [[98, 99]]), [98, 99]);
    expect(state.phase).toBe('lost');
    expect(state.message).toMatch(/You lose\./);
    expect(state.player.cells[0].shot).toBe(true);
  });

  it('ignores shots once the game is over', () => {
    let state = withBoards([[90, 91]], [[0]]);
    state = gameReducer(state, { type: 'fire', index: 0 });
    expect(state.phase).toBe('won');
    expect(gameReducer(state, { type: 'fire', index: 5 })).toBe(state);
  });
});

describe('gameReducer: newGame', () => {
  it('resets the game for the given seed', () => {
    let state = gameReducer(createGame(10), { type: 'fire', index: 0 });
    state = gameReducer(state, { type: 'newGame', seed: 11 });
    expect(state).toEqual(createGame(11));
  });
});

describe('seeded determinism', () => {
  function play(seed: number, shots: number[]): GameState {
    return shots.reduce(
      (state, index) => gameReducer(state, { type: 'fire', index }),
      createGame(seed),
    );
  }

  it('produces identical games for the same seed and moves', () => {
    const shots = [0, 11, 22, 33, 44, 55, 66, 77, 88, 99];
    expect(play(2024, shots)).toEqual(play(2024, shots));
  });

  it('produces the same computer shots for the same seed', () => {
    const shots = Array.from({ length: 30 }, (_, i) => i * 3);
    const fired = (state: GameState) => state.player.cells.map((cell) => cell.shot);
    expect(fired(play(31337, shots))).toEqual(fired(play(31337, shots)));
    expect(fired(play(31337, shots))).not.toEqual(fired(play(31338, shots)));
  });
});
