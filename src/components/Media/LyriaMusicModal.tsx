import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sliders,
  Check,
  Disc,
  Clock,
  Waves
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerShockwave } from '../common/GlobalShockwaveOverlay';
import { triggerTelemetryPopup } from '../common/TelemetryPopupToast';

interface LyriaMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MusicPreset {
  id: string;
  name: string;
  prompt: string;
  badge: string;
}

const MUSIC_PRESETS: MusicPreset[] = [
  {
    id: 'windtunnel',
    name: 'Wind Tunnel Ambient Synthwave',
    prompt: 'Ethereal ambient electronic synthesizer music with sub-bass pulses, smooth white noise aerodynamic sweeps, and hypnotic binaural chords for deep engineering concentration.',
    badge: 'Ambient Focus',
  },
  {
    id: 'supersonic',
    name: 'Supersonic Mach Horizon',
    prompt: 'Cinematic orchestral hybrid with driving percussion, rising brass fanfares, supersonic sonic boom drops, and heroic soaring strings.',
    badge: 'Cinematic Orchestral',
  },
  {
    id: 'cyberpunk',
    name: 'Cybernetic CFD Lab',
    prompt: 'High-tech dark cyberpunk synth with pulsing arpeggiators, futuristic glitch artifacts, heavy analog bass, and crisp metallic hi-hats.',
    badge: 'Electronic Cyber',
  },
  {
    id: 'laminar',
    name: 'Laminar Fluid Harmonics',
    prompt: 'Warm acoustic piano combined with soft ambient water flow textures, melodic marimba, and peaceful reverbed synthesizer pads.',
    badge: 'Calm Laminar',
  },
];

export const LyriaMusicModal: React.FC<LyriaMusicModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [modelType, setModelType] = useState<'clip' | 'pro'>('clip');
  const [prompt, setPrompt] = useState<string>(MUSIC_PRESETS[0].prompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.75);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize or clean audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSelectPreset = (preset: MusicPreset) => {
    sound.playTick();
    setPrompt(preset.prompt);
  };

  const handleGenerateMusic = async () => {
    sound.playAIPredict();
    triggerShockwave(undefined, undefined, 'rgba(168, 85, 247, 0.9)');
    setIsGenerating(true);

    const modelName = modelType === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    triggerTelemetryPopup({
      title: 'Lyria Music Synthesis Started',
      message: `Model: ${modelName} • Generating aerodynamic acoustic score`,
      type: 'info',
    });

    try {
      const res = await fetch('/api/media/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: modelType,
        }),
      });

      const data = await res.json();
      if (data.status === 'completed') {
        let playUrl = '';
        if (data.audioBase64) {
          playUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        }

        setAudioUrl(playUrl);
        setLyrics(data.lyrics || null);

        // Auto-play generated track
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(playUrl);
        audio.loop = isLooping;
        audio.volume = volume;
        audioRef.current = audio;
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));

        audio.onended = () => {
          if (!isLooping) setIsPlaying(false);
        };

        sound.playSuccess();
        triggerShockwave(undefined, undefined, 'rgba(168, 85, 247, 0.9)');

        triggerTelemetryPopup({
          title: 'Lyria Music Generation Complete',
          message: `Model: ${data.model} • Track ready for playback`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('Lyria generation error:', err);
      sound.playWarning();
      triggerTelemetryPopup({
        title: 'Music Generation Warning',
        message: err.message || 'Error generating Lyria audio track',
        type: 'warning',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.loop = isLooping;
      audio.volume = volume;
      audioRef.current = audio;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true));
      }
      sound.playTick();
    }
  };

  const toggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) {
      audioRef.current.loop = next;
    }
    sound.playTick();
  };

  const handleVolume = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden z-10 my-auto text-slate-800"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-white to-indigo-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Generate Music with Lyria
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 font-mono">
                    {modelType === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Synthesize custom ambient aerodynamic soundtracks and background music
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

          {/* Body */}
          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Model Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Track Model & Length
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setModelType('clip');
                    sound.playTick();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    modelType === 'clip'
                      ? 'border-purple-500 bg-purple-50/80 text-purple-900 ring-2 ring-purple-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Lyria Clip (up to 30s)</span>
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    model: lyria-3-clip-preview
                  </div>
                </button>

                <button
                  onClick={() => {
                    setModelType('pro');
                    sound.playTick();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    modelType === 'pro'
                      ? 'border-purple-500 bg-purple-50/80 text-purple-900 ring-2 ring-purple-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Lyria Pro (Full-Length)</span>
                    <Disc className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    model: lyria-3-pro-preview
                  </div>
                </button>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Choose Soundscape Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MUSIC_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-purple-50/60 hover:border-purple-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-purple-900">
                        {preset.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {preset.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>3. Music Generation Prompt</span>
                <span className="text-[10px] text-purple-600 font-mono">Harmonic Guidance</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-slate-800 bg-white"
                placeholder="Describe instruments, tempo, and mood..."
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateMusic}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Track with Lyria...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Music ({modelType === 'pro' ? 'Lyria Pro' : 'Lyria Clip'})</span>
                </>
              )}
            </button>

            {/* Audio Player Card */}
            {audioUrl && (
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Synthesized Soundtrack
                      </div>
                      <div className="text-[10px] text-purple-700 font-mono">
                        {modelType === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview'}
                      </div>
                    </div>
                  </div>

                  {/* Player Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-xs"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={toggleLoop}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        isLooping
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {isLooping ? 'Looping' : 'Once'}
                    </button>

                    <a
                      href={audioUrl}
                      download={`lyria-soundtrack-${Date.now()}.wav`}
                      className="p-2 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 transition-colors cursor-pointer"
                      title="Download Track"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Real-time Simulated Waveform */}
                <div className="h-10 bg-slate-900 rounded-lg p-1.5 flex items-end justify-between gap-1 overflow-hidden px-3">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: isPlaying ? `${20 + Math.sin(Date.now() / 80 + i * 0.4) * 60}%` : '15%',
                      }}
                      transition={{ duration: 0.1 }}
                      className={`w-1 rounded-full ${isPlaying ? 'bg-purple-400' : 'bg-slate-700'}`}
                    />
                  ))}
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => handleVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-[10px] w-8">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-purple-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">
              Lyria Audio Model Suite • Native Audio Output
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
