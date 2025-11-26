import { createState } from "./lib/state.js";
import { makeMove, resetGame, undoMove, STONES } from "./lib/game.js";
import { chooseAiMove } from "./lib/ai.js";
import { createRenderer } from "./lib/render.js";

const canvas = document.getElementById("boardCanvas");
const statusText = document.getElementById("statusText");
const sizeSelect = document.getElementById("sizeSelect");
const forbiddenToggle = document.getElementById("forbiddenToggle");
const aiSelect = document.getElementById("aiSelect");
const undoBtn = document.getElementById("undoBtn");
const resetBtn = document.getElementById("resetBtn");

const store = createState(resetGame(15, false, "off", STONES.WHITE));
const renderer = createRenderer(canvas, store.get);

store.subscribe(() => {
  updateStatus();
  updateControls();
  renderer.draw();
});

updateStatus();
updateControls();
renderer.draw();

window.addEventListener("resize", renderer.resize);

canvas.addEventListener("click", (e) => {
  const target = renderer.screenToCell(e.clientX, e.clientY);
  if (!target) return;
  handleMove(target.x, target.y);
});

canvas.addEventListener(
  "touchend",
  (e) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const target = renderer.screenToCell(touch.clientX, touch.clientY);
    if (!target) return;
    handleMove(target.x, target.y);
    e.preventDefault();
  },
  { passive: false }
);

undoBtn.addEventListener("click", () => {
  const state = store.get();
  const result = undoMove(state);
  if (!result.ok) {
    flashStatus(result.reason, true);
    return;
  }
  store.set(result);
});

resetBtn.addEventListener("click", () => {
  applyReset();
});

sizeSelect.addEventListener("change", () => applyReset());
forbiddenToggle.addEventListener("change", () => applyReset(false));
aiSelect.addEventListener("change", () => applyReset(false));

function handleMove(x, y) {
  const state = store.get();
  const result = makeMove(state, x, y);
  if (!result.ok) {
    flashStatus(result.reason, true);
    return;
  }
  store.set(result);
  maybeAiTurn();
}

function maybeAiTurn() {
  const state = store.get();
  if (state.aiLevel === "off") return;
  if (state.winner) return;
  if (state.currentPlayer !== state.aiSide) return;

  setTimeout(() => {
    const s = store.get();
    if (s.aiLevel === "off" || s.winner || s.currentPlayer !== s.aiSide) return;
    const move = chooseAiMove(s);
    if (!move) return;
    const next = makeMove(s, move.x, move.y);
    if (!next.ok) return;
    store.set(next);
  }, 180);
}

function applyReset(resetSize = true) {
  const size = parseInt(sizeSelect.value, 10);
  const forbidden = forbiddenToggle.checked;
  const aiLevel = aiSelect.value;
  const baseState = resetGame(resetSize ? size : store.get().size, forbidden, aiLevel, STONES.WHITE);
  store.set(baseState);
  renderer.resize();
}

function updateStatus() {
  const state = store.get();
  statusText.textContent = state.message || "";
}

function updateControls() {
  const state = store.get();
  sizeSelect.value = String(state.size);
  forbiddenToggle.checked = !!state.forbidden;
  aiSelect.value = state.aiLevel;
  undoBtn.disabled = state.history.length === 0;
}

function flashStatus(text, isError = false) {
  statusText.textContent = text;
  statusText.classList.toggle("error", isError);
  if (isError) {
    setTimeout(() => statusText.classList.remove("error"), 600);
  }
}
