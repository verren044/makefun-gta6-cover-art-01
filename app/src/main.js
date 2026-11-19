// Vice Coast Cover Studio — editor wiring. Loads photos (local files or the
// bundled samples), keeps one state object, repaints the live preview on every
// change, drags a panel to pan its photo, and exports a PNG at 1080x1080,
// 1080x1350 or 1920x1080. No network: everything is a file under app/.

import { drawCover, defaultState, layoutPanels, LAYOUTS, EXPORT_SIZES } from './cover.js';
import { GRADES, GRADE_IDS } from './grades.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const state = defaultState();
let selectedSlot = 0;
let lastPanels = [];
let drag = null;

const $ = (id) => document.getElementById(id);

function setStatus(text) {
  statusEl.textContent = text;
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

async function loadSample(name) {
  return loadImage(`samples/${name}.jpg`);
}

/** Add a photo to the library and point the selected slot at it. */
function addPhoto(img, label) {
  state.photos.push(img);
  const idx = state.photos.length - 1;
  state.slots[selectedSlot].photo = idx;
  state.slots[selectedSlot].zoom = 1;
  state.slots[selectedSlot].ox = 0;
  state.slots[selectedSlot].oy = 0;
  refreshPhotoLists();
  repaint();
  setStatus(`Loaded ${label} into panel ${selectedSlot + 1}.`);
  return idx;
}

/** Repaint the preview canvas at the chosen export size. */
function repaint() {
  const size = EXPORT_SIZES.find((s) => s.id === $('exportSize').value) || EXPORT_SIZES[0];
  canvas.width = size.w;
  canvas.height = size.h;
  lastPanels = drawCover(canvas, state) || [];
  updateSlotControls();
}

function refreshPhotoLists() {
  document.querySelectorAll('.slot-photo').forEach((sel) => {
    const slotIdx = Number(sel.dataset.slot);
    const current = state.slots[slotIdx].photo;
    sel.innerHTML = '<option value="">— empty —</option>' + state.photos
      .map((img, i) => `<option value="${i}"${i === current ? ' selected' : ''}>Photo ${i + 1} · ${img.alt || 'image'}</option>`)
      .join('');
  });
}

function updateSlotControls() {
  const slot = state.slots[selectedSlot];
  $('panelName').textContent = String(selectedSlot + 1);
  $('zoom').value = slot.zoom;
  $('zoomVal').textContent = `${Math.round(slot.zoom * 100)}%`;
  $('panX').value = Math.round(slot.ox * 100);
  $('panY').value = Math.round(slot.oy * 100);
  document.querySelectorAll('.slot-tab').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.slot) === selectedSlot);
  });
  document.querySelectorAll('.slot-photo').forEach((sel) => {
    sel.value = state.slots[Number(sel.dataset.slot)].photo ?? '';
  });
}

function buildControls() {
  // Layout buttons.
  const layoutBox = $('layouts');
  Object.entries(LAYOUTS).forEach(([id, label]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = label;
    btn.dataset.layout = id;
    btn.addEventListener('click', () => {
      state.layout = id;
      document.querySelectorAll('#layouts .chip').forEach((b) => b.classList.toggle('active', b === btn));
      repaint();
    });
    if (id === state.layout) btn.classList.add('active');
    layoutBox.appendChild(btn);
  });
  // Grade swatches.
  const gradeBox = $('grades');
  GRADE_IDS.forEach((id) => {
    const g = GRADES[id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.textContent = g.label;
    btn.style.setProperty('--sw1', g.sky[1]);
    btn.style.setProperty('--sw2', g.sky[3]);
    btn.dataset.grade = id;
    btn.addEventListener('click', () => {
      state.grade = id;
      document.querySelectorAll('#grades .swatch').forEach((b) => b.classList.toggle('active', b === btn));
      repaint();
    });
    if (id === state.grade) btn.classList.add('active');
    gradeBox.appendChild(btn);
  });
  // Export sizes.
  const sizeSel = $('exportSize');
  EXPORT_SIZES.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.label;
    sizeSel.appendChild(opt);
  });
  sizeSel.addEventListener('change', repaint);
  // Slot tabs + per-slot photo pickers.
  const slotTabs = $('slotTabs');
  const slotPickers = $('slotPickers');
  for (let i = 0; i < 4; i++) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'slot-tab';
    tab.dataset.slot = i;
    tab.textContent = `Panel ${i + 1}`;
    tab.addEventListener('click', () => {
      selectedSlot = i;
      updateSlotControls();
    });
    slotTabs.appendChild(tab);
    const row = document.createElement('label');
    row.className = 'slot-row';
    row.innerHTML = `<span>Panel ${i + 1}</span>`;
    const sel = document.createElement('select');
    sel.className = 'slot-photo';
    sel.dataset.slot = i;
    sel.addEventListener('change', () => {
      state.slots[i].photo = sel.value === '' ? null : Number(sel.value);
      repaint();
    });
    row.appendChild(sel);
    slotPickers.appendChild(row);
  }
  // Text fields.
  $('title').addEventListener('input', (e) => { state.title = e.target.value; repaint(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; repaint(); });
  $('badge').addEventListener('input', (e) => { state.badge = e.target.value; repaint(); });
  $('heat').addEventListener('input', (e) => {
    state.heat = Number(e.target.value);
    $('heatVal').textContent = `${state.heat} / 5`;
    repaint();
  });
  // Zoom + pan sliders for the selected panel.
  $('zoom').addEventListener('input', (e) => {
    state.slots[selectedSlot].zoom = Number(e.target.value);
    repaint();
  });
  $('panX').addEventListener('input', (e) => {
    state.slots[selectedSlot].ox = Number(e.target.value) / 100;
    repaint();
  });
  $('panY').addEventListener('input', (e) => {
    state.slots[selectedSlot].oy = Number(e.target.value) / 100;
    repaint();
  });
  // Photo uploads.
  $('photoFiles').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      try {
        const img = await loadImage(URL.createObjectURL(file));
        img.alt = file.name;
        addPhoto(img, file.name);
      } catch {
        setStatus(`Could not load ${file.name}.`);
      }
    }
    e.target.value = '';
  });
  $('loadSamples').addEventListener('click', async () => {
    for (const name of ['pier', 'boulevard']) {
      try {
        const img = await loadSample(name);
        img.alt = `${name}.jpg (sample)`;
        addPhoto(img, `${name}.jpg`);
      } catch {
        setStatus(`Could not load sample ${name}.jpg.`);
      }
    }
    selectedSlot = 0;
    updateSlotControls();
  });
  // Surprise-me: cycles layout + grade + heat from the current title.
  $('shuffle').addEventListener('click', () => {
    const li = LAYOUTS[state.layout] ? Object.keys(LAYOUTS).indexOf(state.layout) : 0;
    state.layout = Object.keys(LAYOUTS)[(li + 1) % 4];
    const gi = GRADE_IDS.indexOf(state.grade);
    state.grade = GRADE_IDS[(gi + 1) % GRADE_IDS.length];
    state.heat = 1 + ((state.heat + 2) % 5);
    $('heat').value = state.heat;
    $('heatVal').textContent = `${state.heat} / 5`;
    document.querySelectorAll('#layouts .chip').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
    document.querySelectorAll('#grades .swatch').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
    repaint();
    setStatus(`Now showing ${LAYOUTS[state.layout]} in ${GRADES[state.grade].label}.`);
  });
  // Export.
  $('export').addEventListener('click', () => {
    const size = EXPORT_SIZES.find((s) => s.id === $('exportSize').value) || EXPORT_SIZES[0];
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    drawCover(off, state);
    off.toBlob((blob) => {
      if (!blob) {
        setStatus('Export failed.');
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-coast-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setStatus(`Saved vice-coast-${size.w}x${size.h}.png`);
    }, 'image/png');
  });
  // Drag on the preview pans the photo inside the panel under the pointer.
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const hit = lastPanels.find((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
    if (!hit) return;
    selectedSlot = hit.slot;
    const slot = state.slots[hit.slot];
    drag = { slot, startX: e.clientX, startY: e.clientY, ox: slot.ox, oy: slot.oy, w: hit.w, h: hit.h, rect };
    canvas.setPointerCapture(e.pointerId);
    updateSlotControls();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = ((e.clientX - drag.startX) / drag.rect.width) * canvas.width;
    const dy = ((e.clientY - drag.startY) / drag.rect.height) * canvas.height;
    drag.slot.ox = Math.max(-0.5, Math.min(0.5, drag.ox + dx / drag.w));
    drag.slot.oy = Math.max(-0.5, Math.min(0.5, drag.oy + dy / drag.h));
    repaint();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
}

/** Set up a fixed screenshot scene, then paint it. */
async function applyShot(scene) {
  state.layout = scene.layout;
  state.grade = scene.grade;
  state.title = scene.title;
  state.subtitle = scene.subtitle;
  state.badge = scene.badge;
  state.heat = scene.heat;
  if (scene.size) $('exportSize').value = scene.size;
  $('title').value = scene.title;
  $('subtitle').value = scene.subtitle;
  $('badge').value = scene.badge;
  $('heat').value = scene.heat;
  $('heatVal').textContent = `${scene.heat} / 5`;
  document.querySelectorAll('#layouts .chip').forEach((b) => b.classList.toggle('active', b.dataset.layout === scene.layout));
  document.querySelectorAll('#grades .swatch').forEach((b) => b.classList.toggle('active', b.dataset.grade === scene.grade));
  const pier = await loadSample('pier');
  pier.alt = 'pier.jpg (sample)';
  const blvd = await loadSample('boulevard');
  blvd.alt = 'boulevard.jpg (sample)';
  state.photos = [pier, blvd];
  state.slots = [
    { photo: 0, zoom: 1.0, ox: 0, oy: 0 },
    { photo: 1, zoom: 1.0, ox: 0, oy: 0 },
    { photo: 0, zoom: 1.35, ox: 0.08, oy: -0.05 },
    { photo: 1, zoom: 1.5, ox: -0.1, oy: 0.06 },
  ];
  refreshPhotoLists();
  repaint();
}

buildControls();
refreshPhotoLists();

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, applyShot).catch((err) => setStatus(`Shot failed: ${err.message}`));
} else {
  // First paint: load the samples so the editor opens with a cover, not a blank.
  loadSample('pier').then((pier) => {
    pier.alt = 'pier.jpg (sample)';
    return loadSample('boulevard').then((blvd) => {
      blvd.alt = 'boulevard.jpg (sample)';
      state.photos = [pier, blvd];
      refreshPhotoLists();
      repaint();
      setStatus('Sample photos loaded. Add your own photos to replace them.');
    });
  }).catch(() => {
    repaint();
    setStatus('Samples failed to load — add a photo to begin.');
  });
}
