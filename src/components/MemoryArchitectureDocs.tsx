/**
 * DOS Memory Architecture & Interactive Attribute Byte Calculator
 * Explains segment &HB800, text video RAM layout, blink bit registers,
 * and half-block graphics techniques.
 */

import React, { useState } from 'react';
import { Cpu, Binary, LayoutGrid, Zap } from 'lucide-react';
import { VGA_16_PALETTE, getColorByIndex } from '../utils/palettes';

export const MemoryArchitectureDocs: React.FC = () => {
  const [selectedFg, setSelectedFg] = useState<number>(10); // Light Green
  const [selectedBg, setSelectedBg] = useState<number>(1);  // Blue
  const [blinkBit, setBlinkBit] = useState<boolean>(false);

  // Compute attribute byte
  // Standard DOS: attribute = (blink << 7) | ((bg & 7) << 4) | (fg & 15)
  // With blink disabled: attribute = ((bg & 15) << 4) | (fg & 15)
  const attributeByte = ((selectedBg & 0x0F) << 4) | (selectedFg & 0x0F);
  const binaryString = attributeByte.toString(2).padStart(8, '0');
  const hexString = '&H' + attributeByte.toString(16).toUpperCase().padStart(2, '0');

  const fgColor = getColorByIndex(selectedFg, VGA_16_PALETTE);
  const bgColor = getColorByIndex(selectedBg, VGA_16_PALETTE);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-950 text-neutral-100 select-text">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          MS-DOS Video Memory Architecture & Attribute Bytes
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
          In MS-DOS, text mode (SCREEN 0) is not drawn with vector glyphs. Instead, software directly manipulates hardware video buffers starting at physical memory segment <code className="text-amber-400 font-mono font-semibold">&HB800:0000</code>.
        </p>
      </div>

      {/* Interactive Attribute Byte Calculator */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
            <Binary className="w-4 h-4 text-amber-400" />
            Interactive SCREEN 0 Attribute Byte Calculator
          </h2>
          <span className="text-[11px] text-amber-400 font-mono">
            COLOR {selectedFg}, {selectedBg}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Foreground selector */}
          <div>
            <label className="text-xs text-neutral-400 block mb-2 font-medium">
              Foreground Color (Bits 0–3): {selectedFg} ({fgColor.name})
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {VGA_16_PALETTE.map((c) => (
                <button
                  key={c.index}
                  onClick={() => setSelectedFg(c.index)}
                  className={`h-7 rounded border transition-all cursor-pointer relative ${
                    selectedFg === c.index
                      ? 'border-white scale-110 shadow-lg z-10 ring-2 ring-amber-400'
                      : 'border-neutral-700 hover:border-neutral-500'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.index}: ${c.name}`}
                />
              ))}
            </div>
          </div>

          {/* Background selector */}
          <div>
            <label className="text-xs text-neutral-400 block mb-2 font-medium">
              Background Color (Bits 4–7): {selectedBg} ({bgColor.name})
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {VGA_16_PALETTE.map((c) => (
                <button
                  key={c.index}
                  onClick={() => setSelectedBg(c.index)}
                  className={`h-7 rounded border transition-all cursor-pointer relative ${
                    selectedBg === c.index
                      ? 'border-white scale-110 shadow-lg z-10 ring-2 ring-amber-400'
                      : 'border-neutral-700 hover:border-neutral-500'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.index}: ${c.name}`}
                />
              ))}
            </div>
          </div>

          {/* Computed Memory Representation */}
          <div className="bg-neutral-950 border border-neutral-800 rounded p-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[11px] text-neutral-400">
                <span>Resulting Hardware Byte:</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-mono text-base font-bold text-amber-400">
                  {hexString}
                </div>
                <div className="text-xs font-mono text-neutral-300">
                  ({attributeByte} Dec)
                </div>
                <div className="font-mono text-xs text-emerald-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                  {binaryString.slice(0, 4)} {binaryString.slice(4)}
                </div>
              </div>
            </div>

            {/* Simulated Cell Preview */}
            <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Screen Preview:</span>
              <div
                className="w-12 h-8 rounded border border-neutral-700 flex items-center justify-center font-mono font-bold text-lg"
                style={{ backgroundColor: bgColor.hex, color: fgColor.hex }}
              >
                ▀
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Layout Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-5 space-y-3">
          <h2 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-amber-400" />
            Video RAM Layout (4,000 Bytes per Screen)
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Standard DOS text mode consists of 80 columns by 25 rows = 2,000 character cells. Each cell requires 2 consecutive bytes in RAM:
          </p>

          <div className="border border-neutral-800 rounded overflow-hidden text-xs font-mono">
            <div className="bg-neutral-800/80 px-3 py-1.5 font-semibold text-amber-400 border-b border-neutral-700">
              Offset Memory Formula
            </div>
            <div className="p-3 bg-black/50 space-y-2 text-neutral-300">
              <div>
                <span className="text-neutral-500">Character Offset:</span>{' '}
                <span className="text-white">Offset = (Row - 1) * 160 + (Col - 1) * 2</span>
              </div>
              <div>
                <span className="text-neutral-500">Attribute Offset:</span>{' '}
                <span className="text-white">Offset + 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Half-Block Magic */}
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-5 space-y-3">
          <h2 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            The Half-Block Secret (CHR$(223) / ▀)
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            CP437 character code 223 (<code className="text-amber-400">▀</code>) fills exactly the top 8 scanlines of an 8x16 text cell with foreground color, leaving the bottom 8 scanlines to display the cell background color.
          </p>
          <div className="bg-black/50 border border-neutral-800 rounded p-3 text-xs text-neutral-300 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Doubles vertical resolution from 25 to 50 virtual pixels</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Allows full 16-color dithering without graphics mode overhead</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Works directly in stock QBasic 1.1 with standard PRINT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
