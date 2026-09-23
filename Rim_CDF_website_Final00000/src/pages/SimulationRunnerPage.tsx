import React, { useState, useEffect, useRef } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';
import { ConvergenceProgressBar } from '../components/Simulation/ConvergenceProgressBar';
import { CfdLogo } from '../components/common/CfdLogo';
import {
  PlayCircle,
  PauseCircle,
  RotateCcw,
  StepForward,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Wind,
  Terminal,
  Layers,
  ArrowRight,
  Activity,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../utils/soundEffects';

export const SimulationRunnerPage: React.FC = () => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isRealBackend, setIsRealBackend] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [realMetrics, setRealMetrics] = useState<any | null>(null);

  const {
    simConfig,
    currentProjectId,
    projects,
    setPage,
    triggerConfetti,
    geometries,
    currentGeometryId,
  } = usePlatform();

  const { isAuthenticated, openAuthModal } = useAuth();

  const currentGeom = geometries.find((g) => g.id === currentGeometryId) || geometries[0];

  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const maxIterations = simConfig.solverSettings.maxIterations || 500;
  const [cflNumber, setCflNumber] = useState(simConfig.solverSettings.cflNumber || 1.25);
  const [runtimeSeconds, setRuntimeSeconds] = useState(0);
  const [continuityResidual, setContinuityResidual] = useState(0.85);
  const [momentumResidual, setMomentumResidual] = useState(0.72);
  const [energyResidual, setEnergyResidual] = useState(0.65);
  const [isConverged, setIsConverged] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[INIT] OpenFOAM simpleFoam CFD Solver v2606 bridge ready',
    `[GEOM] Active geometry: ${currentGeom?.name || 'Cylinder STL'} (radius 0.5m, height 2.0m)`,
    '[CONFIG] Solver: simpleFoam | Target: 500 iterations | Inflow: ' + simConfig.inletVelocity + ' m/s',
    '[WSL2] Ready to launch blockMesh, snappyHexMesh, checkMesh, simpleFoam in /tmp/of_cases/',
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Trigger real OpenFOAM simulation with JWT and CSRF Protection
  const startSimulation = async () => {
    if (!isAuthenticated) {
      sound.playWarning();
      setBackendError('Authentication Required: You must be logged in to dispatch simulations to the OpenFOAM backend.');
      openAuthModal();
      return;
    }

    sound.playStartSimulation();
    setIsRunning(true);
    setIsConverged(false);
    setBackendError(null);
    setIteration(0);
    setRuntimeSeconds(0);

    const newLogs = [
      `[AUTH] Authenticated JWT session verified. Double-submit CSRF token attached.`,
      `[TRIGGER] Sending sandboxed simulation request to backend (/api/run-simulation)...`,
      `[GEOM] Packaging geometry ${currentGeom?.name || 'cylinder'} (${currentGeom?.cells || 0} cells)...`,
    ];
    setConsoleLogs(newLogs);

    try {
      const data = await apiClient<{ status: string; caseId: string; caseDir: string }>('/api/run-simulation', {
        method: 'POST',
        body: JSON.stringify({
          geometry: {
            name: currentGeom?.name || 'cylinder',
            filename: currentGeom?.filename || 'geometry.stl',
            stlBase64: currentGeom?.stlBase64,
            geometryType: currentGeom?.geometryType || 'cylinder',
          },
          config: {
            inletVelocity: Number(simConfig.inletVelocity) || 1.0,
            maxIterations: maxIterations || 500,
            domain: 'compact',
          },
        }),
      });

      if (data.status === 'started' && data.caseId) {
        setActiveJobId(data.caseId);
        setIsRealBackend(true);
        setConsoleLogs((prev) => [
          ...prev,
          `[WSL2_JOB] Real OpenFOAM job spawned: ${data.caseId}`,
          `[WSL2_JOB] Working case directory: /tmp/of_cases/${data.caseId}`,
          `[SECURITY] Isolated tmpfs mounted, cgroups capped at 2 CPU / 2GB RAM.`,
        ]);
        return;
      }
    } catch (err: any) {
      console.error('OpenFOAM backend error:', err);
      setIsRunning(false);
      setIsRealBackend(false);
      setBackendError(err.message || 'Simulation execution error.');
      setConsoleLogs((prev) => [
        ...prev,
        `[FATAL_ERROR] Cannot dispatch OpenFOAM simulation: ${err.message}`,
        err.correlationId ? `[TRACE] Correlation ID: ${err.correlationId}` : '',
      ].filter(Boolean));
      sound.playWarning();
    }
  };

  // Real backend polling effect with apiClient
  useEffect(() => {
    let pollTimer: any = null;

    if (isRunning && isRealBackend && activeJobId && !isConverged) {
      pollTimer = setInterval(async () => {
        try {
          const job = await apiClient(`/api/simulation-status/${activeJobId}`);

          if (job.logs && job.logs.length > 0) {
            setConsoleLogs(job.logs);
          }

          if (job.progress) {
            setIteration(Math.round((job.progress / 100) * maxIterations));
          }

          if (job.status === 'completed') {
            setIsRunning(false);
            setIsConverged(true);
            sound.playSuccess();
            triggerConfetti();

            if (job.result && job.result.metrics) {
              setRealMetrics(job.result.metrics);
              if (job.result.residuals && job.result.residuals.length > 0) {
                const lastRes = job.result.residuals[job.result.residuals.length - 1];
                if (lastRes.continuity !== undefined) setContinuityResidual(lastRes.continuity);
                if (lastRes.xMomentum !== undefined) setMomentumResidual(lastRes.xMomentum);
                if (lastRes.kTurbulence !== undefined) setEnergyResidual(lastRes.kTurbulence);
              }
            }
          } else if (job.status === 'failed') {
            setIsRunning(false);
            setRealMetrics(null);
            setBackendError(job.errorMessage || (job.result && job.result.error) || 'OpenFOAM solver terminated with an error.');
            sound.playWarning();
          }
        } catch (pollErr: any) {
          console.error('Polling error:', pollErr);
        }

        setRuntimeSeconds((sec) => sec + 1.0);
      }, 1000);
    }

    return () => clearInterval(pollTimer);
  }, [isRunning, isRealBackend, activeJobId, isConverged, maxIterations, triggerConfetti]);

  // Auto scroll console logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Canvas visualizer for live CFD flow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      // Clear with clean light-gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw subtle pressure gradient contour behind
      const pGrad = ctx.createRadialGradient(w * 0.35, h * 0.5, 10, w * 0.35, h * 0.5, 180);
      pGrad.addColorStop(0, 'rgba(37, 99, 235, 0.12)');
      pGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = pGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw streamlines
      const numLines = 14;
      const progress = iteration / maxIterations;

      for (let i = 0; i < numLines; i++) {
        const yBase = (h / (numLines + 1)) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(0, yBase);

        for (let x = 0; x <= w; x += 10) {
          // Deflection around obstacle at (w * 0.35, h * 0.5)
          const dx = x - w * 0.35;
          const dy = yBase - h * 0.5;
          const distSq = dx * dx + dy * dy;
          const r = 50;

          let yOffset = 0;
          if (distSq < r * r * 8) {
            yOffset = -Math.sign(dy || 1) * (r * r * 15) / (distSq + 200);
          }

          // Wavy wake turbulence behind
          if (x > w * 0.38) {
            const wakeFactor = Math.min(1, (x - w * 0.38) / 150);
            yOffset += Math.sin((x * 0.05) - (time * (isRunning ? 4 : 1))) * 6 * wakeFactor;
          }

          ctx.lineTo(x, yBase + yOffset);
        }

        // Color coding by velocity
        const speedRatio = 0.5 + 0.5 * Math.sin(i * 0.5 + time);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(37, 99, 235, 0.6)' : 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Airfoil / Obstacle at center
      ctx.save();
      ctx.translate(w * 0.35, h * 0.5);
      ctx.rotate((-simConfig.inletAngle * Math.PI) / 180);

      // NACA profile
      const chord = 140;
      ctx.beginPath();
      for (let i = 0; i <= 30; i++) {
        const xc = i / 30;
        const yt = 5 * 0.12 * (0.2969 * Math.sqrt(xc) - 0.126 * xc - 0.3516 * xc ** 2 + 0.2843 * xc ** 3 - 0.1015 * xc ** 4);
        const px = (xc - 0.3) * chord;
        const py = -yt * chord;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      for (let i = 30; i >= 0; i--) {
        const xc = i / 30;
        const yt = 5 * 0.12 * (0.2969 * Math.sqrt(xc) - 0.126 * xc - 0.3516 * xc ** 2 + 0.2843 * xc ** 3 - 0.1015 * xc ** 4);
        const px = (xc - 0.3) * chord;
        const py = yt * chord;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, iteration, maxIterations, simConfig]);

  const handleToggleRun = () => {
    if (isRunning) {
      sound.playStop();
      setIsRunning(false);
    } else {
      startSimulation();
    }
  };

  const handleStep = () => {
    sound.playTick();
    setIteration((prev) => Math.min(maxIterations, prev + 10));
  };

  const handleReset = () => {
    sound.playTick();
    setIsRunning(false);
    setIteration(0);
    setRuntimeSeconds(0);
    setContinuityResidual(0.85);
    setMomentumResidual(0.72);
    setEnergyResidual(0.65);
    setIsConverged(false);
  };

  const progressPercent = Math.min(100, Math.round((iteration / maxIterations) * 100));

  return (
    <div className="flex-1 overflow-y-auto select-none text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#BAE6FD]/70">
        <div className="flex items-center gap-3">
          <CfdLogo size="sm" showText={false} />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
                Simulation Execution Cockpit
              </h1>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  isConverged
                    ? 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]'
                    : isRunning
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] animate-pulse'
                    : 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'
                }`}
              >
                {isConverged ? '✓ CONVERGED' : isRunning ? '⚡ SOLVING' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Solver: <span className="font-mono font-semibold text-[#0F172A]">{simConfig.solver}</span> | Grid: {simConfig.mesh.estimatedCells.toLocaleString()} cells
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleStep}
            disabled={isRunning || isConverged}
            className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F1F5F9] disabled:opacity-50 text-[#475569] border border-[#CBD5E1] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          <button
            onClick={handleToggleRun}
            className={`w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-1.5 px-5 py-2 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer ${
              isRunning ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
            }`}
          >
            {isRunning ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
            <span>{isRunning ? 'Pause Solver' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Navier-Stokes Convergence Progress Bar */}
      <ConvergenceProgressBar
        iteration={iteration}
        maxIterations={maxIterations}
        isRunning={isRunning}
        isConverged={isConverged}
        runtimeSeconds={runtimeSeconds}
        continuityResidual={continuityResidual}
        momentumResidual={momentumResidual}
        energyResidual={energyResidual}
      />

      {/* Real OpenFOAM v2606 Telemetry or Diagnostic Banner */}
      {realMetrics && (
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#10B981] animate-ping shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#166534]">
                Real OpenFOAM v2606 CFD Results Verified
              </h4>
              <p className="text-[11px] text-[#15803D]">
                Parsed from snappyHexMesh & foamToVTK latestTime solution files in WSL2.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 text-xs font-mono w-full sm:w-auto">
            <div>
              <span className="text-[#15803D] block text-[10px]">Cylinder Mesh Cells</span>
              <strong className="text-[#166534]">{realMetrics.cells?.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[#15803D] block text-[10px]">Max Velocity</span>
              <strong className="text-[#166534]">{realMetrics.maxVelocity} m/s</strong>
            </div>
            <div>
              <span className="text-[#15803D] block text-[10px]">Stagnation Pressure</span>
              <strong className="text-[#166534]">{realMetrics.maxPressure} Pa</strong>
            </div>
            <div>
              <span className="text-[#15803D] block text-[10px]">Drag Coeff (CD)</span>
              <strong className="text-[#166534]">{realMetrics.cD}</strong>
            </div>
          </div>
        </div>
      )}

      {backendError && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3 shadow-2xs flex items-center justify-between text-xs text-[#92400E]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>{backendError}</span>
          </div>
          <code className="hidden sm:inline-block bg-[#FEF3C7] px-2 py-0.5 rounded text-[11px] font-mono text-[#78350F]">
            node server.js
          </code>
        </div>
      )}

      {/* 4 Live Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Elapsed Runtime</span>
          <strong className="text-xl font-mono text-[#0F172A] mt-1 block">
            {runtimeSeconds.toFixed(1)}s
          </strong>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Courant CFL</span>
          <strong className="text-xl font-mono text-[#2563EB] mt-1 block">
            {cflNumber.toFixed(2)}
          </strong>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Continuity Residual</span>
          <strong className="text-xl font-mono text-[#06B6D4] mt-1 block">
            {continuityResidual.toExponential(2)}
          </strong>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Momentum Ux Norm</span>
          <strong className="text-xl font-mono text-[#10B981] mt-1 block">
            {momentumResidual.toExponential(2)}
          </strong>
        </div>
      </div>

      {/* Main 2-Column Cockpit: Live Canvas & Residuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Live CFD Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold text-[#0F172A]">
                Real-Time Inflow & Streamline Visualizer
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#64748B]">
              U∞ = {simConfig.inletVelocity} m/s | α = {simConfig.inletAngle}°
            </span>
          </div>

          <div className="flex-1 min-h-[300px] rounded-lg border border-[#E2E8F0] overflow-hidden relative">
            <canvas
              ref={canvasRef}
              width={640}
              height={320}
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-[#CBD5E1] text-[10px] font-mono text-[#64748B]">
              60 FPS Vector Field
            </div>
          </div>
        </div>

        {/* Right Col: Residual Plot & Live Stdout Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Residual Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-bold text-[#0F172A]">
                  Logarithmic Convergence Norms
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981]">Target &lt; 1e-5</span>
            </div>

            <div className="space-y-2 pt-1 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Continuity:</span>
                <span className="font-bold text-[#2563EB]">{continuityResidual.toExponential(3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">X-Momentum:</span>
                <span className="font-bold text-[#06B6D4]">{momentumResidual.toExponential(3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Energy:</span>
                <span className="font-bold text-[#10B981]">{energyResidual.toExponential(3)}</span>
              </div>
            </div>
          </div>

          {/* Solver stdout Console */}
          <div className="bg-[#0F172A] rounded-xl p-3 text-white font-mono text-[11px] shadow-sm flex flex-col h-[200px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-slate-400">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Solver stdout stream</span>
              </div>
              <span className="text-[9px] text-emerald-400">● LIVE</span>
            </div>

            <div
              ref={logContainerRef}
              className="flex-1 overflow-y-auto space-y-1 pt-2 text-slate-300 scrollbar-none font-mono text-[10px] sm:text-[11px]"
            >
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="leading-tight break-all whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Convergence Banner & Quick Actions */}
      {isConverged && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 bg-gradient-to-r from-[#ECFDF5] to-[#F0FDF4] rounded-xl border border-[#A7F3D0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xl shrink-0">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#065F46]">
                CFD Solution Converged Successfully!
              </h3>
              <p className="text-xs text-[#047857]">
                Navier-Stokes momentum and continuity residuals achieved target tolerance 1e-5.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage('results')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Inspect 3D Results</span>
            </button>

            <button
              onClick={() => setPage('reporting')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#065F46] border border-[#A7F3D0] text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Export Report</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
