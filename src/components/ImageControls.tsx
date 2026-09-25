/**
 * Image Controls Sidebar
 * Configures image source, character mode, resolution, dithering algorithms,
 * color palettes, and retro image adjustments.
 */

import React, { useRef } from 'react';
import {
  Upload,
  Sliders,
  Palette,
  Sparkles,
  Grid,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import {
  CharacterMode,
  DitherAlgorithm,
  ImageAdjustments,
  PaletteType,
} from '../types/dos';

interface PresetItem {
  id: string;
  name: string;
  desc: string;
  url: string;
}

const PRESET_IMAGES: PresetItem[] = [
  {
    id: 'dos-pc',
    name: 'IBM 5150 PC',
    desc: 'Vintage DOS workstation',
    url: '/src/assets/images/retro_dos_computer_1790304948557.jpg',
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Portrait',
    desc: '80s Arcade Synth character',
    url: '/src/assets/images/cyber_pixel_portrait_1790304959926.jpg',
  },
  {
    id: 'mountain',
    name: 'Alpine Sunset',
    desc: 'Retro Sierra adventure lake',
    url: '/src/assets/images/retro_mountain_landscape_1790304970102.jpg',
  },
];

interface ImageControlsProps {
  onSelectImage: (src: string) => void;
  selectedPreset: string;
  mode: CharacterMode;
  setMode: (m: CharacterMode) => void;
  cols: number;
  setCols: (n: number) => void;
  rows: number;
  setRows: (n: number) => void;
  ditherAlgo: DitherAlgorithm;
  setDitherAlgo: (a: DitherAlgorithm) => void;
  adjustments: ImageAdjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<ImageAdjustments>>;
  paletteType: PaletteType;
  setPaletteType: (p: PaletteType) => void;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  onSelectImage,
  selectedPreset,
  mode,
  setMode,
  cols,
  setCols,
  rows,
  setRows,
  ditherAlgo,
  setDitherAlgo,
  adjustments,
  setAdjustments,
  paletteType,
  setPaletteType,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onSelectImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      gamma: 1.0,
      invert: false,
      ditherStrength: 100,
      aspectCorrection: true,
    });
  };

  const handleResolutionPreset = (presetCols: number, presetRows: number) => {
    setCols(presetCols);
    setRows(presetRows);
  };

  return (
    <aside className="w-84 border-r border-neutral-800 bg-neutral-900/90 flex flex-col h-full text-xs select-none overflow-y-auto shrink-0">
      {/* Preset & Upload Section */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            Source Image
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <Upload className="w-3 h-3" />
            Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-3 gap-2">
          {PRESET_IMAGES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectImage(preset.url)}
              className={`flex flex-col items-center rounded-md border p-1 text-left transition-all cursor-pointer ${
                selectedPreset === preset.url
                  ? 'border-amber-400 bg-amber-950/30'
                  : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                referrerPolicy="no-referrer"
                className="w-full h-12 object-cover rounded mb-1"
              />
              <span className="text-[10px] font-medium text-neutral-300 truncate w-full text-center">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode & Resolution */}
      <div className="p-4 border-b border-neutral-800 space-y-3">
        <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-amber-400" />
          Character Mode & Grid
        </span>

        {/* Mode Selector */}
        <div>
          <label className="text-neutral-400 block mb-1">Character Technique</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as CharacterMode)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 outline-none focus:border-amber-400"
          >
            <option value="half-block">Half-Block ▀ CHR$(223) (80×50 Hi-Res)</option>
            <option value="cp437-shaded">CP437 Shaded Blocks ░▒▓█ (80×25)</option>
            <option value="ascii-ramp">ASCII Ramp .:-=+*#%@ (80×25)</option>
            <option value="full-block">Full Block █ CHR$(219) (80×25)</option>
          </select>
          <span className="text-[10px] text-neutral-500 mt-1 block">
            {mode === 'half-block'
              ? 'Doubles vertical resolution using FG for top & BG for bottom pixel.'
              : mode === 'cp437-shaded'
              ? 'Uses extended ASCII block shading density with 16 foreground colors.'
              : 'Maps pixel luminance to classic ASCII character symbols.'}
          </span>
        </div>

        {/* Resolution presets */}
        <div>
          <label className="text-neutral-400 block mb-1">Resolution Presets</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleResolutionPreset(80, 25)}
              className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors cursor-pointer ${
                cols === 80 && rows === 25
                  ? 'bg-amber-400 text-black font-semibold border-amber-400'
                  : 'bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              80×25 DOS
            </button>
            <button
              onClick={() => handleResolutionPreset(80, 50)}
              className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors cursor-pointer ${
                cols === 80 && rows === 50
                  ? 'bg-amber-400 text-black font-semibold border-amber-400'
                  : 'bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              80×50 Mode
            </button>
            <button
              onClick={() => handleResolutionPreset(40, 25)}
              className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors cursor-pointer ${
                cols === 40 && rows === 25
                  ? 'bg-amber-400 text-black font-semibold border-amber-400'
                  : 'bg-neutral-950 border-neutral-700 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              40×25 Tandy
            </button>
          </div>
        </div>

        {/* Custom Columns / Rows */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-neutral-400 block mb-0.5">Columns ({cols})</label>
            <input
              type="range"
              min="20"
              max="120"
              step="2"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-0.5">Rows ({rows})</label>
            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Dithering Engine */}
      <div className="p-4 border-b border-neutral-800 space-y-3">
        <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Dithering Engine
        </span>

        <div>
          <label className="text-neutral-400 block mb-1">Algorithm</label>
          <select
            value={ditherAlgo}
            onChange={(e) => setDitherAlgo(e.target.value as DitherAlgorithm)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 outline-none focus:border-amber-400"
          >
            <option value="floyd-steinberg">Floyd-Steinberg (Error Diffusion)</option>
            <option value="atkinson">Atkinson (Mac/Lisa Crisp Dither)</option>
            <option value="bayer-4x4">Bayer 4×4 (Classic Ordered Grid)</option>
            <option value="bayer-8x8">Bayer 8×8 (Fine Ordered Pattern)</option>
            <option value="bayer-2x2">Bayer 2×2 (Coarse Crosshatch)</option>
            <option value="sierra-3">Sierra-3 (Smooth Diffusion)</option>
            <option value="stucki">Stucki (Sharp Diffusion)</option>
            <option value="burkes">Burkes (Clean Error Distribution)</option>
            <option value="none">None (Nearest Color Threshold)</option>
          </select>
        </div>

        {/* Dither Strength */}
        {ditherAlgo !== 'none' && (
          <div>
            <div className="flex justify-between text-neutral-400 mb-0.5">
              <span>Dither Strength</span>
              <span className="font-mono text-neutral-300">
                {adjustments.ditherStrength}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adjustments.ditherStrength}
              onChange={(e) =>
                setAdjustments((prev) => ({
                  ...prev,
                  ditherStrength: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Palette Selection */}
      <div className="p-4 border-b border-neutral-800 space-y-3">
        <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          Color Palette
        </span>

        <div>
          <select
            value={paletteType}
            onChange={(e) => setPaletteType(e.target.value as PaletteType)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 outline-none focus:border-amber-400"
          >
            <option value="vga-16">MS-DOS Standard 16 Colors (VGA / ANSI)</option>
            <option value="cga-mode1">CGA Mode 1 (Cyan / Magenta / White)</option>
            <option value="cga-mode2">CGA Mode 2 (Green / Red / Yellow)</option>
            <option value="amber-crt">Amber Phosphor CRT (P3 Monochrome)</option>
            <option value="green-crt">Green Phosphor CRT (P1 Monochrome)</option>
            <option value="c64-16">Commodore 64 Palette (16 Colors)</option>
          </select>
        </div>
      </div>

      {/* Retro Image Adjustments */}
      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Image Grading
          </span>
          <button
            onClick={resetAdjustments}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
            title="Reset adjustments to default"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Brightness */}
        <div>
          <div className="flex justify-between text-neutral-400 mb-0.5">
            <span>Brightness</span>
            <span className="font-mono text-neutral-300">
              {adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.brightness}
            onChange={(e) =>
              setAdjustments((prev) => ({
                ...prev,
                brightness: parseInt(e.target.value, 10),
              }))
            }
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-neutral-400 mb-0.5">
            <span>Contrast</span>
            <span className="font-mono text-neutral-300">
              {adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.contrast}
            onChange={(e) =>
              setAdjustments((prev) => ({
                ...prev,
                contrast: parseInt(e.target.value, 10),
              }))
            }
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between text-neutral-400 mb-0.5">
            <span>Saturation</span>
            <span className="font-mono text-neutral-300">
              {adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.saturation}
            onChange={(e) =>
              setAdjustments((prev) => ({
                ...prev,
                saturation: parseInt(e.target.value, 10),
              }))
            }
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Gamma */}
        <div>
          <div className="flex justify-between text-neutral-400 mb-0.5">
            <span>Gamma</span>
            <span className="font-mono text-neutral-300">
              {adjustments.gamma.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="40"
            max="240"
            value={Math.round(adjustments.gamma * 100)}
            onChange={(e) =>
              setAdjustments((prev) => ({
                ...prev,
                gamma: parseInt(e.target.value, 10) / 100,
              }))
            }
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Invert */}
        <div className="pt-1 flex items-center justify-between">
          <label className="text-neutral-300 cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={adjustments.invert}
              onChange={(e) =>
                setAdjustments((prev) => ({
                  ...prev,
                  invert: e.target.checked,
                }))
              }
              className="accent-amber-400 rounded cursor-pointer"
            />
            <span>Invert Lum / Negative</span>
          </label>
        </div>
      </div>
    </aside>
  );
};
