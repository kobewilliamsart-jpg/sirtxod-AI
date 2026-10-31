import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, AppTab, DeviceViewMode } from './components/Navbar';
import { AppUpdateBar } from './components/AppUpdateBar';
import { useAppUpdate } from './hooks/useAppUpdate';
import { TextToSpeechStudio } from './components/TextToSpeechStudio';
import { AudioLibrary } from './components/AudioLibrary';
import { ProjectsManager } from './components/ProjectsManager';
import { VoiceCloningLab } from './components/VoiceCloningLab';
import { SettingsModal } from './components/SettingsModal';
import { AudioRecord, Project, VoiceCloneProfile, BrandTheme } from './types/tts';
import {
  getAllAudioRecords,
  getAllProjects,
  getAllVoiceClones,
  getStorageStats,
  saveProject,
} from './services/db';
import { downloadBlob, formatFileSize } from './services/audioUtils';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('studio');
  const [currentTheme, setCurrentTheme] = useState<BrandTheme>('teal');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // PWA and Server update tracking
  const {
    isUpdateAvailable,
    isChecking: isCheckingUpdate,
    isUpdating,
    updateInfo,
    checkStatus: updateCheckStatus,
    isBannerDismissed,
    checkForUpdate,
    applyUpdate,
    dismissBanner,
  } = useAppUpdate();

  // Device detection and simulation
  const [detectedScreen, setDetectedScreen] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [deviceMode, setDeviceMode] = useState<DeviceViewMode>('auto');

  // Application Data States
  const [audios, setAudios] = useState<AudioRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customClones, setCustomClones] = useState<VoiceCloneProfile[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(undefined);
  const [storageStats, setStorageStats] = useState({
    audioCount: 0,
    totalBytes: 0,
    projectCount: 0,
    cloneCount: 0,
  });

  // Responsive device listener
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDetectedScreen('mobile');
      } else if (width < 1024) {
        setDetectedScreen('tablet');
      } else {
        setDetectedScreen('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch initial data from IndexedDB
  const refreshAllData = useCallback(async () => {
    try {
      const loadedAudios = await getAllAudioRecords();
      let loadedProjects = await getAllProjects();
      const loadedClones = await getAllVoiceClones();
      const stats = await getStorageStats();

      // Seed initial sample project if first time
      if (loadedProjects.length === 0) {
        const defaultProject: Project = {
          id: 'proj-welcome-demo',
          title: 'sirtxod-AI Master Showcase',
          description: 'Initial studio project showcasing neural multilingual synthesis and voice clarity.',
          category: 'Podcast',
          lastModified: Date.now(),
          text: 'Welcome to sirtxod-AI, the next-generation neural text-to-speech studio. Transform written words into breathtaking, lifelike voices in seconds with complete studio control.',
          targetVoiceId: 'voice-kore',
          targetLanguage: 'en-US',
          readingSpeed: 1.0,
          pitch: 0,
          audioCount: 0,
          tags: ['Welcome', 'Studio Master', 'AI Speech'],
        };
        await saveProject(defaultProject);
        loadedProjects = [defaultProject];
      }

      setAudios(loadedAudios);
      setProjects(loadedProjects);
      setCustomClones(loadedClones);
      setStorageStats(stats);
    } catch (err) {
      console.error('Failed to load records from IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Navigate to studio with selected project
  const handleOpenProjectInStudio = (project: Project) => {
    setActiveProjectId(project.id);
    setCurrentTab('studio');
  };

  // Save project modifications from studio
  const handleSaveProjectFromStudio = async (project: Project) => {
    await saveProject(project);
    await refreshAllData();
  };

  // Navigate to studio with custom clone selected
  const handleSelectCloneForTTS = (cloneId: string) => {
    setCurrentTab('studio');
  };

  // Export full JSON backup of metadata
  const handleExportAllData = () => {
    const exportPayload = {
      app: 'sirtxod-AI',
      exportedAt: new Date().toISOString(),
      projects,
      customClones,
      audioMetadata: audios.map((a) => ({
        id: a.id,
        title: a.title,
        voiceName: a.voiceName,
        language: a.language,
        durationSeconds: a.durationSeconds,
        createdAt: a.createdAt,
        text: a.text,
      })),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, `sirtxod-AI-backup-${Date.now()}.json`);
  };

  // Clear offline cache
  const handleClearStorage = async () => {
    const req = indexedDB.deleteDatabase('sirtxod_ai_studio_db');
    req.onsuccess = () => {
      setAudios([]);
      setProjects([]);
      setCustomClones([]);
      setStorageStats({ audioCount: 0, totalBytes: 0, projectCount: 0, cloneCount: 0 });
      refreshAllData();
    };
  };

  // Effective device view width calculation for simulation
  const effectiveDevice = deviceMode === 'auto' ? detectedScreen : deviceMode;
  let deviceContainerClass = 'w-full';
  if (effectiveDevice === 'mobile') {
    deviceContainerClass = 'max-w-md mx-auto shadow-2xl border-x border-slate-800 my-4 rounded-3xl overflow-hidden bg-slate-950';
  } else if (effectiveDevice === 'tablet') {
    deviceContainerClass = 'max-w-3xl mx-auto shadow-2xl border-x border-slate-800 my-4 rounded-3xl overflow-hidden bg-slate-950';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Dynamic theme accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />

      {/* Untop Update Alert Bar (signals whenever an update is available) */}
      <AppUpdateBar
        isUpdateAvailable={isUpdateAvailable}
        updateInfo={updateInfo}
        isUpdating={isUpdating}
        onApplyUpdate={applyUpdate}
        onDismiss={dismissBanner}
        isDismissed={isBannerDismissed}
      />

      {/* Top Navbar with integrated Update Button */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        audioCount={audios.length}
        projectCount={projects.length}
        cloneCount={customClones.length}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
        detectedScreen={detectedScreen}
        storageSizeStr={formatFileSize(storageStats.totalBytes)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isUpdateAvailable={isUpdateAvailable}
        isChecking={isCheckingUpdate}
        isUpdating={isUpdating}
        checkStatus={updateCheckStatus}
        onCheckForUpdate={checkForUpdate}
        onApplyUpdate={applyUpdate}
      />

      {/* Main Responsive View Container */}
      <main className={`flex-1 ${deviceContainerClass} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {currentTab === 'studio' && (
            <TextToSpeechStudio
              projects={projects}
              customClones={customClones}
              currentProjectId={activeProjectId}
              onSelectProject={(id) => setActiveProjectId(id || undefined)}
              onAudioCreated={() => {
                refreshAllData();
                setCurrentTab('library');
              }}
              onNavigateToCloning={() => setCurrentTab('cloning')}
              onSaveProject={handleSaveProjectFromStudio}
            />
          )}

          {currentTab === 'library' && (
            <AudioLibrary
              audios={audios}
              onRefreshAudios={refreshAllData}
              onNavigateToStudio={() => setCurrentTab('studio')}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              onRefreshProjects={refreshAllData}
              onOpenProjectInStudio={handleOpenProjectInStudio}
            />
          )}

          {currentTab === 'cloning' && (
            <VoiceCloningLab
              clones={customClones}
              onRefreshClones={refreshAllData}
              onSelectCloneForTTS={handleSelectCloneForTTS}
            />
          )}
        </div>
      </main>

      {/* Settings Modal (Theme & Storage) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        storageStats={storageStats}
        onExportAllData={handleExportAllData}
        onClearStorage={handleClearStorage}
      />

      {/* Modern footer with square brand logo */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-teal-500/30 aspect-square shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="sirtxod-AI"
                className="w-full h-full object-cover block"
              />
            </div>
            <span className="font-bold text-slate-300">sirtxod-AI</span>
            <span>• Neural TTS & Voice Cloning PWA</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Free Unlimited Neural Audio</span>
            <span>•</span>
            <span>PWA Offline Enabled</span>
            <span>•</span>
            <span className="text-teal-400 font-mono">v2.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
