/**
 * Virtual MS-DOS QBasic 1.1 IDE and Execution Simulator
 * Features authentic QBasic blue interface, syntax highlighting,
 * and real-time execution animation of the generated BASIC code.
 */

import React, { useState, useEffect } from 'react';
import { Play, Copy, Check, Download, RotateCcw, Monitor, Settings } from 'lucide-react';
import { DosCell, QbasicExportMethod } from '../types/dos';
import { generateQbasicCode } from '../utils/qbasicGenerator';
import { downloadFile } from '../utils/ansiGenerator';
import { CrtDisplay } from './CrtDisplay';

interface VirtualQbasicIdeProps {
  grid: DosCell[][];
  scanlines: boolean;
  setScanlines: (v: boolean) => void;
  curvature: boolean;
  setCurvature: (v: boolean) => void;
  crtTheme: 'color' | 'green' | 'amber';
  setCrtTheme: (v: 'color' | 'green' | 'amber') => void;
  gridOverlay: boolean;
  setGridOverlay: (v: boolean) => void;
  ansiString: string;
}

export const VirtualQbasicIde: React.FC<VirtualQbasicIdeProps> = ({
  grid,
  scanlines,
  setScanlines,
  curvature,
  setCurvature,
  crtTheme,
  setCrtTheme,
  gridOverlay,
  setGridOverlay,
  ansiString,
}) => {
  const [method, setMethod] = useState<QbasicExportMethod>('data-read');
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [renderedRows, setRenderedRows] = useState<number>(grid.length);
  const [isPausedAtEnd, setIsPausedAtEnd] = useState(false);
  const [speed, setSpeed] = useState<'instant' | 'fast' | 'slow'>('fast');

  const code = generateQbasicCode(grid, method, 'ARTLOAD', ansiString);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(code, 'ARTLOAD.BAS', 'text/plain');
  };

  const startRunning = () => {
    setIsRunning(true);
    setIsPausedAtEnd(false);

    if (speed === 'instant') {
      setRenderedRows(grid.length);
      setIsPausedAtEnd(true);
    } else {
      setRenderedRows(0);
    }
  };

  // Execution animation
  useEffect(() => {
    if (!isRunning || speed === 'instant') return;

    if (renderedRows < grid.length) {
      const delay = speed === 'fast' ? 40 : 120;
      const timer = setTimeout(() => {
        setRenderedRows(prev => Math.min(grid.length, prev + 1));
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsPausedAtEnd(true);
    }
  }, [isRunning, renderedRows, grid.length, speed]);

  // Key press to exit DOS execution mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        startRunning();
      } else if (isRunning && isPausedAtEnd) {
        setIsRunning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, isPausedAtEnd]);

  // Sliced grid for execution animation
  const activeGrid = isRunning ? grid.slice(0, renderedRows) : grid;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0000A8] text-white font-mono select-none overflow-hidden relative">
      {/* If execution is running, show the simulated DOS execution output */}
      {isRunning ? (
        <div
          className="flex-1 flex flex-col bg-black relative cursor-pointer"
          onClick={() => {
            if (isPausedAtEnd) setIsRunning(false);
          }}
        >
          {/* Top banner */}
          <div className="h-8 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MS-DOS Execution Mode · SCREEN 0 Active</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startRunning();
                }}
                className="hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rerun</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRunning(false);
                }}
                className="bg-neutral-800 hover:bg-neutral-700 text-white px-2 py-0.5 rounded text-xs cursor-pointer"
              >
                Return to Editor (ESC)
              </button>
            </div>
          </div>

          {/* CRT Screen Display with active rendered rows */}
          <div className="flex-1 overflow-hidden relative">
            <CrtDisplay
              grid={activeGrid}
              scanlines={scanlines}
              setScanlines={setScanlines}
              curvature={curvature}
              setCurvature={setCurvature}
              crtTheme={crtTheme}
              setCrtTheme={setCrtTheme}
              gridOverlay={gridOverlay}
              setGridOverlay={setGridOverlay}
            />

            {/* If execution reached end, show classic DOS prompt */}
            {isPausedAtEnd && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-neutral-950/90 border border-amber-500/50 px-4 py-2 rounded shadow-2xl text-center z-30 animate-pulse">
                <span className="text-amber-400 font-mono text-sm">
                  Press any key to continue...
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* QBASIC 1.1 IDE Interface */
        <div className="flex-1 flex flex-col h-full bg-[#0000A8]">
          {/* Top QBasic Menu Bar */}
          <div className="h-6 bg-[#AAAAAA] text-black px-2 flex items-center justify-between text-xs font-mono font-medium shadow-sm">
            <div className="flex items-center gap-4">
              <span><span className="underline">F</span>ile</span>
              <span><span className="underline">E</span>dit</span>
              <span><span className="underline">V</span>iew</span>
              <span><span className="underline">S</span>earch</span>
              <span className="text-[#0000A8] font-bold"><span className="underline">R</span>un</span>
              <span><span className="underline">D</span>ebug</span>
              <span><span className="underline">O</span>ptions</span>
              <span><span className="underline">H</span>elp</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-800 text-[11px]">
              <span>MS-DOS QBasic 1.1</span>
            </div>
          </div>

          {/* Subheader Toolbar: Technique selector & Quick Actions */}
          <div className="h-10 bg-[#000088] border-b border-[#000055] px-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#AAAAAA] text-xs">Loader Technique:</span>
              <div className="flex items-center bg-[#000055] rounded p-0.5 border border-[#000033]">
                <button
                  onClick={() => setMethod('data-read')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    method === 'data-read'
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  SCREEN 0 DATA/READ
                </button>
                <button
                  onClick={() => setMethod('bload-memory')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    method === 'bload-memory'
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  Video Mem &HB800 (BLOAD/POKE)
                </button>
                <button
                  onClick={() => setMethod('pure-ansi-sub')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    method === 'pure-ansi-sub'
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  Pure ANSI Parser SUB
                </button>
                <button
                  onClick={() => setMethod('screen13-graphics')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    method === 'screen13-graphics'
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  SCREEN 13 VGA
                </button>
              </div>
            </div>

            {/* Run / Copy / Download actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-[#AAAAAA] mr-2">
                <span>Speed:</span>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value as any)}
                  className="bg-[#000055] text-white rounded px-1.5 py-0.5 border border-[#000033] outline-none cursor-pointer"
                >
                  <option value="instant">Instant</option>
                  <option value="fast">DOS 4.77MHz (Fast)</option>
                  <option value="slow">Retro 8088 (Slow)</option>
                </select>
              </div>

              <button
                onClick={startRunning}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded text-xs transition-colors cursor-pointer shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run (F5)</span>
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#000055] hover:bg-[#000044] text-neutral-200 border border-[#000033] rounded text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy .BAS'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#000055] hover:bg-[#000044] text-neutral-200 border border-[#000033] rounded text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .BAS</span>
              </button>
            </div>
          </div>

          {/* QBasic Window Title Header */}
          <div className="h-5 bg-[#00AAAA] text-black px-2 flex items-center justify-between text-xs font-bold border-b border-black">
            <span className="cursor-pointer">[■]</span>
            <span>════════════ ARTLOAD.BAS ════════════</span>
            <span className="cursor-pointer">[↑]</span>
          </div>

          {/* Code Editor Pane */}
          <div className="flex-1 overflow-auto bg-[#0000A8] p-3 text-sm font-mono leading-relaxed select-text">
            <pre className="text-white whitespace-pre font-mono">
              {code.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                let colorClass = 'text-white';
                if (trimmed.startsWith("'") || trimmed.startsWith('REM')) {
                  colorClass = 'text-[#55FFFF] font-normal'; // QBasic Comments
                } else if (
                  trimmed.startsWith('SCREEN') ||
                  trimmed.startsWith('WIDTH') ||
                  trimmed.startsWith('COLOR') ||
                  trimmed.startsWith('CLS') ||
                  trimmed.startsWith('DEF') ||
                  trimmed.startsWith('READ') ||
                  trimmed.startsWith('DATA') ||
                  trimmed.startsWith('RESTORE') ||
                  trimmed.startsWith('SUB') ||
                  trimmed.startsWith('END') ||
                  trimmed.startsWith('PRINT') ||
                  trimmed.startsWith('POKE') ||
                  trimmed.startsWith('BLOAD') ||
                  trimmed.startsWith('DO') ||
                  trimmed.startsWith('LOOP') ||
                  trimmed.startsWith('WHILE') ||
                  trimmed.startsWith('WEND')
                ) {
                  colorClass = 'text-[#FFFFFF] font-bold';
                }

                return (
                  <div key={idx} className="flex">
                    <span className="w-12 text-[#5555FF] select-none text-right pr-3 shrink-0">
                      {idx + 1}
                    </span>
                    <span className={colorClass}>{line}</span>
                  </div>
                );
              })}
            </pre>
          </div>

          {/* Immediate Window Pane */}
          <div className="h-20 bg-[#000088] border-t-2 border-[#00AAAA] flex flex-col shrink-0">
            <div className="h-5 bg-[#00AAAA] text-black px-2 text-xs font-bold flex items-center justify-between">
              <span>Immediate</span>
              <span>[↑]</span>
            </div>
            <div className="p-2 text-xs text-[#55FFFF] flex-1">
              <span>? "QBasic ANSI Studio ready. Press F5 to execute code."</span>
            </div>
          </div>

          {/* Bottom QBasic Status Bar */}
          <div className="h-6 bg-[#AAAAAA] text-black px-2 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4">
              <span>&lt;Shift+F5=Restart&gt;</span>
              <span className="font-bold text-[#0000A8]">&lt;F5=Continue&gt;</span>
              <span>&lt;F1=Help&gt;</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Caps</span>
              <span>Num</span>
              <span className="font-mono">00001:001</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
