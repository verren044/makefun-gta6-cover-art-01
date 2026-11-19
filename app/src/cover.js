// Vice Coast cover renderer: paints one cover onto a canvas at any size.
// Layouts: hero (big panel + 3-strip), four (2x2 grid + centre VC badge),
// bleed (one photo full-bleed), snap (tilted snapshots over a painted skyline).
// Everything random-looking comes from a seeded stream (see prng.js), so a
// cover repaints byte-identically from the same state.

import { GRADES } from './grades.js';
import { coverSeed, mulberry32 } from './prng.js';

export const LAYOUTS = {
  hero: 'Hero + 3 Strip',
  four: 'Four Panel',
  bleed: 'Full Bleed',
  snap: 'Snapshots',
};

export const EXPORT_SIZES = [
  { id: '1080x1080', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
];

/** Blank cover state: two sample photos in slots 0 and 1, the rest empty. */
export function defaultState() {
  return {
    layout: 'hero',
    grade: 'sunset',
    title: 'VICE COAST',
    subtitle: 'Sunset Heist',
    badge: 'VICE CITY',
    heat: 4,
    photos: [],
    slots: [
      { photo: 0, zoom: 1.0, ox: 0, oy: 0 },
      { photo: 1, zoom: 1.0, ox: 0, oy: 0 },
      { photo: 0, zoom: 1.35, ox: 0.08, oy: -0.05 },
      { photo: 1, zoom: 1.5, ox: -0.1, oy: 0.06 },
    ],
  };
}

/** Panel rectangles (in cover pixels) for a layout, with their slot index. */
export function layoutPanels(state, width, height) {
  const pad = Math.round(width * 0.028);
  const gap = Math.round(width * 0.016);
  if (state.layout === 'four') {
    // Grid reserves the foot for the title strip.
    const gridH = height * 0.8;
    const cw = (width - pad * 2 - gap) / 2;
    const ch = (gridH - pad - gap) / 2;
    return [
      { slot: 0, x: pad, y: pad, w: cw, h: ch, tilt: 0 },
      { slot: 1, x: pad + cw + gap, y: pad, w: cw, h: ch, tilt: 0 },
      { slot: 2, x: pad, y: pad + ch + gap, w: cw, h: ch, tilt: 0 },
      { slot: 3, x: pad + cw + gap, y: pad + ch + gap, w: cw, h: ch, tilt: 0 },
    ];
  }
  if (state.layout === 'bleed') {
    return [{ slot: 0, x: 0, y: 0, w: width, h: height, tilt: 0 }];
  }
  if (state.layout === 'snap') {
    const pw = width * 0.42;
    const ph = height * 0.34;
    return [
      { slot: 0, x: width * 0.07, y: height * 0.30, w: pw, h: ph, tilt: -0.10 },
      { slot: 1, x: width * 0.51, y: height * 0.24, w: pw, h: ph, tilt: 0.06 },
      { slot: 2, x: width * 0.28, y: height * 0.56, w: pw, h: ph, tilt: -0.03 },
    ];
  }
  // hero: one tall panel, then a strip of three; the title sits below the strip.
  const topH = height * 0.54;
  const stripY = pad + topH + gap;
  const stripH = height * 0.17;
  const sw = (width - pad * 2 - gap * 2) / 3;
  return [
    { slot: 0, x: pad, y: pad, w: width - pad * 2, h: topH, tilt: 0 },
    { slot: 1, x: pad, y: stripY, w: sw, h: stripH, tilt: 0 },
    { slot: 2, x: pad + sw + gap, y: stripY, w: sw, h: stripH, tilt: 0 },
    { slot: 3, x: pad + (sw + gap) * 2, y: stripY, w: sw, h: stripH, tilt: 0 },
  ];
}

/** Cover-fit draw of one photo into a rect, honouring zoom and pan offsets. */
function drawPhotoInto(ctx, img, rect, slot, grade) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(rect.w / iw, rect.h / ih) * slot.zoom;
  const pw = iw * base;
  const ph = ih * base;
  const cx = rect.x + rect.w / 2 + slot.ox * rect.w;
  const cy = rect.y + rect.h / 2 + slot.oy * rect.h;
  ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
  // Grade wash: two soft colour passes so photos read as one poster.
  const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(1, grade.wash[1]);
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

/** Empty panel: painted sky gradient, a palm and a "load a photo" note. */
function drawEmptyPanel(ctx, rect, grade, rng) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  g.addColorStop(0, grade.sky[1]);
  g.addColorStop(1, grade.sky[3]);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  drawPalm(ctx, rect.x + rect.w * 0.78, rect.y + rect.h * 0.92, rect.h * 0.5, grade.ink, rng);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `700 ${Math.max(12, rect.h * 0.07)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h * 0.52);
}

/** One palm silhouette: curved trunk plus seven fronds. */
function drawPalm(ctx, x, baseY, size, color, rng) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + size * 0.12, baseY - size * 0.55, x + size * 0.05, baseY - size);
  ctx.stroke();
  const topX = x + size * 0.05;
  const topY = baseY - size;
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI * (0.08 + i * 0.14)) + (rng() - 0.5) * 0.08;
    const len = size * (0.42 + rng() * 0.12);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.6, topY + Math.sin(a) * len * 0.5 + size * 0.1,
      topX + Math.cos(a) * len, topY + Math.sin(a) * len + size * 0.22,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/** Painted sunset skyline: gradient sky, glowing sun, two building layers. */
function drawSkyline(ctx, width, height, grade, rng) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  grade.sky.forEach((c, i) => sky.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  if (grade.stars) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 70; i++) {
      const sx = rng() * width;
      const sy = rng() * height * 0.35;
      const r = 0.6 + rng() * 1.6;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Sun with halo, low over the horizon.
  const sunX = width * 0.68;
  const sunY = height * 0.42;
  const sunR = Math.min(width, height) * 0.11;
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.6);
  glow.addColorStop(0, grade.sunGlow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - sunR * 3, sunY - sunR * 3, sunR * 6, sunR * 6);
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  // Far buildings, then near ones, both silhouettes.
  const horizon = height * 0.72;
  ctx.fillStyle = grade.ink;
  ctx.globalAlpha = 0.55;
  let bx = 0;
  while (bx < width) {
    const bw = width * (0.05 + rng() * 0.08);
    const bh = height * (0.08 + rng() * 0.16);
    ctx.fillRect(bx, horizon - bh, bw, bh);
    bx += bw + width * 0.012;
  }
  ctx.globalAlpha = 0.92;
  bx = -width * 0.02;
  while (bx < width) {
    const bw = width * (0.07 + rng() * 0.09);
    const bh = height * (0.05 + rng() * 0.13);
    ctx.fillRect(bx, horizon - bh + height * 0.04, bw, bh + height * 0.1);
    // Lit windows on the near layer.
    ctx.fillStyle = grade.accent;
    const lit = 2 + Math.floor(rng() * 4);
    for (let k = 0; k < lit; k++) {
      ctx.fillRect(bx + rng() * bw * 0.8, horizon - bh + height * 0.04 + rng() * bh * 0.7, 3, 4);
    }
    ctx.fillStyle = grade.ink;
    bx += bw + width * 0.02;
  }
  ctx.globalAlpha = 1;
  // Palms along the horizon.
  for (let i = 0; i < 4; i++) {
    drawPalm(ctx, width * (0.08 + i * 0.24 + rng() * 0.05), horizon + height * 0.1, height * 0.09, grade.ink, rng);
  }
  ctx.fillStyle = grade.ink;
  ctx.fillRect(0, horizon + height * 0.1, width, height - horizon - height * 0.1);
}

/** Halftone dot band: dot radius grows left to right, seeded. */
function drawHalftoneBand(ctx, x, y, w, h, color, rng) {
  ctx.fillStyle = color;
  const step = Math.max(6, h * 0.9);
  for (let px = x + step / 2; px < x + w; px += step) {
    const t = (px - x) / w;
    const r = (h * 0.12 + t * h * 0.36) * (0.85 + rng() * 0.3);
    ctx.beginPath();
    ctx.arc(px, y + h / 2, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Five-star heat meter inside a pill. */
function drawHeatMeter(ctx, x, y, size, heat, grade) {
  const pillW = size * 7.2;
  const pillH = size * 1.5;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = grade.accent;
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('HEAT', x + size * 0.5, y + pillH / 2 + 1);
  for (let i = 0; i < 5; i++) {
    const cx = x + size * 2.35 + i * size * 0.88;
    const cy = y + pillH / 2;
    drawStar(ctx, cx, cy, size * 0.42, size * 0.18, i < heat ? grade.accent : 'rgba(255,255,255,0.25)');
  }
  return pillW;
}

function drawStar(ctx, cx, cy, outer, inner, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Title block: badge pill, Anton title with sunset gradient, Pacifico subtitle.
 *  The title size is capped by the vertical room left below `y`, so the block
 *  never runs off the foot of a wide or short cover. */
function drawTitleBlock(ctx, state, grade, x, y, w, s, rng, canvasHeight) {
  const title = (state.title || 'VICE COAST').toUpperCase();
  // Badge pill.
  ctx.font = `700 ${Math.round(15 * s)}px system-ui, sans-serif`;
  const badgeText = `★ ${state.badge || 'VICE CITY'} ★`;
  const badgeW = ctx.measureText(badgeText).width + 34 * s;
  ctx.fillStyle = grade.accent;
  roundRect(ctx, x, y, badgeW, 30 * s, 15 * s);
  ctx.fill();
  ctx.fillStyle = grade.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, x + 17 * s, y + 15 * s + 1);
  // Title: fit to width, gradient fill, dark outline.
  let size = Math.min(92 * s, (canvasHeight - y) * 0.4);
  ctx.font = `${size}px Anton, sans-serif`;
  while (ctx.measureText(title).width > w && size > 18) {
    size -= 2;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  const titleY = y + 30 * s + size * 0.98;
  const grad = ctx.createLinearGradient(x, titleY - size, x, titleY);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.45, grade.sun);
  grad.addColorStop(1, grade.tint);
  ctx.lineWidth = Math.max(2, size * 0.07);
  ctx.strokeStyle = grade.ink;
  ctx.lineJoin = 'round';
  ctx.strokeText(title, x, titleY);
  ctx.fillStyle = grad;
  ctx.fillText(title, x, titleY);
  // Subtitle in script, halftone band underneath. The script's tall ascenders
  // need a clear gap below the title's baseline.
  const subY = titleY + size * 0.62;
  ctx.font = `${Math.round(34 * s)}px Pacifico, cursive`;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 8 * s;
  ctx.fillText(state.subtitle || '', x + 4 * s, subY);
  ctx.shadowBlur = 0;
  drawHalftoneBand(ctx, x, subY + 16 * s, w * 0.62, 14 * s, grade.band, rng);
  drawHeatMeter(ctx, x + w * 0.66, subY - 4 * s, 15 * s, state.heat, grade);
}

/** Film grain: seeded speckles; vignette: darkened corners. */
function drawGrainAndVignette(ctx, width, height, rng) {
  ctx.save();
  const count = Math.floor((width * height) / 900);
  for (let i = 0; i < count; i++) {
    const v = rng();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(rng() * width, rng() * height, 1.4, 1.4);
  }
  ctx.restore();
  const vig = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
}

/** Paint the whole cover onto `canvas` (its own width/height) from `state`. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const s = Math.min(width, height) / 1080;
  const rng = mulberry32(coverSeed(state, width, height));
  const pad = Math.round(width * 0.028);

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  // Backdrop: painted skyline for the snapshots layout; deep ink for the
  // others, so the panel grid reads clean (a skyline behind the hero strip
  // would show as a stray band between the panels).
  if (state.layout === 'snap') {
    drawSkyline(ctx, width, height, grade, rng);
  } else {
    ctx.fillStyle = grade.ink;
    ctx.fillRect(0, 0, width, height);
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    grade.sky.forEach((c, i) => sky.addColorStop(i / (grade.sky.length - 1), c));
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height * 0.5);
    ctx.globalAlpha = 1;
  }

  const panels = layoutPanels(state, width, height);
  for (const rect of panels) {
    const slot = state.slots[rect.slot];
    const photo = slot && slot.photo != null ? state.photos[slot.photo] : null;
    // Move into the panel's own space: photos, clip and frame all draw at 0,0.
    const place = (c) => {
      if (rect.tilt) {
        c.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
        c.rotate(rect.tilt);
        c.translate(-rect.w / 2, -rect.h / 2);
      } else {
        c.translate(rect.x, rect.y);
      }
    };
    ctx.save();
    place(ctx);
    // Snapshot white border + drop shadow.
    if (state.layout === 'snap') {
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 22 * s;
      ctx.shadowOffsetY = 10 * s;
      ctx.fillStyle = '#fdf8ef';
      ctx.fillRect(-10 * s, -10 * s, rect.w + 20 * s, rect.h + 34 * s);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
    ctx.beginPath();
    ctx.rect(0, 0, rect.w, rect.h);
    ctx.clip();
    if (photo) drawPhotoInto(ctx, photo, { x: 0, y: 0, w: rect.w, h: rect.h }, slot, grade);
    else drawEmptyPanel(ctx, { x: 0, y: 0, w: rect.w, h: rect.h }, grade, rng);
    ctx.restore();
    // Crisp panel frame.
    ctx.save();
    place(ctx);
    ctx.lineWidth = Math.max(2, 4 * s);
    ctx.strokeStyle = state.layout === 'snap' ? '#fdf8ef' : grade.ink;
    ctx.strokeRect(0, 0, rect.w, rect.h);
    ctx.restore();
  }

  if (state.layout === 'four') {
    // Centre VC badge overlapping the four panels (grid centre, above the title strip).
    const cx = width / 2;
    const cy = height * 0.4;
    const r = width * 0.115;
    ctx.fillStyle = grade.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = Math.max(3, 5 * s);
    ctx.strokeStyle = grade.ink;
    ctx.stroke();
    ctx.fillStyle = grade.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(r * 0.62)}px Anton, sans-serif`;
    ctx.fillText('VC', cx, cy - r * 0.14);
    ctx.font = `700 ${Math.round(r * 0.2)}px system-ui, sans-serif`;
    ctx.fillText(state.badge || 'VICE CITY', cx, cy + r * 0.42);
    ctx.textBaseline = 'alphabetic';
  }

  if (state.layout === 'bleed') {
    // Scrim so the title stays readable over the photo.
    const scrim = ctx.createLinearGradient(0, height * 0.45, 0, height);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, width, height);
    drawTitleBlock(ctx, state, grade, pad, height * 0.68, width - pad * 2, s, rng, height);
  } else if (state.layout === 'snap') {
    drawTitleBlock(ctx, state, grade, pad, height * 0.045, width - pad * 2, s, rng, height);
  } else if (state.layout === 'hero') {
    const gap = Math.round(width * 0.016);
    const heroTitleY = pad + height * 0.54 + gap + height * 0.17 + 10 * s;
    drawTitleBlock(ctx, state, grade, pad, heroTitleY, width - pad * 2, s, rng, height);
  } else {
    // four: title strip along the foot, below the grid.
    ctx.fillStyle = grade.ink;
    ctx.fillRect(0, height * 0.83, width, height * 0.17);
    drawTitleBlock(ctx, state, grade, pad, height * 0.845, width - pad * 2, s * 0.78, rng, height);
  }

  drawGrainAndVignette(ctx, width, height, rng);
  ctx.restore();
  return panels;
}
