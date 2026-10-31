import React from 'react';
import { RefreshCw, Sparkles, Check, ArrowUpCircle, Loader2 } from 'lucide-react';
import { useAppUpdate } from '../hooks/useAppUpdate';

interface AppUpdateButtonProps {
  onApplyUpdate?: () => void;
  className?: string;
  isUpdateAvailable?: boolean;
  isChecking?: boolean;
  isUpdating?: boolean;
  checkStatus?: 'idle' | 'up-to-date' | 'error';
  onCheck?: () => void;
}

export const AppUpdateButton: React.FC<AppUpdateButtonProps> = ({
  isUpdateAvailable = false,
  isChecking = false,
  isUpdating = false,
  checkStatus = 'idle',
  onCheck,
  onApplyUpdate,
  className = '',
}) => {
  // If an update is detected, show glowing prominent action button
  if (isUpdateAvailable) {
    return (
      <button
        onClick={onApplyUpdate}
        disabled={isUpdating}
        title="New app version is ready! Click to update now."
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg ${
          isUpdating
            ? 'bg-amber-500 text-slate-950 cursor-wait'
            : 'bg-gradient-to-r from-amber-400 via-teal-400 to-cyan-400 text-slate-950 hover:brightness-110 shadow-teal-500/30 ring-2 ring-teal-400/50 animate-pulse'
        } ${className}`}
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
        {isUpdating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <ArrowUpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Update App</span>
          </>
        )}
      </button>
    );
  }

  // Normal state: manual check or up-to-date indicator
  return (
    <button
      onClick={onCheck}
      disabled={isChecking || checkStatus === 'up-to-date'}
      title="Check for newest sirtxod-AI updates"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
        checkStatus === 'up-to-date'
          ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
          : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
      } ${className}`}
    >
      {isChecking ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
          <span className="hidden sm:inline">Checking...</span>
        </>
      ) : checkStatus === 'up-to-date' ? (
        <>
          <Check className="w-3.5 h-3.5 text-teal-400 stroke-[3]" />
          <span className="hidden sm:inline">Up to date</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400" />
          <span className="hidden sm:inline">Update</span>
        </>
      )}
    </button>
  );
};
