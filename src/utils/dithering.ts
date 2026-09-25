/**
 * Dithering Algorithms for Retro Color Quantization
 * Includes: Floyd-Steinberg, Atkinson, Bayer 2x2/4x4/8x8, Sierra-3, Stucki, Burkes
 */

import { DitherAlgorithm, DosColor } from '../types/dos';
import { findClosestColorIndex, getColorByIndex } from './palettes';

// Bayer Matrices for Ordered Dithering (normalized 0 to 1)
const BAYER_2X2 = [
  [0 / 4, 2 / 4],
  [3 / 4, 1 / 4],
];

const BAYER_4X4 = [
  [ 0 / 16,  8 / 16,  2 / 16, 10 / 16],
  [12 / 16,  4 / 16, 14 / 16,  6 / 16],
  [ 3 / 16, 11 / 16,  1 / 16,  9 / 16],
  [15 / 16,  7 / 16, 13 / 16,  5 / 16],
];

const BAYER_8X8 = [
  [ 0 / 64, 32 / 64,  8 / 64, 40 / 64,  2 / 64, 34 / 64, 10 / 64, 42 / 64],
  [48 / 64, 16 / 64, 56 / 64, 24 / 64, 50 / 64, 18 / 64, 58 / 64, 26 / 64],
  [12 / 64, 44 / 64,  4 / 64, 36 / 64, 14 / 64, 46 / 64,  6 / 64, 38 / 64],
  [60 / 64, 28 / 64, 52 / 64, 20 / 64, 62 / 64, 30 / 64, 54 / 64, 22 / 64],
  [ 3 / 64, 35 / 64, 11 / 64, 43 / 64,  1 / 64, 33 / 64,  9 / 64, 41 / 64],
  [51 / 64, 19 / 64, 59 / 64, 27 / 64, 49 / 64, 17 / 64, 57 / 64, 25 / 64],
  [15 / 64, 47 / 64,  7 / 64, 39 / 64, 13 / 64, 45 / 64,  5 / 64, 37 / 64],
  [63 / 64, 31 / 64, 55 / 64, 23 / 64, 61 / 64, 29 / 64, 53 / 64, 21 / 64],
];

function clamp(v: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Apply ordered dithering to an RGB pixel
 */
function applyOrderedDither(
  r: number,
  g: number,
  b: number,
  x: number,
  y: number,
  matrix: number[][],
  matrixSize: number,
  strength: number,
  palette: DosColor[]
): number {
  const threshold = matrix[y % matrixSize][x % matrixSize] - 0.5;
  const spread = 64 * strength; // Spread factor for 16-color palette
  const dr = clamp(r + threshold * spread);
  const dg = clamp(g + threshold * spread);
  const db = clamp(b + threshold * spread);
  return findClosestColorIndex(dr, dg, db, palette);
}

/**
 * Quantize an RGB image buffer with selectable dithering algorithms
 * Buffer is RGBA array of length width * height * 4
 * Returns an array of color indexes (length = width * height)
 */
export function quantizeImageWithDither(
  imageData: ImageData,
  algorithm: DitherAlgorithm,
  ditherStrength: number, // 0.0 to 1.0
  palette: DosColor[]
): number[] {
  const { width, height, data } = imageData;
  const result: number[] = new Array(width * height);
  const strength = Math.max(0, Math.min(1, ditherStrength));

  // If no dithering or strength is zero, do fast direct nearest color quantization
  if (algorithm === 'none' || strength <= 0) {
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      result[i] = findClosestColorIndex(data[idx], data[idx + 1], data[idx + 2], palette);
    }
    return result;
  }

  // Handle Ordered Dithering (Bayer)
  if (algorithm === 'bayer-2x2') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        result[y * width + x] = applyOrderedDither(
          data[i], data[i + 1], data[i + 2],
          x, y, BAYER_2X2, 2, strength, palette
        );
      }
    }
    return result;
  }

  if (algorithm === 'bayer-4x4') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        result[y * width + x] = applyOrderedDither(
          data[i], data[i + 1], data[i + 2],
          x, y, BAYER_4X4, 4, strength, palette
        );
      }
    }
    return result;
  }

  if (algorithm === 'bayer-8x8') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        result[y * width + x] = applyOrderedDither(
          data[i], data[i + 1], data[i + 2],
          x, y, BAYER_8X8, 8, strength, palette
        );
      }
    }
    return result;
  }

  // Prepare float buffers for error diffusion algorithms
  // Float32Array for R, G, B channels
  const rBuf = new Float32Array(width * height);
  const gBuf = new Float32Array(width * height);
  const bBuf = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    rBuf[i] = data[idx];
    gBuf[i] = data[idx + 1];
    bBuf[i] = data[idx + 2];
  }

  const addError = (x: number, y: number, er: number, eg: number, eb: number, weight: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    const factor = weight * strength;
    rBuf[idx] += er * factor;
    gBuf[idx] += eg * factor;
    bBuf[idx] += eb * factor;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const curR = clamp(rBuf[idx]);
      const curG = clamp(gBuf[idx]);
      const curB = clamp(bBuf[idx]);

      const bestColorIdx = findClosestColorIndex(curR, curG, curB, palette);
      result[idx] = bestColorIdx;

      const palColor = getColorByIndex(bestColorIdx, palette);
      const errR = curR - palColor.r;
      const errG = curG - palColor.g;
      const errB = curB - palColor.b;

      switch (algorithm) {
        case 'floyd-steinberg':
          //   X   7/16
          // 3/16 5/16 1/16
          addError(x + 1, y,     errR, errG, errB, 7 / 16);
          addError(x - 1, y + 1, errR, errG, errB, 3 / 16);
          addError(x,     y + 1, errR, errG, errB, 5 / 16);
          addError(x + 1, y + 1, errR, errG, errB, 1 / 16);
          break;

        case 'atkinson':
          // Bill Atkinson (Apple Lisa / Mac / QuickDraw)
          // Preserves crisp contrast: distributes only 6/8 of the error (3/4), discarding 1/4
          //   X   1/8 1/8
          // 1/8 1/8 1/8
          //     1/8
          addError(x + 1, y,     errR, errG, errB, 1 / 8);
          addError(x + 2, y,     errR, errG, errB, 1 / 8);
          addError(x - 1, y + 1, errR, errG, errB, 1 / 8);
          addError(x,     y + 1, errR, errG, errB, 1 / 8);
          addError(x + 1, y + 1, errR, errG, errB, 1 / 8);
          addError(x,     y + 2, errR, errG, errB, 1 / 8);
          break;

        case 'sierra-3':
          // Sierra-3 (32 divisor)
          //     X   5  3
          //  2  4  5  4  2
          //     2  3  2
          addError(x + 1, y,     errR, errG, errB, 5 / 32);
          addError(x + 2, y,     errR, errG, errB, 3 / 32);
          addError(x - 2, y + 1, errR, errG, errB, 2 / 32);
          addError(x - 1, y + 1, errR, errG, errB, 4 / 32);
          addError(x,     y + 1, errR, errG, errB, 5 / 32);
          addError(x + 1, y + 1, errR, errG, errB, 4 / 32);
          addError(x + 2, y + 1, errR, errG, errB, 2 / 32);
          addError(x - 1, y + 2, errR, errG, errB, 2 / 32);
          addError(x,     y + 2, errR, errG, errB, 3 / 32);
          addError(x + 1, y + 2, errR, errG, errB, 2 / 32);
          break;

        case 'stucki':
          // Stucki (42 divisor)
          //     X   8  4
          //  2  4  8  4  2
          //  1  2  4  2  1
          addError(x + 1, y,     errR, errG, errB, 8 / 42);
          addError(x + 2, y,     errR, errG, errB, 4 / 42);
          addError(x - 2, y + 1, errR, errG, errB, 2 / 42);
          addError(x - 1, y + 1, errR, errG, errB, 4 / 42);
          addError(x,     y + 1, errR, errG, errB, 8 / 42);
          addError(x + 1, y + 1, errR, errG, errB, 4 / 42);
          addError(x + 2, y + 1, errR, errG, errB, 2 / 42);
          addError(x - 2, y + 2, errR, errG, errB, 1 / 42);
          addError(x - 1, y + 2, errR, errG, errB, 2 / 42);
          addError(x,     y + 2, errR, errG, errB, 4 / 42);
          addError(x + 1, y + 2, errR, errG, errB, 2 / 42);
          addError(x + 2, y + 2, errR, errG, errB, 1 / 42);
          break;

        case 'burkes':
          // Burkes (32 divisor)
          //     X   8  4
          //  2  4  8  4  2
          addError(x + 1, y,     errR, errG, errB, 8 / 32);
          addError(x + 2, y,     errR, errG, errB, 4 / 32);
          addError(x - 2, y + 1, errR, errG, errB, 2 / 32);
          addError(x - 1, y + 1, errR, errG, errB, 4 / 32);
          addError(x,     y + 1, errR, errG, errB, 8 / 32);
          addError(x + 1, y + 1, errR, errG, errB, 4 / 32);
          addError(x + 2, y + 1, errR, errG, errB, 2 / 32);
          break;
      }
    }
  }

  return result;
}
