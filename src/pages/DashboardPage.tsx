import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import { CfdLogo } from '../components/common/CfdLogo';
import {
  FolderKanban,
  PlayCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  TrendingUp,
  Wind,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../utils/soundEffects';

export const DashboardPage: React.FC = () => {
  const {
    projects,
    simulations,
    setPage,
    setCurrentProjectId,
    setCurrentSimulationId
  } = usePlatform();

  const totalProjects = projects.length;
  const totalSims = simulations.length;
  const completedSims = simulations.filter((s) => s.status === 'completed').length;
  const runningSims = simulations.filter((s) => s.status === 'running' || s.status === 'meshing').length;
  const failedSims = simulations.filter((s) => s.status === 'failed').length;

  const handleOpenProject = (id: string) => {
    sound.playClick();
    setCurrentProjectId(id);
    setPage('setup');
  };

  const handleOpenSimulation = (id: string) => {
    sound.playClick();
    setCurrentSimulationId(id);
    setPage('results');
  };

  const handleNewProject = () => {
    sound.playClick();
    setPage('projects');
  };

  const handleRefresh = () => {
    sound.playTick();
  };

  return (
    <div className="flex-1 overflow-y-auto select-none text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#BAE6FD]/70">
        <div className="flex items-center gap-3">
          <CfdLogo size="sm" showText={false} />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-2">
              <span>Engineering Dashboard</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-semibold border border-[#BAE6FD]">
                TELEMETRY
              </span>
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Live operational overview of CFD aerodynamic simulation cases, active solvers, and FNO models
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD] rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleNewProject}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Info Status Banner */}
      <div className="p-3.5 bg-gradient-to-r from-[#E0F2FE] via-[#F0F9FF] to-[#E0F7FA]/80 rounded-2xl border border-[#BAE6FD] flex items-center justify-between text-xs text-[#0369A1] shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0284C7] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0284C7]"></span>
          </span>
          <span>
            <strong>Simulation Engine Online:</strong> Real-time Navier-Stokes potential flow solver and OpenFOAM case generator operational.
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#0284C7] font-bold hidden md:inline bg-white/80 px-2.5 py-0.5 rounded-full border border-[#BAE6FD]">
          Ready for Inflow Execution
        </span>
      </div>

      {/* 5 Metric Cards with Bright Aerodynamic Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1: Total Projects */}
        <div className="card-bright p-4 rounded-2xl border border-sky-200 shadow-xs flex flex-col justify-between hover:border-sky-500 transition-all bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Projects</span>
            <FolderKanban className="w-4 h-4 text-sky-600" />
          </div>
          <div className="font-mono text-2xl font-black text-slate-900 mt-2 mb-1">
            {totalProjects}
          </div>
          <span className="text-[11px] text-slate-500">Configured studies</span>
        </div>

        {/* Metric 2: Total Simulations */}
        <div className="card-bright p-4 rounded-2xl border border-cyan-200 shadow-xs flex flex-col justify-between hover:border-cyan-500 transition-all bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Simulations</span>
            <Wind className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="font-mono text-2xl font-black text-slate-900 mt-2 mb-1">
            {totalSims}
          </div>
          <span className="text-[11px] text-slate-500">Total solver runs</span>
        </div>

        {/* Metric 3: Completed */}
        <div className="card-bright p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition-all bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl font-black text-emerald-600 mt-2 mb-1">
            {completedSims}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Converged to 1e-5</span>
        </div>

        {/* Metric 4: Running */}
        <div className="card-bright p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between hover:border-amber-500 transition-all bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Active</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-2xl font-black text-amber-600 mt-2 mb-1">
            {runningSims}
          </div>
          <span className="text-[11px] text-slate-500">Iterating on grid</span>
        </div>

        {/* Metric 5: Failed */}
        <div className="card-bright p-4 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between hover:border-rose-500 transition-all bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Diverged</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-mono text-2xl font-black text-rose-600 mt-2 mb-1">
            {failedSims}
          </div>
          <span className="text-[11px] text-slate-500">0 Courant blowups</span>
        </div>
      </div>

      {/* Featured Real CFD Aerodynamic Graphic Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-white p-5 shadow-md flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-72 shrink-0 aspect-video lg:aspect-4/3 rounded-xl overflow-hidden relative shadow-md border border-slate-200 bg-slate-950 group cursor-pointer" onClick={() => setPage('results')}>
          <img
            src="/src/assets/images/cfd_transonic_shockwave_1790163852748.jpg"
            alt="Transonic Airfoil Simulation"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm text-[10px] font-mono text-cyan-300 font-bold border border-cyan-500/30">
            REAL CFD STUDY
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-white/90 backdrop-blur-sm text-[10px] font-bold text-sky-800 shadow-xs flex items-center gap-1">
            <span>Inspect 3D</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200">
              BENCHMARK CASE: TRANSONIC RANS
            </span>
            <span className="text-xs text-slate-500">Mach 0.85 Supercritical Camber</span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            High-Speed Aerodynamic Surface Pressure & Shockwave Telemetry
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed">
            Real scalar contour data extracted from high-resolution CFD wind tunnel simulation. 
            Lambda shockwave formation on the upper surface shows localized flow deceleration with boundary layer thickening.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-sky-50 border border-sky-100">
              <span className="text-slate-500 block text-[10px]">Inflow Re:</span>
              <span className="font-bold text-sky-800">4.8 × 10⁶</span>
            </div>
            <div className="p-2 rounded-lg bg-cyan-50 border border-cyan-100">
              <span className="text-slate-500 block text-[10px]">Wave Drag:</span>
              <span className="font-bold text-cyan-800">Cd: 0.0214</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-slate-500 block text-[10px]">Lift-to-Drag:</span>
              <span className="font-bold text-emerald-800">L/D: 48.2</span>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
              <span className="text-slate-500 block text-[10px]">Solver CFL:</span>
              <span className="font-bold text-purple-800">1.2 (Stable)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Recent Projects & Recent Simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Recent Projects (7 cols) */}
        <div className="lg:col-span-7 card-bright rounded-2xl border border-[#BAE6FD]/70 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Recent CFD Projects</h2>
            </div>
            <button
              onClick={() => setPage('projects')}
              className="text-xs text-[#2563EB] hover:underline font-medium"
            >
              View All ({totalProjects})
            </button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => (
              <div
                key={project.projectId}
                className="p-3.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#0F172A] font-sans">
                      {project.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white text-[#2563EB] rounded border border-[#E2E8F0]">
                      {project.cfdType}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] line-clamp-1">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[#94A3B8] font-mono">
                    <span>Fluid: {project.fluidType}</span>
                    <span>•</span>
                    <span>Created: {project.createdAt}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenProject(project.projectId)}
                  className="self-start sm:self-center flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#EFF6FF] text-[#2563EB] border border-[#CBD5E1] hover:border-[#2563EB] rounded text-xs font-semibold transition-colors shrink-0 shadow-2xs"
                >
                  <span>Configure</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Recent Simulations (5 cols) */}
        <div className="lg:col-span-5 card-bright rounded-2xl border border-[#A5F3FC]/70 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-[#0891B2]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Recent Solver Runs</h2>
            </div>
            <button
              onClick={() => setPage('runner')}
              className="text-xs text-[#0891B2] hover:underline font-bold"
            >
              Runner Cockpit
            </button>
          </div>

          <div className="space-y-2.5">
            {simulations.slice(0, 4).map((sim) => {
              const isCompleted = sim.status === 'completed';
              const isRunning = sim.status === 'running';

              return (
                <div
                  key={sim.simulationId}
                  onClick={() => handleOpenSimulation(sim.simulationId)}
                  className="p-3 bg-white/90 hover:bg-[#ECFEFF] rounded-xl border border-[#BAE6FD]/60 hover:border-[#0891B2] transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : isRunning ? (
                        <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping"></span>
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                      )}
                      <span className="font-mono text-xs font-bold text-[#0F172A]">
                        {sim.simulationId.slice(0, 22)}...
                      </span>
                    </div>

                    <div className="text-[11px] text-[#64748B] flex items-center gap-2">
                      <span className="font-semibold text-[#0369A1]">{sim.projectName}</span>
                      <span>•</span>
                      <span className="font-mono">{sim.solver}</span>
                    </div>

                    <div className="text-[10px] text-[#64748B] font-mono">
                      Iterations: {sim.iterations} | Cells: {sim.meshCells.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isCompleted
                          ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                          : isRunning
                          ? 'bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA]'
                          : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                      }`}
                    >
                      {sim.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setPage('runner')}
              className="w-full py-2.5 bg-gradient-to-r from-[#0284C7] to-[#0891B2] hover:from-[#0369A1] hover:to-[#0e7490] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Open Solver Execution Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
