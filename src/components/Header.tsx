/**
 * Header Component conforming strictly to the Top Bar Contract:
 * [Zone 1: Single text element wordmark] - [Zone 2: 4-6 nav links] - [Zone 3: 1-2 primary actions]
 */

import React from 'react';
import { Play, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'converter' | 'ide' | 'samples' | 'architecture';
  setActiveTab: (tab: 'converter' | 'ide' | 'samples' | 'architecture') => void;
  onRunClick: () => void;
  onExportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunClick,
  onExportClick,
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950 px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Zone 1: Single text element wordmark */}
      <span className="text-sm font-semibold tracking-wider text-amber-400 font-mono">
        QBASIC ANSI STUDIO
      </span>

      {/* Zone 2: 4 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
        <button
          onClick={() => setActiveTab('converter')}
          className={`hover:text-neutral-100 transition-colors cursor-pointer ${
            activeTab === 'converter' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Converter & CRT
        </button>
        <button
          onClick={() => setActiveTab('ide')}
          className={`hover:text-neutral-100 transition-colors cursor-pointer ${
            activeTab === 'ide' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Virtual QBasic IDE
        </button>
        <button
          onClick={() => setActiveTab('samples')}
          className={`hover:text-neutral-100 transition-colors cursor-pointer ${
            activeTab === 'samples' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Loader Code Samples
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`hover:text-neutral-100 transition-colors cursor-pointer ${
            activeTab === 'architecture' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          DOS Memory Architecture
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onRunClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-black bg-amber-400 rounded-md hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          title="Run code in simulated QBasic (F5)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run (F5)</span>
        </button>
        <button
          onClick={onExportClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 transition-colors cursor-pointer whitespace-nowrap"
          title="Export BAS, ANS, BIN, and PNG files"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
