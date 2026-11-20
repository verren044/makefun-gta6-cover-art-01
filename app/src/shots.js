// Fixed ?shot= scenes for Vice Coast Cover Studio.
// Loading the page with ?shot=cover, ?shot=editor, ?shot=portrait or
// ?shot=square applies one preset (layout, grade, words, sample photos)
// so screenshots of the app are reproducible run after run.

const PRESETS = {
  cover: {
    layout: "hero3",
    grade: "sunset",
    title: "VICE COAST",
    subtitle: "Sunset Boulevard",
    badge: "VICE CITY",
    heat: 5,
    samples: ["samples/boulevard.jpg", "samples/pier.jpg"],
  },
  editor: {
    layout: "hero3",
    grade: "neon",
    title: "NEON NIGHTS",
    subtitle: "Vice Coast",
    badge: "VC",
    heat: 4,
    samples: ["samples/pier.jpg", "samples/boulevard.jpg"],
  },
  portrait: {
    layout: "four",
    grade: "neon",
    title: "NEON VICE",
    subtitle: "After Dark",
    badge: "VC-06",
    heat: 5,
    samples: ["samples/pier.jpg", "samples/boulevard.jpg"],
  },
  square: {
    layout: "snapshots",
    grade: "gold",
    title: "GOLDEN HOUR",
    subtitle: "Palm Coast",
    badge: "EST. 2026",
    heat: 4,
    samples: ["samples/boulevard.jpg", "samples/pier.jpg"],
  },
};

async function applyShot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get("shot");
  if (!shot || !PRESETS[shot]) return;
  // Wait until the editor module has exposed its API.
  for (let i = 0; i < 100 && !window.ViceCoast; i++) {
    await new Promise((r) => setTimeout(r, 50));
  }
  if (!window.ViceCoast) return;
  await window.ViceCoast.applyPreset(PRESETS[shot]);
  window.__shotReady = true;
}

applyShot();
