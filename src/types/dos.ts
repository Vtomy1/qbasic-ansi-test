/**
 * QBasic and DOS ANSI Studio Types
 */

export interface DosColor {
  index: number;
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  ansiCode: number; // 30-37 for normal, or with bold
}

export type DitherAlgorithm = 
  | 'none'
  | 'floyd-steinberg'
  | 'atkinson'
  | 'bayer-2x2'
  | 'bayer-4x4'
  | 'bayer-8x8'
  | 'sierra-3'
  | 'stucki'
  | 'burkes';

export type CharacterMode = 
  | 'half-block'     // ▀ CHR$(223) Foreground=Top, Background=Bottom (Doubles vertical res)
  | 'cp437-shaded'   // CP437 Shading Blocks (░ ▒ ▓ █)
  | 'ascii-ramp'     // Standard ASCII luminance ramp
  | 'full-block';    // █ CHR$(219) 1 pixel per character cell

export type PaletteType = 
  | 'vga-16'         // Standard IBM PC / MS-DOS 16 colors
  | 'cga-mode1'      // CGA Palette 1 (Black, Cyan, Magenta, White)
  | 'cga-mode2'      // CGA Palette 2 (Black, Green, Red, Brown)
  | 'amber-crt'      // Amber phosphor monochrome 16 levels
  | 'green-crt'      // Green phosphor monochrome 16 levels
  | 'c64-16';        // Commodore 64 16-color palette

export interface DosCell {
  char: string;
  cp437Code: number;
  fg: number; // 0-15
  bg: number; // 0-15 (or 0-7 if blink enabled)
}

export interface GridDimensions {
  cols: number;
  rows: number;
  renderRows: number; // For half block, image is processed at 2x rows
}

export interface ImageAdjustments {
  brightness: number;  // -100 to 100 (0 default)
  contrast: number;    // -100 to 100 (0 default)
  saturation: number;  // -100 to 100 (0 default)
  gamma: number;       // 0.2 to 3.0 (1.0 default)
  invert: boolean;     // false default
  ditherStrength: number; // 0 to 100 (100 default)
  aspectCorrection: boolean; // DOS 8x16 non-square character compensation
}

export type QbasicExportMethod = 
  | 'data-read'       // SCREEN 0 with RLE DATA / READ strings
  | 'bload-memory'    // DEF SEG = &HB800 with direct video memory BLOAD/POKE
  | 'pure-ansi-sub'   // Native QBasic ANSI sequence parser SUB
  | 'screen13-graphics'; // SCREEN 13 320x200 graphics mode
