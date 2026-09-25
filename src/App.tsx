/**
 * QBasic ANSI Studio & Dither Converter
 * Main Application Component
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CrtDisplay } from './components/CrtDisplay';
import { VirtualQbasicIde } from './components/VirtualQbasicIde';
import { ImageControls } from './components/ImageControls';
import { LoaderDocs } from './components/LoaderDocs';
import { MemoryArchitectureDocs } from './components/MemoryArchitectureDocs';
import { ExportModal } from './components/ExportModal';
import {
  CharacterMode,
  DitherAlgorithm,
  DosCell,
  ImageAdjustments,
  PaletteType,
} from './types/dos';
import { processImageToDosGrid } from './utils/imageProcessor';
import { generateAnsiString } from './utils/ansiGenerator';

const DEFAULT_IMAGE = '/src/assets/images/retro_dos_computer_1790304948557.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<'converter' | 'ide' | 'samples' | 'architecture'>('converter');
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);
  const [mode, setMode] = useState<CharacterMode>('half-block');
  const [cols, setCols] = useState<number>(80);
  const [rows, setRows] = useState<number>(25);
  const [ditherAlgo, setDitherAlgo] = useState<DitherAlgorithm>('floyd-steinberg');
  const [paletteType, setPaletteType] = useState<PaletteType>('vga-16');

  // Display toggles
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [curvature, setCurvature] = useState<boolean>(true);
  const [crtTheme, setCrtTheme] = useState<'color' | 'green' | 'amber'>('color');
  const [gridOverlay, setGridOverlay] = useState<boolean>(false);

  // Modal
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Image adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 10,
    saturation: 15,
    gamma: 1.0,
    invert: false,
    ditherStrength: 90,
    aspectCorrection: true,
  });

  // Processed Grid State
  const [grid, setGrid] = useState<DosCell[][]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Process source image whenever parameters change
  useEffect(() => {
    let isCancelled = false;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (isCancelled) return;
      const resultGrid = processImageToDosGrid(
        img,
        cols,
        rows,
        mode,
        ditherAlgo,
        adjustments,
        paletteType
      );
      setGrid(resultGrid);
      setIsProcessing(false);
    };
    img.onerror = () => {
      setIsProcessing(false);
    };
    img.src = imageSrc;

    return () => {
      isCancelled = true;
    };
  }, [imageSrc, cols, rows, mode, ditherAlgo, adjustments, paletteType]);

  // Pre-generate ANSI escape sequence string
  const ansiString = useMemo(() => {
    if (grid.length === 0) return '';
    return generateAnsiString(grid);
  }, [grid]);

  // Handle Run F5
  const handleRun = () => {
    setActiveTab('ide');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100">
      {/* Top Header conforming to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunClick={handleRun}
        onExportClick={() => setIsExportOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'converter' && (
          <>
            {/* Left Controls Sidebar */}
            <ImageControls
              onSelectImage={(url) => setImageSrc(url)}
              selectedPreset={imageSrc}
              mode={mode}
              setMode={setMode}
              cols={cols}
              setCols={setCols}
              rows={rows}
              setRows={setRows}
              ditherAlgo={ditherAlgo}
              setDitherAlgo={setDitherAlgo}
              adjustments={adjustments}
              setAdjustments={setAdjustments}
              paletteType={paletteType}
              setPaletteType={setPaletteType}
            />

            {/* Center CRT Screen Viewport */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              <CrtDisplay
                grid={grid}
                scanlines={scanlines}
                setScanlines={setScanlines}
                curvature={curvature}
                setCurvature={setCurvature}
                crtTheme={crtTheme}
                setCrtTheme={setCrtTheme}
                gridOverlay={gridOverlay}
                setGridOverlay={setGridOverlay}
              />

              {isProcessing && (
                <div className="absolute top-14 right-4 bg-neutral-900/90 border border-neutral-700 px-3 py-1.5 rounded text-xs text-amber-400 font-mono flex items-center gap-2 shadow-lg z-20">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Dithering Image...</span>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'ide' && (
          <VirtualQbasicIde
            grid={grid}
            scanlines={scanlines}
            setScanlines={setScanlines}
            curvature={curvature}
            setCurvature={setCurvature}
            crtTheme={crtTheme}
            setCrtTheme={setCrtTheme}
            gridOverlay={gridOverlay}
            setGridOverlay={setGridOverlay}
            ansiString={ansiString}
          />
        )}

        {activeTab === 'samples' && <LoaderDocs />}

        {activeTab === 'architecture' && <MemoryArchitectureDocs />}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        grid={grid}
        ansiString={ansiString}
      />
    </div>
  );
}
