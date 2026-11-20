# BUILD_LOG — gta6-cover-art-01 round 7

- App: Vice Coast Cover Studio, rebuilt from the prose spec in a fresh
  recording. No file under the old cover-art-r4 or entries/gta6-cover-art-01
  directories was read, copied or opened; every counted file was written
  fresh in this session. The only copy from outside the repo is the
  vendored library `vendor/makefun-app.ts` (kit starter, unchanged).
- Layouts: Hero + 3 strip, Four Panel with centre VC badge, Full Bleed,
  tilted Snapshots. Grades: Vice Sunset, Neon Night, Palm Gold, Teal Dusk,
  Noir. Up to 4 photo slots, per-panel zoom/pan by drag and sliders.
  Words: Anton title, Pacifico subtitle, badge, 5-star heat meter.
  Effects: halftone band, painted skyline with palms and lit windows,
  grain, vignette — all seeded from the cover settings (mulberry32).
  Export: 1080x1080, 1080x1350, 1920x1080 via canvas.toBlob.
- Fonts: Anton + Pacifico downloaded from google/fonts (raw.githubusercontent)
  with OFL texts; bytes changed in-session via a fontTools round-trip
  (head.fontRevision 1.0 -> 1.001), sha256 verified changed.
- Samples: boulevard.jpg and pier.jpg drawn programmatically with PIL
  (1080x1350, quality 85). No real people, no copied art.
- Screenshots: rendered by serving the app (serve.ts, port 8080) and driving
  headless Chromium (Playwright) through ?shot= presets; exports taken
  from the app itself, only scaled down with PIL. Zero console errors.
- Gate verification (all pass, each <= 256 KiB, long side <= 1280 px,
  short side >= 480 px):
  - 1-cover.jpg — 1280x720, 109,089 bytes (hero wide export 1920x1080)
  - 2-editor.jpg — 1280x720, 99,239 bytes (browser shot, photo loaded)
  - 3-cover-portrait.jpg — 1024x1280, 132,780 bytes (portrait export)
  - 4-cover-square.jpg — 1080x1080, 126,330 bytes (square export)
- main.ts: run twice with MAKEFUN_OUTPUT_DIR set — dossier.json
  byte-identical both runs (sha256 68d05a0d…b5b81), 660,837 bytes (<= 1.5 MiB).
  Bare `node main.ts` also works (defaults to /output, no env required).
- Syntax: all five app .js modules pass node --input-type=module --check.
  No network references in index.html or any reachable script (grep clean).
- Kit check (re-run on final commit 5e55ec39563ac068d39ac5e796d6028b3febeb40,
  identical result): 4 passed, 0 failed, 17 skipped, 5 checked at submission
  (competition_open, snapshot, license_osi, entrypoint pass; transcript /
  thinking checks run server-side only; repo_public, repo_owner,
  repo_created_after_open, commit_in_repo, duplicate_snapshot are
  at-submission and need the push + submit the parent does).
- Round 7 of 20 (quota: 6 rounds used before this round, 5/day).
  Deadline 21 Nov 17:30 WIB. Not pushed, not submitted — parent does that.
