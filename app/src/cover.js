// Cover renderer for Vice Coast Cover Studio.
// Draws the whole poster onto a canvas: painted sky, sun, skyline with palm
// silhouettes and lit windows, photo panels, halftone band, lettering,
// heat stars, grain and vignette. Fully seeded: the seed string is the
// cover settings (layout, grade, words, heat), so identical settings
// always produce an identical image, export after export.

import { rngFromString, range } from "./prng.js";
import { gradeByKey } from "./grades.js";

export const LAYOUTS = ["hero3", "four", "bleed", "snapshots"];

function seedOf(settings) {
  return JSON.stringify([
    settings.layout,
    settings.grade,
    settings.title,
    settings.subtitle,
    settings.badge,
    settings.heat,
  ]);
}

function drawSky(ctx, w, h, grade, rng) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, grade.skyTop);
  g.addColorStop(0.55, grade.skyMid);
  g.addColorStop(1, grade.skyBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Sun with a soft glow halo.
  const sx = w * (0.32 + rng() * 0.36);
  const sy = h * (0.2 + rng() * 0.14);
  const sr = Math.min(w, h) * (0.09 + rng() * 0.03);
  const halo = ctx.createRadialGradient(sx, sy, sr * 0.4, sx, sy, sr * 3.2);
  halo.addColorStop(0, grade.sunGlow);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
  // Thin horizontal sun stripes, the retro sunset look.
  ctx.fillStyle = grade.skyMid;
  for (let i = 0; i < 4; i++) {
    const yy = sy + sr * (0.15 + i * 0.22);
    ctx.fillRect(sx - sr, yy, sr * 2, sr * 0.06);
  }
}

function drawPalm(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.06, y - s * 0.55, x + s * 0.02, y - s);
  ctx.stroke();
  // Five fronds fanning out from the crown.
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.08 + i * 0.21);
    const ex = x + s * 0.02 + Math.cos(a) * s * 0.55 * (i % 2 === 0 ? 1 : -0.8);
    const ey = y - s - Math.sin(a) * s * 0.32;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.02, y - s);
    ctx.quadraticCurveTo(
      x + s * 0.02 + (ex - x) * 0.5,
      y - s - s * 0.28,
      ex,
      ey,
    );
    ctx.stroke();
  }
  // Coconuts: two small dots under the crown.
  ctx.beginPath();
  ctx.arc(x - s * 0.03, y - s * 0.96, s * 0.045, 0, Math.PI * 2);
  ctx.arc(x + s * 0.05, y - s * 0.95, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

function drawSkyline(ctx, w, h, grade, rng, baseY) {
  // Dark building band across the lower third, windows lit at random.
  const top = baseY;
  ctx.fillStyle = "rgba(12, 8, 24, 0.92)";
  let x = -10;
  while (x < w + 10) {
    const bw = range(rng, w * 0.06, w * 0.16);
    const bh = range(rng, h * 0.08, h * 0.24);
    ctx.fillRect(x, top - bh, bw, bh + (h - top));
    // Lit windows: warm dots in a grid, about one in three lit.
    const cols = Math.max(2, Math.floor(bw / (w * 0.02)));
    const rows = Math.max(2, Math.floor(bh / (h * 0.035)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rng() < 0.34) {
          ctx.fillStyle = rng() < 0.75 ? "#ffd166" : grade.accent;
          ctx.fillRect(
            x + (c + 0.5) * (bw / cols) - w * 0.004,
            top - bh + (r + 0.5) * (bh / rows) - h * 0.006,
            w * 0.008,
            h * 0.012,
          );
          ctx.fillStyle = "rgba(12, 8, 24, 0.92)";
        }
      }
    }
    x += bw + range(rng, 0, w * 0.02);
  }
  // Palm silhouettes in front of the buildings, spaced by the seed.
  const palms = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < palms; i++) {
    const px = range(rng, w * 0.04, w * 0.96);
    const ps = range(rng, h * 0.09, h * 0.17);
    drawPalm(ctx, px, top + h * 0.02, ps, "rgba(8, 5, 18, 0.95)");
  }
}

function drawPhotoCover(ctx, img, x, y, w, h, zoom, panX, panY) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x + (w - dw) / 2 + panX * w * 0.2;
  const dy = y + (h - dh) / 2 + panY * h * 0.2;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawPanel(ctx, img, rect, grade, zoom, panX, panY, wash) {
  if (img) {
    drawPhotoCover(ctx, img, rect.x, rect.y, rect.w, rect.h, zoom, panX, panY);
  } else {
    // Empty slot: a painted placeholder so the layout still reads.
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    g.addColorStop(0, grade.skyMid);
    g.addColorStop(1, grade.skyBot);
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = `700 ${Math.round(rect.h * 0.09)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+ ADD PHOTO", rect.x + rect.w / 2, rect.y + rect.h / 2);
  }
  // Grade wash over the photo, then a crisp panel border.
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = grade.panelLine;
  ctx.lineWidth = Math.max(2, rect.w * 0.008);
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

function drawHalftone(ctx, w, h, grade, rng, y, bandH) {
  // A band of dots that grows toward one side: classic poster texture.
  const step = Math.max(6, w * 0.012);
  for (let yy = y; yy < y + bandH; yy += step) {
    const t = (yy - y) / bandH;
    for (let xx = step / 2; xx < w; xx += step) {
      const r = step * 0.42 * (0.25 + t * 0.75) * (0.7 + rng() * 0.6);
      ctx.fillStyle = "rgba(10, 6, 20, 0.5)";
      ctx.beginPath();
      ctx.arc(xx, yy, Math.min(r, step * 0.45), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawWords(ctx, w, h, settings, grade, area) {
  const { title, subtitle, badge } = settings;
  // Clamp heat at draw time, not at input time: presets and sliders both
  // feed this function, and a star drawn half-lit reads as a bug.
  const heat = Math.max(0, Math.min(5, Math.round(settings.heat || 0)));
  const cx = area.x + area.w / 2;
  // Badge pill above the title.
  ctx.font = `700 ${Math.round(area.h * 0.16)}px sans-serif`;
  const badgeW = ctx.measureText(badge).width + area.h * 0.5;
  const badgeH = area.h * 0.3;
  const bx = cx - badgeW / 2;
  const by = area.y;
  ctx.fillStyle = grade.accent;
  ctx.beginPath();
  ctx.roundRect(bx, by, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.fillStyle = "#101018";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badge, cx, by + badgeH / 2 + 1);
  // Title in Anton, filled with the grade gradient, dark outline.
  const titleSize = Math.min(area.h * 0.52, (area.w * 0.92) / Math.max(4, title.length * 0.52));
  const ty = by + badgeH + titleSize * 0.95;
  const tg = ctx.createLinearGradient(0, ty - titleSize, 0, ty);
  tg.addColorStop(0, grade.inkTop);
  tg.addColorStop(1, grade.inkBot);
  ctx.font = `${Math.round(titleSize)}px Anton, sans-serif`;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(10, 6, 20, 0.85)";
  ctx.lineWidth = Math.max(2, titleSize * 0.06);
  ctx.strokeText(title, cx, ty);
  ctx.fillStyle = tg;
  ctx.fillText(title, cx, ty);
  // Subtitle in script, slightly rotated for the hand-lettered feel.
  const subSize = Math.min(area.h * 0.26, area.w * 0.07);
  ctx.save();
  ctx.translate(cx, ty + subSize * 1.15);
  ctx.rotate(-0.03);
  ctx.font = `${Math.round(subSize)}px Pacifico, cursive`;
  ctx.fillStyle = grade.inkTop;
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = subSize * 0.12;
  ctx.fillText(subtitle, 0, 0);
  ctx.restore();
  // Heat meter: five stars, filled up to the heat value.
  const starY = ty + subSize * 2.1;
  const starR = Math.min(area.h * 0.11, area.w * 0.028);
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, cx + (i - 2) * starR * 2.6, starY, starR, i < heat);
  }
}

function drawStar(ctx, x, y, r, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(ang) * rad;
    const py = y + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? "#ffd166" : "rgba(255,255,255,0.28)";
  ctx.fill();
  ctx.strokeStyle = "rgba(10,6,20,0.6)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawGrain(ctx, w, h, rng) {
  // Seeded monochrome grain: thousands of faint dots, same every render.
  const n = Math.floor((w * h) / 900);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < n; i++) {
    ctx.fillRect(rng() * w, rng() * h, 1.5, 1.5);
  }
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  for (let i = 0; i < n / 2; i++) {
    ctx.fillRect(rng() * w, rng() * h, 1.5, 1.5);
  }
}

function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function panelSettings(settings, i) {
  const z = settings.zooms && settings.zooms[i] ? settings.zooms[i] : 1;
  const px = settings.pans && settings.pans[i] ? settings.pans[i][0] : 0;
  const py = settings.pans && settings.pans[i] ? settings.pans[i][1] : 0;
  return { zoom: z, panX: px, panY: py };
}

function photoFor(settings, i) {
  // One photo may fill several panels; slots cycle when fewer photos exist.
  if (!settings.photos || settings.photos.length === 0) return null;
  return settings.photos[i % settings.photos.length];
}

// Render the cover described by `settings` onto `canvas`.
// settings: { layout, grade, title, subtitle, badge, heat, photos,
//             zooms[], pans[[x,y]...], width, height }
export async function renderCover(canvas, settings) {
  const w = settings.width;
  const h = settings.height;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const grade = gradeByKey(settings.grade);
  const rng = rngFromString(seedOf(settings));
  const m = Math.round(Math.min(w, h) * 0.03); // outer margin
  const gap = Math.round(Math.min(w, h) * 0.02);

  drawSky(ctx, w, h, grade, rng);

  if (settings.layout === "bleed") {
    // One photo edge to edge, skyline and words over it.
    const p = panelSettings(settings, 0);
    const img = photoFor(settings, 0);
    if (img) {
      drawPhotoCover(ctx, img, 0, 0, w, h, p.zoom, p.panX, p.panY);
      ctx.fillStyle = grade.wash;
      ctx.fillRect(0, 0, w, h);
    }
    drawSkyline(ctx, w, h, grade, rng, h * 0.78);
    drawWords(ctx, w, h, settings, grade, {
      x: m, y: h * 0.42, w: w - 2 * m, h: h * 0.3,
    });
  } else if (settings.layout === "four") {
    // Four panels in a grid with a centre VC badge.
    const pw = (w - 2 * m - gap) / 2;
    const ph = (h * 0.62 - gap) / 2;
    const rects = [
      { x: m, y: m, w: pw, h: ph },
      { x: m + pw + gap, y: m, w: pw, h: ph },
      { x: m, y: m + ph + gap, w: pw, h: ph },
      { x: m + pw + gap, y: m + ph + gap, w: pw, h: ph },
    ];
    rects.forEach((r, i) => {
      const p = panelSettings(settings, i);
      drawPanel(ctx, photoFor(settings, i), r, grade, p.zoom, p.panX, p.panY, grade.wash);
    });
    // Centre badge: a circle stamped over the panel seams.
    const cx = w / 2;
    const cy = m + h * 0.31;
    const cr = Math.min(w, h) * 0.085;
    ctx.fillStyle = grade.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = Math.max(2, cr * 0.08);
    ctx.stroke();
    ctx.fillStyle = "#101018";
    ctx.font = `700 ${Math.round(cr * 0.62)}px Anton, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VC", cx, cy + 1);
    drawWords(ctx, w, h, settings, grade, {
      x: m, y: h * 0.66, w: w - 2 * m, h: h * 0.28,
    });
  } else if (settings.layout === "snapshots") {
    // Tilted photo cards scattered over a painted sunset skyline.
    drawSkyline(ctx, w, h, grade, rng, h * 0.62);
    const cardW = w * 0.42;
    const cardH = h * 0.34;
    const spots = [
      { x: w * 0.06, y: h * 0.07, rot: -0.07 },
      { x: w * 0.52, y: h * 0.05, rot: 0.06 },
      { x: w * 0.12, y: h * 0.42, rot: 0.05 },
      { x: w * 0.52, y: h * 0.4, rot: -0.05 },
    ];
    spots.forEach((s, i) => {
      ctx.save();
      ctx.translate(s.x + cardW / 2, s.y + cardH / 2);
      ctx.rotate(s.rot);
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#fdf6e3";
      ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
      ctx.restore();
      ctx.save();
      ctx.translate(s.x + cardW / 2, s.y + cardH / 2);
      ctx.rotate(s.rot);
      const inner = {
        x: -cardW / 2 + cardW * 0.04,
        y: -cardH / 2 + cardH * 0.05,
        w: cardW * 0.92,
        h: cardH * 0.78,
      };
      const p = panelSettings(settings, i);
      const img = photoFor(settings, i);
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(inner.x, inner.y, inner.w, inner.h);
        ctx.clip();
        const scale = Math.max(inner.w / img.naturalWidth, inner.h / img.naturalHeight) * p.zoom;
        ctx.drawImage(
          img,
          inner.x + (inner.w - img.naturalWidth * scale) / 2 + p.panX * inner.w * 0.2,
          inner.y + (inner.h - img.naturalHeight * scale) / 2 + p.panY * inner.h * 0.2,
          img.naturalWidth * scale,
          img.naturalHeight * scale,
        );
        ctx.restore();
      }
      ctx.fillStyle = grade.wash;
      ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
      ctx.restore();
    });
    drawWords(ctx, w, h, settings, grade, {
      x: m, y: h * 0.78, w: w - 2 * m, h: h * 0.18,
    });
  } else {
    // hero3 (default): one big hero panel, three small panels beneath.
    const heroH = h * 0.58;
    const stripH = h * 0.2;
    const stripW = (w - 2 * m - 2 * gap) / 3;
    const hero = { x: m, y: m, w: w - 2 * m, h: heroH };
    const p0 = panelSettings(settings, 0);
    drawPanel(ctx, photoFor(settings, 0), hero, grade, p0.zoom, p0.panX, p0.panY, grade.wash);
    for (let i = 0; i < 3; i++) {
      const r = {
        x: m + i * (stripW + gap),
        y: m + heroH + gap,
        w: stripW,
        h: stripH,
      };
      const p = panelSettings(settings, i + 1);
      drawPanel(ctx, photoFor(settings, i + 1), r, grade, p.zoom, p.panX, p.panY, grade.wash);
    }
    drawHalftone(ctx, w, h, grade, rng, m + heroH + gap + stripH + gap * 0.5, h * 0.02);
    drawWords(ctx, w, h, settings, grade, {
      x: m, y: h * 0.82, w: w - 2 * m, h: h * 0.15,
    });
  }

  drawGrain(ctx, w, h, rng);
  drawVignette(ctx, w, h);
  return canvas;
}
