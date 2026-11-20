// Colour grades for Vice Coast Cover Studio.
// One grade repaints the whole cover at once: sky gradient, sun, photo wash
// and lettering gradient all come from the same palette, so a grade change
// never leaves a stray colour behind.

export const GRADES = {
  sunset: {
    label: "Vice Sunset",
    skyTop: "#2b1055",
    skyMid: "#e14e6b",
    skyBot: "#ff9a3d",
    sun: "#ffd166",
    sunGlow: "rgba(255, 157, 61, 0.55)",
    wash: "rgba(255, 122, 61, 0.18)",
    inkTop: "#fff3c4",
    inkBot: "#ff7a3d",
    accent: "#ff5e7a",
    panelLine: "rgba(255, 255, 255, 0.85)",
  },
  neon: {
    label: "Neon Night",
    skyTop: "#05001f",
    skyMid: "#3b0f6e",
    skyBot: "#0f2a5e",
    sun: "#ff2e88",
    sunGlow: "rgba(255, 46, 136, 0.5)",
    wash: "rgba(64, 224, 255, 0.14)",
    inkTop: "#b8fff1",
    inkBot: "#ff2e88",
    accent: "#00e5ff",
    panelLine: "rgba(0, 229, 255, 0.9)",
  },
  gold: {
    label: "Palm Gold",
    skyTop: "#3a1c00",
    skyMid: "#c97b1e",
    skyBot: "#ffd97a",
    sun: "#fff1b8",
    sunGlow: "rgba(255, 201, 60, 0.55)",
    wash: "rgba(255, 190, 60, 0.16)",
    inkTop: "#fffbe6",
    inkBot: "#e8a100",
    accent: "#7a4a00",
    panelLine: "rgba(255, 246, 214, 0.9)",
  },
  teal: {
    label: "Teal Dusk",
    skyTop: "#062a33",
    skyMid: "#0f766e",
    skyBot: "#f2a65a",
    sun: "#ffe3a3",
    sunGlow: "rgba(242, 166, 90, 0.5)",
    wash: "rgba(20, 184, 166, 0.16)",
    inkTop: "#e6fffa",
    inkBot: "#0d9488",
    accent: "#f2a65a",
    panelLine: "rgba(230, 255, 250, 0.9)",
  },
  noir: {
    label: "Noir",
    skyTop: "#0a0a0c",
    skyMid: "#3a3a44",
    skyBot: "#8a8a96",
    sun: "#e8e8ec",
    sunGlow: "rgba(200, 200, 210, 0.4)",
    wash: "rgba(120, 120, 140, 0.2)",
    inkTop: "#ffffff",
    inkBot: "#9a9aa8",
    accent: "#e8e8ec",
    panelLine: "rgba(255, 255, 255, 0.9)",
  },
};

export const GRADE_KEYS = Object.keys(GRADES);

export function gradeByKey(key) {
  return GRADES[key] || GRADES.sunset;
}
