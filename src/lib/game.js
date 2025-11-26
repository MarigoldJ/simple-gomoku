const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const directions = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

export function createBoard(size) {
  return new Array(size * size).fill(EMPTY);
}

export function inBounds(x, y, size) {
  return x >= 0 && y >= 0 && x < size && y < size;
}

function idx(x, y, size) {
  return y * size + x;
}

export function checkWinner(board, size, x, y, player) {
  for (const [dx, dy] of directions) {
    const left = countRun(board, size, x, y, -dx, -dy, player);
    const right = countRun(board, size, x, y, dx, dy, player);
    const total = left + right + 1;
    if (total >= 5) return true;
  }
  return false;
}

function countRun(board, size, x, y, dx, dy, player) {
  let count = 0;
  let cx = x + dx;
  let cy = y + dy;
  while (inBounds(cx, cy, size) && board[idx(cx, cy, size)] === player) {
    count += 1;
    cx += dx;
    cy += dy;
  }
  return count;
}

function isEmpty(board, size, x, y) {
  return inBounds(x, y, size) && board[idx(x, y, size)] === EMPTY;
}

// Simplified forbidden move detection (overline, double-four, double-three).
function detectForbidden(board, size, x, y, player) {
  // Only black stones are checked.
  if (player !== BLACK) return null;

  // Overline
  for (const [dx, dy] of directions) {
    const left = countRun(board, size, x, y, -dx, -dy, player);
    const right = countRun(board, size, x, y, dx, dy, player);
    if (left + right + 1 > 5) return "6목(장목)";
  }

  let openFours = 0;
  let openThrees = 0;

  for (const [dx, dy] of directions) {
    const left = countRun(board, size, x, y, -dx, -dy, player);
    const right = countRun(board, size, x, y, dx, dy, player);
    const total = left + right + 1;

    const lx = x - (left + 1) * dx;
    const ly = y - (left + 1) * dy;
    const rx = x + (right + 1) * dx;
    const ry = y + (right + 1) * dy;
    const leftOpen = isEmpty(board, size, lx, ly);
    const rightOpen = isEmpty(board, size, rx, ry);

    if (total === 4 && leftOpen && rightOpen) {
      openFours += 1; // straight open four
    }

    // Broken four (3 stones with a single gap and two open ends)
    if (total === 3 && leftOpen && rightOpen) {
      const leftGapNext = isEmpty(board, size, lx - dx, ly - dy);
      const rightGapNext = isEmpty(board, size, rx + dx, ry + dy);
      if (leftGapNext || rightGapNext) openFours += 1;
    }

    if (total === 3 && leftOpen && rightOpen) {
      openThrees += 1; // simple open three
    }
  }

  if (openFours >= 2) return "44 금수";
  if (openThrees >= 2) return "33 금수";

  return null;
}

export function makeMove(state, x, y) {
  const { board, size, currentPlayer, winner, forbidden } = state;
  if (winner) return { ok: false, reason: "게임 종료" };
  if (!inBounds(x, y, size)) return { ok: false, reason: "범위를 벗어났습니다." };
  const position = idx(x, y, size);
  if (board[position] !== EMPTY) return { ok: false, reason: "이미 돌이 있습니다." };

  const nextBoard = board.slice();
  nextBoard[position] = currentPlayer;

  const forbiddenReason =
    forbidden && currentPlayer === BLACK
      ? detectForbidden(nextBoard, size, x, y, currentPlayer)
      : null;

  if (forbiddenReason) {
    return { ok: false, reason: forbiddenReason, forbidden: true };
  }

  const hasWon = checkWinner(nextBoard, size, x, y, currentPlayer);

  const history = [
    ...state.history,
    { x, y, player: currentPlayer },
  ];

  const nextPlayer = hasWon ? currentPlayer : currentPlayer === BLACK ? WHITE : BLACK;

  return {
    ok: true,
    board: nextBoard,
    history,
    winner: hasWon ? currentPlayer : 0,
    currentPlayer: nextPlayer,
    lastMove: { x, y, player: currentPlayer },
    message: hasWon
      ? (currentPlayer === BLACK ? "흑" : "백") + " 승리!"
      : (nextPlayer === BLACK ? "흑" : "백") + " 차례",
  };
}

export function resetGame(size, forbidden = false, aiLevel = "off", aiSide = WHITE) {
  return {
    size,
    board: createBoard(size),
    currentPlayer: BLACK,
    history: [],
    winner: 0,
    forbidden,
    aiLevel,
    aiSide,
    lastMove: null,
    message: "흑 차례",
  };
}

export function undoMove(state) {
  const { history, board, size, winner } = state;
  if (!history.length) return { ok: false, reason: "되돌릴 수 없습니다." };
  const last = history[history.length - 1];
  const nextBoard = board.slice();
  nextBoard[idx(last.x, last.y, size)] = EMPTY;
  const newHistory = history.slice(0, -1);
  const prevPlayer = last.player;
  const lastMove = newHistory[newHistory.length - 1] || null;
  const message = winner ? "승리 취소" : (prevPlayer === BLACK ? "흑" : "백") + " 차례";
  return {
    ok: true,
    board: nextBoard,
    history: newHistory,
    currentPlayer: prevPlayer,
    winner: 0,
    lastMove,
    message,
  };
}

export function availableMoves(board, size) {
  const moves = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[idx(x, y, size)] === EMPTY) moves.push({ x, y });
    }
  }
  return moves;
}

export const STONES = { EMPTY, BLACK, WHITE };
