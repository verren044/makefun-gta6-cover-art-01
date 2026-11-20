// Editor wiring for Vice Coast Cover Studio.
// Owns the state, the controls, drag-to-pan on the preview, sample loading
// and PNG export. All photos stay on the user's machine: file input reads
// via FileReader, samples load from the app folder, nothing is uploaded.

import { renderCover } from "./cover.js";
import { GRADES, GRADE_KEYS } from "./grades.js";

const DEFAULTS = {
  layout: "hero3",
  grade: "sunset",
  title: "VICE COAST",
  subtitle: "Sunset Boulevard",
  badge: "VICE CITY",
  heat: 5,
  zooms: [1, 1, 1, 1],
  pans: [[0, 0], [0, 0], [0, 0], [0, 0]],
};

const state = {
  ...DEFAULTS,
  photos: [],
  selectedPanel: 0,
};

const $ = (id) => document.getElementById(id);

function currentSettings(width, height) {
  return {
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
    badge: state.badge,
    heat: state.heat,
    photos: state.photos,
    zooms: state.zooms,
    pans: state.pans,
    width,
    height,
  };
}

async function renderPreview() {
  const canvas = $("preview");
  await renderCover(canvas, currentSettings(960, 540));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("could not load image"));
    img.src = src;
  });
}

async function addPhotoFromDataUrl(dataUrl) {
  const img = await loadImage(dataUrl);
  state.photos.push(img);
  if (state.photos.length > 4) state.photos.shift();
  await renderPreview();
}

function bindControls() {
  $("file-input").addEventListener("change", async (ev) => {
    const files = Array.from(ev.target.files || []).slice(0, 4);
    for (const file of files) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      await addPhotoFromDataUrl(dataUrl);
    }
    ev.target.value = "";
  });

  document.querySelectorAll("[data-sample]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const img = await loadImage(btn.dataset.sample);
      state.photos.push(img);
      if (state.photos.length > 4) state.photos.shift();
      await renderPreview();
    });
  });

  document.querySelectorAll("[data-layout]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      state.layout = btn.dataset.layout;
      document.querySelectorAll("[data-layout]").forEach((b) =>
        b.classList.toggle("active", b === btn),
      );
      await renderPreview();
    });
  });

  document.querySelectorAll("[data-grade]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      state.grade = btn.dataset.grade;
      document.querySelectorAll("[data-grade]").forEach((b) =>
        b.classList.toggle("active", b === btn),
      );
      await renderPreview();
    });
  });

  $("title-input").addEventListener("input", async (ev) => {
    state.title = ev.target.value.toUpperCase() || "VICE COAST";
    await renderPreview();
  });
  $("subtitle-input").addEventListener("input", async (ev) => {
    state.subtitle = ev.target.value || "Sunset Boulevard";
    await renderPreview();
  });
  $("badge-input").addEventListener("input", async (ev) => {
    state.badge = ev.target.value.toUpperCase() || "VICE CITY";
    await renderPreview();
  });
  $("heat-input").addEventListener("input", async (ev) => {
    state.heat = Number(ev.target.value);
    await renderPreview();
  });
  $("panel-input").addEventListener("input", (ev) => {
    state.selectedPanel = Number(ev.target.value);
    syncSliders();
  });
  $("zoom-input").addEventListener("input", async (ev) => {
    state.zooms[state.selectedPanel] = Number(ev.target.value);
    await renderPreview();
  });
  $("panx-input").addEventListener("input", async (ev) => {
    state.pans[state.selectedPanel][0] = Number(ev.target.value);
    await renderPreview();
  });
  $("pany-input").addEventListener("input", async (ev) => {
    state.pans[state.selectedPanel][1] = Number(ev.target.value);
    await renderPreview();
  });

  document.querySelectorAll("[data-export]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const [w, h] = btn.dataset.export.split("x").map(Number);
      await exportPNG(w, h);
    });
  });

  // Drag on the preview pans the selected panel's photo.
  const canvas = $("preview");
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener("pointerdown", (ev) => {
    dragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener("pointermove", async (ev) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const i = state.selectedPanel;
    state.pans[i][0] += ((ev.clientX - lastX) / rect.width) * 2;
    state.pans[i][1] += ((ev.clientY - lastY) / rect.height) * 2;
    state.pans[i][0] = Math.max(-1, Math.min(1, state.pans[i][0]));
    state.pans[i][1] = Math.max(-1, Math.min(1, state.pans[i][1]));
    lastX = ev.clientX;
    lastY = ev.clientY;
    syncSliders();
    await renderPreview();
  });
  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });
}

function syncSliders() {
  const i = state.selectedPanel;
  $("zoom-input").value = String(state.zooms[i]);
  $("panx-input").value = String(state.pans[i][0]);
  $("pany-input").value = String(state.pans[i][1]);
}

async function exportPNG(width, height) {
  const off = document.createElement("canvas");
  await renderCover(off, currentSettings(width, height));
  const blob = await new Promise((resolve) => off.toBlob(resolve, "image/png"));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vice-coast-${width}x${height}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return blob;
}

// Used by the screenshot driver and by shots.js presets: returns a PNG
// data URL for the current settings at the requested size.
async function exportDataUrl(width, height) {
  const off = document.createElement("canvas");
  await renderCover(off, currentSettings(width, height));
  return off.toDataURL("image/png");
}

async function applyPreset(preset) {
  Object.assign(state, {
    layout: preset.layout || state.layout,
    grade: preset.grade || state.grade,
    title: preset.title || state.title,
    subtitle: preset.subtitle || state.subtitle,
    badge: preset.badge || state.badge,
    heat: preset.heat !== undefined ? preset.heat : state.heat,
  });
  state.photos = [];
  for (const src of preset.samples || []) {
    state.photos.push(await loadImage(src));
  }
  document.querySelectorAll("[data-layout]").forEach((b) =>
    b.classList.toggle("active", b.dataset.layout === state.layout),
  );
  document.querySelectorAll("[data-grade]").forEach((b) =>
    b.classList.toggle("active", b.dataset.grade === state.grade),
  );
  $("title-input").value = state.title;
  $("subtitle-input").value = state.subtitle;
  $("badge-input").value = state.badge;
  $("heat-input").value = String(state.heat);
  await renderPreview();
}

window.ViceCoast = {
  state,
  applyPreset,
  exportPNG,
  exportDataUrl,
  renderPreview,
  grades: GRADES,
  gradeKeys: GRADE_KEYS,
};

async function init() {
  bindControls();
  syncSliders();
  try {
    await document.fonts.load('16px Anton');
    await document.fonts.load('16px Pacifico');
  } catch (err) {
    // Fonts fall back to system faces; the cover still renders.
  }
  await renderPreview();
}

init();
