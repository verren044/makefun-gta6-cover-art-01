// Seeded randomness for Vice Coast Cover Studio. Every visual that looks
// random — grain, halftone dots, skyline buildings, palm placement — is drawn
// from a mulberry32 stream seeded by the cover's own settings, so the same
// title, layout, grade and panel crops always paint the exact same cover.

/** FNV-1a hash of a string, returned as an unsigned 32-bit seed. */
export function hashSeed(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic PRNG stream: mulberry32. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seed string for a whole cover: title, layout, grade, size and panel crops. */
export function coverSeed(state, width, height) {
  const crops = state.slots
    .map((s) => `${s.photo ?? -1}:${s.zoom.toFixed(3)}:${s.ox.toFixed(3)}:${s.oy.toFixed(3)}`)
    .join('|');
  return hashSeed(
    `${state.title}\n${state.subtitle}\n${state.badge}\n${state.layout}\n${state.grade}\n${state.heat}\n${width}x${height}\n${crops}`,
  );
}
