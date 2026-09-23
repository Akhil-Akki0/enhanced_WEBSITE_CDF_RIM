import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import { CfdLogo } from '../components/common/CfdLogo';
import {
  Rocket,
  LayoutDashboard,
  BookOpen,
  Microscope,
  Palette,
  Brain,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Wind,
  ShieldCheck,
  Cpu,
  Flame,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../utils/soundEffects';

export const LandingPage: React.FC = () => {
  const { setPage, activeThemeConfig } = usePlatform();

  const handleStart = () => {
    sound.playClick();
    setPage('projects');
  };

  const handleDashboard = () => {
    sound.playClick();
    setPage('dashboard');
  };

  const handleDoc = () => {
    sound.playTick();
    setPage('setup');
  };

  return (
    <div className="flex-1 overflow-y-auto select-none text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Hero Container with Vibrant Aero Gradient & Official Logo Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-[#0369A1] via-[#0284C7] to-[#0EA5E9] text-white shadow-xl border border-white/20"
      >
        {/* Subtle decorative background wave SVG */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
            <path
              d="M0,150 C200,80 350,220 500,150 C650,80 800,200 1000,120 L1000,400 L0,400 Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold tracking-wider uppercase text-sky-100 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>OFFICIAL CFD PLATFORM</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-sans">
              AI-Powered Computational <br className="hidden sm:inline" />
              Fluid Dynamics
            </h1>

            <p className="text-lg sm:text-xl text-sky-100 font-semibold tracking-wide">
              Simulate • Analyze • Predict
            </p>

            <p className="text-sm text-sky-100/90 leading-relaxed max-w-xl font-normal">
              Next-generation browser CFD workbench combining real-time Navier-Stokes potential flow, 
              Fourier Neural Operators (FNO), interactive 3D vector fields, and automated compliance reporting.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 w-full">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-sky-50 text-[#0369A1] rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Rocket className="w-4 h-4 text-[#0284C7]" />
                <span>Start Simulation</span>
              </button>

              <button
                onClick={handleDashboard}
                className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-xl font-semibold text-sm backdrop-blur-sm transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-200" />
                <span>View Dashboard</span>
              </button>

              <button
                onClick={handleDoc}
                className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/10 text-sky-100 rounded-xl font-medium text-sm transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-sky-200" />
                <span>Configuration Guide</span>
              </button>
            </div>
          </div>

          {/* Official Website Logo Feature Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full sm:w-auto max-w-xs shrink-0 bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-2xl border-2 border-white/60 flex flex-col items-center text-center text-[#0F172A] mx-auto lg:mx-0"
          >
            <div className="w-32 h-32 relative rounded-2xl overflow-hidden shadow-md border border-[#BAE6FD] bg-white p-1 mb-3">
              <img
                src="/logo.png"
                alt="CFD Platform Website Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="font-black text-lg text-[#0F172A] tracking-tight flex items-center gap-1">
              <span className="bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#2563EB] bg-clip-text text-transparent">
                CFD
              </span>
              <span>PLATFORM</span>
            </div>
            <p className="text-[11px] font-semibold text-[#0284C7] uppercase tracking-wider mb-2">
              Aerodynamics & AI Engine
            </p>

            <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] font-semibold border border-[#BAE6FD]">
              <Activity className="w-3 h-3 text-[#0284C7] animate-pulse" />
              <span>Real-Time Solver Active</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Section: What is CFD? */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card-bright rounded-2xl border border-[#BAE6FD]/70 p-6 space-y-4"
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shadow-2xs border border-[#BAE6FD]">
            <Microscope className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">What is CFD?</h2>
            <p className="text-xs text-[#64748B]">The physics & computational science powering this platform</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#334155] leading-relaxed">
          <div className="space-y-2 p-3.5 rounded-xl bg-[#F0F9FF]/60 border border-[#BAE6FD]/50">
            <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-[#0284C7]" />
              The Digital Wind Tunnel
            </h3>
            <p>
              <strong>Computational Fluid Dynamics (CFD)</strong> is the science of using numerical analysis to solve the 
              partial differential equations governing fluid motion, thermal transport, and shock formation.
            </p>
          </div>

          <div className="space-y-2 p-3.5 rounded-xl bg-[#F0FDFA]/60 border border-[#99F6E4]/50">
            <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#0D9488]" />
              Navier-Stokes Equations
            </h3>
            <p>
              Instead of manufacturing costly physical wind tunnel prototypes, our engine calculates mass, momentum, and 
              energy conservation across unstructured and structured boundary-layer grids.
            </p>
          </div>

          <div className="space-y-2 p-3.5 rounded-xl bg-[#FAF5FF]/60 border border-[#E9D5FF]/50">
            <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[#7C3AED]" />
              Physics-Informed AI Acceleration
            </h3>
            <p>
              Augmented with Fourier Neural Operators (FNO) and DeepONets to deliver near-instantaneous 
              aerodynamic surrogate inference with validated confidence scoring.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Section: Core Capabilities Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0284C7]" />
            <h2 className="text-base font-bold text-[#0F172A]">Core Capabilities</h2>
          </div>
          <span className="text-xs text-[#64748B] font-medium">Full-featured industrial aerodynamic engineering</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: CFD Simulation */}
          <div
            onClick={() => setPage('runner')}
            className="group card-bright hover:bg-[#F0F9FF] border border-[#BAE6FD]/70 hover:border-[#0284C7] rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-xl group-hover:scale-105 transition-transform border border-[#BAE6FD]">
                🔬
              </div>
              <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#0284C7] transition-colors">
                CFD Simulation
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Run OpenFOAM and SU2 steady and transient solvers for external aerodynamics, internal pipe flow, and conjugate heat transfer.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-bold text-[#0284C7]">
              <span>Launch Runner</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: 3D Visualization */}
          <div
            onClick={() => setPage('results')}
            className="group card-bright hover:bg-[#ECFEFF] border border-[#A5F3FC]/70 hover:border-[#0891B2] rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#CFFAFE] text-[#0891B2] flex items-center justify-center text-xl group-hover:scale-105 transition-transform border border-[#A5F3FC]">
                🎨
              </div>
              <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#0891B2] transition-colors">
                3D Visualization
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Interactive real-time 60 FPS vector streamlines, surface pressure contours (-Cp), Mach shock boundaries, and custom colormaps.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-bold text-[#0891B2]">
              <span>Explore Viewport</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: AI Analysis */}
          <div
            onClick={() => setPage('ai')}
            className="group card-bright hover:bg-[#FAF5FF] border border-[#E9D5FF]/70 hover:border-[#7C3AED] rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center text-xl group-hover:scale-105 transition-transform border border-[#E9D5FF]">
                🧠
              </div>
              <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#7C3AED] transition-colors">
                AI Analysis
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Fourier Neural Operators (FNO) and Physics-Informed Neural Networks (PINN) for sub-second flow prediction and confidence metrics.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-bold text-[#7C3AED]">
              <span>Open AI Models</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Automated Reports */}
          <div
            onClick={() => setPage('reporting')}
            className="group card-bright hover:bg-[#F0FDF4] border border-[#BBF7D0]/70 hover:border-[#16A34A] rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-xl group-hover:scale-105 transition-transform border border-[#BBF7D0]">
                📊
              </div>
              <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#16A34A] transition-colors">
                Automated Reports
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Generate professional multi-worksheet Excel spreadsheets, VTK structured grid files, and aerodynamic compliance certificates.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
              <span>Generate Reports</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Workflow Stepper */}
      <div className="card-bright rounded-2xl border border-[#BAE6FD]/70 p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide flex items-center gap-2">
          <span>Standard CFD Workflow Pipeline</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-mono font-bold">
            4 STAGES
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-[#BAE6FD]/60 shadow-2xs space-y-1.5">
            <span className="font-mono text-[10px] text-[#0284C7] font-bold">STAGE 01</span>
            <h4 className="font-bold text-[#0F172A]">Geometry & Mesh</h4>
            <p className="text-[11px] text-[#64748B]">Upload STL/OBJ or select airfoil. Inspect watertightness and boundary layers.</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#A5F3FC]/60 shadow-2xs space-y-1.5">
            <span className="font-mono text-[10px] text-[#0891B2] font-bold">STAGE 02</span>
            <h4 className="font-bold text-[#0F172A]">Physics & Inflow</h4>
            <p className="text-[11px] text-[#64748B]">Set Mach number, angle of attack, k-ω SST turbulence, and fluid density.</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#E9D5FF]/60 shadow-2xs space-y-1.5">
            <span className="font-mono text-[10px] text-[#7C3AED] font-bold">STAGE 03</span>
            <h4 className="font-bold text-[#0F172A]">Solver Execution</h4>
            <p className="text-[11px] text-[#64748B]">Monitor logarithmic residual decay, mass flow balance, and Courant CFL stepping.</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#BBF7D0]/60 shadow-2xs space-y-1.5">
            <span className="font-mono text-[10px] text-[#16A34A] font-bold">STAGE 04</span>
            <h4 className="font-bold text-[#0F172A]">Telemetry & Export</h4>
            <p className="text-[11px] text-[#64748B]">Inspect lift/drag polars, evaluate AI surrogate models, and download Excel reports.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-4 pb-2 border-t border-[#BAE6FD]/60 text-center text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CfdLogo size="xs" showText={true} />
        </div>
        <span>CFD Platform v0.1.0 • High-Performance Browser Aerodynamics Workbench</span>
      </footer>
    </div>
  );
};
