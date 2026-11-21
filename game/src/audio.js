// Tiny WebAudio chimes, generated from oscillators. Nothing is loaded from the network.
let context = null;

function audioContext() {
  if (!context) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(freq, start, duration, volume, type = 'sine') {
  const ctx = audioContext();
  if (!ctx) return;
  const now = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playFound(index = 0) {
  const scale = [0, 2, 4, 7, 9, 12, 14, 16];
  const base = 523.25 * Math.pow(2, (scale[index % scale.length] ?? 0) / 12);
  tone(base, 0, 0.34, 0.12, 'sine');
  tone(base * 1.5, 0.07, 0.28, 0.06, 'triangle');
  tone(base * 2, 0.13, 0.22, 0.025, 'sine');
}

export function playWrong() {
  tone(174, 0, 0.14, 0.055, 'triangle');
  tone(146, 0.06, 0.16, 0.04, 'triangle');
}

export function playHint() {
  tone(740, 0, 0.24, 0.045, 'sine');
  tone(988, 0.1, 0.3, 0.035, 'sine');
}

export function playClear() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => {
    tone(n, i * 0.11, 0.5, 0.09, 'sine');
    tone(n * 2, i * 0.11 + 0.02, 0.32, 0.025, 'triangle');
  });
}
