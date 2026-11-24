import { useReducer } from 'react';
import { BoardGrid } from './components/BoardGrid';
import { createGame, gameReducer } from './game/game';
import { parseSeed, randomSeed } from './game/rng';

const urlSeed = parseSeed(window.location.search);

function nextSeed(): number {
  return urlSeed ?? randomSeed();
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createGame(nextSeed()));
  const gameOver = state.phase !== 'playing';

  return (
    <main className="app">
      <header>
        <h1>Battleships</h1>
        <p className="status" role="status" aria-live="polite">
          {state.message}
        </p>
      </header>

      {gameOver && (
        <section className={`result ${state.phase}`} aria-labelledby="result-title">
          <h2 id="result-title">{state.phase === 'won' ? 'You win!' : 'You lose'}</h2>
          <button
            type="button"
            className="new-game"
            autoFocus
            onClick={() => dispatch({ type: 'newGame', seed: nextSeed() })}
          >
            New Game
          </button>
        </section>
      )}

      <div className="boards">
        <BoardGrid
          id="enemy"
          title="Enemy waters"
          board={state.computer}
          revealShips={gameOver}
          onFire={(index) => dispatch({ type: 'fire', index })}
          disabled={gameOver}
        />
        <BoardGrid id="fleet" title="Your fleet" board={state.player} revealShips />
      </div>

      <footer>
        <p>
          Seed: <a href={`?seed=${state.seed}`}>{state.seed}</a>
        </p>
      </footer>
    </main>
  );
}
