// The five colour grades of Vice Coast Cover Studio. Each grade is a full
// palette: sky gradient, sun, wash tint, ink and accent, so a grade change
// repaints the skyline, the lettering gradient and the photo wash together.

export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    sky: ['#2b1055', '#7597de', '#ff6a3d', '#ffb347'],
    sun: '#ffd76a',
    sunGlow: 'rgba(255, 190, 90, 0.55)',
    wash: ['rgba(255, 94, 120, 0.28)', 'rgba(255, 140, 66, 0.20)'],
    tint: '#ff5e78',
    ink: '#1c0b2e',
    accent: '#ffcf3f',
    band: '#ff2e88',
    stars: false,
  },
  neon: {
    label: 'Neon Night',
    sky: ['#070418', '#1c0b3d', '#5b1a8a', '#ff2e88'],
    sun: '#ff9de2',
    sunGlow: 'rgba(255, 46, 136, 0.55)',
    wash: ['rgba(0, 229, 255, 0.22)', 'rgba(255, 46, 136, 0.30)'],
    tint: '#00e5ff',
    ink: '#0a0618',
    accent: '#00e5ff',
    band: '#00e5ff',
    stars: true,
  },
  gold: {
    label: 'Palm Gold',
    sky: ['#3a2405', '#8a5a13', '#e8a93d', '#ffe9a8'],
    sun: '#fff3c4',
    sunGlow: 'rgba(255, 220, 120, 0.6)',
    wash: ['rgba(255, 190, 60, 0.26)', 'rgba(180, 110, 20, 0.22)'],
    tint: '#ffb52e',
    ink: '#2a1a05',
    accent: '#fff3c4',
    band: '#c98a1b',
    stars: false,
  },
  teal: {
    label: 'Teal Dusk',
    sky: ['#04222b', '#0b4a5a', '#0f766e', '#f59e0b'],
    sun: '#ffd9a0',
    sunGlow: 'rgba(245, 158, 11, 0.5)',
    wash: ['rgba(15, 118, 110, 0.30)', 'rgba(245, 158, 11, 0.20)'],
    tint: '#2dd4bf',
    ink: '#04222b',
    accent: '#f59e0b',
    band: '#2dd4bf',
    stars: true,
  },
  noir: {
    label: 'Noir',
    sky: ['#0a0a0a', '#262626', '#5a5a5a', '#bdbdbd'],
    sun: '#f5f5f5',
    sunGlow: 'rgba(255, 255, 255, 0.35)',
    wash: ['rgba(255, 255, 255, 0.10)', 'rgba(0, 0, 0, 0.34)'],
    tint: '#e5e5e5',
    ink: '#0a0a0a',
    accent: '#ffffff',
    band: '#737373',
    stars: false,
  },
};

export const GRADE_IDS = Object.keys(GRADES);
