import { type KeyboardEvent, useRef, useState } from 'react';
import { BOARD_SIZE, type Board, type Cell, colOf, coordinate, isSunk, rowOf } from '../game/board';

interface BoardGridProps {
  id: string;
  title: string;
  board: Board;
  /** Show un-hit ships. True for the player's own fleet. */
  revealShips: boolean;
  /** When provided, cells are buttons that fire at the given index. */
  onFire?: (index: number) => void;
  disabled?: boolean;
}

type CellState = 'empty' | 'ship' | 'miss' | 'hit' | 'sunk';

const ROW_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i));
const COL_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String(i + 1));

function cellState(board: Board, cell: Cell, revealShips: boolean): CellState {
  if (cell.shipId === null) return cell.shot ? 'miss' : 'empty';
  if (!cell.shot) return revealShips ? 'ship' : 'empty';
  return isSunk(board, cell.shipId) ? 'sunk' : 'hit';
}

const STATE_TEXT: Record<CellState, string> = {
  empty: 'not fired',
  ship: 'your ship',
  miss: 'miss',
  hit: 'hit',
  sunk: 'sunk',
};

function moveFocus(index: number, key: string): number | null {
  const row = rowOf(index);
  const col = colOf(index);
  switch (key) {
    case 'ArrowUp':
      return row > 0 ? index - BOARD_SIZE : null;
    case 'ArrowDown':
      return row < BOARD_SIZE - 1 ? index + BOARD_SIZE : null;
    case 'ArrowLeft':
      return col > 0 ? index - 1 : null;
    case 'ArrowRight':
      return col < BOARD_SIZE - 1 ? index + 1 : null;
    case 'Home':
      return index - col;
    case 'End':
      return index - col + BOARD_SIZE - 1;
    default:
      return null;
  }
}

export function BoardGrid({ id, title, board, revealShips, onFire, disabled = false }: BoardGridProps) {
  const [focusIndex, setFocusIndex] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const interactive = onFire !== undefined;
  const titleId = `${id}-title`;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = moveFocus(index, event.key);
    if (next === null) return;
    event.preventDefault();
    setFocusIndex(next);
    buttons.current[next]?.focus();
  }

  return (
    <section className="board" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <div className="grid" role="grid" aria-labelledby={titleId} aria-disabled={disabled || undefined}>
        <div className="grid-row" role="row">
          <span className="label corner" role="columnheader" aria-hidden="true" />
          {COL_LABELS.map((label) => (
            <span key={label} className="label" role="columnheader">
              {label}
            </span>
          ))}
        </div>
        {ROW_LABELS.map((rowLabel, row) => (
          <div key={rowLabel} className="grid-row" role="row">
            <span className="label" role="rowheader">
              {rowLabel}
            </span>
            {COL_LABELS.map((_, col) => {
              const index = row * BOARD_SIZE + col;
              const cell = board.cells[index];
              const state = cellState(board, cell, revealShips);
              const label = `${coordinate(index)}, ${STATE_TEXT[state]}`;

              if (!interactive) {
                return (
                  <span key={index} role="gridcell" className={`cell ${state}`} aria-label={label} />
                );
              }

              const unavailable = disabled || cell.shot;
              return (
                <span key={index} role="gridcell">
                  <button
                    ref={(el) => {
                      buttons.current[index] = el;
                    }}
                    type="button"
                    className={`cell ${state}`}
                    aria-label={label}
                    aria-disabled={unavailable || undefined}
                    tabIndex={index === focusIndex ? 0 : -1}
                    onFocus={() => setFocusIndex(index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onClick={() => {
                      if (!unavailable) onFire(index);
                    }}
                  />
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
