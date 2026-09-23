import React from 'react';
import { NAVIGATION_SHORTCUTS } from '../../hooks/useKeyboardNavigation';
import { PageId } from '../../types';
import {
  Keyboard,
  X,
  Zap,
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: PageId) => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/20 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-sky-200/90 shadow-2xl w-full max-w-xl overflow-hidden text-slate-800 ring-1 ring-sky-500/10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50/80 via-white to-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-200 text-sky-600 flex items-center justify-center shadow-xs">
              <Keyboard className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Keyboard Navigation Shortcuts
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  Ctrl / Cmd
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Instantly navigate between CFD modules using single-hand shortcuts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NAVIGATION_SHORTCUTS.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  sound.playClick();
                  onNavigate(item.pageId);
                  onClose();
                }}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 transition-all text-left cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 flex items-center gap-1.5">
                    <span>{item.label}</span>
                    <ArrowRight className="w-3 h-3 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {item.description}
                  </div>
                </div>

                <kbd className="px-2 py-1 rounded-md bg-white border border-slate-300 shadow-2xs font-mono text-[11px] font-bold text-sky-700 shrink-0 group-hover:border-sky-400 group-hover:bg-sky-100/50">
                  {item.combination}
                </kbd>
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 rounded-xl bg-sky-50/80 border border-sky-200/70 text-xs text-sky-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-sky-300 font-mono font-bold text-sky-700">?</kbd> at any time to open this cheat sheet</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200 text-center text-xs text-slate-500">
          Mac users can also use <kbd className="font-mono font-bold text-slate-700">⌘ Command</kbd> instead of <kbd className="font-mono font-bold text-slate-700">Ctrl</kbd>
        </div>
      </div>
    </div>
  );
};
