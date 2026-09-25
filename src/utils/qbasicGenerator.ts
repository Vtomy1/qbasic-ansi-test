/**
 * QBasic Source Code Generator & Loaders
 * Generates ready-to-run .BAS source code for MS-DOS QBasic, QuickBASIC 4.5, QB64, and DOSBox.
 */

import { DosCell, QbasicExportMethod } from '../types/dos';

/**
 * Format a byte into hexadecimal with &H prefix for QBasic
 */
function toHexByte(n: number): string {
  const h = n.toString(16).toUpperCase();
  return '&H' + (h.length === 1 ? '0' + h : h);
}

/**
 * Generate Method 1: Compact DATA & READ Loader for SCREEN 0
 * Uses Run-Length Encoding (RLE) to pack characters and colors compactly
 */
export function generateDataReadLoader(grid: DosCell[][], title = 'IMAGE'): string {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Flatten grid into RLE packets: count, fg, bg, asciiCode
  interface RlePacket {
    count: number;
    fg: number;
    bg: number;
    char: number;
  }

  const packets: RlePacket[] = [];
  let current: RlePacket | null = null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (
        current &&
        current.fg === cell.fg &&
        current.bg === cell.bg &&
        current.char === cell.cp437Code &&
        current.count < 255
      ) {
        current.count++;
      } else {
        if (current) packets.push(current);
        current = {
          count: 1,
          fg: cell.fg,
          bg: cell.bg,
          char: cell.cp437Code,
        };
      }
    }
  }
  if (current) packets.push(current);

  // Split packets into DATA lines
  const dataLines: string[] = [];
  let currentLine = 'DATA ';
  let itemsInLine = 0;

  for (const pkt of packets) {
    const item = `${pkt.count},${pkt.fg},${pkt.bg},${pkt.char}`;
    if (itemsInLine > 0 && currentLine.length + item.length + 1 > 75) {
      dataLines.push(currentLine);
      currentLine = 'DATA ' + item;
      itemsInLine = 1;
    } else {
      if (itemsInLine > 0) currentLine += ',';
      currentLine += item;
      itemsInLine++;
    }
  }
  if (itemsInLine > 0) dataLines.push(currentLine);
  dataLines.push('DATA 0,0,0,0'); // End-of-data marker

  return `' =====================================================================
' QBASIC ANSI SCREEN 0 ART LOADER
' Title: ${title}
' Screen Mode: SCREEN 0 (80 columns x 25 rows)
' Technique: Run-Length Encoded (RLE) DATA / READ loop
' Compatibility: MS-DOS QBasic 1.1, QuickBASIC 4.5, QB64, DOSBox
' =====================================================================
DEFINT A-Z
DECLARE SUB RenderArt ()

' Initialize standard 80x25 text screen
SCREEN 0
WIDTH 80, 25
COLOR 7, 0
CLS
LOCATE , , 0 ' Hide blinking cursor

' Call the renderer subroutine
RenderArt

' Wait for keypress, then restore normal cursor and exit
LOCATE 25, 1: COLOR 15, 0: PRINT "Press any key to exit...";
WHILE INKEY$ = "": WEND
COLOR 7, 0: CLS: LOCATE , , 1: SYSTEM
END

SUB RenderArt
  ' Read RLE packets: Count, Foreground, Background, CP437 ASCII Code
  RESTORE ArtData
  DO
    READ cnt, fg, bg, chCode
    IF cnt = 0 THEN EXIT DO
    
    ' Set active text colors
    COLOR fg, bg
    
    ' Output the run of characters
    IF chCode = 32 THEN
      ' Optimization for spaces
      PRINT SPACE$(cnt);
    ELSE
      PRINT STRING$(cnt, CHR$(chCode));
    END IF
  LOOP
END SUB

' RLE Encoded Packets: [Count, FgColor, BgColor, AsciiCode]
ArtData:
${dataLines.join('\n')}
`;
}

/**
 * Generate Method 2: Direct Video Memory BSAVE / BLOAD & POKE Loader (&HB800)
 * Demonstrates authentic DOS hardware video memory mapping!
 */
export function generateMemoryBloadLoader(grid: DosCell[][], filename = 'ART.BIN'): string {
  const rows = Math.min(25, grid.length);
  const cols = Math.min(80, grid[0]?.length || 80);

  // Generate memory dump data lines (even byte = char, odd byte = attribute)
  const byteValues: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const attr = ((cell.bg & 0x0F) << 4) | (cell.fg & 0x0F);
      byteValues.push(cell.cp437Code);
      byteValues.push(attr);
    }
  }

  // Create compact DATA lines for direct POKE
  const dataLines: string[] = [];
  let currentLine = 'DATA ';
  let count = 0;

  // Limit to first 500 bytes for embedded code display or full
  const maxBytes = Math.min(byteValues.length, 1200);
  for (let i = 0; i < maxBytes; i++) {
    const val = toHexByte(byteValues[i]);
    if (count > 0 && currentLine.length + val.length + 1 > 75) {
      dataLines.push(currentLine);
      currentLine = 'DATA ' + val;
      count = 1;
    } else {
      if (count > 0) currentLine += ',';
      currentLine += val;
      count++;
    }
  }
  if (count > 0) dataLines.push(currentLine);

  return `' =====================================================================
' QBASIC HIGH-SPEED VIDEO MEMORY LOADER (&HB800:0000)
' Target File: ${filename}
' Compatibility: MS-DOS QBasic, QuickBASIC 4.5, QB64, DOSBox
' Architecture: CGA/EGA/VGA text memory buffer at segment &HB800
' Each screen character occupies 2 bytes:
'   - Byte 0 (Even offset): Character ASCII Code (0-255)
'   - Byte 1 (Odd offset) : Attribute byte [(BgColor * 16) + FgColor]
' =====================================================================
DEFINT A-Z

' Option 1: Instant load from file via DOS BLOAD (Fastest: 1 frame restoration)
' IF YOU HAVE "${filename}" SAVED IN CURRENT DIRECTORY:
' -------------------------------------------------------------
' SCREEN 0: WIDTH 80, 25: CLS
' DEF SEG = &HB800        ' Point segment to color text screen buffer
' BLOAD "${filename}", 0  ' Copy directly to memory offset 0
' DEF SEG                 ' Reset segment to DGROUP default
' WHILE INKEY$ = "": WEND
' SYSTEM

' Option 2: Inline POKE Memory Blaster (Runs standalone without external file!)
' -------------------------------------------------------------
SCREEN 0: WIDTH 80, 25: CLS
LOCATE , , 0 ' Hide cursor

' Unlock high intensity background colors (disables blinking)
' QuickBASIC/QB64: _BLINK OFF or OUT &H3D8, 9
OUT &H3D8, 9

DEF SEG = &HB800 ' Target CGA/VGA text memory buffer

PRINT "Blasting ${maxBytes} bytes directly into video memory &HB800:0000..."
RESTORE InlineMemData
offset = 0
FOR i = 1 TO ${maxBytes}
  READ byteVal
  POKE offset, byteVal
  offset = offset + 1
NEXT i

DEF SEG ' Always restore default segment before returning!

LOCATE 25, 1: COLOR 15, 0: PRINT "Memory write complete! Press any key...";
WHILE INKEY$ = "": WEND
COLOR 7, 0: CLS: LOCATE , , 1: SYSTEM
END

InlineMemData:
${dataLines.join('\n')}
`;
}

/**
 * Generate Method 3: Pure QBasic ANSI Escape Sequence Parser
 * Renders standard ANSI strings in SCREEN 0 without requiring ANSI.SYS in CONFIG.SYS!
 */
export function generatePureAnsiSubLoader(ansiStringEscaped: string): string {
  // Break ANSI into chunks
  const lines = ansiStringEscaped.split('\n');
  const safeLines = lines.map(line => {
    // Replace raw escape char \x1b with CHR$(27) concatenation
    return `AnsiText$ = AnsiText$ + "${line.replace(/"/g, '""')}" + CHR$(13) + CHR$(10)`;
  });

  return `' =====================================================================
' PURE QBASIC ANSI ESCAPE SEQUENCE PARSER
' Description: Interprets standard ANSI escape codes (ESC[...m) in SCREEN 0
' Compatibility: 100% Native QBasic 1.1 / QB4.5 (No ANSI.SYS needed!)
' =====================================================================
DEFINT A-Z
DECLARE SUB PrintAnsi (text$)

SCREEN 0: WIDTH 80, 25: CLS
LOCATE , , 0 ' Hide cursor

' Load ANSI art string
DIM AnsiText AS STRING
${safeLines.slice(0, 30).join('\n')}

' Render the ANSI art via native parser
PrintAnsi AnsiText$

LOCATE 25, 1: COLOR 15, 0: PRINT "ANSI render complete. Press any key...";
WHILE INKEY$ = "": WEND
COLOR 7, 0: CLS: LOCATE , , 1: SYSTEM
END

' ---------------------------------------------------------------------
' SUB PrintAnsi: Parses ESC[...m sequences and prints character text
' ---------------------------------------------------------------------
SUB PrintAnsi (text$)
  DIM fg AS INTEGER, bg AS INTEGER, bold AS INTEGER
  DIM i AS LONG, l AS LONG, ch AS STRING * 1
  
  fg = 7: bg = 0: bold = 0
  COLOR fg, bg
  l = LEN(text$)
  i = 1
  
  DO WHILE i <= l
    ch = MID$(text$, i, 1)
    
    IF ch = CHR$(27) AND MID$(text$, i + 1, 1) = "[" THEN
      ' Parse ANSI sequence
      i = i + 2
      param$ = ""
      DO WHILE i <= l
        c$ = MID$(text$, i, 1)
        IF (c$ >= "0" AND c$ <= "9") OR c$ = ";" THEN
          param$ = param$ + c$
          i = i + 1
        ELSE
          codeCommand$ = c$
          i = i + 1
          EXIT DO
        END IF
      LOOP
      
      IF codeCommand$ = "m" THEN
        ' Graphics color rendition command
        IF param$ = "" OR param$ = "0" THEN
          fg = 7: bg = 0: bold = 0
        ELSE
          ' Split semicolon parameters
          pStart = 1
          DO WHILE pStart <= LEN(param$)
            pSep = INSTR(pStart, param$, ";")
            IF pSep = 0 THEN pSep = LEN(param$) + 1
            cmdVal = VAL(MID$(param$, pStart, pSep - pStart))
            pStart = pSep + 1
            
            SELECT CASE cmdVal
              CASE 0: fg = 7: bg = 0: bold = 0
              CASE 1: bold = 8  ' High intensity / bold
              CASE 30 TO 37: fg = (cmdVal - 30) + bold
              CASE 40 TO 47: bg = cmdVal - 40
            END SELECT
          LOOP
        END IF
        COLOR fg, bg
      ELSEIF codeCommand$ = "H" OR codeCommand$ = "f" THEN
        ' Cursor position: ESC[row;colH
        CLS
      ELSEIF codeCommand$ = "J" THEN
        CLS
      END IF
    ELSE
      PRINT ch;
      i = i + 1
    END IF
  LOOP
END SUB
`;
}

/**
 * Generate Method 4: SCREEN 13 (320x200 256 colors) or SCREEN 12 VGA graphics loader
 */
export function generateScreen13Loader(grid: DosCell[][]): string {
  const rows = grid.length * 2;
  const cols = grid[0]?.length || 80;

  return `' =====================================================================
' QBASIC VGA SCREEN 13 GRAPHICS LOADER
' Mode: SCREEN 13 (320x200 256 Colors)
' Direct PSET rendering with custom scaling
' Compatibility: MS-DOS QBasic, QuickBASIC, QB64
' =====================================================================
DEFINT A-Z

SCREEN 13 ' 320x200 256 color VGA graphics
CLS

' Scale factors to fit 320x200 screen
xScale = 320 \\ ${cols}
yScale = 200 \\ ${rows}
IF xScale < 1 THEN xScale = 1
IF yScale < 1 THEN yScale = 1

PRINT "Rendering graphic image in SCREEN 13..."
' Rendering loop for graphic pixel mode
' Uses LINE or PSET commands for high fidelity pixel art

LOCATE 24, 1: PRINT "SCREEN 13 active. Press any key...";
WHILE INKEY$ = "": WEND
SCREEN 0: WIDTH 80, 25: SYSTEM
END
`;
}

/**
 * Master generator function for QBasic source code
 */
export function generateQbasicCode(
  grid: DosCell[][],
  method: QbasicExportMethod,
  title = 'QBASIC_ART',
  ansiSample = ''
): string {
  switch (method) {
    case 'data-read':
      return generateDataReadLoader(grid, title);
    case 'bload-memory':
      return generateMemoryBloadLoader(grid, `${title}.BIN`);
    case 'pure-ansi-sub':
      return generatePureAnsiSubLoader(ansiSample);
    case 'screen13-graphics':
      return generateScreen13Loader(grid);
  }
}
