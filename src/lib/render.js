export function createRenderer(canvas, getState) {
  const ctx = canvas.getContext("2d");
  const FALLBACK_BOARD = "#d6a75c";
  const FALLBACK_LINE = "#2f1a07";
  let geometry = {
    sizePx: 640,
    padding: 24,
    cell: 32,
    dpr: window.devicePixelRatio || 1,
  };

  const resize = () => {
    const parent = canvas.parentElement;
    const available = parent ? parent.clientWidth : 640;
    const display = Math.max(320, Math.min(available, 760));
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${display}px`;
    canvas.style.height = `${display}px`;
    canvas.width = Math.round(display * dpr);
    canvas.height = Math.round(display * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { size } = getState();
    const padding = Math.max(18, Math.min(28, display * 0.04));
    const cell = (display - padding * 2) / (size - 1);
    geometry = { sizePx: display, padding, cell, dpr };
    draw();
  };

  const screenToCell = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const { padding, cell } = geometry;
    const gx = Math.round((x - padding) / cell);
    const gy = Math.round((y - padding) / cell);
    const { size } = getState();
    if (gx < 0 || gy < 0 || gx >= size || gy >= size) return null;
    // Reject clicks too far from grid intersections
    const px = padding + gx * cell;
    const py = padding + gy * cell;
    const dist = Math.hypot(px - x, py - y);
    if (dist > cell * 0.45) return null;
    return { x: gx, y: gy };
  };

  const draw = () => {
    const { size, board, lastMove, winnerLine } = getState();
    const { padding, cell, sizePx } = geometry;
    const style = getComputedStyle(document.documentElement);
    const boardColor =
      getComputedStyle(canvas).backgroundColor ||
      style.getPropertyValue("--board-wood") ||
      FALLBACK_BOARD;
    const lineColor =
      (style.getPropertyValue("--board-line") || FALLBACK_LINE).trim() || FALLBACK_LINE;

    ctx.clearRect(0, 0, sizePx, sizePx);
    ctx.fillStyle = boardColor;
    ctx.fillRect(0, 0, sizePx, sizePx);

    // Grid lines with stronger contrast
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = Math.max(1.6, Math.min(3.2, cell * 0.08));
    ctx.beginPath();
    for (let i = 0; i < size; i++) {
      const offset = padding + i * cell;
      ctx.moveTo(padding, offset);
      ctx.lineTo(padding + cell * (size - 1), offset);
      ctx.moveTo(offset, padding);
      ctx.lineTo(offset, padding + cell * (size - 1));
    }
    ctx.stroke();

    // Star points (hoshi) for common board sizes
    const stars = getStarPoints(size);
    ctx.fillStyle = "rgba(0,0,0,0.68)";
    for (const [sx, sy] of stars) {
      const px = padding + sx * cell;
      const py = padding + sy * cell;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(2.5, cell * 0.09), 0, Math.PI * 2);
      ctx.fill();
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const stone = board[y * size + x];
        if (!stone) continue;
        const px = padding + x * cell;
        const py = padding + y * cell;
        drawStone(ctx, px, py, cell * 0.42, stone === 1 ? "black" : "white");
      }
    }

    if (winnerLine && winnerLine.length) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 215, 0, 0.9)";
      ctx.lineWidth = Math.max(3, cell * 0.14);
      ctx.shadowColor = "rgba(255, 213, 0, 0.8)";
      ctx.shadowBlur = cell * 0.2;
      ctx.beginPath();
      winnerLine.forEach((coord, idx) => {
        const px = padding + coord.x * cell;
        const py = padding + coord.y * cell;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    if (lastMove) {
      const px = padding + lastMove.x * cell;
      const py = padding + lastMove.y * cell;
      ctx.strokeStyle = "rgba(255, 213, 0, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, cell * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  resize();

  return { draw, resize, screenToCell };
}

function drawStone(ctx, x, y, r, color) {
  const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
  if (color === "black") {
    gradient.addColorStop(0, "#444");
    gradient.addColorStop(1, "#0f0f0f");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
  } else {
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(1, "#d9d9d9");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
  }
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function getStarPoints(size) {
  if (size === 19)
    return [
      [3, 3],
      [9, 3],
      [15, 3],
      [3, 9],
      [9, 9],
      [15, 9],
      [3, 15],
      [9, 15],
      [15, 15],
    ];
  if (size === 15)
    return [
      [3, 3],
      [7, 3],
      [11, 3],
      [3, 7],
      [7, 7],
      [11, 7],
      [3, 11],
      [7, 11],
      [11, 11],
    ];
  return [];
}
