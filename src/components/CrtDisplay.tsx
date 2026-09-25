/**
 * CRT Display Component
 * Renders MS-DOS text mode graphics with canvas-backed CP437 glyphs,
 * scanlines, phosphor glow, curvature, zoom, and live cell inspector.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DosCell, DosColor } from '../types/dos';
import { getColorByIndex, VGA_16_PALETTE } from '../utils/palettes';
import { ZoomIn, ZoomOut, Maximize2, Grid, Tv, Eye } from 'lucide-react';

interface CrtDisplayProps {
  grid: DosCell[][];
  scanlines: boolean;
  setScanlines: (v: boolean) => void;
  curvature: boolean;
  setCurvature: (v: boolean) => void;
  crtTheme: 'color' | 'green' | 'amber';
  setCrtTheme: (v: 'color' | 'green' | 'amber') => void;
  gridOverlay: boolean;
  setGridOverlay: (v: boolean) => void;
  onHoverCell?: (cell: DosCell | null, col: number, row: number) => void;
}

export const CrtDisplay: React.FC<CrtDisplayProps> = ({
  grid,
  scanlines,
  setScanlines,
  curvature,
  setCurvature,
  crtTheme,
  setCrtTheme,
  gridOverlay,
  setGridOverlay,
  onHoverCell,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<'fit' | 1 | 1.5 | 2>('fit');
  const [hoveredCell, setHoveredCell] = useState<{
    cell: DosCell;
    col: number;
    row: number;
    x: number;
    y: number;
  } | null>(null);

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Base font size and cell dimensions for DOS 8x16 character cell
  const cellWidth = 9;
  const cellHeight = 16;
  const canvasWidth = cols * cellWidth;
  const canvasHeight = rows * cellHeight;

  // Render text grid to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cols === 0 || rows === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // Helper to get styled color based on CRT theme
    const getCrtColor = (colorIndex: number): string => {
      const c = getColorByIndex(colorIndex, VGA_16_PALETTE);
      if (crtTheme === 'color') return c.hex;

      const lum = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
      if (crtTheme === 'green') {
        const g = Math.round(lum * 255);
        const r = Math.round(lum * 35);
        const b = Math.round(lum * 50);
        return `rgb(${r},${g},${b})`;
      } else {
        // Amber
        const r = Math.round(lum * 255);
        const g = Math.round(lum * 175);
        const b = Math.round(lum * 20);
        return `rgb(${r},${g},${b})`;
      }
    };

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Font setup for regular glyphs
    ctx.font = `${cellHeight - 2}px "IBM Plex Mono", "Courier New", monospace`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let r = 0; r < rows; r++) {
      const rowCells = grid[r];
      if (!rowCells) continue;

      for (let c = 0; c < cols; c++) {
        const cell = rowCells[c];
        const x = c * cellWidth;
        const y = r * cellHeight;

        const fgColor = getCrtColor(cell.fg);
        const bgColor = getCrtColor(cell.bg);

        // Always fill cell background first
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, cellWidth, cellHeight);

        // Special handling for high-fidelity block characters:
        // Half-block ▀ (223)
        if (cell.cp437Code === 223 || cell.char === '▀') {
          // Top half gets fgColor, bottom half remains bgColor
          ctx.fillStyle = fgColor;
          ctx.fillRect(x, y, cellWidth, Math.ceil(cellHeight / 2));
        }
        // Bottom half-block ▄ (220)
        else if (cell.cp437Code === 220 || cell.char === '▄') {
          ctx.fillStyle = fgColor;
          ctx.fillRect(x, y + Math.floor(cellHeight / 2), cellWidth, Math.ceil(cellHeight / 2));
        }
        // Full block █ (219)
        else if (cell.cp437Code === 219 || cell.char === '█') {
          ctx.fillStyle = fgColor;
          ctx.fillRect(x, y, cellWidth, cellHeight);
        }
        // Shading blocks: ░ (176), ▒ (177), ▓ (178)
        else if (cell.cp437Code === 176 || cell.cp437Code === 177 || cell.cp437Code === 178) {
          ctx.fillStyle = fgColor;
          const density = cell.cp437Code === 176 ? 0.25 : cell.cp437Code === 177 ? 0.5 : 0.75;
          
          // Draw authentic ordered stipple pattern
          for (let py = 0; py < cellHeight; py += 2) {
            for (let px = 0; px < cellWidth; px += 2) {
              const dVal = ((px % 4) + (py % 4) * 2) / 8;
              if (dVal < density) {
                ctx.fillRect(x + px, y + py, 1, 1);
              }
            }
          }
        }
        // Regular character or space
        else if (cell.char !== ' ') {
          ctx.fillStyle = fgColor;
          ctx.fillText(cell.char, x + cellWidth / 2, y + cellHeight / 2);
        }

        // Grid lines overlay if enabled
        if (gridOverlay) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
      }
    }
  }, [grid, cols, rows, canvasWidth, canvasHeight, crtTheme, gridOverlay]);

  // Handle mouse move for cell inspector
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || cols === 0 || rows === 0) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(mouseX / cellWidth);
    const row = Math.floor(mouseY / cellHeight);

    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      const cell = grid[row][col];
      setHoveredCell({
        cell,
        col: col + 1, // 1-indexed for DOS / QBasic LOCATE r, c
        row: row + 1,
        x: e.clientX,
        y: e.clientY,
      });
      if (onHoverCell) onHoverCell(cell, col + 1, row + 1);
    } else {
      setHoveredCell(null);
      if (onHoverCell) onHoverCell(null, 0, 0);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    if (onHoverCell) onHoverCell(null, 0, 0);
  };

  // Inspect colors
  const fgColor = hoveredCell ? getColorByIndex(hoveredCell.cell.fg, VGA_16_PALETTE) : null;
  const bgColor = hoveredCell ? getColorByIndex(hoveredCell.cell.bg, VGA_16_PALETTE) : null;

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="h-10 px-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="font-mono text-neutral-300">
            SCREEN 0 : {cols}×{rows} cells {grid[0]?.[0]?.char === '▀' ? '(80×50 Half-Blocks)' : ''}
          </span>
          <span className="text-neutral-600">·</span>
          <span className="font-mono text-neutral-400">
            {cols * rows * 2} bytes B800:0000
          </span>
        </div>

        {/* Display Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center bg-neutral-800 rounded p-0.5 border border-neutral-700">
            <button
              onClick={() => setCrtTheme('color')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                crtTheme === 'color' ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              RGB
            </button>
            <button
              onClick={() => setCrtTheme('green')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                crtTheme === 'green' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              P1 Green
            </button>
            <button
              onClick={() => setCrtTheme('amber')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                crtTheme === 'amber' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              P3 Amber
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          {/* Scanlines Toggle */}
          <button
            onClick={() => setScanlines(!scanlines)}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 border transition-colors ${
              scanlines
                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle authentic CRT scanlines"
          >
            <Tv className="w-3 h-3" />
            <span>Scanlines</span>
          </button>

          {/* Curvature Toggle */}
          <button
            onClick={() => setCurvature(!curvature)}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 border transition-colors ${
              curvature
                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle curved CRT monitor glass"
          >
            <Eye className="w-3 h-3" />
            <span>CRT Bezel</span>
          </button>

          {/* Grid Overlay Toggle */}
          <button
            onClick={() => setGridOverlay(!gridOverlay)}
            className={`p-1.5 rounded border transition-colors ${
              gridOverlay
                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle Character Grid Overlay"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-neutral-800/90 rounded border border-neutral-700 p-0.5">
            <button
              onClick={() => setZoom('fit')}
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                zoom === 'fit' ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Fit
            </button>
            <button
              onClick={() => setZoom(1)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                zoom === 1 ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setZoom(1.5)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                zoom === 1.5 ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              1.5x
            </button>
            <button
              onClick={() => setZoom(2)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                zoom === 2 ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              2x
            </button>
          </div>
        </div>
      </div>

      {/* Main CRT Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-6 bg-black relative"
      >
        {/* Outer CRT Monitor Bezel Frame */}
        <div
          className={`relative transition-all duration-300 ${
            curvature
              ? 'rounded-2xl p-4 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black shadow-[0_0_50px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.15)] border-4 border-neutral-800'
              : 'p-1 bg-neutral-950 border border-neutral-800'
          }`}
        >
          {/* CRT Screen Wrapper */}
          <div
            className={`relative overflow-hidden bg-black ${
              curvature ? 'rounded-xl shadow-[inset_0_0_35px_rgba(0,0,0,0.85)]' : ''
            }`}
            style={{
              width: zoom === 'fit' ? '100%' : `${canvasWidth * (typeof zoom === 'number' ? zoom : 1)}px`,
              maxWidth: zoom === 'fit' ? '920px' : 'none',
            }}
          >
            {/* The Actual Canvas */}
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-auto block cursor-crosshair"
              style={{
                imageRendering: 'pixelated',
                filter: scanlines ? 'contrast(106%) brightness(98%)' : 'none',
              }}
            />

            {/* CRT Horizontal Scanlines Overlay */}
            {scanlines && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.35) 0px, rgba(0, 0, 0, 0.35) 1px, transparent 1px, transparent 2px)',
                }}
              />
            )}

            {/* CRT Glass Reflection & Curvature Vignette */}
            {curvature && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background:
                      'radial-gradient(circle at center, transparent 65%, rgba(0,0,0,0.6) 100%)',
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none z-10 opacity-15"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%, transparent 100%)',
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Inspector Bar */}
      <div className="h-9 px-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs shrink-0 font-mono text-neutral-400 select-none">
        {hoveredCell && fgColor && bgColor ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-neutral-200">
              <span className="text-neutral-500">LOCATE</span>
              <span className="text-amber-400 font-semibold">
                {hoveredCell.row}, {hoveredCell.col}
              </span>
            </div>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">CHR$:</span>
              <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-white border border-neutral-700">
                '{hoveredCell.cell.char}'
              </span>
              <span className="text-neutral-500">Code {hoveredCell.cell.cp437Code} (0x{hoveredCell.cell.cp437Code.toString(16).toUpperCase()})</span>
            </div>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">FG:</span>
              <span
                className="w-3 h-3 rounded-full border border-neutral-600 inline-block"
                style={{ backgroundColor: fgColor.hex }}
              />
              <span className="text-neutral-300">
                {hoveredCell.cell.fg} ({fgColor.name})
              </span>
            </div>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">BG:</span>
              <span
                className="w-3 h-3 rounded-full border border-neutral-600 inline-block"
                style={{ backgroundColor: bgColor.hex }}
              />
              <span className="text-neutral-300">
                {hoveredCell.cell.bg} ({bgColor.name})
              </span>
            </div>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-1 text-neutral-400">
              <span className="text-neutral-500">MEM:</span>
              <span>&HB800:{( (hoveredCell.row - 1) * cols * 2 + (hoveredCell.col - 1) * 2 ).toString(16).toUpperCase().padStart(4, '0')}</span>
            </div>
          </div>
        ) : (
          <div className="text-neutral-500">
            Hover cursor over character cells to inspect DOS memory & attributes
          </div>
        )}

        <div className="flex items-center gap-2 text-neutral-500">
          <span>MS-DOS ANSI.SYS COMPLIANT</span>
        </div>
      </div>
    </div>
  );
};
