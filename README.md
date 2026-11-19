# Vice Coast Cover Studio

[![Make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/verren044/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/verren044/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your photos and a caption into GTA 6-style cover art — the multi-panel Vice City poster look, with bold lettering and a sunset or neon colour grade. Entry for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty ($250).

## What it does

- **4 layouts** — Hero + 3 strip, Four Panel with a centre VC badge, Full Bleed, and tilted Snapshots over a painted sunset skyline.
- **5 grades** — Vice Sunset, Neon Night, Palm Gold, Teal Dusk, Noir. Each grade repaints the sky, the sun, the photo wash and the lettering gradient together.
- **Up to 4 photo slots** — fill several panels with one photo or several. Per-panel zoom and pan: drag on the preview or use the sliders.
- **Editable words** — title (Anton), subtitle in script (Pacifico), badge, and a 5-star heat meter.
- **Poster effects** — halftone band, painted skyline with palms and lit windows, film grain and vignette. All of it seeded from the cover's own settings, so the same cover repaints identically every time.
- **PNG export** — 1080×1080, 1080×1350, 1920×1080, saved straight from the browser.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: every script, font and sample photo is a file under `app/`. Photos you add stay on your machine — nothing is uploaded.

## Layout

- `app/index.html` + `app/style.css` — the editor.
- `app/src/cover.js` — the cover renderer (layouts, skyline, lettering, grain).
- `app/src/grades.js` — the five grade palettes.
- `app/src/prng.js` — seeded randomness, so covers are deterministic.
- `app/src/main.js` — editor wiring, drag-to-pan, export.
- `app/src/shots.js` — fixed `?shot=` scenes used for the screenshots.
- `app/fonts/` — Anton and Pacifico, both under the SIL Open Font License (license texts beside them).
- `app/samples/` — two image-model sample photos bundled with the kit, free to use.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` (Node 22, standard library only).
- `screenshots/` — 4 screenshots: the wide hero cover, the editor with a photo loaded, the neon four-panel portrait cover, and the gold snapshots square cover.

## License

MIT — see [LICENSE](LICENSE). Fonts under `app/fonts/` are licensed under the SIL Open Font License 1.1 (see `OFL-Anton.txt` and `OFL-Pacifico.txt`).
