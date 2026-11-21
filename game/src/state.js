// All mutable game state and rules, with no drawing or event wiring.
import { SCENES, findDifferenceAt } from './difference-set.js';
import { makeRandom } from './random.js';

export const HINT_DURATION = 2.6;
export const HINT_COOLDOWN = 11;

export function createGameState(search = '') {
  const params = new URLSearchParams(search);
  const seed = Number(params.get('seed')) || 20261121;
  const state = {
    seed,
    sceneIndex: 0,
    foundByScene: SCENES.map(() => new Set()),
    elapsed: 0,
    totalElapsed: 0,
    mode: 'play',
    hint: { index: -1, until: 0, cooldownUntil: 0 },
    lens: { active: false, x: 300, y: 250, panel: 0, heldMouse: false, heldKey: false },
    reticle: { x: 300, y: 250, usingKeyboard: false },
    shake: 0,
    feedback: { index: -1, wrongAt: -1, at: 0 },
    bannerAt: -10,
    shots: params.get('shot') ?? '',
    random: makeRandom(seed ^ 0x51f00d),
  };

  if (state.shots === 'cover') {
    for (let i = 0; i < 4; i++) state.foundByScene[0].add(i);
    state.elapsed = 42.8;
    state.totalElapsed = 42.8;
    state.reticle.x = 466;
    state.reticle.y = 300;
  } else if (state.shots === 'hint') {
    for (let i = 0; i < 3; i++) state.foundByScene[0].add(i);
    state.sceneIndex = 1;
    state.elapsed = 25.4;
    state.totalElapsed = 69.2;
    state.foundByScene[1].add(0);
    state.hint.index = 4;
    state.hint.until = Infinity;
    state.foundByScene[1].add(1);
    state.lens.x = 424;
    state.lens.y = 292;
    state.reticle.x = 424;
    state.reticle.y = 292;
  } else if (state.shots === 'magnifier') {
    state.sceneIndex = 2;
    for (let i = 0; i < 5; i++) state.foundByScene[2].add(i);
    state.elapsed = 51.6;
    state.totalElapsed = 118.4;
    state.lens.active = true;
    state.lens.x = 356;
    state.lens.y = 349;
    state.lens.panel = 1;
    state.reticle.x = 356;
    state.reticle.y = 349;
  } else if (state.shots === 'end') {
    for (let s = 0; s < SCENES.length; s++) {
      for (let i = 0; i < SCENES[s].diffs.length; i++) state.foundByScene[s].add(i);
    }
    state.sceneIndex = 3;
    state.mode = 'gameClear';
    state.totalElapsed = 267.3;
    state.elapsed = 48.7;
    state.bannerAt = 0;
  }
  return state;
}

export function getFoundCount(state, sceneIndex = state.sceneIndex) {
  return state.foundByScene[sceneIndex].size;
}

export function getRemaining(state) {
  return SCENES[state.sceneIndex].diffs.length - getFoundCount(state);
}

export function getTotalFound(state) {
  return state.foundByScene.reduce((sum, set) => sum + set.size, 0);
}

export function updateState(state, dt, now) {
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 3.5);
  if (state.mode === 'play') state.elapsed += dt;
  state.totalElapsed += dt;
  if (state.hint.index >= 0 && now > state.hint.until) state.hint.index = -1;
  state.lens.active = state.lens.heldMouse || state.lens.heldKey || state.shots === 'magnifier';
}

export function requestHint(state, now) {
  if (state.mode !== 'play' || now < state.hint.cooldownUntil) return false;
  const remaining = [];
  SCENES[state.sceneIndex].diffs.forEach((_, i) => {
    if (!state.foundByScene[state.sceneIndex].has(i)) remaining.push(i);
  });
  if (!remaining.length) return false;
  state.hint.index = remaining[Math.floor(state.random() * remaining.length)];
  state.hint.until = now + HINT_DURATION;
  state.hint.cooldownUntil = now + HINT_COOLDOWN;
  return true;
}

export function hintCooldownLeft(state, now) {
  return Math.max(0, state.hint.cooldownUntil - now);
}

export function setLensHeld(state, source, held) {
  state.lens[source] = held;
}

export function selectAt(state, x, y, now) {
  if (state.mode !== 'play') {
    if (state.mode === 'sceneClear') advanceScene(state, now);
    return 'advance';
  }
  const index = findDifferenceAt(state.sceneIndex, x, y);
  if (index === null || state.foundByScene[state.sceneIndex].has(index)) {
    state.feedback.wrongAt = now;
    state.shake = 1;
    return 'wrong';
  }
  state.foundByScene[state.sceneIndex].add(index);
  state.feedback.index = index;
  state.feedback.at = now;
  if (state.hint.index === index) state.hint.index = -1;
  if (getRemaining(state) === 0) {
    state.mode = state.sceneIndex === SCENES.length - 1 ? 'gameClear' : 'sceneClear';
    state.bannerAt = now;
  }
  return 'found';
}

export function advanceScene(state, now) {
  if (state.mode !== 'sceneClear') return false;
  state.sceneIndex++;
  state.mode = 'play';
  state.elapsed = 0;
  state.hint.index = -1;
  state.hint.cooldownUntil = now;
  state.shots = '';
  return true;
}

export function restartGame(state, now) {
  state.sceneIndex = 0;
  state.foundByScene = SCENES.map(() => new Set());
  state.elapsed = 0;
  state.totalElapsed = 0;
  state.mode = 'play';
  state.hint.index = -1;
  state.hint.cooldownUntil = now;
  state.feedback.index = -1;
  state.feedback.wrongAt = -1;
  state.shake = 0;
  state.shots = '';
  return state;
}

export function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}
