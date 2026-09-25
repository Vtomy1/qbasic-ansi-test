/**
 * Image Processing Engine for QBasic ANSI Studio
 * Handles resizing, color corrections, aspect ratio, dithering, and character mode mapping
 */

import { CharacterMode, DitherAlgorithm, DosCell, ImageAdjustments, PaletteType } from '../types/dos';
import { quantizeImageWithDither } from './dithering';
import { getPalette } from './palettes';

// ASCII ramp ordered from darkest to brightest
const ASCII_RAMP = ' .:-=+*#%@';

// CP437 Shading characters
const SHADE_CHARS = [
  { char: ' ', code: 32,  coverage: 0.00 },
  { char: '░', code: 176, coverage: 0.25 },
  { char: '▒', code: 177, coverage: 0.50 },
  { char: '▓', code: 178, coverage: 0.75 },
  { char: '█', code: 219, coverage: 1.00 },
];

/**
 * Apply contrast, brightness, saturation, gamma, and invert to ImageData
 */
function applyAdjustments(
  imageData: ImageData,
  adjustments: ImageAdjustments
): void {
  const { data } = imageData;
  const { brightness, contrast, saturation, gamma, invert } = adjustments;

  // Pre-calculate adjustment factors
  const bFactor = brightness * 2.55; // -255 to 255
  const cFactor = (contrast + 100) / 100; // 0 to 2
  const cFactorSq = cFactor * cFactor;
  const satFactor = (saturation + 100) / 100; // 0 to 2
  const invGamma = 1 / Math.max(0.1, gamma);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Invert
    if (invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    // Brightness
    r += bFactor;
    g += bFactor;
    b += bFactor;

    // Contrast around mid-gray 128
    r = (r - 128) * cFactorSq + 128;
    g = (g - 128) * cFactorSq + 128;
    b = (b - 128) * cFactorSq + 128;

    // Saturation
    if (saturation !== 0) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + (r - lum) * satFactor;
      g = lum + (g - lum) * satFactor;
      b = lum + (b - lum) * satFactor;
    }

    // Gamma correction
    if (gamma !== 1.0) {
      r = 255 * Math.pow(Math.max(0, r) / 255, invGamma);
      g = 255 * Math.pow(Math.max(0, g) / 255, invGamma);
      b = 255 * Math.pow(Math.max(0, b) / 255, invGamma);
    }

    data[i]     = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
}

/**
 * Process an HTMLImageElement or ImageBitmap into a 2D array of DosCells
 */
export function processImageToDosGrid(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  cols: number,
  rows: number,
  mode: CharacterMode,
  ditherAlgo: DitherAlgorithm,
  adjustments: ImageAdjustments,
  paletteType: PaletteType
): DosCell[][] {
  const palette = getPalette(paletteType);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  // For half-block mode, each character cell contains two vertical pixels
  // so the internal pixel render height is rows * 2!
  const renderWidth = cols;
  const renderHeight = mode === 'half-block' ? rows * 2 : rows;

  canvas.width = renderWidth;
  canvas.height = renderHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw source image to fit canvas
  ctx.drawImage(sourceImage, 0, 0, renderWidth, renderHeight);

  // Extract raw pixel data
  const imageData = ctx.getImageData(0, 0, renderWidth, renderHeight);

  // Apply color adjustments
  applyAdjustments(imageData, adjustments);

  // Quantize with requested dithering algorithm
  const colorIndexes = quantizeImageWithDither(
    imageData,
    ditherAlgo,
    adjustments.ditherStrength / 100,
    palette
  );

  const grid: DosCell[][] = [];

  if (mode === 'half-block') {
    // Each row in the text grid is 2 vertical pixels
    for (let r = 0; r < rows; r++) {
      const rowCells: DosCell[] = [];
      const topRowY = r * 2;
      const bottomRowY = r * 2 + 1;

      for (let c = 0; c < cols; c++) {
        const topColorIdx = colorIndexes[topRowY * renderWidth + c];
        const bottomColorIdx = colorIndexes[bottomRowY * renderWidth + c];

        if (topColorIdx === bottomColorIdx) {
          // If both half-pixels have identical color, output a space with bg or full block
          rowCells.push({
            char: ' ',
            cp437Code: 32,
            fg: topColorIdx,
            bg: topColorIdx,
          });
        } else {
          // Top half block character CHR$(223) / '▀'
          // FG is top half color, BG is bottom half color!
          rowCells.push({
            char: '▀',
            cp437Code: 223,
            fg: topColorIdx,
            bg: bottomColorIdx,
          });
        }
      }
      grid.push(rowCells);
    }
  } else if (mode === 'cp437-shaded') {
    // CP437 Shading Blocks (░ ▒ ▓ █)
    for (let r = 0; r < rows; r++) {
      const rowCells: DosCell[] = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * renderWidth + c;
        const colorIdx = colorIndexes[idx];
        const pIdx = idx * 4;
        const rVal = imageData.data[pIdx];
        const gVal = imageData.data[pIdx + 1];
        const bVal = imageData.data[pIdx + 2];
        const lum = (0.299 * rVal + 0.587 * gVal + 0.114 * bVal) / 255;

        // Choose shading character based on luminance
        let shade = SHADE_CHARS[0];
        if (lum > 0.85) shade = SHADE_CHARS[4]; // █
        else if (lum > 0.60) shade = SHADE_CHARS[3]; // ▓
        else if (lum > 0.35) shade = SHADE_CHARS[2]; // ▒
        else if (lum > 0.12) shade = SHADE_CHARS[1]; // ░

        rowCells.push({
          char: shade.char,
          cp437Code: shade.code,
          fg: colorIdx,
          bg: 0, // standard black background for shading
        });
      }
      grid.push(rowCells);
    }
  } else if (mode === 'ascii-ramp') {
    // ASCII ramp based on pixel luminance
    for (let r = 0; r < rows; r++) {
      const rowCells: DosCell[] = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * renderWidth + c;
        const colorIdx = colorIndexes[idx];
        const pIdx = idx * 4;
        const rVal = imageData.data[pIdx];
        const gVal = imageData.data[pIdx + 1];
        const bVal = imageData.data[pIdx + 2];
        const lum = (0.299 * rVal + 0.587 * gVal + 0.114 * bVal) / 255;

        const charIdx = Math.min(
          ASCII_RAMP.length - 1,
          Math.floor(lum * ASCII_RAMP.length)
        );
        const char = ASCII_RAMP[charIdx];

        rowCells.push({
          char,
          cp437Code: char.charCodeAt(0),
          fg: colorIdx,
          bg: 0,
        });
      }
      grid.push(rowCells);
    }
  } else {
    // Full Block 1 pixel per cell
    for (let r = 0; r < rows; r++) {
      const rowCells: DosCell[] = [];
      for (let c = 0; c < cols; c++) {
        const colorIdx = colorIndexes[r * renderWidth + c];
        rowCells.push({
          char: '█',
          cp437Code: 219,
          fg: colorIdx,
          bg: 0,
        });
      }
      grid.push(rowCells);
    }
  }

  return grid;
}
