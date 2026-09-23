import React from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle2, Clock, Zap, Target, Gauge } from 'lucide-react';

interface ConvergenceProgressBarProps {
  iteration: number;
  maxIterations: number;
  isRunning: boolean;
  isConverged: boolean;
  runtimeSeconds: number;
  continuityResidual: number;
  momentumResidual: number;
  energyResidual: number;
}

export const ConvergenceProgressBar: React.FC<ConvergenceProgressBarProps> = ({
  iteration,
  maxIterations,
  isRunning,
  isConverged,
  runtimeSeconds,
  continuityResidual,
  momentumResidual,
  energyResidual,
}) => {
  const progressRatio = Math.min(1, Math.max(0, iteration / maxIterations));
  const progressPercent = Math.round(progressRatio * 100);

  // Calculate iteration speed and remaining ETA
  const itersPerSec = runtimeSeconds > 0 ? iteration / runtimeSeconds : 0;
  const remainingIters = Math.max(0, maxIterations - iteration);
  const etaSeconds = itersPerSec > 0 ? remainingIters / itersPerSec : 0;

  // CFD Phase classification based on Navier-Stokes progression
  const getCfdPhase = () => {
    if (isConverged) return { label: 'Navier-Stokes Fully Converged', sub: 'L2 norm residuals < 1e-5 threshold achieved', color: 'text-[#10B981]' };
    if (progressPercent < 25) return { label: 'Phase 1: Initial Transient Field Development', sub: 'Inflow momentum penetration & wall potential initialization', color: 'text-[#2563EB]' };
    if (progressPercent < 60) return { label: 'Phase 2: Viscous Boundary Layer Growth', sub: 'Prism layer shear stresses & eddy viscosity production', color: 'text-[#0284C7]' };
    if (progressPercent < 85) return { label: 'Phase 3: Pressure-Velocity Coupling (SIMPLE)', sub: 'Rhie-Chow face flux interpolation & continuity stabilization', color: 'text-[#0D9488]' };
    return { label: 'Phase 4: Asymptotic Residual Convergence', sub: 'Iterative matrix relaxation damping high-frequency spatial modes', color: 'text-[#059669]' };
  };

  const currentPhase = getCfdPhase();

  // Residual status flags
  const isContinuityGood = continuityResidual < 1e-3;
  const isMomentumGood = momentumResidual < 1e-3;
  const isEnergyGood = energyResidual < 1e-3;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header with Convergence State & ETA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isConverged ? 'bg-[#ECFDF5] text-[#10B981]' : isRunning ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
            {isConverged ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Activity className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Navier-Stokes Iteration Progress
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isConverged
                    ? 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]'
                    : isRunning
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                    : 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'
                }`}
              >
                {isConverged ? '✓ CONVERGED' : isRunning ? 'SOLVING' : 'PAUSED'}
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span className="font-semibold text-[#0F172A]">{currentPhase.label}</span>
              <span className="hidden sm:inline text-[#94A3B8]">•</span>
              <span className="truncate max-w-[280px] sm:max-w-none">{currentPhase.sub}</span>
            </div>
          </div>
        </div>

        {/* Live Numbers */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono self-start sm:self-auto shrink-0 mt-2 sm:mt-0">
          <div className="text-right">
            <span className="text-[10px] text-[#64748B] block">Solve Rate</span>
            <span className="font-bold text-[#0F172A] flex items-center justify-end gap-1">
              <Zap className="w-3 h-3 text-[#2563EB]" />
              {itersPerSec.toFixed(1)} it/s
            </span>
          </div>

          <div className="h-6 w-px bg-[#E2E8F0]" />

          <div className="text-right">
            <span className="text-[10px] text-[#64748B] block">Est. Time Remaining</span>
            <span className="font-bold text-[#0F172A] flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 text-[#0284C7]" />
              {isConverged ? '0.0s' : `${etaSeconds.toFixed(1)}s`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Progress Bar with Milestones */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#0F172A]">
              {iteration.toLocaleString()}
            </span>
            <span className="text-[#94A3B8]">/</span>
            <span className="text-[#64748B]">
              {maxIterations.toLocaleString()} iterations
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#64748B] font-medium">Convergence:</span>
            <span className="font-extrabold text-sm text-[#2563EB]">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-3.5 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E2E8F0] shadow-inner">
          {/* Animated Fill */}
          <motion.div
            className={`h-full relative ${
              isConverged
                ? 'bg-gradient-to-r from-[#059669] to-[#10B981]'
                : 'bg-gradient-to-r from-[#2563EB] via-[#0284C7] to-[#0D9488]'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          >
            {/* Pulsing light sweep animation when solving */}
            {isRunning && !isConverged && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
              />
            )}
          </motion.div>

          {/* Milestone markers on track */}
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
            <div className="w-px h-full bg-white/50" style={{ left: '25%' }} />
            <div className="w-px h-full bg-white/50" style={{ left: '50%' }} />
            <div className="w-px h-full bg-white/50" style={{ left: '75%' }} />
          </div>
        </div>

        {/* Milestone Labels below track */}
        <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] px-0.5">
          <span>0 (Init)</span>
          <span className="hidden sm:inline">25% (Wake Dev)</span>
          <span className="hidden sm:inline">50% (Core Coupling)</span>
          <span className="hidden sm:inline">75% (Fine Relaxation)</span>
          <span>{maxIterations} (Limit)</span>
        </div>
      </div>

      {/* Live Residual Convergence Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isContinuityGood ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
            <span className="text-[#64748B] text-[11px]">Continuity (p)</span>
          </div>
          <span className={`font-bold ${isContinuityGood ? 'text-[#059669]' : 'text-[#D97706]'}`}>
            {continuityResidual.toExponential(3)}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isMomentumGood ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
            <span className="text-[#64748B] text-[11px]">Momentum (Ux, Uy)</span>
          </div>
          <span className={`font-bold ${isMomentumGood ? 'text-[#059669]' : 'text-[#D97706]'}`}>
            {momentumResidual.toExponential(3)}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isEnergyGood ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
            <span className="text-[#64748B] text-[11px]">Turbulence (k-ω)</span>
          </div>
          <span className={`font-bold ${isEnergyGood ? 'text-[#059669]' : 'text-[#D97706]'}`}>
            {energyResidual.toExponential(3)}
          </span>
        </div>
      </div>
    </div>
  );
};
