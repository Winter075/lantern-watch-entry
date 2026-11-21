// Mouse and keyboard wiring. Coordinates arrive in canvas pixels (1280 x 720).
import { PANEL_HEIGHT, PANEL_WIDTH } from './difference-set.js';
import { requestHint, restartGame, selectAt, setLensHeld, advanceScene } from './state.js';
import { playFound, playHint, playWrong, playClear } from './audio.js';

export const PANEL_ORIGINS = [
  { x: 28, y: 106 },
  { x: 652, y: 106 },
];

function toPanelPoint(canvasX, canvasY, origin) {
  return { x: canvasX - origin.x, y: canvasY - origin.y };
}

function insidePanel(point) {
  return point.x >= 0 && point.y >= 0 && point.x <= PANEL_WIDTH && point.y <= PANEL_HEIGHT;
}

function activatePoint(state, canvasX, canvasY, now) {
  for (const origin of PANEL_ORIGINS) {
    const point = toPanelPoint(canvasX, canvasY, origin);
    if (!insidePanel(point)) continue;
    state.reticle.x = point.x;
    state.reticle.y = point.y;
    state.reticle.usingKeyboard = false;
    const result = selectAt(state, point.x, point.y, now);
    if (result === 'found') {
      playFound(state.foundByScene[state.sceneIndex].size - 1);
      if (state.mode === 'sceneClear' || state.mode === 'gameClear') playClear();
    } else if (result === 'wrong') {
      playWrong();
    }
    return true;
  }
  return false;
}

function hintButtonHit(x, y) {
  return x >= 898 && x <= 1012 && y >= 26 && y <= 66;
}

function lensButtonHit(x, y) {
  return x >= 1022 && x <= 1142 && y >= 26 && y <= 66;
}

export function attachInput(canvas, state, now) {
  const toCanvas = (event) => {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
  };

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  canvas.addEventListener('mousemove', (event) => {
    const p = toCanvas(event);
    const panel = p.x >= PANEL_ORIGINS[1].x ? 1 : 0;
    state.lens.panel = panel;
    state.lens.x = Math.max(0, Math.min(PANEL_WIDTH, p.x - PANEL_ORIGINS[panel].x));
    state.lens.y = Math.max(0, Math.min(PANEL_HEIGHT, p.y - PANEL_ORIGINS[panel].y));
    if (!state.reticle.usingKeyboard) {
      state.reticle.x = state.lens.x;
      state.reticle.y = state.lens.y;
    }
  });

  canvas.addEventListener('mousedown', (event) => {
    const p = toCanvas(event);
    if (event.button === 2) {
      setLensHeld(state, 'heldMouse', true);
      event.preventDefault();
      return;
    }
    if (event.button !== 0) return;
    if (hintButtonHit(p.x, p.y)) {
      if (requestHint(state, now())) playHint();
      return;
    }
    if (lensButtonHit(p.x, p.y)) {
      setLensHeld(state, 'heldKey', !state.lens.heldKey);
      return;
    }
    if (!activatePoint(state, p.x, p.y, now())) {
      if (state.mode === 'sceneClear') advanceScene(state, now());
    }
  });

  const releaseMouse = (event) => {
    if (event.button === 2) setLensHeld(state, 'heldMouse', false);
  };
  window.addEventListener('mouseup', releaseMouse);

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const step = event.shiftKey ? 18 : 7;
    let used = true;
    switch (key) {
      case 'arrowleft': state.reticle.x = Math.max(0, state.reticle.x - step); break;
      case 'arrowright': state.reticle.x = Math.min(PANEL_WIDTH, state.reticle.x + step); break;
      case 'arrowup': state.reticle.y = Math.max(0, state.reticle.y - step); break;
      case 'arrowdown': state.reticle.y = Math.min(PANEL_HEIGHT, state.reticle.y + step); break;
      case 'enter':
      case ' ': {
        const result = selectAt(state, state.reticle.x, state.reticle.y, now());
        if (result === 'found') {
          playFound(state.foundByScene[state.sceneIndex].size - 1);
          if (state.mode === 'sceneClear' || state.mode === 'gameClear') playClear();
        } else if (result === 'wrong') playWrong();
        break;
      }
      case 'h': if (requestHint(state, now())) playHint(); break;
      case 'm': setLensHeld(state, 'heldKey', !state.lens.heldKey); break;
      case 'n': advanceScene(state, now()); break;
      case 'r': restartGame(state, now()); break;
      default: used = false;
    }
    if (used) {
      state.reticle.usingKeyboard = true;
      state.lens.x = state.reticle.x;
      state.lens.y = state.reticle.y;
      event.preventDefault();
    }
  });
}
