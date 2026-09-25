/**
 * ANSI Escape Sequence and Binary Screen Dump Generators
 * Supports standard DOS ANSI.SYS, BBS standards, .ANS, .BIN, and UTF-8 export
 */

import { DosCell } from '../types/dos';
import { VGA_16_PALETTE } from './palettes';

/**
 * Convert DosCell grid to standard ANSI.SYS escape sequence string
 */
export function generateAnsiString(grid: DosCell[][]): string {
  let output = '';
  let lastFg = -1;
  let lastBg = -1;

  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];

      // If colors changed, emit ANSI color escape sequence
      if (cell.fg !== lastFg || cell.bg !== lastBg) {
        // Standard DOS ANSI.SYS mapping:
        // Colors 0-7: standard intensity (codes 30-37, 40-47)
        // Colors 8-15: high intensity (ESC[1;...m with fg code)
        const isBold = cell.fg >= 8;
        const fgBase = (cell.fg % 8) + 30;
        const bgBase = (cell.bg % 8) + 40;

        if (isBold) {
          output += `\x1b[0;1;${fgBase};${bgBase}m`;
        } else {
          output += `\x1b[0;${fgBase};${bgBase}m`;
        }

        lastFg = cell.fg;
        lastBg = cell.bg;
      }

      output += cell.char;
    }
    // End of line reset and newline
    output += '\r\n';
    lastFg = -1;
    lastBg = -1;
  }

  // Reset attributes at end
  output += '\x1b[0m';
  return output;
}

/**
 * Generate 4000-byte raw DOS screen memory dump for DEF SEG = &HB800 / BLOAD
 * Format: 80 cols * 25 rows = 2000 cells * 2 bytes = 4000 bytes
 * Byte 0: ASCII character code (0-255)
 * Byte 1: Attribute byte ((bg << 4) | fg)
 */
export function generateBinBuffer(grid: DosCell[][]): Uint8Array {
  const cols = 80;
  const rows = 25;
  const buffer = new Uint8Array(cols * rows * 2);

  let byteIdx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r] && grid[r][c]
        ? grid[r][c]
        : { char: ' ', cp437Code: 32, fg: 7, bg: 0 };

      // CP437 ASCII code
      buffer[byteIdx++] = cell.cp437Code & 0xFF;
      // Attribute byte: BG (bits 4-7) | FG (bits 0-3)
      const attr = ((cell.bg & 0x0F) << 4) | (cell.fg & 0x0F);
      buffer[byteIdx++] = attr;
    }
  }

  return buffer;
}

/**
 * Generate plain text UTF-8 representation
 */
export function generatePlainText(grid: DosCell[][]): string {
  return grid.map(row => row.map(cell => cell.char).join('')).join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(
  content: string | Uint8Array | Blob,
  filename: string,
  mimeType: string
): void {
  const blob = content instanceof Blob
    ? content
    : new Blob([content as any], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
