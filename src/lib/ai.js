import { availableMoves, checkWinner, STONES } from "./game.js";

export function chooseAiMove(state) {
  const { board, size, aiSide } = state;
  const moves = availableMoves(board, size);
  if (!moves.length) return null;

  // 1) Immediate win
  const winMove = findWinningMove(board, size, aiSide, moves);
  if (winMove) return winMove;

  // 2) Block opponent's win
  const opponent = aiSide === STONES.BLACK ? STONES.WHITE : STONES.BLACK;
  const block = findWinningMove(board, size, opponent, moves);
  if (block) return block;

  // 3) Prefer center-ish moves
  const center = (size - 1) / 2;
  moves.sort((a, b) => {
    const da = Math.abs(a.x - center) + Math.abs(a.y - center);
    const db = Math.abs(b.x - center) + Math.abs(b.y - center);
    return da - db;
  });

  // 4) Random among top candidates
  const pickCount = Math.min(8, moves.length);
  const idx = Math.floor(Math.random() * pickCount);
  return moves[idx];
}

function findWinningMove(board, size, player, moves) {
  for (const move of moves) {
    const { x, y } = move;
    const flat = board.slice();
    flat[y * size + x] = player;
    if (checkWinner(flat, size, x, y, player)) return move;
  }
  return null;
}
