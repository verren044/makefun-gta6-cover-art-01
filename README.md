# makefun-gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verren044/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verren044/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Coast Cover Studio — an offline web app that turns your photos and a caption into GTA 6-style Vice City cover art: four poster layouts, five sunset grades, seeded poster effects and PNG export.

## Run it

```sh
node serve.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=vvz66fvh&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>

## Features

- **Four layouts** — Hero + 3 strip, Four Panel with a centre VC badge, Full Bleed, and tilted Snapshots over a painted sunset skyline.
- **Five grades** — Vice Sunset, Neon Night, Palm Gold, Teal Dusk and Noir. Each grade repaints the sky, sun, photo wash and lettering together.
- **Up to 4 photo slots** — fill several panels with one photo or several. Per-panel zoom and pan by dragging the preview or with sliders.
- **Editable words** — title in Anton, subtitle in script (Pacifico), badge text, and a 5-star heat meter.
- **Poster effects** — halftone band, painted skyline with palm silhouettes and lit windows, film grain and vignette, all seeded from the cover's own settings so the same cover repaints identically.
- **PNG export** — 1080×1080, 1080×1350 and 1920×1080, saved straight from the browser.
- **Offline** — no build step, no network requests. Every script, font and sample is a file under `app/`.
- **Reproducible shots** — `?shot=cover`, `?shot=editor`, `?shot=portrait` or `?shot=square` applies a fixed preset for screenshots.

## File layout

- `app/index.html` — editor page
- `app/style.css` — dark editor UI
- `app/src/prng.js` — seeded PRNG (mulberry32-style) behind every deterministic effect
- `app/src/grades.js` — the five grade palettes
- `app/src/cover.js` — the cover renderer
- `app/src/main.js` — editor wiring: file input, samples, controls, drag-to-pan, export
- `app/src/shots.js` — fixed `?shot=` presets
- `app/fonts/` — Anton and Pacifico (SIL Open Font License, license texts included)
- `app/samples/` — two original illustrated sample photos (boulevard, pier), drawn in code
- `serve.ts` — tiny static server for the app (Node stdlib only)
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json`
- `screenshots/` — the four entry screenshots

## License note

Code is MIT (see `LICENSE`). Fonts Anton and Pacifico are under the SIL Open Font License 1.1 (texts in `app/fonts/`). The sample photos are original illustrations drawn programmatically — no Rockstar logo, artwork or font is used anywhere in this project.
