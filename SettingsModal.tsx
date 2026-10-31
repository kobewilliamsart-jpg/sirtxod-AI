import React, { useState } from 'react';
import {
  Palette,
  HardDrive,
  Download,
  Trash2,
  Check,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { BrandTheme } from '../types/tts';
import { formatFileSize } from '../services/audioUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: BrandTheme;
  onThemeChange: (theme: BrandTheme) => void;
  storageStats: {
    audioCount: number;
    totalBytes: number;
    projectCount: number;
    cloneCount: number;
  };
  onExportAllData: () => void;
  onClearStorage: () => void;
}

const THEME_OPTIONS: { id: BrandTheme; name: string; primaryHex: string; gradient: string }[] = [
  { id: 'teal', name: 'sirtxod Teal Aurora (Official)', primaryHex: '#2dd4bf', gradient: 'from-teal-400 to-cyan-500' },
  { id: 'cyan', name: 'Cyber Electric Cyan', primaryHex: '#06b6d4', gradient: 'from-cyan-400 to-blue-500' },
  { id: 'emerald', name: 'Emerald Studio Master', primaryHex: '#10b981', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'slate', name: 'Obsidian Stealth Studio', primaryHex: '#94a3b8', gradient: 'from-slate-300 to-slate-500' },
  { id: 'violet', name: 'Neon Synthwave Violet', primaryHex: '#a855f7', gradient: 'from-purple-400 to-indigo-500' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  storageStats,
  onExportAllData,
  onClearStorage,
}) => {
  const [clearingSuccess, setClearingSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your local offline audio cache? This action cannot be undone.')) {
      onClearStorage();
      setClearingSuccess(true);
      setTimeout(() => setClearingSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-teal-500/40 aspect-square shrink-0">
              <img src="/pwa-192x192.png" alt="sirtxod-AI" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Studio Settings & Offline Cache</h3>
              <p className="text-[11px] text-slate-400">Palette themes and IndexedDB local storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Palette Switcher */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Color Accent Theme
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500 shadow-md shadow-teal-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-lg bg-gradient-to-r ${theme.gradient}`} />
                    <span className="text-xs font-semibold text-white">{theme.name.split(' ')[0]}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-400 stroke-[3]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Local Storage & Cache */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              IndexedDB Storage Cache
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300">
              Offline Available
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Audios Cached</span>
              <span className="font-mono text-teal-300 font-bold text-sm">{storageStats.audioCount} files</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Storage Used</span>
              <span className="font-mono text-cyan-300 font-bold text-sm">{formatFileSize(storageStats.totalBytes)}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={onExportAllData}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export Full Metadata Backup (JSON)</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Offline Cache</span>
            </button>

            {clearingSuccess && (
              <p className="text-xs text-teal-400 text-center font-semibold animate-in fade-in">
                ✓ Offline cache cleared successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
