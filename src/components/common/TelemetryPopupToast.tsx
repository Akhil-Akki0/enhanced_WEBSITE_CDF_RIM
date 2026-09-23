import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  Wind,
  Film,
  Music,
  X
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export interface TelemetryToast {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'aerodynamic';
  timestamp: Date;
  duration?: number;
}

export const TelemetryPopupContainer: React.FC = () => {
  const [toasts, setToasts] = useState<TelemetryToast[]>([
    {
      id: 'init-1',
      title: 'OpenFOAM v2606 Engine Armed',
      message: 'Boundary layer discretization active. Veo Video & Lyria Audio synthesizers ready.',
      type: 'aerodynamic',
      timestamp: new Date(),
      duration: 7000,
    },
  ]);

  useEffect(() => {
    const handleToastEvent = (e: CustomEvent<Omit<TelemetryToast, 'id' | 'timestamp'>>) => {
      const newToast: TelemetryToast = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: e.detail.title,
        message: e.detail.message,
        type: e.detail.type || 'info',
        timestamp: new Date(),
        duration: e.detail.duration || 5000,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]);
      sound.playTick();
    };

    window.addEventListener('aero-telemetry-toast' as any, handleToastEvent);
    return () => {
      window.removeEventListener('aero-telemetry-toast' as any, handleToastEvent);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-14 sm:bottom-6 right-3 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isAero = toast.type === 'aerodynamic';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg backdrop-blur-md relative overflow-hidden flex items-start gap-3 transition-all ${
                isAero
                  ? 'bg-slate-900/90 text-white border-cyan-500/40 shadow-cyan-500/10 aero-pulse-glow'
                  : isSuccess
                  ? 'bg-emerald-900/90 text-white border-emerald-500/40 shadow-emerald-500/10'
                  : isWarning
                  ? 'bg-amber-900/90 text-white border-amber-500/40 shadow-amber-500/10'
                  : 'bg-white/95 text-slate-800 border-sky-200/90 shadow-sky-500/10'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isAero
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-sky-100 text-sky-600'
                }`}
              >
                {isAero ? (
                  <Wind className="w-4 h-4" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-4">
                <div
                  className={`text-xs font-bold truncate ${
                    isAero ? 'text-cyan-300' : isSuccess ? 'text-emerald-300' : isWarning ? 'text-amber-300' : 'text-slate-900'
                  }`}
                >
                  {toast.title}
                </div>
                <div
                  className={`text-[11px] line-clamp-2 mt-0.5 leading-relaxed ${
                    isAero || isSuccess || isWarning ? 'text-slate-200' : 'text-slate-600'
                  }`}
                >
                  {toast.message}
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">
                  {toast.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Dispatch helper for anywhere in the app
export const triggerTelemetryPopup = (toast: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'aerodynamic';
  duration?: number;
}) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aero-telemetry-toast', {
        detail: toast,
      })
    );
  }
};
