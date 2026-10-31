import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, X, CheckCircle2, Disc, Waves, Loader2 } from 'lucide-react';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';

interface RecordingProgressModalProps {
  isOpen: boolean;
  voiceName: string;
  language: string;
  charCount: number;
  wordCount: number;
  onPauseToggle: (isPaused: boolean) => void;
  onStop: () => void;
  onCancel: () => void;
  progressPercentage: number;
  statusText: string;
}

export const RecordingProgressModal: React.FC<RecordingProgressModalProps> = ({
  isOpen,
  voiceName,
  language,
  charCount,
  wordCount,
  onPauseToggle,
  onStop,
  onCancel,
  progressPercentage,
  statusText,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setElapsedSeconds(0);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused]);

  if (!isOpen) return null;

  const handlePauseResume = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    onPauseToggle(nextState);
  };

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const estimatedTotalSecs = Math.max(3, Math.ceil(wordCount / 2.5));
  const estimatedRemainingSecs = Math.max(0, Math.ceil(estimatedTotalSecs * (1 - progressPercentage / 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl shadow-teal-500/10 text-slate-100 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`} />
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>{isPaused ? 'Recording Paused' : 'Neural Audio Recording In Progress'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Voice Model: <span className="text-teal-300 font-semibold">{voiceName}</span> • Language: <span className="text-slate-300">{language}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            title="Cancel recording"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Visualizer */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono text-teal-400">
              <Disc className={`w-3.5 h-3.5 ${isPaused ? '' : 'animate-spin'}`} />
              {isPaused ? 'BUFFER ON HOLD' : 'STREAMING 24kHz 16-BIT AUDIO'}
            </span>
            <span className="font-mono text-slate-300">
              {formatSecs(elapsedSeconds)} / ~{formatSecs(estimatedTotalSecs)}
            </span>
          </div>

          <AudioVisualizerCanvas
            isPlaying={!isPaused}
            isLiveRecording={!isPaused}
            height={64}
            interactive={false}
          />
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Loader2 className={`w-3.5 h-3.5 text-teal-400 ${progressPercentage < 100 ? 'animate-spin' : ''}`} />
              {statusText}
            </span>
            <span className="text-sm font-bold font-mono text-teal-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-300 rounded-full transition-all duration-300 shadow-sm shadow-teal-400/50"
              style={{ width: `${Math.min(100, Math.max(5, progressPercentage))}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 px-0.5">
            <span>{wordCount} words • {charCount} chars</span>
            <span>Est. Remaining: ~{estimatedRemainingSecs}s</span>
          </div>
        </div>

        {/* Controls: Pause, Resume, Stop, Cancel */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={handlePauseResume}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 border ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-amber-300 text-amber-300" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              )}
            </button>

            {/* Stop and Save Button */}
            <button
              type="button"
              onClick={onStop}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-teal-500/25"
            >
              <Square className="w-4 h-4 fill-slate-950 text-slate-950" />
              Stop & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
