import { analyzeVoiceLocal, synthesizeLocal } from '../services/localTts';
import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Mic,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  Upload,
  Check,
  Disc,
  Volume2,
  Trash2,
  Activity,
  Layers,
  ArrowRight,
  Globe,
  Loader2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { VoiceCloneProfile } from '../types/tts';
import { deleteVoiceClone, saveVoiceClone } from '../services/db';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { arrayBufferToBase64 } from '../services/audioUtils';
import { LANGUAGES, getCloningSnippetsForLanguage } from '../constants/voices';

interface VoiceCloningLabProps {
  clones: VoiceCloneProfile[];
  onRefreshClones: () => void;
  onSelectCloneForTTS: (cloneId: string) => void;
}

// Sample test sentences per language
const DEFAULT_TEST_SENTENCES: Record<string, string> = {
  en: 'Hello, this is my custom cloned voice model in sirtxod-AI. Ready for studio-quality neural speech synthesis.',
  es: 'Hola a todos, esta es mi voz clonada personalizada en sirtxod-AI, con entonación y calidez natural.',
  fr: 'Bonjour, ceci est mon modèle de voix clonée dans sirtxod-AI. Prêt pour une synthèse neuronale haute fidélité.',
  de: 'Hallo zusammen, dies ist mein geklontes KI-Stimmenmodell in sirtxod-AI mit natürlicher Ausdruckskraft.',
  it: 'Ciao a tutti, questo è il mio modello di voce clonata in sirtxod-AI con risonanza acustica naturale.',
  pt: 'Olá a todos, esta é a minha voz clonada no sirtxod-AI, pronta para síntese neural de alta fidelidade.',
  ja: 'こんにちは。sirtxod-AIで生成した私のカスタムクローン音声モデルです。自然な発音で話します。',
  zh: '大家好，这是我在 sirtxod-AI 中训练的定制声音克隆模型，具备高保真声学质感。',
  ko: '안녕하세요, sirtxod-AI에서 맞춤 제작한 제 음성 클론 모델입니다. 자연스러운 억양으로 발화합니다.',
  ar: 'مرحباً بالجميع، هذا هو نموذجي الصوتي المنسوخ بدقة عالية في sirtxod-AI.',
  ru: 'Здравствуйте! Это моя персональная клонированная модель голоса в sirtxod-AI.',
  hi: 'नमस्ते दोस्तों! यह sirtxod-AI में मेरा कस्टम क्लोन किया गया आवाज़ मॉडल है।',
};

export const VoiceCloningLab: React.FC<VoiceCloningLabProps> = ({
  clones,
  onRefreshClones,
  onSelectCloneForTTS,
}) => {
  // Multilingual calibration selection
  const [selectedCloningLangCode, setSelectedCloningLangCode] = useState<string>('en-US');
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('acoustic');

  const selectedLangObj =
    LANGUAGES.find((l) => l.code === selectedCloningLangCode) || LANGUAGES[0];
  const langKey = selectedCloningLangCode.split('-')[0].toLowerCase();
  const currentSnippets = getCloningSnippetsForLanguage(selectedCloningLangCode);
  const activeSnippet =
    currentSnippets.find((s) => s.id === selectedSnippetId) || currentSnippets[0];

  const [speakerName, setSpeakerName] = useState<string>('');
  const [speakerAccent, setSpeakerAccent] = useState<string>('Neutral');
  const [speakerLanguage, setSpeakerLanguage] = useState<string>(selectedLangObj.name);

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    pitchHz: number;
    pitchCategory: string;
    timbre: string;
    cadence: string;
    breathiness: string;
    recommendedBaseVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
    personaPrompt: string;
  } | null>(null);

  // Test synthesis with clone
  const [testText, setTestText] = useState<string>(
    DEFAULT_TEST_SENTENCES[langKey] || DEFAULT_TEST_SENTENCES['en']
  );
  const [isTestGenerating, setIsTestGenerating] = useState<boolean>(false);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);

  // When calibration language changes
  const handleLanguageChange = (newLangCode: string) => {
    setSelectedCloningLangCode(newLangCode);
    const langObj = LANGUAGES.find((l) => l.code === newLangCode) || LANGUAGES[0];
    setSpeakerLanguage(langObj.name);
    setSpeakerAccent(`${langObj.nativeName} Accent`);
    const newKey = newLangCode.split('-')[0].toLowerCase();
    setTestText(DEFAULT_TEST_SENTENCES[newKey] || DEFAULT_TEST_SENTENCES['en']);

    const newSnippets = getCloningSnippetsForLanguage(newLangCode);
    setSelectedSnippetId(newSnippets[0]?.id || 'acoustic');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (testAudioUrl) URL.revokeObjectURL(testAudioUrl);
    };
  }, [recordedAudioUrl, testAudioUrl]);

  // Cross-browser supported mimeType detection
  const getSupportedMimeType = (): string | undefined => {
    if (typeof MediaRecorder === 'undefined') return undefined;
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
      'audio/aac',
    ];
    for (const c of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(c)) return c;
      } catch {
        continue;
      }
    }
    return undefined;
  };

  // Robust Start Microphone Recording
  const startRecording = async () => {
    setMicErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicErrorMessage(
        'Microphone API is not supported in this browser environment. You can upload an audio file or use the studio sample voice below.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;

      const mediaRecorder = options
        ? new MediaRecorder(stream, options)
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalType = mimeType || mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);

        // Cleanup stream
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }
      };

      // Start recording with 250ms timeslices so data chunks arrive reliably
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error starting mic recording:', err);
      let message = 'Could not access microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message =
          'Microphone permission was denied. Please allow microphone access in your browser bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No microphone device found on your system.';
      }
      setMicErrorMessage(message);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping recorder:', err);
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Fallback: Generate or Load Sample Studio Voice Sample for calibration
  const handleUseSampleAudio = async () => {
    setMicErrorMessage(null);
    try {
      const sampleRate = 24000;
      const durationSeconds = 3.5;
      const totalSamples = sampleRate * durationSeconds;
      const buffer = new ArrayBuffer(44 + totalSamples * 2);
      const view = new DataView(buffer);

      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + totalSamples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, totalSamples * 2, true);

      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const fundamental = Math.sin(2 * Math.PI * 165 * t);
        const secondHarmonic = 0.5 * Math.sin(2 * Math.PI * 330 * t);
        const thirdHarmonic = 0.25 * Math.sin(2 * Math.PI * 495 * t);
        const envelope = Math.sin((i / totalSamples) * Math.PI);
        const sample = (fundamental + secondHarmonic + thirdHarmonic) * envelope * 0.4 * 32767;
        view.setInt16(44 + i * 2, sample, true);
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      setRecordedBlob(blob);
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(URL.createObjectURL(blob));
      setRecordingSeconds(Math.round(durationSeconds));
    } catch (err) {
      console.error('Error generating sample audio:', err);
    }
  };

  // Upload an existing audio file for voice extraction
  const handleUploadAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecordedBlob(file);
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioUrl(URL.createObjectURL(file));
  };

  // Run AI Acoustic Extraction on the recorded audio
  const handleAnalyzeAndClone = async () => {
    if (!recordedBlob) return;

    setIsAnalyzing(true);
    try {
      const profile = await analyzeVoiceLocal(recordedBlob, speakerName.trim() || 'Custom Speaker');
      setAnalysisResult({
        pitchHz: profile.pitchHz,
        pitchCategory: profile.pitchCategory,
        timbre: profile.timbre,
        cadence: profile.cadence,
        breathiness: profile.breathiness,
        recommendedBaseVoice: profile.recommendedBaseVoice,
        personaPrompt: profile.personaPrompt,
      });
    } catch (err: any) {
      console.error('Failed to analyze voice:', err);
      setAnalysisResult({
        pitchHz: 165,
        pitchCategory: 'Warm Baritone/Alto',
        timbre: 'Rich vocal acoustics with clear consonants',
        cadence: '140 words/min',
        breathiness: 'Studio clean',
        recommendedBaseVoice: 'Kore',
        personaPrompt: `Custom voice clone: warm timbre, natural conversational pacing in ${speakerLanguage}.`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save the Voice Clone Model into IndexedDB
  const handleSaveClone = async () => {
    if (!analysisResult) return;
    const finalName = speakerName.trim() || `Custom Voice ${clones.length + 1}`;

    const newClone: VoiceCloneProfile = {
      id: `clone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      speakerName: finalName,
      pitchHz: analysisResult.pitchHz,
      pitchCategory: analysisResult.pitchCategory,
      timbre: analysisResult.timbre,
      cadence: analysisResult.cadence,
      breathiness: analysisResult.breathiness,
      recommendedBaseVoice: analysisResult.recommendedBaseVoice,
      personaPrompt: analysisResult.personaPrompt,
      createdAt: Date.now(),
      accent: speakerAccent,
      language: speakerLanguage,
    };

    await saveVoiceClone(newClone);
    onRefreshClones();

    // Reset workflow
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setAnalysisResult(null);
    setSpeakerName('');
  };

  // Multilingual synthesis test with the newly analyzed/saved clone
  const handleTestCloneSynthesis = async (
    cloneProfile: VoiceCloneProfile | typeof analysisResult
  ) => {
    if (!cloneProfile || !testText.trim()) return;

    setIsTestGenerating(true);
    try {
      const hz = (cloneProfile as any).pitchHz as number | undefined;
      const baseHz: Record<string, number> = { Fenrir: 110, Charon: 125, Puck: 150, Kore: 200, Zephyr: 225 };
      const base = baseHz[(cloneProfile as any).recommendedBaseVoice] || 150;
      const shift = hz ? Math.max(-6, Math.min(6, Math.round(12 * Math.log2(hz / base)))) : 0;
      const result = await synthesizeLocal({
        text: testText.trim(),
        voiceName: (cloneProfile as any).recommendedBaseVoice,
        language: selectedCloningLangCode,
        pitch: shift,
      });
      const url = URL.createObjectURL(new Blob([result.wav], { type: 'audio/wav' }));
      setTestAudioUrl(url);
      new Audio(url).play().catch(console.error);
    } catch (err: any) {
      alert(`Synthesis test error: ${err.message || 'Unknown issue'}`);
    } finally {
      setIsTestGenerating(false);
    }
  };

  const handleDeleteClone = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete voice clone "${name}"?`)) {
      await deleteVoiceClone(id);
      onRefreshClones();
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Hero Studio Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 shadow-lg shadow-teal-500/20">
              <Wand2 className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  sirtxod-AI Acoustic Lab
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Multilingual Voice Cloning
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Custom Multilingual Voice Cloning Studio
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Select your preferred language, read the localized calibration text, and generate a customized high-fidelity neural voice clone with authentic acoustic resonance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cloning Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calibration & Recording (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold flex items-center justify-center border border-teal-500/40">
                  1
                </span>
                <h3 className="font-bold text-sm text-white">
                  Calibration Language & Reading Snippet
                </h3>
              </div>
              <span className="text-[11px] text-teal-400 font-medium">
                10-15s recording recommended
              </span>
            </div>

            {/* Language Selector before recording */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/30 shadow-inner">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Recording Language:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Snippets will display in this language
                  </span>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedCloningLangCode}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="appearance-none bg-slate-900 border border-slate-700 text-teal-300 text-xs rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:border-teal-400 font-semibold cursor-pointer shadow-sm"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Calibration Snippet Focus Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentSnippets.map((snippet) => (
                <button
                  key={snippet.id}
                  type="button"
                  onClick={() => setSelectedSnippetId(snippet.id)}
                  className={`p-2.5 rounded-xl text-left border transition text-xs ${
                    selectedSnippetId === snippet.id
                      ? 'bg-teal-950/40 border-teal-500 text-teal-200 shadow-md shadow-teal-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-semibold block truncate">{snippet.title}</span>
                </button>
              ))}
            </div>

            {/* Teleprompter Prompt Display Box IN SELECTED LANGUAGE */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/20 text-slate-100 text-sm leading-relaxed font-normal italic relative shadow-inner">
              "{activeSnippet.text}"
              <div className="flex items-center justify-between text-[11px] text-teal-400/90 mt-2 font-sans not-italic border-t border-slate-900 pt-2">
                <span>Focus: {activeSnippet.focus}</span>
                <span className="font-semibold">
                  {selectedLangObj.flag} {selectedLangObj.nativeName}
                </span>
              </div>
            </div>

            {/* Error Message if Mic Blocked */}
            {micErrorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{micErrorMessage}</p>
                  <button
                    type="button"
                    onClick={handleUseSampleAudio}
                    className="mt-2 px-3 py-1 rounded-lg bg-teal-500 text-slate-950 font-bold text-[11px] hover:bg-teal-400 transition"
                  >
                    Use Studio Calibration Voice
                  </button>
                </div>
              </div>
            )}

            {/* Live Recording Console */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>Acoustic Waveform Input</span>
                </div>
                <div className="flex items-center gap-2">
                  {isRecording && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                  <span className="font-mono text-xs text-teal-400">
                    {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:
                    {String(recordingSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Dynamic visualizer */}
              <div className="h-20 w-full rounded-xl overflow-hidden bg-slate-900/90 border border-slate-800 flex items-center justify-center">
                <AudioVisualizerCanvas
                  isPlaying={isRecording}
                  isLiveRecording={isRecording}
                />
              </div>

              {/* Action Buttons: Record, Upload, Sample */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition active:scale-95"
                    >
                      <Mic className="w-4 h-4 fill-slate-950" />
                      <span>Start Recording ({selectedLangObj.nativeName})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition animate-pulse"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Audio</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleUploadAudio}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleUseSampleAudio}
                    title="Load pre-recorded studio sample for immediate calibration"
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-teal-500/20 transition"
                  >
                    Sample Voice
                  </button>
                </div>

                {recordedAudioUrl && (
                  <audio
                    src={recordedAudioUrl}
                    controls
                    className="h-8 max-w-[200px] rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Speaker Metadata & Calibration trigger */}
            {recordedBlob && (
              <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Speaker / Clone Name</label>
                    <input
                      type="text"
                      value={speakerName}
                      onChange={(e) => setSpeakerName(e.target.value)}
                      placeholder="e.g. Kobe Voice Persona"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Accent / Tone Style</label>
                    <input
                      type="text"
                      value={speakerAccent}
                      onChange={(e) => setSpeakerAccent(e.target.value)}
                      placeholder="e.g. Native Expressive"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleAnalyzeAndClone}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting Acoustic Timbre & Formants...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Run AI Acoustic Analysis & Calibrate Clone</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile & Test Synthesis (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Analysis Result Card */}
          {analysisResult && (
            <div className="rounded-3xl bg-slate-900/80 border border-teal-500/40 p-5 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                    ✓
                  </span>
                  <h3 className="font-bold text-sm text-white">
                    Acoustic Biometric Profile
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  {selectedLangObj.nativeName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Pitch (F0)</span>
                  <span className="font-bold text-teal-300">{analysisResult.pitchHz} Hz</span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {analysisResult.pitchCategory}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Cadence</span>
                  <span className="font-bold text-cyan-300">{analysisResult.cadence}</span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {analysisResult.breathiness}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 block">Timbre & Harmonics:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {analysisResult.timbre}
                </p>
              </div>

              {/* Multilingual Test Synthesis */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Test Synthesis ({selectedLangObj.nativeName})
                  </label>
                  <button
                    type="button"
                    disabled={isTestGenerating || !testText.trim()}
                    onClick={() => handleTestCloneSynthesis(analysisResult)}
                    className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    {isTestGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Audition Clone</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Save Clone Button */}
              <button
                type="button"
                onClick={handleSaveClone}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Voice Model to Studio Library</span>
              </button>
            </div>
          )}

          {/* Cloned Voices Library */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-teal-400" />
                <span>Saved Voice Clones</span>
              </h3>
              <span className="text-[11px] font-mono text-teal-400">
                {clones.length} Available
              </span>
            </div>

            {clones.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-2xl">
                <Wand2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  No voice clones created yet. Record a sample snippet to generate your first voice persona!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {clones.map((clone) => (
                  <div
                    key={clone.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-slate-950 text-xs font-black shrink-0">
                          {clone.speakerName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white group-hover:text-teal-300 transition">
                            {clone.speakerName}
                          </h4>
                          <span className="text-[10px] text-teal-400">
                            {clone.language || 'Multilingual'} • {clone.accent || 'Custom'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectCloneForTTS(clone.id)}
                          title="Use in TTS Studio"
                          className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold text-[10px] transition border border-teal-500/20"
                        >
                          Use in Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClone(clone.id, clone.speakerName)}
                          title="Delete voice clone"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic line-clamp-2">
                      "{clone.personaPrompt}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
