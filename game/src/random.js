// Small seeded PRNG helpers. Every scene detail is derived from a fixed seed so the
// two side-by-side panels are identical except for the authored differences.

export function makeRandom(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return function random() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randBetween(random, min, max) {
  return min + (max - min) * random();
}

export function pick(random, items) {
  return items[Math.floor(random() * items.length) % items.length];
}
