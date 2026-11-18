/**
 * One keyframe per chapter. The stage interpolates between neighbours based on
 * scroll position. `xFrac` is a fraction of the visible half-width, so the form
 * keeps its composition on any aspect ratio (and is mirrored in RTL).
 */
export const CHAPTER_KEYS = [
  // 00 — Seed (intro)
  {
    xFrac: 0, y: 0.05, scale: 1.0, noiseAmp: 0.16, noiseFreq: 1.15,
    crystal: 0, torus: 0, twist: 0, facet: 0, rotX: 0.15, spin: 0.12,
    rings: 1, dust: 1.0, glow: 1.0,
  },
  // 01 — Liquid (about)
  {
    xFrac: 0.48, y: 0, scale: 0.9, noiseAmp: 0.34, noiseFreq: 1.55,
    crystal: 0, torus: 0, twist: 0.9, facet: 0, rotX: 0.1, spin: 0.2,
    rings: 0.55, dust: 1.15, glow: 0.85,
  },
  // 02 — Crystal (craft)
  {
    xFrac: -0.5, y: 0, scale: 0.86, noiseAmp: 0.05, noiseFreq: 2.2,
    crystal: 1, torus: 0, twist: 0, facet: 0.9, rotX: 0.35, spin: 0.24,
    rings: 0.8, dust: 1.3, glow: 0.9,
  },
  // 03 — Portal (works)
  {
    xFrac: 0, y: 0.05, scale: 1.3, noiseAmp: 0.1, noiseFreq: 1.35,
    crystal: 0, torus: 1, twist: 0, facet: 0, rotX: 1.3, spin: 0.16,
    rings: 0.15, dust: 1.7, glow: 0.7,
  },
  // 04 — Return (contact)
  {
    xFrac: 0, y: 1.55, scale: 0.36, noiseAmp: 0.18, noiseFreq: 1.1,
    crystal: 0, torus: 0, twist: 0, facet: 0, rotX: 0.15, spin: 0.1,
    rings: 1, dust: 0.8, glow: 1.2,
  },
];

export const PALETTES = {
  dark: {
    bgTop: "#121212",
    bgBottom: "#070908",
    glowA: "#52d379",
    glowB: "#edff20",
    grid: "#a4ff91",
    gridAlpha: 0.06,
    glowStrength: 0.2,
    deep: "#030905",
    main: "#52d379",
    glow: "#a4ff91",
    accent: "#edff20",
    sheen: "#e4ffe9",
    dustA: "#a4ff91",
    dustB: "#edff20",
    dustOpacity: 0.9,
    ring: "#a4ff91",
    ringOpacity: 0.3,
    bloomStrength: 0.85,
    bloomRadius: 0.55,
    bloomThreshold: 0.6,
    grain: 0.05,
    vignette: 0.55,
    dark: 1,
  },
  light: {
    bgTop: "#f2f4f2",
    bgBottom: "#d4dad6",
    glowA: "#52d379",
    glowB: "#c8e000",
    grid: "#4c7753",
    gridAlpha: 0.1,
    glowStrength: 0.16,
    deep: "#132a19",
    main: "#4c7753",
    glow: "#86dc94",
    accent: "#a9c400",
    sheen: "#ffffff",
    dustA: "#4c7753",
    dustB: "#2c5434",
    dustOpacity: 0.6,
    ring: "#4c7753",
    ringOpacity: 0.4,
    bloomStrength: 0.2,
    bloomRadius: 0.4,
    bloomThreshold: 0.96,
    grain: 0.03,
    vignette: 0.14,
    dark: 0,
  },
};

export const COLOR_KEYS = [
  "bgTop", "bgBottom", "glowA", "glowB", "grid", "deep", "main", "glow",
  "accent", "sheen", "dustA", "dustB", "ring",
];

export const NUMBER_KEYS = [
  "gridAlpha", "glowStrength", "dustOpacity", "ringOpacity", "bloomStrength",
  "bloomRadius", "bloomThreshold", "grain", "vignette", "dark",
];
