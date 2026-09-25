/**
 * Export Modal Component
 * Allows downloading .BAS programs, .ANS ANSI art files, .BIN screen dumps,
 * .TXT unicode art, and CRT screenshot PNGs.
 */

import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Terminal, Image as ImageIcon, Binary } from 'lucide-react';
import { DosCell, QbasicExportMethod } from '../types/dos';
import { generateQbasicCode } from '../utils/qbasicGenerator';
import { downloadFile, generateBinBuffer, generatePlainText } from '../utils/ansiGenerator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: DosCell[][];
  ansiString: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  grid,
  ansiString,
}) => {
  const [method, setMethod] = useState<QbasicExportMethod>('data-read');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAnsi, setCopiedAnsi] = useState(false);

  if (!isOpen) return null;

  const qbasicCode = generateQbasicCode(grid, method, 'ARTWORK', ansiString);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qbasicCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAnsi = () => {
    navigator.clipboard.writeText(ansiString);
    setCopiedAnsi(true);
    setTimeout(() => setCopiedAnsi(false), 2000);
  };

  const handleDownloadBas = () => {
    downloadFile(qbasicCode, 'ARTWORK.BAS', 'text/plain');
  };

  const handleDownloadAns = () => {
    downloadFile(ansiString, 'ARTWORK.ANS', 'text/plain');
  };

  const handleDownloadBin = () => {
    const binData = generateBinBuffer(grid);
    downloadFile(binData, 'ARTWORK.BIN', 'application/octet-stream');
  };

  const handleDownloadTxt = () => {
    const txt = generatePlainText(grid);
    downloadFile(txt, 'ARTWORK.TXT', 'text/plain;charset=utf-8');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-neutral-100">
              Export Artwork & Code Samples
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Format Download Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* .BAS QBasic Program */}
            <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-amber-400 flex items-center gap-1.5 font-mono">
                    <FileCode className="w-3.5 h-3.5" />
                    ARTWORK.BAS
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    QBasic Source
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Ready-to-run program for MS-DOS QBasic, QuickBASIC 4.5, and QB64.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/60">
                <button
                  onClick={handleDownloadBas}
                  className="flex-1 py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .BAS</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  className="py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs transition-colors cursor-pointer"
                  title="Copy QBasic Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* .ANS Standard ANSI File */}
            <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-amber-400 flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5" />
                    ARTWORK.ANS
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ANSI.SYS BBS File
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Standard escape sequence file compatible with TheDraw, PabloDraw, Moebius, and BBS systems.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/60">
                <button
                  onClick={handleDownloadAns}
                  className="flex-1 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ANS</span>
                </button>
                <button
                  onClick={handleCopyAnsi}
                  className="py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs transition-colors cursor-pointer"
                  title="Copy ANSI String"
                >
                  {copiedAnsi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* .BIN Raw DOS Screen Dump */}
            <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-amber-400 flex items-center gap-1.5 font-mono">
                    <Binary className="w-3.5 h-3.5" />
                    ARTWORK.BIN
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    4,000 Bytes RAM Dump
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Binary video memory dump loaded in 1 frame using DEF SEG = &HB800: BLOAD "ARTWORK.BIN", 0.
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-800/60">
                <button
                  onClick={handleDownloadBin}
                  className="w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .BIN (4 KB)</span>
                </button>
              </div>
            </div>

            {/* .TXT Plain Text UTF-8 */}
            <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-amber-400 flex items-center gap-1.5 font-mono">
                    <ImageIcon className="w-3.5 h-3.5" />
                    ARTWORK.TXT
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    UTF-8 Character Art
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Clean text format using unicode block characters for modern editors and terminal displays.
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-800/60">
                <button
                  onClick={handleDownloadTxt}
                  className="w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loader Selection for .BAS Generation */}
          <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-2">
            <label className="text-xs font-semibold text-neutral-300 block">
              Embedded QBasic Loader Architecture for .BAS export:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setMethod('data-read')}
                className={`p-2 rounded border text-left cursor-pointer transition-colors ${
                  method === 'data-read'
                    ? 'border-amber-400 bg-amber-950/30 text-white'
                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-amber-400">RLE DATA / READ Loader</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Standalone, no external files</div>
              </button>

              <button
                onClick={() => setMethod('bload-memory')}
                className={`p-2 rounded border text-left cursor-pointer transition-colors ${
                  method === 'bload-memory'
                    ? 'border-amber-400 bg-amber-950/30 text-white'
                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-amber-400">Memory &HB800 BLOAD/POKE</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Direct hardware video RAM</div>
              </button>

              <button
                onClick={() => setMethod('pure-ansi-sub')}
                className={`p-2 rounded border text-left cursor-pointer transition-colors ${
                  method === 'pure-ansi-sub'
                    ? 'border-amber-400 bg-amber-950/30 text-white'
                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-amber-400">Native ANSI Parser SUB</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Software ESC interpreter</div>
              </button>

              <button
                onClick={() => setMethod('screen13-graphics')}
                className={`p-2 rounded border text-left cursor-pointer transition-colors ${
                  method === 'screen13-graphics'
                    ? 'border-amber-400 bg-amber-950/30 text-white'
                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-amber-400">SCREEN 13 VGA Graphics</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">320x200 pixel mode</div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 rounded-md transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
