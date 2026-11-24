import { type Board, type ShotResult, allSunk, coordinate, fireAt, unfiredCells } from './board';
import { placeShips } from './placement';
import { createRng, randomInt } from './rng';

export type Phase = 'playing' | 'won' | 'lost';

export interface GameState {
  seed: number;
  rngState: number;
  player: Board;
  computer: Board;
  phase: Phase;
  message: string;
}

export type GameAction =
  | { type: 'fire'; index: number }
  | { type: 'newGame'; seed: number };

export const START_MESSAGE = 'Your turn. Fire at the enemy waters.';

export function createGame(seed: number): GameState {
  const rng = createRng(seed);
  const player = placeShips(rng);
  const computer = placeShips(rng);
  return {
    seed,
    rngState: rng.state(),
    player,
    computer,
    phase: 'playing',
    message: START_MESSAGE,
  };
}

function describeShot(who: 'You' | 'The computer', index: number, result: ShotResult): string {
  const at = coordinate(index);
  switch (result) {
    case 'miss':
      return `${who} missed at ${at}.`;
    case 'hit':
      return `${who} hit at ${at}!`;
    case 'sunk':
      return `${who} sank a ship at ${at}!`;
  }
}

function fire(state: GameState, index: number): GameState {
  if (state.phase !== 'playing') return state;
  if (index < 0 || index >= state.computer.cells.length) return state;
  if (state.computer.cells[index].shot) return state;

  const playerShot = fireAt(state.computer, index);
  const playerMessage = describeShot('You', index, playerShot.result);

  if (allSunk(playerShot.board)) {
    return {
      ...state,
      computer: playerShot.board,
      phase: 'won',
      message: `${playerMessage} You sank the whole fleet. You win!`,
    };
  }

  const rng = createRng(state.rngState);
  const options = unfiredCells(state.player);
  const target = options[randomInt(rng, options.length)];
  const computerShot = fireAt(state.player, target);
  const computerMessage = describeShot('The computer', target, computerShot.result);
  const lost = allSunk(computerShot.board);

  return {
    ...state,
    rngState: rng.state(),
    computer: playerShot.board,
    player: computerShot.board,
    phase: lost ? 'lost' : 'playing',
    message: lost
      ? `${playerMessage} ${computerMessage} Your fleet is sunk. You lose.`
      : `${playerMessage} ${computerMessage}`,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'fire':
      return fire(state, action.index);
    case 'newGame':
      return createGame(action.seed);
  }
}
