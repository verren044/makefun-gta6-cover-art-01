// Seeded PRNG for Vice Coast Cover Studio.
// Every random-looking choice in a cover (grain, windows, palms, halftone)
// derives from the cover settings string, so the same cover repaints
// identically on every load and every export.

export function hashString(str) {
  // FNV-1a 32-bit over UTF-16 code units; small, fast, deterministic.
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFromString(str) {
  return mulberry32(hashString(str));
}

// Deterministic pick: same seed string always returns the same element.
export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

// Deterministic range helper, inclusive of min, exclusive of max.
export function range(rng, min, max) {
  return min + rng() * (max - min);
}
