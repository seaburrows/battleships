# Battleships

A small browser Battleships game: you play against the computer on a 10x10 grid. Each side gets five ships (lengths 5, 4, 3, 3 and 2) placed at random. Click a cell in **Enemy waters** to fire, and the computer fires back at a random cell on **Your fleet**. Sink every enemy ship before yours are sunk to win.

Built with TypeScript, React and Vite. There is no backend. Game state is a single `useReducer`, and each board is a flat array of 100 cells (`index = row * 10 + col`).

This is a practice project.

## Running it

Requires Node.js 22 or later.

```sh
npm install
npm run dev
```

Then open http://localhost:5173.

### Seeds

Ship placement and the computer's shots come from a seeded random number generator (mulberry32). The current seed is shown under the boards. Add `?seed=<number>` to the URL to replay a game exactly, for example:

```
http://localhost:5173/?seed=42
```

Without a seed, each game picks a random one.

### Keyboard

Tab to the enemy board, move with the arrow keys (Home and End jump to the start and end of a row), and press Enter or Space to fire.

## Testing

```sh
npm test          # run the unit tests once
npm run test:watch
npm run lint
npm run build     # type-check and produce a production build in dist/
```

The tests cover the game reducer, hit/sunk and win detection, ship placement and seeded determinism. CI runs lint, test and build on every push and pull request.

## Project layout

```
src/
  game/rng.ts        seeded RNG and ?seed parsing
  game/board.ts      board model, firing, sunk and win checks
  game/placement.ts  random ship placement
  game/game.ts       game state and reducer
  components/        board grid
  App.tsx            page layout
```
