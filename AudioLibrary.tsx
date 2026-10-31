import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  Share2,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  FileAudio,
  HardDrive,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
  Rewind,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AudioRecord } from '../types/tts';
import {
  convertWavToMp3,
  convertWavToOggOrWebm,
  downloadBlob,
  formatDuration,
  formatFileSize,
} from '../services/audioUtils';
import { deleteAudioRecord, updateAudioTitle } from '../services/db';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';

interface AudioLibraryProps {
  audios: AudioRecord[];
  onRefreshAudios: () => void;
  onNavigateToStudio: () => void;
}

export const AudioLibrary: React.FC<AudioLibraryProps> = ({
  audios,
  onRefreshAudios,
  onNavigateToStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Active audio player state
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackDuration, setPlaybackDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // In-place rename state
  const [editingAudioId, setEditingAudioId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  // Download format modal/state
  const [downloadDropdownId, setDownloadDropdownId] = useState<string | null>(null);
  const [isConvertingFormat, setIsConvertingFormat] = useState<boolean>(false);

  // Share alert / modal state
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);

  const activeAudio = audios.find((a) => a.id === activeAudioId) || null;

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  // Filter audios
  const filteredAudios = audios.filter((audio) => {
    const matchesSearch =
      audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audio.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audio.voiceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject =
      selectedProjectId === 'all' || audio.projectId === selectedProjectId;
    const matchesLang =
      selectedLanguage === 'all' || audio.language === selectedLanguage;
    return matchesSearch && matchesProject && matchesLang;
  });

  // Extract unique languages and projects for filtering
  const uniqueLanguages = Array.from(new Set(audios.map((a) => a.language)));
  const uniqueProjects = Array.from(
    new Set(
      audios
        .filter((a) => a.projectId && a.projectTitle)
        .map((a) => JSON.stringify({ id: a.projectId, title: a.projectTitle }))
    )
  ).map((str) => JSON.parse(str));

  // Load and play audio record
  const playAudioRecord = (record: AudioRecord) => {
    if (activeAudioId === record.id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // New audio selection
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
    }

    const blob = new Blob([record.audioData], { type: record.mimeType || 'audio/wav' });
    const url = URL.createObjectURL(blob);
    currentBlobUrlRef.current = url;

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.playbackRate = playbackRate;
    audio.volume = isMuted ? 0 : volume;

    audio.onloadedmetadata = () => {
      setPlaybackDuration(audio.duration || record.durationSeconds);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    setActiveAudioId(record.id);
    setIsPlaying(true);
    audio.play().catch(console.error);
  };

  // Waveform seek
  const handleSeek = (ratio: number) => {
    if (!audioRef.current || !playbackDuration) return;
    const newTime = ratio * playbackDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Jump seconds
  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(playbackDuration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Change playback speed
  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Change volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  // Start in-place title rename
  const handleStartRename = (record: AudioRecord) => {
    setEditingAudioId(record.id);
    setEditingTitle(record.title);
  };

  // Save renamed title
  const handleSaveRename = async (id: string) => {
    if (editingTitle.trim()) {
      await updateAudioTitle(id, editingTitle.trim());
      onRefreshAudios();
    }
    setEditingAudioId(null);
  };

  // Delete audio record
  const handleDeleteAudio = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      if (activeAudioId === id && audioRef.current) {
        audioRef.current.pause();
        setActiveAudioId(null);
        setIsPlaying(false);
      }
      await deleteAudioRecord(id);
      onRefreshAudios();
    }
  };

  // Format Download Handlers
  const handleDownload = async (record: AudioRecord, format: 'wav' | 'mp3' | 'ogg') => {
    setDownloadDropdownId(null);
    setIsConvertingFormat(true);

    try {
      const sanitizedTitle = record.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32);

      if (format === 'wav') {
        const blob = new Blob([record.audioData], { type: 'audio/wav' });
        downloadBlob(blob, `${sanitizedTitle}.wav`);
      } else if (format === 'mp3') {
        const mp3Blob = convertWavToMp3(record.audioData);
        downloadBlob(mp3Blob, `${sanitizedTitle}.mp3`);
      } else if (format === 'ogg') {
        const oggBlob = await convertWavToOggOrWebm(record.audioData);
        downloadBlob(oggBlob, `${sanitizedTitle}.ogg`);
      }
    } catch (err) {
      console.error('Download format conversion failed:', err);
      // Fallback direct WAV
      const blob = new Blob([record.audioData], { type: 'audio/wav' });
      downloadBlob(blob, `${record.title}.wav`);
    } finally {
      setIsConvertingFormat(false);
    }
  };

  // Share Handler
  const handleShare = async (record: AudioRecord) => {
    const blob = new Blob([record.audioData], { type: 'audio/wav' });
    const file = new File([blob], `${record.title}.wav`, { type: 'audio/wav' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `sirtxod-AI Speech: ${record.title}`,
          text: `Neural speech recording generated with sirtxod-AI (${record.voiceName} - ${record.language})`,
          files: [file],
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy summary or trigger download
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        `[sirtxod-AI Audio]\nTitle: ${record.title}\nVoice: ${record.voiceName}\nLanguage: ${record.language}\nText: "${record.text}"`
      );
      setShareToast('Audio metadata copied to clipboard!');
      setTimeout(() => setShareToast(null), 3500);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Toast notification */}
      {shareToast && (
        <div className="fixed bottom-20 right-6 z-50 bg-teal-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Header & Storage status banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Studio Recordings Library
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-teal-400" />
              IndexedDB Offline Ready
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Synthesized Audio Vault & Player
          </h2>
          <p className="text-xs text-slate-400">
            {audios.length} {audios.length === 1 ? 'recording' : 'recordings'} stored locally for instant offline playback and multi-format export.
          </p>
        </div>

        <button
          onClick={onNavigateToStudio}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-teal-500/20 flex items-center gap-2"
        >
          <FileAudio className="w-4 h-4" />
          New Speech Synthesis
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recordings by title, script, or voice..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Filter by project */}
        {uniqueProjects.length > 0 && (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Projects</option>
            {uniqueProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        )}

        {/* Filter by language */}
        {uniqueLanguages.length > 1 && (
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Languages</option>
            {uniqueLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Recordings List */}
      {filteredAudios.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
          <FileAudio className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-200 text-base">No audio recordings found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {audios.length === 0
              ? 'Synthesize your first speech script in the studio to populate your audio library.'
              : 'Try clearing your search query or filter settings.'}
          </p>
          {audios.length === 0 && (
            <button
              onClick={onNavigateToStudio}
              className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition"
            >
              Open TTS Studio
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAudios.map((record) => {
            const isThisPlaying = activeAudioId === record.id && isPlaying;
            const isThisActive = activeAudioId === record.id;
            const isEditing = editingAudioId === record.id;

            return (
              <div
                key={record.id}
                className={`p-4 rounded-3xl border transition-all ${
                  isThisActive
                    ? 'bg-slate-900 border-teal-500/50 shadow-lg shadow-teal-500/10'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Play button & Audio Info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => playAudioRecord(record)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md ${
                        isThisPlaying
                          ? 'bg-teal-500 text-slate-950 shadow-teal-500/30'
                          : 'bg-slate-800 text-teal-400 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-5 h-5 fill-slate-950" />
                      ) : (
                        <Play className="w-5 h-5 fill-teal-400 ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2 my-1">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(record.id)}
                            autoFocus
                            className="bg-slate-950 border border-teal-500 text-slate-100 text-xs rounded-lg px-2.5 py-1 focus:outline-none flex-1"
                          />
                          <button
                            onClick={() => handleSaveRename(record.id)}
                            className="p-1.5 rounded-lg bg-teal-500 text-slate-950"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingAudioId(null)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white truncate">
                            {record.title}
                          </h4>
                          <button
                            onClick={() => handleStartRename(record)}
                            title="Rename audio file"
                            className="p-1 text-slate-500 hover:text-slate-300 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="px-2 py-0.2 rounded-md bg-slate-800 text-teal-300 font-medium">
                          {record.voiceName}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>{record.language}</span>
                        <span className="text-slate-500">•</span>
                        <span className="font-mono text-slate-300">
                          {formatDuration(record.durationSeconds)}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="font-mono text-slate-400">
                          {formatFileSize(record.fileSizeBytes)}
                        </span>
                        {record.projectTitle && (
                          <>
                            <span className="text-slate-500">•</span>
                            <span className="text-teal-400/80">Project: {record.projectTitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Download dropdown, Share, Delete) */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    {/* Multi-format Download Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setDownloadDropdownId(
                            downloadDropdownId === record.id ? null : record.id
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-teal-400" />
                        <span>Export</span>
                      </button>

                      {downloadDropdownId === record.id && (
                        <div className="absolute right-0 top-9 z-30 w-44 rounded-2xl bg-slate-900 border border-slate-800 p-1.5 shadow-2xl space-y-1">
                          <button
                            onClick={() => handleDownload(record, 'wav')}
                            className="w-full text-left px-3 py-1.5 rounded-xl text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                          >
                            <span>Download WAV</span>
                            <span className="text-[10px] text-teal-400 font-mono">24kHz Master</span>
                          </button>
                          <button
                            onClick={() => handleDownload(record, 'mp3')}
                            className="w-full text-left px-3 py-1.5 rounded-xl text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                          >
                            <span>Download MP3</span>
                            <span className="text-[10px] text-cyan-400 font-mono">192 kbps</span>
                          </button>
                          <button
                            onClick={() => handleDownload(record, 'ogg')}
                            className="w-full text-left px-3 py-1.5 rounded-xl text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                          >
                            <span>Download OGG</span>
                            <span className="text-[10px] text-slate-400 font-mono">Web Audio</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Share */}
                    <button
                      type="button"
                      onClick={() => handleShare(record)}
                      title="Share Audio"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteAudio(record.id, record.title)}
                      title="Delete recording"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition border border-slate-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Script text snippet */}
                <p className="text-xs text-slate-400/90 mt-2.5 line-clamp-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50 font-normal">
                  "{record.text}"
                </p>

                {/* Inline Waveform Scrubber if this track is active */}
                {isThisActive && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <AudioVisualizerCanvas
                      isPlaying={isThisPlaying}
                      waveformData={record.waveformData}
                      progress={playbackDuration > 0 ? currentTime / playbackDuration : 0}
                      onSeek={handleSeek}
                      height={44}
                      barColor="rgba(45, 212, 191, 0.22)"
                      activeBarColor="#2dd4bf"
                      interactive={true}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Sticky Audio Player (when a track is selected) */}
      {activeAudio && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-teal-500/30 backdrop-blur-2xl p-3 shadow-2xl">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Track Info */}
            <div className="flex items-center gap-3 w-full md:w-1/4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                <FileAudio className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{activeAudio.title}</h4>
                <p className="text-[10px] text-teal-400 font-mono">
                  {activeAudio.voiceName} • {activeAudio.language}
                </p>
              </div>
            </div>

            {/* Playback Controls & Waveform */}
            <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleSkip(-5)}
                  title="Rewind 5s"
                  className="p-1.5 text-slate-400 hover:text-white transition"
                >
                  <Rewind className="w-4 h-4" />
                </button>

                <button
                  onClick={() => playAudioRecord(activeAudio)}
                  className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-teal-500/30 hover:scale-105 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-slate-950" />
                  ) : (
                    <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => handleSkip(5)}
                  title="Fast Forward 5s"
                  className="p-1.5 text-slate-400 hover:text-white transition"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              </div>

              {/* Scrubber Progress Bar */}
              <div className="flex items-center gap-2 w-full text-[10px] font-mono text-slate-400">
                <span>{formatDuration(currentTime)}</span>
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    handleSeek(ratio);
                  }}
                  className="flex-1 h-1.5 bg-slate-800 rounded-full cursor-pointer relative overflow-hidden"
                >
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                    style={{
                      width: `${playbackDuration > 0 ? (currentTime / playbackDuration) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span>{formatDuration(playbackDuration)}</span>
              </div>
            </div>

            {/* Speed & Volume Tools */}
            <div className="hidden md:flex items-center gap-3 w-1/4 justify-end">
              {/* Playback rate */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px]">
                {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-1.5 py-0.5 rounded font-mono ${
                      playbackRate === rate
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleVolumeChange(isMuted ? 0.8 : 0)}
                  className="text-slate-400 hover:text-white transition"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-teal-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 accent-teal-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
