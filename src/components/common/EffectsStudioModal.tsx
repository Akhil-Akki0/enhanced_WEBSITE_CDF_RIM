import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  sound,
  SoundVisualizerState,
} from '../../utils/soundEffects';
import { usePlatform, LIGHT_THEMES } from '../../context/PlatformContext';
import { LightThemeId } from '../../types';
import { triggerShockwave } from './GlobalShockwaveOverlay';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Wind,
  Zap,
  Activity,
  Flame,
  Radio,
  Play,
  RotateCcw,
  Check,
  Disc,
  Layers,
  Waves,
  Eye
} from 'lucide-react';

interface EffectsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EffectsStudioModal: React.FC<EffectsStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lightTheme, setLightTheme } = usePlatform();
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());
  const [volume, setVolume] = useState(sound.getVolume());
  const [activeSoundName, setActiveSoundName] = useState<string | null>(null);
  const [vizState, setVizState] = useState<SoundVisualizerState>({
    isActive: false,
    frequency: 0,
    level: 0,
    type: '',
  });

  // Animation FX local settings
  const [shockwavesActive, setShockwavesActive] = useState(true);
  const [streamlineLaser, setStreamlineLaser] = useState(true);

  // Subscribe to real-time audio synthesis events for the visualizer
  useEffect(() => {
    const unsubscribe = sound.subscribe((state) => {
      setVizState(state);
      if (state.isActive) {
        setActiveSoundName(state.type);
      } else {
        setTimeout(() => setActiveSoundName(null), 300);
      }
    });
    return unsubscribe;
  }, []);

  const handleToggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    sound.setVolume(newVol);
    sound.playTick();
  };

  // Sound triggers with tactile feedback
  const triggerEffect = (name: string, fn: () => void, color?: string) => {
    fn();
    triggerShockwave(undefined, undefined, color);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-sky-200 overflow-hidden z-10 my-auto text-slate-800"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  FX & Audio Studio
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                    Live Synthesis
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Interactive sound synthesizer, aerodynamic color grading & physics animations
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* 1. AUDIO SYNTHESIZER & LIVE WAVEFORM */}
            <div className="p-4 rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50/50 to-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                    Web Audio Synthesis Engine
                  </span>
                </div>

                {/* Master Volume & Mute */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleSound}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      soundEnabled
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{soundEnabled ? 'Audio Active' : 'Muted'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      disabled={!soundEnabled}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20 sm:w-28 accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-600 min-w-[32px]">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Oscilloscope Display */}
              <div className="h-16 w-full rounded-lg bg-slate-950 border border-slate-800 p-2 relative overflow-hidden flex items-center justify-between px-3">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-30" />

                {/* Active Sound indicator */}
                <div className="relative z-10 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${vizState.isActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`} />
                  <span className="text-[11px] font-mono text-cyan-400">
                    {vizState.isActive
                      ? `SYNTH // ${vizState.type.toUpperCase()} • ${Math.round(vizState.frequency)} Hz`
                      : 'STANDBY // CLICK ANY SOUND TO AUDITION'}
                  </span>
                </div>

                {/* Real-time Visualizer Frequency Bars */}
                <div className="relative z-10 flex items-end gap-1 h-10">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const isCenter = Math.abs(i - 12);
                    const heightPercent = vizState.isActive
                      ? Math.min(100, Math.max(15, (vizState.level * 100) - isCenter * 4 + Math.sin(Date.now() / 50 + i) * 20))
                      : 10 + Math.sin(i * 0.5) * 5;

                    return (
                      <motion.div
                        key={i}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.08 }}
                        className={`w-1 rounded-full transition-colors ${
                          vizState.isActive
                            ? i % 2 === 0
                              ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                              : 'bg-sky-400 shadow-[0_0_8px_#38bdf8]'
                            : 'bg-slate-800'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Interactive Soundboard Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => triggerEffect('turbine', () => sound.playStartSimulation(), 'rgba(6, 182, 212, 0.8)')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-cyan-200 bg-cyan-50/80 hover:bg-cyan-100 text-cyan-900 transition-all active:scale-95 shadow-2xs group cursor-pointer text-center"
                >
                  <Wind className="w-5 h-5 text-cyan-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Turbine Spool</span>
                  <span className="text-[10px] text-cyan-700 font-mono">Pink Noise Sweep</span>
                </button>

                <button
                  onClick={() => triggerEffect('success', () => sound.playSuccess(), 'rgba(99, 102, 241, 0.8)')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 transition-all active:scale-95 shadow-2xs group cursor-pointer text-center"
                >
                  <Sparkles className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Convergence Chime</span>
                  <span className="text-[10px] text-indigo-700 font-mono">F#maj9 Chord</span>
                </button>

                <button
                  onClick={() => triggerEffect('shockwave', () => sound.playShockwave(), 'rgba(239, 68, 68, 0.8)')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-900 transition-all active:scale-95 shadow-2xs group cursor-pointer text-center"
                >
                  <Zap className="w-5 h-5 text-rose-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Sonic Shockwave</span>
                  <span className="text-[10px] text-rose-700 font-mono">Sub-Bass 40Hz Boom</span>
                </button>

                <button
                  onClick={() => triggerEffect('ai', () => sound.playAIPredict(), 'rgba(168, 85, 247, 0.8)')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100 text-purple-900 transition-all active:scale-95 shadow-2xs group cursor-pointer text-center"
                >
                  <Radio className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Neural Sweep</span>
                  <span className="text-[10px] text-purple-700 font-mono">Harmonic Resonance</span>
                </button>

                <button
                  onClick={() => triggerEffect('color', () => sound.playColorShift(), 'rgba(245, 158, 11, 0.8)')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 transition-all active:scale-95 shadow-2xs group cursor-pointer text-center"
                >
                  <Flame className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Color Shift</span>
                  <span className="text-[10px] text-amber-700 font-mono">Filter Sweep</span>
                </button>

                <button
                  onClick={() => triggerEffect('save', () => sound.playSave(), 'rgba(16, 185, 129, 0.8)')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 transition-all active:scale-95 shadow-2xs group cursor-pointer text-center"
                >
                  <Disc className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Telemetry Save</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Dual E5-A5 Chime</span>
                </button>

                <button
                  onClick={() => triggerEffect('click', () => sound.playClick())}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all active:scale-95 shadow-2xs group cursor-pointer text-center"
                >
                  <Activity className="w-5 h-5 text-slate-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Tactile Click</span>
                  <span className="text-[10px] text-slate-500 font-mono">Micro Transient</span>
                </button>

                <button
                  onClick={() => triggerEffect('warning', () => sound.playWarning(), 'rgba(234, 88, 12, 0.8)')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-orange-200 bg-orange-50/80 hover:bg-orange-100 text-orange-900 transition-all active:scale-95 shadow-2xs group cursor-pointer text-center"
                >
                  <RotateCcw className="w-5 h-5 text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold">Warning Buzz</span>
                  <span className="text-[10px] text-orange-700 font-mono">Cautionary Saw</span>
                </button>
              </div>
            </div>

            {/* 2. AERODYNAMIC COLOR GRADING THEMES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Aerodynamic Color Palettes
                </span>
                <span className="text-[11px] text-slate-500">Real-time chromatic grading</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(Object.keys(LIGHT_THEMES) as LightThemeId[]).map((themeKey) => {
                  const theme = LIGHT_THEMES[themeKey];
                  const isSelected = lightTheme === themeKey;

                  return (
                    <button
                      key={themeKey}
                      onClick={() => {
                        setLightTheme(themeKey);
                        sound.playColorShift();
                        triggerShockwave(undefined, undefined, theme.accentColor);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">{theme.name}</span>
                        <div
                          className="w-4 h-4 rounded-full border border-white shadow-xs shrink-0"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                      </div>

                      <div className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                        {theme.badge} • Luminous {theme.name}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${theme.accentColor}18`,
                            color: theme.accentColor,
                          }}
                        >
                          {theme.badge}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-sky-700 flex items-center gap-1 ml-auto">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. PHYSICAL ANIMATION CONTROLS */}
            <div className="p-4 rounded-xl border border-sky-100 bg-slate-50/70 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-600" />
                Physical Wind Tunnel & Animation Shaders
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Sonic Shockwave Click Rings</div>
                    <div className="text-[11px] text-slate-500">Expands circular pressure wave on actions</div>
                  </div>
                  <button
                    onClick={() => {
                      setShockwavesActive(!shockwavesActive);
                      sound.playTick();
                      triggerShockwave();
                    }}
                    className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                      shockwavesActive ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {shockwavesActive ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Laser Doppler Streamlines</div>
                    <div className="text-[11px] text-slate-500">Sweeping aerodynamic velocity field</div>
                  </div>
                  <button
                    onClick={() => {
                      setStreamlineLaser(!streamlineLaser);
                      sound.playTick();
                    }}
                    className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                      streamlineLaser ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {streamlineLaser ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-sky-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">
              Native Web Audio API • 0 Latency Synthesis
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
