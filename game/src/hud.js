// HUD, markers, hint pulse, magnifier and end-card overlays.
import { SCENES, PANEL_WIDTH, PANEL_HEIGHT } from './difference-set.js';
import { getFoundCount, getRemaining, getTotalFound, formatTime, hintCooldownLeft } from './state.js';
import { PANEL_ORIGINS } from './input.js';

const INK = '#eaf0ff';
const MUTED = '#96a3c4';

function text(ctx, value, x, y, size, color = INK, weight = 'normal', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function button(ctx, x, y, w, h, label, sub, enabled, accent) {
  roundRect(ctx, x, y, w, h, 11, enabled ? 'rgba(255,255,255,.09)' : 'rgba(255,255,255,.035)',
    enabled ? 'rgba(255,255,255,.34)' : 'rgba(255,255,255,.1)');
  text(ctx, label, x + w / 2, y + 26, 14, enabled ? accent : MUTED, 'bold', 'center');
  text(ctx, sub, x + w / 2, y + 43, 10.5, MUTED, 'normal', 'center');
}

export function drawHUD(ctx, state, now) {
  const scene = SCENES[state.sceneIndex];
  const g = ctx.createLinearGradient(0, 0, 0, 96);
  g.addColorStop(0, '#0d1430');
  g.addColorStop(1, 'rgba(11,17,38,0.86)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 96);
  ctx.fillStyle = scene.accent;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(0, 94, 1280, 2);
  ctx.globalAlpha = 1;

  text(ctx, 'LANTERN', 28, 34, 23, '#ffe0a3', 'bold');
  text(ctx, 'WATCH', 28, 58, 23, scene.accent, 'bold');
  text(ctx, 'spot the difference · night edition', 148, 55, 11.5, MUTED);

  text(ctx, `SCENE ${state.sceneIndex + 1} / ${SCENES.length}`, 304, 27, 11, MUTED, 'bold');
  text(ctx, scene.name, 304, 53, 19, INK, 'bold');
  const dotStart = 304;
  for (let i = 0; i < SCENES.length; i++) {
    ctx.beginPath();
    ctx.arc(dotStart + 7 + i * 18, 74, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = i === state.sceneIndex ? scene.accent : i < state.sceneIndex ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.18)';
    ctx.fill();
  }
  text(ctx, scene.subtitle, 400, 75, 11, MUTED);

  text(ctx, 'TIME', 590, 28, 10, MUTED, 'bold');
  text(ctx, formatTime(state.elapsed), 590, 55, 20, INK, 'bold');

  const remaining = getRemaining(state);
  const pulse = remaining <= 2 ? 0.5 + 0.5 * Math.sin(now * 5) : 0;
  roundRect(ctx, 664, 22, 196, 48, 13, `rgba(${255},${190 + pulse * 40},${110},.14)`, 'rgba(255,197,114,.55)');
  text(ctx, remaining === 0 ? 'SCENE CLEAR' : `${remaining} remaining`, 762, 52, 20, '#ffd694', 'bold', 'center');

  const cool = hintCooldownLeft(state, now);
  const hintReady = cool <= 0 && state.mode === 'play';
  button(ctx, 898, 26, 114, 40, 'HINT  H', hintReady ? 'ready' : cool > 0 ? `${Math.ceil(cool)}s cooldown` : 'unavailable', hintReady, '#ffd694');
  button(ctx, 1022, 26, 120, 40, 'LENS  M', state.lens.active ? 'active' : 'hold / toggle', true, '#9fe6e0');

  text(ctx, `${getTotalFound(state)} / 32`, 1252, 38, 17, INK, 'bold', 'right');
  text(ctx, 'TOTAL FOUND', 1252, 56, 10, MUTED, 'bold', 'right');

  // footer
  const fg = ctx.createLinearGradient(0, 620, 0, 720);
  fg.addColorStop(0, 'rgba(9,14,30,0.2)');
  fg.addColorStop(0.35, 'rgba(9,14,30,0.93)');
  fg.addColorStop(1, '#080d1c');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 620, 1280, 100);
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  ctx.fillRect(28, 650, 1224, 1);
  text(ctx, 'CLICK THE DIFFERENCE', 28, 676, 12, '#ffe0a3', 'bold');
  text(ctx, 'ARROWS + ENTER / SPACE', 278, 676, 12, INK, 'bold');
  text(ctx, 'H  HINT', 545, 676, 12, INK, 'bold');
  text(ctx, 'M / RIGHT-CLICK  LENS', 668, 676, 12, '#9fe6e0', 'bold');
  text(ctx, 'N  NEXT SCENE     R  RESTART', 940, 676, 12, INK, 'bold');
  text(ctx, 'Find 8 changes in each of 4 procedurally drawn night scenes · click either panel · wrong clicks only shake the screen',
    640, 702, 11.5, MUTED, 'normal', 'center');
}

export function drawPanelLabels(ctx) {
  PANEL_ORIGINS.forEach((origin, i) => {
    roundRect(ctx, origin.x + 10, origin.y + 10, 66, 22, 7, 'rgba(6,10,22,.62)', 'rgba(255,255,255,.14)');
    text(ctx, i === 0 ? 'PANEL A' : 'PANEL B', origin.x + 43, origin.y + 25, 10, '#e5ecff', 'bold', 'center');
  });
}

export function drawMarkers(ctx, state, panelIndex, now) {
  const origin = PANEL_ORIGINS[panelIndex];
  const diffs = SCENES[state.sceneIndex].diffs;
  const found = state.foundByScene[state.sceneIndex];
  for (const index of found) {
    const d = diffs[index];
    if (!d) continue;
    const x = origin.x + d.x;
    const y = origin.y + d.y;
    const fresh = state.feedback.index === index ? Math.max(0, 1 - (now - state.feedback.at) * 1.6) : 0;
    const radius = d.r + 3 + fresh * 12;
    ctx.save();
    ctx.shadowColor = 'rgba(255,205,110,.85)';
    ctx.shadowBlur = 14 + fresh * 20;
    ctx.strokeStyle = 'rgba(255,224,160,.96)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(x, y, radius, -0.45, Math.PI * 1.62);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();
    ctx.strokeStyle = '#fff5dc';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x - 1, y + 5);
    ctx.lineTo(x + 7, y - 6);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawHintPulse(ctx, state, now) {
  if (state.hint.index < 0) return;
  const d = SCENES[state.sceneIndex].diffs[state.hint.index];
  if (!d) return;
  const phase = 0.5 + 0.5 * Math.sin(now * 4.6);
  for (const origin of PANEL_ORIGINS) {
    const x = origin.x + d.x;
    const y = origin.y + d.y;
    ctx.save();
    ctx.strokeStyle = `rgba(255,225,140,${0.3 + phase * 0.6})`;
    ctx.lineWidth = 2 + phase * 2;
    ctx.setLineDash([9, 7]);
    ctx.beginPath();
    ctx.arc(x, y, d.r + 16 + phase * 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(255,255,255,${0.12 + phase * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, d.r + 34 + phase * 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  text(ctx, 'LOOK NEAR THE PULSE', 640, 624, 12, '#ffe0a3', 'bold', 'center');
}

export function drawReticle(ctx, state, now) {
  if (!state.reticle.usingKeyboard) return;
  const x = PANEL_ORIGINS[0].x + state.reticle.x;
  const y = PANEL_ORIGINS[0].y + state.reticle.y;
  ctx.save();
  ctx.strokeStyle = 'rgba(190,235,255,.85)';
  ctx.lineWidth = 1.5;
  const r = 13 + Math.sin(now * 4) * 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  lineSegments(ctx, x, y);
  ctx.restore();
}

function lineSegments(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 21, y); ctx.lineTo(x - 15, y);
  ctx.moveTo(x + 15, y); ctx.lineTo(x + 21, y);
  ctx.moveTo(x, y - 21); ctx.lineTo(x, y - 15);
  ctx.moveTo(x, y + 15); ctx.lineTo(x, y + 21);
  ctx.stroke();
}

export function drawMagnifier(ctx, state, drawArt) {
  if (!state.lens.active) return;
  const panel = state.lens.panel ?? 0;
  const origin = PANEL_ORIGINS[panel];
  const cx = origin.x + state.lens.x;
  const cy = origin.y + state.lens.y;
  const zoom = 2.15;
  const radius = 86;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#131c30';
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.translate(cx - state.lens.x * zoom, cy - state.lens.y * zoom);
  ctx.scale(zoom, zoom);
  drawArt(ctx, panel);
  ctx.restore();
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.7)';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = '#e6d3a4';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawOverlays(ctx, state, now) {
  if (state.mode === 'play') return;
  const scene = SCENES[state.sceneIndex];
  const gameClear = state.mode === 'gameClear';
  const fade = Math.min(1, Math.max(0, (now - state.bannerAt) * 1.7));
  ctx.save();
  ctx.globalAlpha = 0.72 * fade;
  ctx.fillStyle = '#060a18';
  ctx.fillRect(0, 96, 1280, 524);
  ctx.globalAlpha = fade;
  const cardW = gameClear ? 660 : 520;
  const cardH = gameClear ? 264 : 226;
  const x = (1280 - cardW) / 2;
  const y = 258;
  roundRect(ctx, x, y, cardW, cardH, 22, 'rgba(20,27,50,.97)', 'rgba(255,214,148,.65)');
  text(ctx, gameClear ? 'NIGHT COMPLETE' : 'SCENE CLEAR', 640, y + 62, gameClear ? 36 : 33, '#ffd694', 'bold', 'center');
  text(ctx, gameClear ? 'All 32 differences found — the lanterns stay lit.' : `${scene.name} — all 8 differences found`,
    640, y + 100, 16, INK, 'normal', 'center');
  text(ctx, gameClear ? `Total time  ${formatTime(state.totalElapsed)}` : `Scene time  ${formatTime(state.elapsed)}`,
    640, y + 140, 21, '#9fe6e0', 'bold', 'center');
  const prompt = gameClear ? 'Press R to watch the night again' : 'Press N or click to continue';
  const blink = 0.65 + 0.35 * Math.sin(now * 4);
  ctx.globalAlpha = fade * blink;
  text(ctx, prompt, 640, y + cardH - 38, 15, INK, 'bold', 'center');
  ctx.restore();
}
