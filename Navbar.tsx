import React from 'react';
import {
  Mic,
  FolderOpen,
  FolderKanban,
  Wand2,
  HardDrive,
  Laptop,
  Tablet,
  Smartphone,
  Settings,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AppUpdateButton } from './AppUpdateButton';

export type AppTab = 'studio' | 'library' | 'projects' | 'cloning';
export type DeviceViewMode = 'auto' | 'desktop' | 'tablet' | 'mobile';

interface NavbarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  audioCount: number;
  projectCount: number;
  cloneCount: number;
  deviceMode: DeviceViewMode;
  onDeviceModeChange: (mode: DeviceViewMode) => void;
  detectedScreen: 'desktop' | 'tablet' | 'mobile';
  storageSizeStr: string;
  onOpenSettings: () => void;
  isUpdateAvailable?: boolean;
  isChecking?: boolean;
  isUpdating?: boolean;
  checkStatus?: 'idle' | 'up-to-date' | 'error';
  onCheckForUpdate?: () => void;
  onApplyUpdate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  audioCount,
  projectCount,
  cloneCount,
  deviceMode,
  onDeviceModeChange,
  detectedScreen,
  storageSizeStr,
  onOpenSettings,
  isUpdateAvailable = false,
  isChecking = false,
  isUpdating = false,
  checkStatus = 'idle',
  onCheckForUpdate,
  onApplyUpdate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand & Logo - Fitted perfectly into square */}
        <div
          onClick={() => onTabChange('studio')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-teal-500/40 shadow-md shadow-teal-500/20 aspect-square shrink-0 transition-transform group-hover:scale-105">
            <img
              src="/pwa-192x192.png"
              alt="sirtxod-AI Logo"
              className="w-full h-full object-cover block"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                sirtxod-AI
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30">
                PWA v2.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Neural Speech Synthesis & Voice Cloning
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs (Team tab removed as requested) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => onTabChange('studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              currentTab === 'studio'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            TTS Studio
          </button>

          <button
            onClick={() => onTabChange('library')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all relative ${
              currentTab === 'library'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Library</span>
            {audioCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  currentTab === 'library'
                    ? 'bg-slate-950 text-teal-300'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                }`}
              >
                {audioCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('projects')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all relative ${
              currentTab === 'projects'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects</span>
            {projectCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  currentTab === 'projects'
                    ? 'bg-slate-950 text-teal-300'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {projectCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('cloning')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all relative ${
              currentTab === 'cloning'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Voice Cloning</span>
            {cloneCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  currentTab === 'cloning'
                    ? 'bg-slate-950 text-cyan-300'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {cloneCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Tools: App Update, PWA Install, Device Switcher, Storage, Settings */}
        <div className="flex items-center gap-2">
          {/* Update Button inside untop interface */}
          <AppUpdateButton
            isUpdateAvailable={isUpdateAvailable}
            isChecking={isChecking}
            isUpdating={isUpdating}
            checkStatus={checkStatus}
            onCheck={onCheckForUpdate}
            onApplyUpdate={onApplyUpdate}
          />

          {/* PWA In-App Install Button */}
          <PWAInstallButton />

          {/* Offline Cache Indicator */}
          <div
            title="Local IndexedDB storage for offline audio access"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400"
          >
            <HardDrive className="w-3.5 h-3.5 text-teal-400" />
            <span>Cache:</span>
            <span className="font-mono text-teal-300 font-semibold">{storageSizeStr}</span>
          </div>

          {/* Device simulation controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => onDeviceModeChange('desktop')}
              title="Desktop View"
              className={`p-1.5 rounded-lg text-xs transition ${
                deviceMode === 'desktop' || (deviceMode === 'auto' && detectedScreen === 'desktop')
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeviceModeChange('tablet')}
              title="Tablet View"
              className={`p-1.5 rounded-lg text-xs transition ${
                deviceMode === 'tablet' || (deviceMode === 'auto' && detectedScreen === 'tablet')
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeviceModeChange('mobile')}
              title="Mobile View"
              className={`p-1.5 rounded-lg text-xs transition ${
                deviceMode === 'mobile' || (deviceMode === 'auto' && detectedScreen === 'mobile')
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Settings & Theme Button */}
          <button
            onClick={onOpenSettings}
            title="Theme & Storage Settings"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-teal-300 border border-slate-800 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 py-2 px-1">
        <button
          onClick={() => onTabChange('studio')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-medium ${
            currentTab === 'studio' ? 'text-teal-400' : 'text-slate-400'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Studio</span>
        </button>

        <button
          onClick={() => onTabChange('library')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-medium relative ${
            currentTab === 'library' ? 'text-teal-400' : 'text-slate-400'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Library</span>
          {audioCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-teal-400" />
          )}
        </button>

        <button
          onClick={() => onTabChange('projects')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-medium ${
            currentTab === 'projects' ? 'text-teal-400' : 'text-slate-400'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => onTabChange('cloning')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-medium ${
            currentTab === 'cloning' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Cloning</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-medium text-slate-400 hover:text-teal-400 relative"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
          {isUpdateAvailable && (
            <span className="absolute top-1 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
