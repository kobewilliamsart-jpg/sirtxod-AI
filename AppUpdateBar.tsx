import React from 'react';
import { Sparkles, ArrowRight, X, RefreshCw, Loader2, Zap } from 'lucide-react';
import { UpdateInfo } from '../hooks/useAppUpdate';

interface AppUpdateBarProps {
  isUpdateAvailable: boolean;
  updateInfo: UpdateInfo | null;
  isUpdating: boolean;
  onApplyUpdate: () => void;
  onDismiss: () => void;
  isDismissed: boolean;
}

export const AppUpdateBar: React.FC<AppUpdateBarProps> = ({
  isUpdateAvailable,
  updateInfo,
  isUpdating,
  onApplyUpdate,
  onDismiss,
  isDismissed,
}) => {
  if (!isUpdateAvailable || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="App update announcement"
      className="relative z-50 bg-gradient-to-r from-teal-900/90 via-cyan-900/90 to-slate-900/95 border-b border-teal-500/40 text-slate-100 px-4 py-2.5 shadow-xl shadow-teal-950/40 backdrop-blur-md animate-in slide-in-from-top duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left message & signal badge */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-400 text-slate-950 uppercase tracking-wide flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 fill-slate-950" />
              Update Available
            </span>
            <p className="text-slate-200">
              A newer version of <strong className="text-white">sirtxod-AI</strong> ({updateInfo?.version || '2.2'}) is ready to install!
            </p>
          </div>
        </div>

        {/* Right CTA controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onApplyUpdate}
            disabled={isUpdating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs shadow-md shadow-teal-500/20 transition active:scale-95"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Applying Update...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Update App Now</span>
              </>
            )}
          </button>

          <button
            onClick={onDismiss}
            title="Dismiss notice for now"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
