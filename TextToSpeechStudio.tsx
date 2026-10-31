import { synthesizeLocal } from '../services/localTts';
import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Upload,
  Layers,
  FileText,
  Clock,
  Gauge,
  Check,
  Disc,
  Info,
  ChevronDown,
  Wand2,
  ArrowRight,
  AlertTriangle,
  Scissors,
  Save,
  Globe,
  Code2,
  HelpCircle,
  X,
  Plus,
} from 'lucide-react';
import { Project, VoiceCloneProfile, VoiceModel } from '../types/tts';
import {
  LANGUAGES,
  PREBUILT_VOICES,
  SAMPLE_SCRIPTS,
  STYLE_PRESETS,
  getLocalizedVoice,
  getLocalizedSampleText,
} from '../constants/voices';
import { RecordingProgressModal } from './RecordingProgressModal';
import {
  base64ToArrayBuffer,
  extractWaveformData,
  speakWithBrowserTts,
} from '../services/audioUtils';
import { saveAudioRecord, saveProject } from '../services/db';
import {
  SSML_PRESETS,
  COMMON_IPA_SYMBOLS,
  wrapTextWithSsml,
} from '../constants/ssml';

const MAX_WORD_LIMIT = 10000; // runs locally, so the old 750-word API cap is no longer needed

interface TextToSpeechStudioProps {
  projects: Project[];
  customClones: VoiceCloneProfile[];
  currentProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onAudioCreated: () => void;
  onNavigateToCloning: () => void;
  onSaveProject?: (project: Project) => Promise<void>;
}

export const TextToSpeechStudio: React.FC<TextToSpeechStudioProps> = ({
  projects,
  customClones,
  currentProjectId,
  onSelectProject,
  onAudioCreated,
  onNavigateToCloning,
  onSaveProject,
}) => {
  const activeProject = projects.find((p) => p.id === currentProjectId);

  const [text, setText] = useState<string>(
    activeProject?.text ||
      'Welcome to sirtxod-AI, the next-generation neural text-to-speech studio. Transform written words into breathtaking, lifelike voices in seconds with complete studio control.'
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    activeProject?.targetVoiceId || 'voice-kore'
  );
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(
    activeProject?.targetLanguage || 'en-US'
  );
  const [selectedStyleId, setSelectedStyleId] = useState<string>('natural');
  const [readingSpeed, setReadingSpeed] = useState<number>(activeProject?.readingSpeed || 1.0);
  const [pitch, setPitch] = useState<number>(activeProject?.pitch || 0);

  // Sync state if activeProject changes externally
  useEffect(() => {
    if (activeProject) {
      setText(activeProject.text || '');
      setSelectedVoiceId(activeProject.targetVoiceId || 'voice-kore');
      setSelectedLanguageCode(activeProject.targetLanguage || 'en-US');
      setReadingSpeed(activeProject.readingSpeed || 1.0);
      setPitch(activeProject.pitch || 0);
    }
  }, [activeProject?.id]);

  // Save Project State
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [newProjectTitle, setNewProjectTitle] = useState<string>('');
  const [newProjectCategory, setNewProjectCategory] = useState<Project['category']>('Podcast');
  const [newProjectDescription, setNewProjectDescription] = useState<string>('');

  // SSML & Phonetics State
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isIpaModalOpen, setIsIpaModalOpen] = useState<boolean>(false);
  const [ipaWord, setIpaWord] = useState<string>('sirtxod-AI');
  const [ipaPhonetic, setIpaPhonetic] = useState<string>('ˈsɜːrt.zɒd.eɪ.aɪ');
  const [isSsmlGuideOpen, setIsSsmlGuideOpen] = useState<boolean>(false);

  // Pre-listening audition state
  const [isAuditioning, setIsAuditioning] = useState<boolean>(false);
  const [auditionAudio, setAuditionAudio] = useState<HTMLAudioElement | null>(null);

  // Recording & Generation Modal state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Initializing neural acoustic engine...');
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Combine localized prebuilt voices and custom clones
  const localizedPrebuiltVoices = PREBUILT_VOICES.map((v) =>
    getLocalizedVoice(v, selectedLanguageCode)
  );

  const allVoices: VoiceModel[] = [
    ...localizedPrebuiltVoices,
    ...customClones.map((c) => ({
      id: `clone-${c.id}`,
      name: `${c.speakerName || 'Custom Voice'} (Clone)`,
      gender: 'Neutral' as const,
      age: 'Adult' as const,
      language: c.language || 'Multilingual',
      accent: c.accent || 'Custom Timbre',
      description: `Cloned voice profile: ${c.timbre || 'Natural'}, ${c.cadence || 'Balanced'}.`,
      sampleText: `Hello, this is my custom cloned voice in sirtxod-AI. Ready for high-fidelity speech synthesis.`,
      baseVoice: c.recommendedBaseVoice || 'Kore',
      isCustomClone: true,
      avatarColor: 'from-cyan-400 to-teal-500',
      avatarInitials: (c.speakerName || 'CV').substring(0, 2).toUpperCase(),
      tags: ['Custom Clone', c.pitchCategory || 'Warm', 'High-Fidelity'],
    })),
  ];

  const currentVoice =
    allVoices.find((v) => v.id === selectedVoiceId) || allVoices[0] || PREBUILT_VOICES[0];
  const currentLanguage =
    LANGUAGES.find((l) => l.code === selectedLanguageCode) || LANGUAGES[0];
  const currentStyle =
    STYLE_PRESETS.find((s) => s.id === selectedStyleId) || STYLE_PRESETS[0];

  // Dirty check for unsaved modifications
  const hasUnsavedChanges = activeProject
    ? text !== activeProject.text ||
      selectedVoiceId !== activeProject.targetVoiceId ||
      selectedLanguageCode !== activeProject.targetLanguage ||
      readingSpeed !== activeProject.readingSpeed ||
      pitch !== activeProject.pitch
    : false;

  // Text metrics & 750 words limitation
  const charCount = text.length;
  const rawWords = text.trim() ? text.trim().split(/\s+/) : [];
  const wordCount = rawWords.length;
  const isLimitExceeded = wordCount > MAX_WORD_LIMIT;
  const exceedingWordCount = Math.max(0, wordCount - MAX_WORD_LIMIT);

  // Words breakdown for highlighting
  const allowedWords = rawWords.slice(0, MAX_WORD_LIMIT);
  const exceedingWords = rawWords.slice(MAX_WORD_LIMIT);
  const estimatedSeconds = Math.max(
    1,
    Math.round((Math.min(wordCount, MAX_WORD_LIMIT) / (150 * readingSpeed)) * 60)
  );

  // Trim text to exactly 750 words
  const handleTrimToLimit = () => {
    if (wordCount <= MAX_WORD_LIMIT) return;
    const trimmed = rawWords.slice(0, MAX_WORD_LIMIT).join(' ');
    setText(trimmed);
  };

  const handleDeleteExceeding = () => {
    handleTrimToLimit();
  };

  // Import text file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setText(content);
    };
    reader.readAsText(file);
  };

  // SSML Text Selection Helper
  const applySsmlWrap = (template: string, placeholder: string = 'text') => {
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => `${prev} ${template.replace('{selected}', placeholder)} `);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedChunk = text.substring(start, end) || placeholder;
    const wrapped = template.includes('{selected}')
      ? template.replace('{selected}', selectedChunk)
      : template;

    const newText = text.substring(0, start) + wrapped + text.substring(end);
    setText(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start + wrapped.length);
    }, 50);
  };

  // Insert IPA Phoneme Tag
  const handleInsertIpaTag = () => {
    if (!ipaWord.trim()) return;
    const ipaTag = `<phoneme alphabet="ipa" ph="${ipaPhonetic.trim()}">${ipaWord.trim()}</phoneme>`;
    applySsmlWrap(ipaTag, ipaWord.trim());
    setIsIpaModalOpen(false);
  };

  // Open IPA popover with selected text if highlighted
  const handleOpenIpaBuilder = () => {
    const el = textareaRef.current;
    if (el && el.selectionStart !== el.selectionEnd) {
      const selected = text.substring(el.selectionStart, el.selectionEnd).trim();
      if (selected) {
        setIpaWord(selected);
      }
    }
    setIsIpaModalOpen(true);
  };

  // Save Project Modifications handler
  const handleSaveProjectModifications = async () => {
    if (activeProject) {
      // Update existing project
      const updated: Project = {
        ...activeProject,
        text: text.trim(),
        targetVoiceId: selectedVoiceId,
        targetLanguage: selectedLanguageCode,
        readingSpeed,
        pitch,
        lastModified: Date.now(),
      };
      await saveProject(updated);
      if (onSaveProject) {
        await onSaveProject(updated);
      }
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 3000);
    } else {
      // Prompt modal to save as new project
      const snippet = text.trim().slice(0, 32);
      setNewProjectTitle(snippet ? `Project: ${snippet}...` : 'My Voiceover Project');
      setNewProjectCategory('Podcast');
      setNewProjectDescription('');
      setIsSaveModalOpen(true);
    }
  };

  // Create new project from Scratchpad modal submit
  const handleCreateNewProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const newProj: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newProjectTitle.trim(),
      description: newProjectDescription.trim(),
      category: newProjectCategory,
      text: text.trim(),
      targetVoiceId: selectedVoiceId,
      targetLanguage: selectedLanguageCode,
      readingSpeed,
      pitch,
      audioCount: 0,
      tags: ['Studio', currentLanguage.name],
      lastModified: Date.now(),
    };

    await saveProject(newProj);
    if (onSaveProject) {
      await onSaveProject(newProj);
    }
    onSelectProject(newProj.id);
    setIsSaveModalOpen(false);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  // Pre-listen / Audition Voice in the Selected Language
  const handleAudition = async () => {
    if (isAuditioning) {
      if (auditionAudio) {
        auditionAudio.pause();
        auditionAudio.currentTime = 0;
      }
      window.speechSynthesis?.cancel();
      setIsAuditioning(false);
      return;
    }

    setIsAuditioning(true);

    // Get localized sample text for selected language
    const auditionText =
      currentVoice.sampleText ||
      getLocalizedSampleText(currentVoice.baseVoice, currentLanguage.code);

    try {
      const result = await synthesizeLocal({
        text: auditionText,
        voiceName: currentVoice.baseVoice,
        language: currentLanguage.code,
        speed: readingSpeed,
        pitch,
      });
      const url = URL.createObjectURL(new Blob([result.wav], { type: 'audio/wav' }));
      const audio = new Audio(url);
      setAuditionAudio(audio);
      audio.onended = () => setIsAuditioning(false);
      audio.onerror = () => setIsAuditioning(false);
      await audio.play();
    } catch {
      // Language not available locally -> instant browser voice
      speakWithBrowserTts(
        auditionText,
        currentLanguage.code,
        readingSpeed,
        1.0,
        () => setIsAuditioning(false)
      );
    }
  };

  // Export Text to Audio Flow
  const handleExportToAudio = async () => {
    if (!text.trim() || isLimitExceeded) return;

    setIsExporting(true);
    setExportProgress(10);
    setStatusText('Analyzing linguistic phonemes & prosody...');
    setIsPaused(false);

    abortControllerRef.current = new AbortController();

    try {
      const result = await synthesizeLocal({
        text: text.trim(),
        voiceName: currentVoice.baseVoice,
        language: currentLanguage.code,
        speed: readingSpeed,
        pitch,
        signal: abortControllerRef.current.signal,
        onProgress: (msg, fraction) => {
          setStatusText(msg);
          if (typeof fraction === 'number') {
            setExportProgress(Math.min(90, 10 + fraction * 80));
          }
        },
      });

      setExportProgress(95);
      setStatusText('Mastering audio and caching to local IndexedDB...');

      const arrayBuffer = result.wav;
      const waveformPeaks = await extractWaveformData(arrayBuffer, 70);

      const audioId = `audio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const titleSnippet = text.trim().substring(0, 36) + (text.length > 36 ? '...' : '');

      await saveAudioRecord({
        id: audioId,
        projectId: activeProject?.id,
        projectTitle: activeProject?.title,
        title: activeProject ? `${activeProject.title} - ${currentVoice.name}` : titleSnippet,
        text: text.trim(),
        durationSeconds: Math.max(1, Math.round(result.durationSeconds)),
        mimeType: 'audio/wav',
        format: 'wav',
        voiceId: currentVoice.id,
        voiceName: currentVoice.name,
        language: currentLanguage.name,
        createdAt: Date.now(),
        fileSizeBytes: arrayBuffer.byteLength,
        audioData: arrayBuffer,
        waveformData: waveformPeaks,
      });

      setExportProgress(100);
      setStatusText('Audio synthesis complete! Redirecting to Library...');

      setTimeout(() => {
        setIsExporting(false);
        onAudioCreated();
      }, 700);
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (err.name === 'AbortError') {
        setIsExporting(false);
        return;
      }
      alert(`Synthesis error: ${err.message || 'Unknown issue'}`);
      setIsExporting(false);
    }
  };

  const handlePauseToggle = (paused: boolean) => {
    setIsPaused(paused);
    if (auditionAudio) {
      if (paused) auditionAudio.pause();
      else auditionAudio.play();
    }
  };

  const handleStopAndSave = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setStatusText('Finalizing and saving partial audio buffer...');
    setExportProgress(100);
    setTimeout(() => {
      setIsExporting(false);
      onAudioCreated();
    }, 400);
  };

  const handleCancelExport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setIsExporting(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Recording progress modal */}
      <RecordingProgressModal
        isOpen={isExporting}
        voiceName={currentVoice.name}
        language={currentLanguage.name}
        charCount={charCount}
        wordCount={wordCount}
        onPauseToggle={handlePauseToggle}
        onStop={handleStopAndSave}
        onCancel={handleCancelExport}
        progressPercentage={exportProgress}
        statusText={statusText}
      />

      {/* Top Banner / Project Context & SAVE MODIFICATIONS BUTTON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Text-to-Speech Studio
              </span>
              {activeProject ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-teal-300 border border-teal-500/30">
                  Project: {activeProject.title}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Quick Scratchpad
                </span>
              )}

              {/* Status Indicator */}
              {isSavedRecently && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Saved!
                </span>
              )}
              {hasUnsavedChanges && !isSavedRecently && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Unsaved edits
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white">
              Neural Speech Synthesizer & Acoustic Master
            </h2>
          </div>
        </div>

        {/* Right Tools: Project Selector + SAVE BUTTON */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Project Selector dropdown */}
          <div className="relative flex-1 sm:w-52">
            <select
              value={currentProjectId || ''}
              onChange={(e) => onSelectProject(e.target.value)}
              className="w-full appearance-none bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-teal-500 transition font-medium"
            >
              <option value="">Scratchpad (No Project)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Explicit Save Modifications Button */}
          <button
            type="button"
            onClick={handleSaveProjectModifications}
            title={activeProject ? 'Save modifications to current project' : 'Save script and settings as new project'}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95 ${
              isSavedRecently
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                : hasUnsavedChanges
                ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20 ring-1 ring-teal-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30'
            }`}
          >
            {isSavedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Saved ✓</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{activeProject ? 'Save Edits' : 'Save Project'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text Input & SSML Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
            {/* Editor Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Script Text</span>
              </div>

              {/* Sample script presets & file import */}
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    const sample = SAMPLE_SCRIPTS.find((s) => s.title === e.target.value);
                    if (sample) setText(sample.text);
                  }}
                  defaultValue=""
                  className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-teal-400"
                >
                  <option value="" disabled>Load Sample Script...</option>
                  {SAMPLE_SCRIPTS.map((s) => (
                    <option key={s.title} value={s.title}>
                      {s.title} ({s.category})
                    </option>
                  ))}
                </select>

                <label
                  className="cursor-pointer p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Import .txt file"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept=".txt,.md,.srt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setText('')}
                  title="Clear text"
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SSML & Phonetics Controls Toolbar */}
            <div className="py-2.5 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-teal-400 font-semibold flex items-center gap-1 mr-1">
                  <Code2 className="w-3.5 h-3.5" />
                  SSML & Phonetics:
                </span>

                {/* Phoneme IPA Trigger */}
                <button
                  type="button"
                  onClick={handleOpenIpaBuilder}
                  title="Add exact phonetic pronunciation using IPA (International Phonetic Alphabet)"
                  className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span>&lt;phoneme IPA&gt;</span>
                </button>

                {/* Quick Pause insertion chips */}
                <button
                  type="button"
                  onClick={() => applySsmlWrap('<break time="250ms"/>')}
                  title="Insert 250ms micro-pause"
                  className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 transition"
                >
                  + 250ms
                </button>
                <button
                  type="button"
                  onClick={() => applySsmlWrap('<break time="500ms"/>')}
                  title="Insert 500ms comma break"
                  className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 transition"
                >
                  + 500ms
                </button>
                <button
                  type="button"
                  onClick={() => applySsmlWrap('<break time="1s"/>')}
                  title="Insert 1 second dramatic pause"
                  className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 transition"
                >
                  + 1.0s
                </button>

                {/* Emphasis Wrap */}
                <button
                  type="button"
                  onClick={() => applySsmlWrap('<emphasis level="strong">{selected}</emphasis>', 'word')}
                  title="Wrap selected text with strong acoustic emphasis"
                  className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-teal-500/20 hover:text-teal-300 border border-slate-700 text-[10px] text-slate-300 transition"
                >
                  &lt;emphasis&gt;
                </button>

                {/* Prosody Wrap */}
                <button
                  type="button"
                  onClick={() => applySsmlWrap('<prosody rate="slow">{selected}</prosody>', 'slow phrase')}
                  title="Wrap selected text with slow prosody pacing"
                  className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-teal-500/20 hover:text-teal-300 border border-slate-700 text-[10px] text-slate-300 transition"
                >
                  &lt;prosody slow&gt;
                </button>

                {/* Say-As Characters */}
                <button
                  type="button"
                  onClick={() => applySsmlWrap('<say-as interpret-as="characters">{selected}</say-as>', 'ABC')}
                  title="Spell out each letter individually"
                  className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-teal-500/20 hover:text-teal-300 border border-slate-700 text-[10px] text-slate-300 transition"
                >
                  &lt;spell letters&gt;
                </button>
              </div>

              {/* SSML Guide Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsSsmlGuideOpen(true)}
                className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-1 transition underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>SSML Reference</span>
              </button>
            </div>

            {/* Script Textarea */}
            <div className="relative my-2">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter or paste text to synthesize into speech. You can insert <phoneme alphabet='ipa' ph='...'> or <break time='500ms'/> tags for fine-grained pronunciation control..."
                rows={8}
                className={`w-full bg-slate-950/70 border rounded-2xl p-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition resize-y leading-relaxed font-normal ${
                  isLimitExceeded
                    ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/50'
                    : 'border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                }`}
              />
            </div>

            {/* Exceeding Words Highlight Section */}
            {isLimitExceeded && (
              <div className="mt-2 p-3.5 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Exceeding Words Highlighted in Red ({exceedingWordCount} words):
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteExceeding}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline font-semibold"
                  >
                    Delete Exceeding Words
                  </button>
                </div>

                <div className="max-h-32 overflow-y-auto p-3 rounded-xl bg-slate-900/90 text-xs leading-relaxed border border-slate-800">
                  <span className="text-slate-400">
                    ...{allowedWords.slice(-15).join(' ')}{' '}
                  </span>
                  <mark className="bg-rose-600/30 text-rose-200 border border-rose-500/60 rounded px-1.5 py-0.5 font-semibold underline decoration-rose-500 decoration-wavy">
                    {exceedingWords.join(' ')}
                  </mark>
                </div>
              </div>
            )}

            {/* Counter bar */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60 mt-1">
              <div className="flex items-center gap-4">
                <span className={`font-mono ${isLimitExceeded ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                  <strong>{wordCount}</strong> / {MAX_WORD_LIMIT} words
                  {isLimitExceeded && (
                    <span className="ml-1 text-rose-400">({exceedingWordCount} over limit)</span>
                  )}
                </span>
                <span>
                  <strong className="text-slate-200">{charCount}</strong> characters
                </span>
                <span className="flex items-center gap-1 text-teal-400">
                  <Clock className="w-3.5 h-3.5" />
                  Est. ~{estimatedSeconds}s audio
                </span>
              </div>
            </div>
          </div>

          {/* Speech Fine-Tuning Controls */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              Acoustic & Prosody Controls
            </h3>

            {/* Reading Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-teal-400" />
                  Reading Speed
                </span>
                <span className="font-mono text-teal-300 font-bold">{readingSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={readingSpeed}
                onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                <span>0.5x Slow</span>
                <span>1.0x Normal</span>
                <span>2.0x Fast</span>
              </div>
            </div>

            {/* Pitch & Emotional Style Preset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">
                  Vocal Tone & Emotion Style
                </label>
                <select
                  value={selectedStyleId}
                  onChange={(e) => setSelectedStyleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-teal-500 font-medium"
                >
                  {STYLE_PRESETS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300">Pitch Modulation</span>
                  <span className="font-mono text-teal-300 font-bold">{pitch > 0 ? `+${pitch}` : pitch}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="1"
                  value={pitch}
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg mt-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400 px-0.5 mt-1">
                  <span>-5 Deeper</span>
                  <span>0 Natural</span>
                  <span>+5 Brighter</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Voice & Language Selection + Export CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl space-y-4">
            {/* Language Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Reading Language</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {LANGUAGES.length} Languages Available
                </span>
              </div>
              <div className="relative">
                <select
                  value={selectedLanguageCode}
                  onChange={(e) => setSelectedLanguageCode(e.target.value)}
                  className="w-full appearance-none bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-2xl p-3 pr-10 focus:outline-none focus:border-teal-500 font-medium"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-teal-400/80 mt-1.5">
                ✓ Neural voices & pre-listening are dynamically translated into {currentLanguage.nativeName}
              </p>
            </div>

            {/* Neural Voice Models Selector (Translated in selected language) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Neural Voice Models ({currentLanguage.nativeName})
                </label>
                <button
                  type="button"
                  onClick={onNavigateToCloning}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                >
                  <Wand2 className="w-3 h-3" />
                  + Clone Voice
                </button>
              </div>

              {/* Voice Cards with translated descriptions & accents */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {allVoices.map((voice) => {
                  const isSelected = voice.id === selectedVoiceId;
                  return (
                    <div
                      key={voice.id}
                      onClick={() => setSelectedVoiceId(voice.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500 shadow-md shadow-teal-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${voice.avatarColor || 'from-teal-500 to-cyan-600'} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                        >
                          {voice.avatarInitials || voice.name.substring(0, 2)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">
                              {voice.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {voice.gender}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/60 text-teal-400">
                              {voice.accent}
                            </span>
                            {voice.isCustomClone && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                Clone
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {voice.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(voice.tags || []).slice(0, 3).map((t) => (
                              <span key={t} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Voice Card Preview & Audition Button in SELECTED LANGUAGE */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-2 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-teal-400 font-semibold flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    Pre-listening in {currentLanguage.nativeName}
                  </span>
                  <h4 className="font-bold text-sm text-white">
                    {currentVoice.name} • {currentLanguage.name}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleAudition}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isAuditioning
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isAuditioning ? 'fill-slate-950' : 'fill-teal-300'}`} />
                  {isAuditioning ? 'Auditioning...' : 'Pre-listen Voice'}
                </button>
              </div>

              {/* Localized Sample Text Preview */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{currentVoice.sampleText}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-teal-400/80 mt-1.5">
                  <span>Sample voice preview text</span>
                  <span>{currentLanguage.flag} {currentLanguage.code}</span>
                </div>
              </div>
            </div>

            {/* Export Text to Audio Button */}
            <button
              type="button"
              disabled={!text.trim() || isExporting || isLimitExceeded}
              onClick={handleExportToAudio}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                !text.trim() || isExporting || isLimitExceeded
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 shadow-teal-500/25 active:scale-[0.99]'
              }`}
            >
              <Disc className="w-5 h-5 fill-slate-950" />
              <span>
                {isLimitExceeded
                  ? `Limit Exceeded (${exceedingWordCount} words over)`
                  : 'Export Text to Audio'}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* IPA Phonetics Insertion Modal */}
      {isIpaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">SSML IPA Phonetics Builder</h3>
                  <p className="text-[11px] text-slate-400">Custom pronunciation for difficult words or brands</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIpaModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Target Word / Brand Name</label>
                <input
                  type="text"
                  value={ipaWord}
                  onChange={(e) => setIpaWord(e.target.value)}
                  placeholder="e.g. sirtxod-AI, cache, Worcestershire"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300">IPA Phonetic Transcription</label>
                  <span className="text-[10px] text-teal-400">IPA Alphabet</span>
                </div>
                <input
                  type="text"
                  value={ipaPhonetic}
                  onChange={(e) => setIpaPhonetic(e.target.value)}
                  placeholder="e.g. ˈsɜːrt.zɒd.eɪ.aɪ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Clickable Common IPA Characters Keyboard */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1.5">Quick IPA Symbols (Click to insert):</span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {COMMON_IPA_SYMBOLS.map((s) => (
                    <button
                      key={s.symbol}
                      type="button"
                      onClick={() => setIpaPhonetic((prev) => prev + s.symbol)}
                      title={`${s.name} (${s.example})`}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-200 font-mono text-xs transition"
                    >
                      {s.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Generated SSML Tag:</span>
                <code className="text-[11px] text-teal-300 font-mono break-all">
                  &lt;phoneme alphabet="ipa" ph="{ipaPhonetic}"&gt;{ipaWord}&lt;/phoneme&gt;
                </code>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsIpaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertIpaTag}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20"
              >
                Insert Phoneme Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SSML Guide & Cheat Sheet Modal */}
      {isSsmlGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base text-white">SSML & Pronunciation Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSsmlGuideOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Speech Synthesis Markup Language (SSML) provides granular control over pronunciation, acoustic pauses, pitch, and phonetic realization in sirtxod-AI.
            </p>

            <div className="space-y-3">
              {SSML_PRESETS.map((preset) => (
                <div key={preset.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-teal-300">{preset.label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        applySsmlWrap(preset.template, 'text');
                        setIsSsmlGuideOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold transition"
                    >
                      Insert Tag
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">{preset.description}</p>
                  <code className="block p-2 rounded-lg bg-slate-900 text-[11px] text-cyan-300 font-mono">
                    {preset.template}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save As New Project Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base text-white">Save as Workspace Project</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Documentary Chapter 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Category</label>
                <select
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Podcast">Podcast</option>
                  <option value="Audiobook">Audiobook</option>
                  <option value="Voiceover">Voiceover</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Personal">Personal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Production notes or script summary..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Selected Voice:</span>
                  <strong className="text-teal-300">{currentVoice.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <strong className="text-slate-200">{currentLanguage.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Word Count:</span>
                  <strong className="text-slate-200">{wordCount} words</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
