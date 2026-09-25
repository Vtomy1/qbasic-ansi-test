/**
 * Authentic Retro Palettes for MS-DOS, QBasic, and ANSI.SYS
 */

import { DosColor, PaletteType } from '../types/dos';

// Standard MS-DOS / QBasic 16-color text mode palette
// Indexes 0-15 match QBasic COLOR n statements and text attribute byte bits
export const VGA_16_PALETTE: DosColor[] = [
  { index: 0,  name: 'Black',         hex: '#000000', r: 0,   g: 0,   b: 0,   ansiCode: 30 },
  { index: 1,  name: 'Blue',          hex: '#0000AA', r: 0,   g: 0,   b: 170, ansiCode: 34 },
  { index: 2,  name: 'Green',         hex: '#00AA00', r: 0,   g: 170, b: 0,   ansiCode: 32 },
  { index: 3,  name: 'Cyan',          hex: '#00AAAA', r: 0,   g: 170, b: 170, ansiCode: 36 },
  { index: 4,  name: 'Red',           hex: '#AA0000', r: 170, g: 0,   b: 0,   ansiCode: 31 },
  { index: 5,  name: 'Magenta',       hex: '#AA00AA', r: 170, g: 0,   b: 170, ansiCode: 35 },
  { index: 6,  name: 'Brown',         hex: '#AA5500', r: 170, g: 85,  b: 0,   ansiCode: 33 },
  { index: 7,  name: 'Light Gray',    hex: '#AAAAAA', r: 170, g: 170, b: 170, ansiCode: 37 },
  { index: 8,  name: 'Dark Gray',     hex: '#555555', r: 85,  g: 85,  b: 85,  ansiCode: 90 },
  { index: 9,  name: 'Light Blue',    hex: '#5555FF', r: 85,  g: 85,  b: 255, ansiCode: 94 },
  { index: 10, name: 'Light Green',   hex: '#55FF55', r: 85,  g: 255, b: 85,  ansiCode: 92 },
  { index: 11, name: 'Light Cyan',    hex: '#55FFFF', r: 85,  g: 255, b: 255, ansiCode: 96 },
  { index: 12, name: 'Light Red',     hex: '#FF5555', r: 255, g: 85,  b: 85,  ansiCode: 91 },
  { index: 13, name: 'Light Magenta', hex: '#FF55FF', r: 255, g: 85,  b: 255, ansiCode: 95 },
  { index: 14, name: 'Yellow',        hex: '#FFFF55', r: 255, g: 255, b: 85,  ansiCode: 93 },
  { index: 15, name: 'Bright White',  hex: '#FFFFFF', r: 255, g: 255, b: 255, ansiCode: 97 },
];

// CGA Palette 1 (High Intensity): Black, Cyan, Magenta, White
export const CGA_MODE1_PALETTE: DosColor[] = [
  { index: 0, name: 'Black',   hex: '#000000', r: 0,   g: 0,   b: 0,   ansiCode: 30 },
  { index: 1, name: 'Cyan',    hex: '#55FFFF', r: 85,  g: 255, b: 255, ansiCode: 96 },
  { index: 2, name: 'Magenta', hex: '#FF55FF', r: 255, g: 85,  b: 255, ansiCode: 95 },
  { index: 3, name: 'White',   hex: '#FFFFFF', r: 255, g: 255, b: 255, ansiCode: 97 },
];

// CGA Palette 2: Black, Green, Red, Yellow
export const CGA_MODE2_PALETTE: DosColor[] = [
  { index: 0, name: 'Black',  hex: '#000000', r: 0,   g: 0,   b: 0,   ansiCode: 30 },
  { index: 1, name: 'Green',  hex: '#55FF55', r: 85,  g: 255, b: 85,  ansiCode: 92 },
  { index: 2, name: 'Red',    hex: '#FF5555', r: 255, g: 85,  b: 85,  ansiCode: 91 },
  { index: 3, name: 'Yellow', hex: '#FFFF55', r: 255, g: 255, b: 85,  ansiCode: 93 },
];

// Amber Phosphor CRT (P3 phosphor) 16 steps
export const AMBER_CRT_PALETTE: DosColor[] = Array.from({ length: 16 }, (_, i) => {
  const norm = i / 15;
  const r = Math.round(255 * Math.pow(norm, 1.1));
  const g = Math.round(176 * Math.pow(norm, 1.2));
  const b = Math.round(20 * Math.pow(norm, 1.4));
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return {
    index: i,
    name: `Amber Lvl ${i}`,
    hex,
    r,
    g,
    b,
    ansiCode: i < 8 ? 33 : 93,
  };
});

// Green Phosphor CRT (P1 phosphor) 16 steps
export const GREEN_CRT_PALETTE: DosColor[] = Array.from({ length: 16 }, (_, i) => {
  const norm = i / 15;
  const r = Math.round(33 * Math.pow(norm, 1.3));
  const g = Math.round(255 * Math.pow(norm, 1.1));
  const b = Math.round(66 * Math.pow(norm, 1.3));
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return {
    index: i,
    name: `Green Lvl ${i}`,
    hex,
    r,
    g,
    b,
    ansiCode: i < 8 ? 32 : 92,
  };
});

// Commodore 64 Palette (16 colors)
export const C64_PALETTE: DosColor[] = [
  { index: 0,  name: 'Black',        hex: '#000000', r: 0,   g: 0,   b: 0,   ansiCode: 30 },
  { index: 1,  name: 'White',        hex: '#FFFFFF', r: 255, g: 255, b: 255, ansiCode: 97 },
  { index: 2,  name: 'Red',          hex: '#880000', r: 136, g: 0,   b: 0,   ansiCode: 31 },
  { index: 3,  name: 'Cyan',         hex: '#AAFFEE', r: 170, g: 255, b: 238, ansiCode: 96 },
  { index: 4,  name: 'Purple',       hex: '#CC44CC', r: 204, g: 68,  b: 204, ansiCode: 95 },
  { index: 5,  name: 'Green',        hex: '#00CC55', r: 0,   g: 204, b: 85,  ansiCode: 92 },
  { index: 6,  name: 'Blue',         hex: '#0000AA', r: 0,   g: 0,   b: 170, ansiCode: 34 },
  { index: 7,  name: 'Yellow',       hex: '#EEEE77', r: 238, g: 238, b: 119, ansiCode: 93 },
  { index: 8,  name: 'Orange',       hex: '#DD8855', r: 221, g: 136, b: 85,  ansiCode: 33 },
  { index: 9,  name: 'Brown',        hex: '#664400', r: 102, g: 68,  b: 0,   ansiCode: 33 },
  { index: 10, name: 'Light Red',    hex: '#FF7777', r: 255, g: 119, b: 119, ansiCode: 91 },
  { index: 11, name: 'Dark Gray',    hex: '#333333', r: 51,  g: 51,  b: 51,  ansiCode: 90 },
  { index: 12, name: 'Medium Gray',  hex: '#777777', r: 119, g: 119, b: 119, ansiCode: 37 },
  { index: 13, name: 'Light Green',  hex: '#AAFF66', r: 170, g: 255, b: 102, ansiCode: 92 },
  { index: 14, name: 'Light Blue',   hex: '#0088FF', r: 0,   g: 136, b: 255, ansiCode: 94 },
  { index: 15, name: 'Light Gray',   hex: '#BBBBBB', r: 187, g: 187, b: 187, ansiCode: 37 },
];

export function getPalette(type: PaletteType): DosColor[] {
  switch (type) {
    case 'cga-mode1':
      return CGA_MODE1_PALETTE;
    case 'cga-mode2':
      return CGA_MODE2_PALETTE;
    case 'amber-crt':
      return AMBER_CRT_PALETTE;
    case 'green-crt':
      return GREEN_CRT_PALETTE;
    case 'c64-16':
      return C64_PALETTE;
    case 'vga-16':
    default:
      return VGA_16_PALETTE;
  }
}

/**
 * Weighted Euclidean color distance considering human eye sensitivity
 * 30% Red, 59% Green, 11% Blue
 */
export function getColorDistanceSq(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const rMean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  // Improved approximation for RGB perceptual distance (compuphase formula)
  return ((2 + rMean / 256) * dr * dr) +
         (4 * dg * dg) +
         ((2 + (255 - rMean) / 256) * db * db);
}

/**
 * Find the closest palette color index to a given RGB value
 */
export function findClosestColorIndex(
  r: number,
  g: number,
  b: number,
  palette: DosColor[] = VGA_16_PALETTE
): number {
  let minDistance = Infinity;
  let bestIndex = 0;

  for (let i = 0; i < palette.length; i++) {
    const color = palette[i];
    const dist = getColorDistanceSq(r, g, b, color.r, color.g, color.b);
    if (dist < minDistance) {
      minDistance = dist;
      bestIndex = color.index;
    }
  }

  return bestIndex;
}

export function getColorByIndex(index: number, palette: DosColor[] = VGA_16_PALETTE): DosColor {
  const match = palette.find(c => c.index === index);
  return match || palette[0];
}
