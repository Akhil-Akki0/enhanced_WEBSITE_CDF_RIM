import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlatform } from '../../context/PlatformContext';
import { PageId } from '../../types';
import {
  AerodynamicParticleCanvas,
  PerformanceMode,
} from './AerodynamicParticleCanvas';
import {
  Play,
  Pause,
  Sliders,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Zap,
  Gauge,
  Wind,
  Activity,
  Cpu,
  Eye,
  Video,
  Flame,
  Maximize2,
  Film
} from 'lucide-react';
import { VeoVideoModal } from '../Media/VeoVideoModal';

export interface PageBackgroundMeta {
  page: PageId;
  name: string;
  src: string;
  category: string;
  tag: string;
  description: string;
  flowProfile: string;
  telemetryMetric: string;
  darkOverlay: string;
  lightOverlay: string;
}

export const PAGE_BACKGROUND_CONFIGS: Record<PageId, PageBackgroundMeta> = {
  landing: {
    page: 'landing',
    name: 'Wind Tunnel Car Lab',
    src: '/backgrounds/landing.jpg',
    category: 'Vehicle Aerodynamics',
    tag: 'Wind Tunnel HUD',
    description: 'AI-driven CFD wind tunnel simulation with multi-color velocity streamlines and telemetry HUD',
    flowProfile: 'Vehicle Boundary Layer & Stagnation',
    telemetryMetric: 'Re: 4.8×10⁶ • Cd: 0.238',
    darkOverlay: 'bg-white/30',
    lightOverlay: 'bg-white/45 backdrop-blur-[0.5px]',
  },
  dashboard: {
    page: 'dashboard',
    name: 'Transonic Wing Wake',
    src: '/backgrounds/dashboard.jpg',
    category: 'Flight Telemetry',
    tag: 'Kelvin-Helmholtz Vortices',
    description: 'Commercial airliner in high-speed flight with wake vortices and neural drag reduction HUD',
    flowProfile: 'Twin Counter-Rotating Tip Vortices',
    telemetryMetric: 'Mach 0.82 • FL380 • AoA +2.4°',
    darkOverlay: 'bg-white/30',
    lightOverlay: 'bg-white/40 backdrop-blur-[0.5px]',
  },
  projects: {
    page: 'projects',
    name: 'Engineering Workspace',
    src: '/backgrounds/projects.jpg',
    category: 'CAD Drafting',
    tag: 'Project Blueprint',
    description: 'Engineering drafting blueprint with compass, gears, computer workstation, and geometric tools',
    flowProfile: 'Orthogonal CAD Grid Snapping Flow',
    telemetryMetric: 'Grid: 50mm • 14 Parametric Sets',
    darkOverlay: 'bg-white/35',
    lightOverlay: 'bg-sky-50/50 backdrop-blur-[0.5px]',
  },
  geometry: {
    page: 'geometry',
    name: 'Flow Manifold Mesh',
    src: '/backgrounds/geometry.jpg',
    category: 'Mesh Topology',
    tag: '3D CAD Piping',
    description: '3D isometric technical visualization of industrial piping flow manifold on blueprint grid',
    flowProfile: 'Tri-Branch Conduit Manifold Advection',
    telemetryMetric: 'Cells: 1.48M • Polyhedral Hex',
    darkOverlay: 'bg-white/30',
    lightOverlay: 'bg-cyan-50/45 backdrop-blur-[0.5px]',
  },
  setup: {
    page: 'setup',
    name: 'Geometric Prisms Studio',
    src: '/backgrounds/setup.jpg',
    category: 'Multi-Physics',
    tag: 'Optical Refraction',
    description: 'Macro studio photography of translucent acrylic prisms and geometric crystal polyhedra',
    flowProfile: 'Prismatic Snell Dispersion Rays',
    telemetryMetric: 'λ: 380-750nm • n: 1.492',
    darkOverlay: 'bg-white/30',
    lightOverlay: 'bg-rose-50/40 backdrop-blur-[0.5px]',
  },
  runner: {
    page: 'runner',
    name: 'High-Speed Solver Horizon',
    src: '/backgrounds/runner.jpg',
    category: 'Solver Kinetics',
    tag: 'Manga Sprint Robot',
    description: 'Sleek anime-style humanoid robot sprinting dynamically across open horizon with speed lines',
    flowProfile: 'Supersonic Oblique Shock Streaks',
    telemetryMetric: 'Mach 2.4 • CFL: 0.85 • 64 Cores',
    darkOverlay: 'bg-white/30',
    lightOverlay: 'bg-amber-50/40 backdrop-blur-[0.5px]',
  },
  sweeps: {
    page: 'sweeps',
    name: 'Airfoil Polar Curves',
    src: '/backgrounds/sweeps.jpg',
    category: 'Parametric Physics',
    tag: 'Polar Streamlines',
    description: 'Minimalist scientific visualization of green wireframe airfoil streamlines and polar curve chart',
    flowProfile: 'Upper Camber Bernoulli Acceleration',
    telemetryMetric: 'Cl/Cd max: 62.4 • AoA: 5.5°',
    darkOverlay: 'bg-white/30',
    lightOverlay: 'bg-emerald-50/45 backdrop-blur-[0.5px]',
  },
  results: {
    page: 'results',
    name: 'AI-CFD Cockpit Suite',
    src: '/backgrounds/results.jpg',
    category: 'Post-Processing',
    tag: 'Cockpit Scalar Field',
    description: 'Futuristic aerospace cockpit display with rainbow scalar pressure field and neural graphs',
    flowProfile: 'Rainbow Iso-Pressure Contour Drift',
    telemetryMetric: 'ΔP: 14.2 kPa • Q-Criterion',
    darkOverlay: 'bg-white/35',
    lightOverlay: 'bg-sky-50/45 backdrop-blur-[0.5px]',
  },
  ai: {
    page: 'ai',
    name: 'Neural Co-Pilot Robot',
    src: '/backgrounds/ai.jpg',
    category: 'AI Advisory',
    tag: 'Holographic UI',
    description: 'Friendly humanoid AI robot looking up at luminous blue holographic charts and neural graphs',
    flowProfile: 'Synaptic Axon Pulse Network',
    telemetryMetric: 'Gemini 2.5 Flash • 98.4% Confidence',
    darkOverlay: 'bg-white/30',
    lightOverlay: 'bg-purple-50/45 backdrop-blur-[0.5px]',
  },
  reporting: {
    page: 'reporting',
    name: 'Compliance Analytics Waves',
    src: '/backgrounds/reporting.jpg',
    category: 'Verification',
    tag: 'Telemetry Waves',
    description: 'Minimalist corporate analytics background with clean data waveforms and topology nodes',
    flowProfile: 'Harmonic Fourier Telemetry Oscillation',
    telemetryMetric: 'ISO-9001 / DO-160G Verified',
    darkOverlay: 'bg-white/30',
    lightOverlay: 'bg-slate-50/45 backdrop-blur-[0.5px]',
  },
  docs: {
    page: 'docs',
    name: 'Architectural Documentation',
    src: '/backgrounds/docs.jpg',
    category: 'Architecture',
    tag: 'Flowchart Nodes',
    description: 'Clean technical documentation background with diagrammatic node flowchart connectors',
    flowProfile: 'Orthogonal Bus Trace Routing',
    telemetryMetric: 'API v2.4 • OpenFOAM Native',
    darkOverlay: 'bg-white/30',
    lightOverlay: 'bg-sky-50/50 backdrop-blur-[0.5px]',
  },
};

export const VideoBackground: React.FC = () => {
  const { page, themeMode } = usePlatform();

  // Video Motion, Blur and Opacity controls with localStorage memory
  const [motionEnabled, setMotionEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cfd_bg_motion');
    return saved !== null ? saved === 'true' : true;
  });

  // Blur in pixels (little blur default is 2px)
  const [blurPx, setBlurPx] = useState<number>(() => {
    const saved = localStorage.getItem('cfd_bg_blur');
    return saved !== null ? parseFloat(saved) : 2;
  });

  // Background Opacity in percentage (default 75% for rich visibility)
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('cfd_bg_opacity');
    return saved !== null ? parseInt(saved, 10) : 75;
  });

  // Particle Engine Settings
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cfd_particles_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(() => {
    const saved = localStorage.getItem('cfd_performance_mode') as PerformanceMode;
    return saved === 'eco' || saved === 'ultra' ? saved : 'turbo';
  });

  const [particleDensity, setParticleDensity] = useState<number>(() => {
    const saved = localStorage.getItem('cfd_particle_density');
    return saved !== null ? parseFloat(saved) : 1.25;
  });

  const [interactiveVortex, setInteractiveVortex] = useState<boolean>(() => {
    const saved = localStorage.getItem('cfd_interactive_vortex');
    return saved !== null ? saved === 'true' : true;
  });

  const [speedMultiplier, setSpeedMultiplier] = useState<number>(() => {
    const saved = localStorage.getItem('cfd_speed_mult');
    return saved !== null ? parseFloat(saved) : 1.0;
  });

  // Real-time FPS tracker
  const [liveFps, setLiveFps] = useState<number>(60);

  // Optional preview override to inspect any page's background
  const [previewPage, setPreviewPage] = useState<PageId | null>(null);

  // HUD drawer toggle
  const [isHudOpen, setIsHudOpen] = useState<boolean>(false);

  // Veo Video Generator Modal state
  const [isVeoModalOpen, setIsVeoModalOpen] = useState<boolean>(false);

  // Custom generated or selected video background URL
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(() => {
    return localStorage.getItem('cfd_custom_bg_video');
  });

  useEffect(() => {
    const handleVideoChange = (e: any) => {
      if (e.detail?.videoUrl) {
        setCustomVideoUrl(e.detail.videoUrl);
      }
    };
    window.addEventListener('cfd-bg-video-change', handleVideoChange);
    return () => {
      window.removeEventListener('cfd-bg-video-change', handleVideoChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('cfd_bg_motion', String(motionEnabled));
  }, [motionEnabled]);

  useEffect(() => {
    localStorage.setItem('cfd_bg_blur', String(blurPx));
  }, [blurPx]);

  useEffect(() => {
    localStorage.setItem('cfd_bg_opacity', String(bgOpacity));
  }, [bgOpacity]);

  useEffect(() => {
    localStorage.setItem('cfd_particles_enabled', String(particlesEnabled));
  }, [particlesEnabled]);

  useEffect(() => {
    localStorage.setItem('cfd_performance_mode', performanceMode);
  }, [performanceMode]);

  useEffect(() => {
    localStorage.setItem('cfd_particle_density', String(particleDensity));
  }, [particleDensity]);

  useEffect(() => {
    localStorage.setItem('cfd_interactive_vortex', String(interactiveVortex));
  }, [interactiveVortex]);

  useEffect(() => {
    localStorage.setItem('cfd_speed_mult', String(speedMultiplier));
  }, [speedMultiplier]);

  const activeKey = previewPage || page;
  const config = PAGE_BACKGROUND_CONFIGS[activeKey] || PAGE_BACKGROUND_CONFIGS.landing;

  // Particle count estimate
  const currentParticleCount = useMemo(() => {
    const base = performanceMode === 'eco' ? 140 : performanceMode === 'turbo' ? 380 : 750;
    return Math.round(base * particleDensity);
  }, [performanceMode, particleDensity]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Dynamic Looping Video Background Container with Smooth Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={customVideoUrl || config.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: bgOpacity / 100 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full overflow-hidden"
        >
          {customVideoUrl ? (
            <video
              src={customVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                filter: `blur(${blurPx}px)`,
                WebkitFilter: `blur(${blurPx}px)`,
              }}
              className="w-full h-full object-cover object-center transform-gpu scale-102"
            />
          ) : (
            <img
              src={config.src}
              alt={config.name}
              referrerPolicy="no-referrer"
              style={{
                filter: `blur(${blurPx}px)`,
                WebkitFilter: `blur(${blurPx}px)`,
              }}
              className={`w-full h-full object-cover object-center transform-gpu transition-all duration-700 ${
                motionEnabled ? 'animate-video-loop' : 'scale-105'
              }`}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 2. Atmospheric Luminous Overlays Tailored to Current Page */}
      <div
        className={`absolute inset-0 transition-colors duration-500 pointer-events-none ${config.lightOverlay}`}
      />

      {/* 3. Soft Aerodynamic Ambient Vignette along the Outer Edges (No Dark Shading) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-sky-100/30 pointer-events-none" />

      {/* 4. Soft Aerospace Micro-Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.4)_50%,rgba(255,255,255,0)_50%)] bg-[length:100%_4px] opacity-15 pointer-events-none" />

      {/* 5. Real-Time Aerodynamic Particle Physics Simulation Canvas */}
      {particlesEnabled && (
        <AerodynamicParticleCanvas
          page={activeKey}
          densityMultiplier={particleDensity}
          performanceMode={performanceMode}
          interactiveVortex={interactiveVortex}
          speedMultiplier={speedMultiplier}
          onFpsUpdate={setLiveFps}
        />
      )}

      {/* 6. Page-Oriented HUD Vector Telemetry Overlays */}
      <div className="absolute inset-0 pointer-events-none z-15">
        {activeKey === 'landing' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Wind Tunnel Streamlines & Pitot Coordinate Axes */}
            <line x1="120" y1="180" x2="1320" y2="180" stroke="#06B6D4" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="120" y1="720" x2="1320" y2="720" stroke="#06B6D4" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="690" cy="450" r="140" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="8 6" />
            <circle cx="690" cy="450" r="4" fill="#F59E0B" />
            <text x="705" y="445" fill="#F59E0B" fontSize="11" fontFamily="monospace">STAGNATION CP=1.0</text>
            <text x="130" y="170" fill="#38BDF8" fontSize="10" fontFamily="monospace">WIND TUNNEL FREESTREAM V∞ = 42.5 m/s</text>
          </svg>
        )}

        {activeKey === 'dashboard' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Transonic Vortex Core Rings */}
            <circle cx="500" cy="450" r="80" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="5 5" />
            <circle cx="940" cy="450" r="80" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="5 5" />
            <line x1="500" y1="450" x2="940" y2="450" stroke="#C084FC" strokeWidth="1" strokeDasharray="4 4" />
            <text x="510" y="430" fill="#38BDF8" fontSize="10" fontFamily="monospace">PORT WAKE CORE Γ(+) = 18.2 m²/s</text>
            <text x="780" y="430" fill="#818CF8" fontSize="10" fontFamily="monospace">STARBOARD CORE Γ(-) = -18.2 m²/s</text>
          </svg>
        )}

        {activeKey === 'projects' && (
          <svg className="w-full h-full opacity-20" viewBox="0 0 1440 900" fill="none">
            {/* Engineering Millimeter Blueprint Grid & Drafting Crosshairs */}
            <defs>
              <pattern id="cadGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0284C7" strokeWidth="0.6" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cadGrid)" />
            <line x1="200" y1="200" x2="260" y2="200" stroke="#38BDF8" strokeWidth="1.5" />
            <line x1="230" y1="170" x2="230" y2="230" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="240" y="195" fill="#38BDF8" fontSize="10" fontFamily="monospace">DATUM 0,0</text>
          </svg>
        )}

        {activeKey === 'geometry' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Manifold Topology Flow Connectors */}
            <path d="M 180 450 L 520 450 L 820 280 L 1260 280" stroke="#2DD4BF" strokeWidth="1.5" strokeDasharray="8 6" />
            <path d="M 520 450 L 820 450 L 1260 450" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="8 6" />
            <path d="M 520 450 L 820 620 L 1260 620" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="8 6" />
            <circle cx="520" cy="450" r="6" fill="#F43F5E" />
            <text x="535" y="445" fill="#F43F5E" fontSize="10" fontFamily="monospace">SPLITTER JUNCTION ΔP = 420 Pa</text>
          </svg>
        )}

        {activeKey === 'setup' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Optical Prism Refraction Dispersion Scale */}
            <polygon points="650,280 540,550 760,550" stroke="#FACC15" strokeWidth="1.8" fill="none" />
            <line x1="200" y1="415" x2="595" y2="415" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="705" y1="415" x2="1280" y2="290" stroke="#A855F7" strokeWidth="1.5" />
            <line x1="705" y1="415" x2="1280" y2="415" stroke="#4ADE80" strokeWidth="1.5" />
            <line x1="705" y1="415" x2="1280" y2="540" stroke="#F43F5E" strokeWidth="1.5" />
            <text x="220" y="405" fill="#FFFFFF" fontSize="10" fontFamily="monospace">INCIDENT WHITE RAY</text>
            <text x="1290" y="295" fill="#A855F7" fontSize="10" fontFamily="monospace">λ=380nm (VIOLET)</text>
            <text x="1290" y="545" fill="#F43F5E" fontSize="10" fontFamily="monospace">λ=700nm (RED)</text>
          </svg>
        )}

        {activeKey === 'runner' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Supersonic Shock Angles & Mach Waves */}
            <line x1="300" y1="450" x2="1140" y2="150" stroke="#F97316" strokeWidth="2" strokeDasharray="10 8" />
            <line x1="300" y1="450" x2="1140" y2="750" stroke="#F97316" strokeWidth="2" strokeDasharray="10 8" />
            <circle cx="300" cy="450" r="5" fill="#EF4444" />
            <text x="315" y="445" fill="#EF4444" fontSize="10" fontFamily="monospace">SUPERSONIC NOSE APEX (μ = 24.6°)</text>
            <text x="1000" y="140" fill="#F97316" fontSize="10" fontFamily="monospace">OBLIQUE SHOCK FRONT</text>
          </svg>
        )}

        {activeKey === 'sweeps' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Airfoil Polar Grid & Lift vs Drag Coordinate System */}
            <line x1="200" y1="700" x2="1240" y2="700" stroke="#10B981" strokeWidth="1.2" />
            <line x1="200" y1="700" x2="200" y2="150" stroke="#10B981" strokeWidth="1.2" />
            <path d="M 200 680 Q 500 660 700 380 T 1100 220" stroke="#38BDF8" strokeWidth="2" fill="none" />
            <text x="210" y="165" fill="#10B981" fontSize="10" fontFamily="monospace">LIFT COEFF Cl</text>
            <text x="1160" y="690" fill="#10B981" fontSize="10" fontFamily="monospace">DRAG COEFF Cd</text>
            <text x="710" y="365" fill="#FBBF24" fontSize="10" fontFamily="monospace">STALL MARGIN (AoA 16.2°)</text>
          </svg>
        )}

        {activeKey === 'results' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Isobaric Contour Waves & Colormap Axis */}
            <path d="M 200 300 C 500 240, 800 360, 1240 300" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 6" />
            <path d="M 200 450 C 500 400, 800 500, 1240 450" stroke="#10B981" strokeWidth="1.5" strokeDasharray="8 6" />
            <path d="M 200 600 C 500 560, 800 640, 1240 600" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="8 6" />
            <text x="1255" y="305" fill="#3B82F6" fontSize="10" fontFamily="monospace">P = -1.2 kPa</text>
            <text x="1255" y="455" fill="#10B981" fontSize="10" fontFamily="monospace">P = 0.0 kPa</text>
            <text x="1255" y="605" fill="#EF4444" fontSize="10" fontFamily="monospace">P = +2.4 kPa</text>
          </svg>
        )}

        {activeKey === 'ai' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Neural Topology Interconnects */}
            <circle cx="360" cy="300" r="8" stroke="#818CF8" strokeWidth="2" fill="none" />
            <circle cx="360" cy="600" r="8" stroke="#818CF8" strokeWidth="2" fill="none" />
            <circle cx="720" cy="450" r="12" stroke="#C084FC" strokeWidth="2.5" fill="none" />
            <circle cx="1080" cy="300" r="8" stroke="#38BDF8" strokeWidth="2" fill="none" />
            <circle cx="1080" cy="600" r="8" stroke="#38BDF8" strokeWidth="2" fill="none" />
            <line x1="368" y1="300" x2="708" y2="450" stroke="#818CF8" strokeWidth="1.2" strokeDasharray="6 6" />
            <line x1="368" y1="600" x2="708" y2="450" stroke="#818CF8" strokeWidth="1.2" strokeDasharray="6 6" />
            <line x1="732" y1="450" x2="1072" y2="300" stroke="#C084FC" strokeWidth="1.2" strokeDasharray="6 6" />
            <line x1="732" y1="450" x2="1072" y2="600" stroke="#C084FC" strokeWidth="1.2" strokeDasharray="6 6" />
            <text x="660" y="430" fill="#C084FC" fontSize="10" fontFamily="monospace">AI CO-PILOT AGENT</text>
          </svg>
        )}

        {activeKey === 'reporting' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Telemetry Spectrum Signal Waveform */}
            <path
              d="M 100 450 Q 250 350, 400 450 T 700 450 T 1000 450 T 1340 450"
              stroke="#0EA5E9"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 100 450 Q 250 520, 400 450 T 700 450 T 1000 450 T 1340 450"
              stroke="#10B981"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 4"
            />
            <text x="120" y="435" fill="#0EA5E9" fontSize="10" fontFamily="monospace">HARMONIC SENSOR TELEMETRY (f = 400 Hz)</text>
          </svg>
        )}

        {activeKey === 'docs' && (
          <svg className="w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none">
            {/* Architecture Node Connectors */}
            <rect x="240" y="240" width="140" height="70" rx="6" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
            <rect x="650" y="240" width="140" height="70" rx="6" stroke="#6366F1" strokeWidth="1.5" fill="none" />
            <rect x="1060" y="240" width="140" height="70" rx="6" stroke="#34D399" strokeWidth="1.5" fill="none" />
            <line x1="380" y1="275" x2="650" y2="275" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="5 5" />
            <line x1="790" y1="275" x2="1060" y2="275" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="5 5" />
            <text x="255" y="280" fill="#38BDF8" fontSize="10" fontFamily="monospace">GEOMETRY CAD</text>
            <text x="670" y="280" fill="#6366F1" fontSize="10" fontFamily="monospace">OPENFOAM SOLVER</text>
            <text x="1080" y="280" fill="#34D399" fontSize="10" fontFamily="monospace">AI TELEMETRY</text>
          </svg>
        )}
      </div>

      {/* 7. Interactive Performance & Particle Engine HUD Floating in Bottom Right */}
      <div className="absolute bottom-10 right-4 z-30 pointer-events-auto flex flex-col items-end gap-2 text-xs">
        <AnimatePresence>
          {isHudOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="w-88 max-w-[92vw] p-4 rounded-xl bg-white/95 border border-sky-300/80 shadow-2xl backdrop-blur-xl space-y-3.5 text-slate-800 ring-1 ring-sky-500/20"
            >
              {/* Header & Live Performance Telemetry */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-sky-500/15 text-sky-500">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs tracking-tight flex items-center gap-1.5 text-slate-900">
                      Aerodynamic Engine HUD
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-600 font-mono font-bold">
                        v2.8
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${liveFps >= 55 ? 'bg-emerald-500' : liveFps >= 30 ? 'bg-amber-500' : 'bg-red-500'}`} />
                      {liveFps} FPS • {currentParticleCount} Pts • GPU Canvas
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsHudOpen(false)}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Minimize HUD"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Active Page Discipline & Aerodynamic Telemetry */}
              <div className="p-2.5 rounded-lg bg-sky-50/80 border border-sky-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Page Context:</span>
                  <span className="font-mono font-bold text-sky-600 capitalize">{activeKey}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Flow Regime:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[180px]">
                    {config.flowProfile}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-600 pt-0.5 border-t border-slate-200/60">
                  <span>Telemetry:</span>
                  <span>{config.telemetryMetric}</span>
                </div>
              </div>

              {/* Performance Mode Selector (Eco / Turbo / Ultra) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-sky-500" />
                    Performance Profile:
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{performanceMode} Mode</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['eco', 'turbo', 'ultra'] as PerformanceMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPerformanceMode(mode)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold tracking-wide uppercase transition-all flex items-center justify-center gap-1 border ${
                        performanceMode === mode
                          ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      {mode === 'eco' && <LeafIcon />}
                      {mode === 'turbo' && <Zap className="w-3 h-3" />}
                      {mode === 'ultra' && <Flame className="w-3 h-3 text-amber-300" />}
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Particles & Interactive Wind Tunnel Controls */}
              <div className="space-y-2 pt-1 border-t border-slate-200/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-cyan-500" />
                    Fluid Particles Engine:
                  </span>
                  <button
                    onClick={() => setParticlesEnabled(!particlesEnabled)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      particlesEnabled
                        ? 'bg-cyan-500/20 text-cyan-600 border border-cyan-500/30'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {particlesEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {particlesEnabled && (
                  <>
                    {/* Particle Density Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Particle Density:</span>
                        <span className="font-mono font-semibold text-sky-600">
                          {currentParticleCount} Particles
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.25"
                        value={particleDensity}
                        onChange={(e) => setParticleDensity(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Interactive Mouse Wind Tunnel Vortex */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Cursor Wind Tunnel Vortex:
                      </span>
                      <button
                        onClick={() => setInteractiveVortex(!interactiveVortex)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                          interactiveVortex
                            ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                            : 'bg-slate-100 text-slate-400 border border-slate-300'
                        }`}
                      >
                        {interactiveVortex ? 'Active' : 'Off'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Background Video Controls (Motion & Blur) */}
              <div className="space-y-2 pt-1 border-t border-slate-200/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-sky-500" />
                    Cinematic Video Motion:
                  </span>
                  <button
                    onClick={() => setMotionEnabled(!motionEnabled)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      motionEnabled
                        ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                        : 'bg-slate-100 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {motionEnabled ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                    {motionEnabled ? 'Looping' : 'Paused'}
                  </button>
                </div>

                {/* Blur Slider & Presets */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Subtle Backdrop Blur:</span>
                    <span className="font-mono font-semibold text-sky-600">{blurPx}px</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'Sharp', val: 0 },
                      { label: 'Subtle', val: 1.5 },
                      { label: 'Normal', val: 2.5 },
                      { label: 'Soft', val: 5 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => setBlurPx(preset.val)}
                        className={`py-0.8 text-[9px] font-medium rounded border transition-all ${
                          blurPx === preset.val
                            ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Backdrop Opacity:</span>
                    <span className="font-mono font-semibold text-sky-600">{bgOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(Number(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Page Background Selector / Switcher */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-sky-500" />
                    All 11 Page Backdrops:
                  </span>
                  {previewPage && (
                    <button
                      onClick={() => setPreviewPage(null)}
                      className="text-[10px] text-sky-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset to Page
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {(Object.keys(PAGE_BACKGROUND_CONFIGS) as PageId[]).map((pId) => {
                    const item = PAGE_BACKGROUND_CONFIGS[pId];
                    const isSelected = (previewPage || page) === pId;
                    return (
                      <button
                        key={pId}
                        onClick={() => setPreviewPage(pId)}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left text-[10px] transition-all border ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-400 text-sky-700 font-medium shadow-sm'
                            : 'bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-6 h-6 rounded overflow-hidden shrink-0 border border-slate-300 bg-slate-200">
                          <img
                            src={item.src}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="truncate flex-1">
                          <div className="truncate font-semibold leading-tight">{item.name}</div>
                          <div className="text-[9px] text-slate-400 truncate capitalize">{pId}</div>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-sky-500 shrink-0 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Veo Video Generator Feature Trigger */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5 pointer-events-auto">
                <div className="text-[11px] font-medium text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-sky-600" />
                    Veo Video Background:
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                    veo-3.1
                  </span>
                </div>
                <button
                  onClick={() => setIsVeoModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Animate with Veo (16:9 / 9:16)</span>
                </button>
                {customVideoUrl && (
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="text-cyan-600 font-medium truncate">Playing custom Veo video</span>
                    <button
                      onClick={() => {
                        setCustomVideoUrl(null);
                        localStorage.removeItem('cfd_custom_bg_video');
                      }}
                      className="text-rose-500 hover:underline cursor-pointer"
                    >
                      Reset to Default
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Pill with Live FPS & Particles Count */}
        <button
          onClick={() => setIsHudOpen(!isHudOpen)}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white border border-sky-300/80 shadow-xl backdrop-blur-md text-slate-700 text-xs font-medium transition-all hover:scale-105 active:scale-95"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform animate-pulse" />
          <span className="font-mono text-[10px] font-bold text-sky-600">
            {liveFps} FPS
          </span>
          <span className="text-[11px] text-slate-300">|</span>
          <span className="text-[11px] flex items-center gap-1 font-mono text-cyan-600">
            <Wind className="w-3 h-3" />
            {currentParticleCount} Pts
          </span>
          <span className="text-[11px] text-slate-300">|</span>
          <span className="text-[10px] uppercase font-mono tracking-wide text-slate-500">
            {config.tag}
          </span>
          {isHudOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Veo Video Modal */}
      <VeoVideoModal
        isOpen={isVeoModalOpen}
        onClose={() => setIsVeoModalOpen(false)}
        onApplyBackgroundVideo={(url) => setCustomVideoUrl(url)}
      />
    </div>
  );
};

const LeafIcon = () => (
  <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);
