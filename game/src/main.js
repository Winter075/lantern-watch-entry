// Bootstrap: owns the canvas, the frame loop and the order in which a frame is painted.
import { drawScene } from './scene-art.js';
import { SCENES } from './difference-set.js';
import { createGameState, updateState } from './state.js';
import { attachInput, PANEL_ORIGINS } from './input.js';
import {
  drawHUD, drawPanelLabels, drawMarkers, drawHintPulse,
  drawReticle, drawMagnifier, drawOverlays,
} from './hud.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = createGameState(window.location.search);
const now = () => performance.now() / 1000;

attachInput(canvas, state, now);

function drawBackdrop() {
  const g = ctx.createLinearGradient(0, 0, 1280, 720);
  g.addColorStop(0, '#0a1024');
  g.addColorStop(0.5, '#111832');
  g.addColorStop(1, '#070b18');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.strokeStyle = 'rgba(255,255,255,.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1280; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 96); ctx.lineTo(x, 624); ctx.stroke();
  }
}

function drawPanel(panelIndex, shakeX) {
  const origin = PANEL_ORIGINS[panelIndex];
  ctx.save();
  ctx.translate(origin.x + shakeX, origin.y);
  ctx.beginPath();
  ctx.roundRect(0, 0, 600, 500, 8);
  ctx.clip();
  drawScene(ctx, state.sceneIndex, panelIndex === 0 ? 'a' : 'b', state.seed);
  ctx.restore();
}

function drawArtForLens(target, panelIndex) {
  drawScene(target, state.sceneIndex, panelIndex === 0 ? 'a' : 'b', state.seed);
}

let previous = now();

function frame() {
  const current = now();
  const dt = Math.min(0.05, Math.max(0, current - previous));
  previous = current;
  updateState(state, dt, current);

  drawBackdrop();
  const shakeX = state.shake > 0 ? Math.sin(current * 72) * state.shake * 7 : 0;
  drawPanel(0, shakeX);
  drawPanel(1, shakeX);
  drawPanelLabels();
  drawMarkers(ctx, state, 0, current);
  drawMarkers(ctx, state, 1, current);
  drawHintPulse(ctx, state, current);
  drawReticle(ctx, state, current);
  drawMagnifier(ctx, state, drawArtForLens);
  drawHUD(ctx, state, current);
  drawOverlays(ctx, state, current);

  requestAnimationFrame(frame);
}

// Paint one frame immediately so deterministic screenshot states appear without waiting.
frame();
