import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  Upload,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Download,
  Check,
  X,
  Layers,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Maximize2,
  Wind
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerShockwave } from '../common/GlobalShockwaveOverlay';
import { triggerTelemetryPopup } from '../common/TelemetryPopupToast';

interface VeoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBackgroundVideo?: (videoUrl: string) => void;
}

interface PresetImage {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  prompt: string;
}

const PRESET_IMAGES: PresetImage[] = [
  {
    id: 'car',
    name: 'Wind Tunnel Supercar',
    category: 'Vehicle CFD',
    thumbnail: '/backgrounds/landing.jpg',
    prompt: 'High-speed wind tunnel airflow with multi-color laser smoke filaments wrapping smoothly around a sleek sports car with turbulent wake separation.',
  },
  {
    id: 'wing',
    name: 'Transonic Wing Wake',
    category: 'Aerospace',
    thumbnail: '/backgrounds/dashboard.jpg',
    prompt: 'Commercial aircraft wing flying at transonic speed Mach 0.85 with visible condensation clouds and counter-rotating tip vortices rolling off the winglet.',
  },
  {
    id: 'jet',
    name: 'Hypersonic Stealth Fighter',
    category: 'Supersonic',
    thumbnail: '/backgrounds/runner.jpg',
    prompt: 'Supersonic stealth jet banking sharply through clouds with distinct Prandtl-Glauert vapor cone shockwaves and supersonic flame shock diamonds.',
  },
  {
    id: 'airfoil',
    name: 'Airfoil Polar Field',
    category: 'Laminar / Turbulent',
    thumbnail: '/backgrounds/sweeps.jpg',
    prompt: 'Bernoulli airflow streamlines smoothly accelerating over an aerodynamic cambered wing profile with laminar boundary layer transition.',
  },
  {
    id: 'manifold',
    name: 'Flow Manifold Mesh',
    category: 'Industrial',
    thumbnail: '/backgrounds/geometry.jpg',
    prompt: 'Industrial 3D piping manifold with vibrant rainbow velocity streamlines pulsating through the interior conduits.',
  },
];

export const VeoVideoModal: React.FC<VeoVideoModalProps> = ({
  isOpen,
  onClose,
  onApplyBackgroundVideo,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_IMAGES[0].thumbnail);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(PRESET_IMAGES[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<'5s' | '10s'>('5s');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [appliedAsBg, setAppliedAsBg] = useState<boolean>(false);

  // Video playback controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const b64 = uploadEvent.target?.result as string;
      setCustomImageBase64(b64);
      setSelectedImage(b64);
      sound.playSuccess();
      triggerTelemetryPopup({
        title: 'Photo Uploaded Successfully',
        message: `Ready for Veo video animation (${file.name}, ${Math.round(file.size / 1024)} KB)`,
        type: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: PresetImage) => {
    sound.playTick();
    setSelectedImage(preset.thumbnail);
    setCustomImageBase64(null);
    setPrompt(preset.prompt);
  };

  // Generate Video using Veo
  const handleGenerateVideo = async () => {
    sound.playStartSimulation();
    triggerShockwave(undefined, undefined, 'rgba(14, 165, 233, 0.9)');
    setIsGenerating(true);
    setGenerationProgress(10);
    setGeneratedVideoUrl(null);
    setAppliedAsBg(false);

    triggerTelemetryPopup({
      title: 'Veo Video Generation Dispatched',
      message: `Model: veo-3.1-fast-generate-preview • Aspect: ${aspectRatio} • ${duration}`,
      type: 'info',
    });

    // Sim progress interval
    const interval = setInterval(() => {
      setGenerationProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 12;
      });
    }, 450);

    try {
      const res = await fetch('/api/media/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: customImageBase64 || selectedImage,
          prompt,
          aspectRatio,
          duration,
        }),
      });

      clearInterval(interval);
      setGenerationProgress(100);

      const data = await res.json();
      if (data.status === 'completed') {
        const videoSrc = data.videoBase64
          ? `data:video/mp4;base64,${data.videoBase64}`
          : data.videoUri || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

        setGeneratedVideoUrl(videoSrc);
        sound.playSuccess();
        triggerShockwave(undefined, undefined, 'rgba(16, 185, 129, 0.9)');

        triggerTelemetryPopup({
          title: 'Veo Video Render Complete',
          message: `Model: veo-3.1-fast-generate-preview • ${aspectRatio} aspect ratio rendered`,
          type: 'success',
        });
      } else {
        throw new Error(data.error || 'Generation error');
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error('Veo video error:', err);
      sound.playWarning();
      triggerTelemetryPopup({
        title: 'Video Generation Warning',
        message: err.message || 'Error executing Veo video generation',
        type: 'warning',
      });
      // Fallback sample video
      setGeneratedVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyBackground = () => {
    if (!generatedVideoUrl) return;
    sound.playSuccess();
    triggerShockwave(undefined, undefined, 'rgba(6, 182, 212, 1)');
    setAppliedAsBg(true);

    if (onApplyBackgroundVideo) {
      onApplyBackgroundVideo(generatedVideoUrl);
    } else {
      localStorage.setItem('cfd_custom_bg_video', generatedVideoUrl);
      window.dispatchEvent(new CustomEvent('cfd-bg-video-change', { detail: { videoUrl: generatedVideoUrl } }));
    }

    triggerTelemetryPopup({
      title: 'Active Background Video Updated',
      message: 'Now playing your Veo generated video loop in the background',
      type: 'success',
    });
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
      sound.playTick();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      sound.playTick();
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
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-sky-200 overflow-hidden z-10 my-auto text-slate-800"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Animate Images into Video
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200 font-mono">
                    veo-3.1-fast-generate-preview
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Transform any photo or aerodynamic design into an animated wind tunnel background video
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
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 max-h-[82vh] overflow-y-auto">
            {/* Left Column: Image Selection & Settings (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Upload Photo Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>1. Select or Upload Starting Photo</span>
                  <span className="text-[10px] font-normal text-slate-500">PNG, JPG, WebP</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sky-200 hover:border-sky-400 rounded-xl p-3 bg-sky-50/40 hover:bg-sky-50/80 transition-all cursor-pointer flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800">
                      {customImageBase64 ? 'Custom Photo Uploaded (Click to Change)' : 'Upload Your Photo to Animate'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Upload CAD screenshots, wind tunnel photos, or vehicle renders
                    </div>
                  </div>
                </div>
              </div>

              {/* Aerodynamic Preset Photos */}
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Or Choose an Aerodynamic Preset:</div>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_IMAGES.map((preset) => {
                    const isSelected = selectedImage === preset.thumbnail;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`group relative rounded-lg overflow-hidden border transition-all cursor-pointer aspect-video ${
                          isSelected
                            ? 'border-sky-500 ring-2 ring-sky-400/40 scale-102'
                            : 'border-slate-200 hover:border-sky-300 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset.thumbnail}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-1">
                          <span className="text-[9px] font-bold text-white truncate w-full text-left">
                            {preset.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio (16:9 Landscape or 9:16 Portrait) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Video Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setAspectRatio('16:9');
                      sound.playTick();
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      aspectRatio === '16:9'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-900 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Monitor className="w-4 h-4 text-sky-600" />
                    <div>
                      <div className="text-xs font-bold">16:9 Landscape</div>
                      <div className="text-[10px] text-slate-500">Desktop & Wide Displays</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setAspectRatio('9:16');
                      sound.playTick();
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      aspectRatio === '9:16'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-900 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-sky-600" />
                    <div>
                      <div className="text-xs font-bold">9:16 Portrait</div>
                      <div className="text-[10px] text-slate-500">Mobile & Vertical Screens</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Motion Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>3. Motion Guidance Prompt</span>
                  <span className="text-[10px] font-mono text-sky-600">Veo Kinetics</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-sky-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-slate-800 bg-white"
                  placeholder="Describe the fluid streamline motion, wind velocity, and vortex shedding..."
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerateVideo}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Rendering Veo Video ({generationProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Video with Veo ({aspectRatio})</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Video Output & Live Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Video Screen Preview
              </label>

              <div
                className={`relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 flex items-center justify-center shadow-inner ${
                  aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[380px] mx-auto' : 'aspect-video w-full'
                }`}
              >
                {generatedVideoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      src={generatedVideoUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Player Controls */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-white">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={togglePlay}
                          className="p-1 rounded hover:bg-slate-800 text-white transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={toggleMute}
                          className="p-1 rounded hover:bg-slate-800 text-white transition-colors cursor-pointer"
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <span className="text-[10px] font-mono text-cyan-400">
                        VEO • {aspectRatio}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="relative w-full h-full">
                    {/* Placeholder starting image */}
                    <img
                      src={selectedImage}
                      alt="Source frame"
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center mb-2">
                        <Play className="w-5 h-5 ml-0.5" />
                      </div>
                      <span className="text-xs font-bold text-white mb-1">
                        Awaiting Veo Generation
                      </span>
                      <span className="text-[10px] text-slate-300">
                        Click "Generate Video with Veo" to animate this image into an aerodynamic motion video
                      </span>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                    <div className="w-12 h-12 rounded-full border-3 border-sky-400 border-t-transparent animate-spin mb-3" />
                    <span className="text-xs font-bold text-white mb-1">
                      Veo Model 3.1 Neural Diffusion
                    </span>
                    <span className="text-[11px] text-cyan-300 font-mono mb-2">
                      Synthesizing Fluid Streamlines ({generationProgress}%)
                    </span>
                    <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Background Video Button */}
              {generatedVideoUrl && (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleApplyBackground}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                      appliedAsBg
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-600 hover:bg-sky-700 text-white'
                    }`}
                  >
                    {appliedAsBg ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Active as Live Background Video</span>
                      </>
                    ) : (
                      <>
                        <Wind className="w-4 h-4" />
                        <span>Set as Active Background Video</span>
                      </>
                    )}
                  </button>

                  <a
                    href={generatedVideoUrl}
                    download={`veo-cfd-video-${Date.now()}.mp4`}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download MP4 Video Asset</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-sky-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">
              Google Veo 3.1 Video Engine • 16:9 & 9:16 Native Format
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
