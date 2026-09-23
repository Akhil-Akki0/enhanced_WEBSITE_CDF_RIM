import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageId } from '../../types';

export type PerformanceMode = 'eco' | 'turbo' | 'ultra';

export interface AerodynamicParticleCanvasProps {
  page: PageId;
  densityMultiplier?: number;
  performanceMode?: PerformanceMode;
  interactiveVortex?: boolean;
  onFpsUpdate?: (fps: number) => void;
  speedMultiplier?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  history: [number, number][];
  age: number;
  maxAge: number;
  speed: number;
  size: number;
  color: string;
  seed: number;
  branch?: number;
}

export const AerodynamicParticleCanvas: React.FC<AerodynamicParticleCanvasProps> = ({
  page,
  densityMultiplier = 1,
  performanceMode = 'turbo',
  interactiveVortex = true,
  onFpsUpdate,
  speedMultiplier = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number; active: boolean }>({
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    active: false,
  });

  // Calculate target particle count based on mode and density multiplier
  const baseCount = performanceMode === 'eco' ? 140 : performanceMode === 'turbo' ? 380 : 750;
  const targetParticleCount = Math.round(baseCount * densityMultiplier);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // DPR handling (clamp to 1.5 for ultra-efficient fillrate)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Track mouse movement
    let lastMouseX = -9999;
    let lastMouseY = -9999;
    let lastMouseTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max((now - lastMouseTime) / 1000, 0.001);
      const curX = e.clientX;
      const curY = e.clientY;

      mouseRef.current.vx = (curX - lastMouseX) / dt * 0.15;
      mouseRef.current.vy = (curY - lastMouseY) / dt * 0.15;
      mouseRef.current.x = curX;
      mouseRef.current.y = curY;
      mouseRef.current.active = true;

      lastMouseX = curX;
      lastMouseY = curY;
      lastMouseTime = now;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Attractive soft aerodynamic color palettes per page (clean & high contrast on light backgrounds)
    const getPalette = (pageId: PageId): string[] => {
      switch (pageId) {
        case 'landing':
          // Wind tunnel: vivid cyan, aero sky blue, royal cobalt, amber stagnation, emerald
          return ['#0284c7', '#06b6d4', '#2563eb', '#d97706', '#059669'];
        case 'dashboard':
          // Transonic flight: sky blue, supersonic violet, electric indigo, cyan, deep azure
          return ['#0284c7', '#6366f1', '#7c3aed', '#0891b2', '#1d4ed8'];
        case 'projects':
          // Blueprint CAD: engineering sky, technical cobalt, deep cyan, draft amber
          return ['#0284c7', '#0369a1', '#2563eb', '#d97706', '#0891b2'];
        case 'geometry':
          // Manifold mesh: wireframe teal, purple junction, rose port, azure
          return ['#0d9488', '#7c3aed', '#0284c7', '#e11d48', '#4f46e5'];
        case 'setup':
          // Prism refraction: soft rainbow dispersion (ruby, amber, emerald, sky, violet)
          return ['#e11d48', '#ea580c', '#d97706', '#059669', '#0284c7', '#7c3aed'];
        case 'runner':
          // Solver kinetic: solar amber, blazing coral, plasma sky, cobalt
          return ['#ea580c', '#dc2626', '#d97706', '#0284c7', '#2563eb'];
        case 'sweeps':
          // Polar curves: aerodynamic emerald, lift cyan, drag amber, pressure blue
          return ['#059669', '#10b981', '#0284c7', '#d97706', '#1d4ed8'];
        case 'results':
          // Scalar colormap: rainbow pressure contours
          return ['#2563eb', '#0891b2', '#059669', '#ca8a04', '#dc2626'];
        case 'ai':
          // Neural synapses: synaptic electric purple, royal blue, glow cyan, coral
          return ['#6366f1', '#7c3aed', '#0284c7', '#d97706', '#db2777'];
        case 'reporting':
          // Telemetry waves: marine blue, compliance emerald, signal cyan
          return ['#0284c7', '#059669', '#0891b2', '#64748b', '#2563eb'];
        case 'docs':
          // System graph: circuit trace cyan, logic indigo, signal mint, amber
          return ['#0284c7', '#4f46e5', '#d97706', '#059669', '#0369a1'];
        default:
          return ['#0284c7', '#0891b2', '#2563eb', '#d97706'];
      }
    };

    const palette = getPalette(page);

    // Initialize particle pool
    const particles: Particle[] = [];

    const initParticle = (p?: Particle): Particle => {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const size = performanceMode === 'ultra' ? Math.random() * 2 + 1.2 : Math.random() * 1.5 + 0.8;
      const speed = (Math.random() * 1.1 + 0.6) * speedMultiplier;
      const maxAge = Math.floor(Math.random() * 200 + 150);

      if (p) {
        p.x = startX;
        p.y = startY;
        p.history = [[startX, startY]];
        p.vx = 0;
        p.vy = 0;
        p.age = 0;
        p.maxAge = maxAge;
        p.speed = speed;
        p.size = size;
        p.color = color;
        p.seed = Math.random() * 1000;
        p.branch = Math.floor(Math.random() * 4);
        return p;
      }

      return {
        x: startX,
        y: startY,
        history: [[startX, startY]],
        vx: 0,
        vy: 0,
        age: Math.floor(Math.random() * maxAge),
        maxAge,
        speed,
        size,
        color,
        seed: Math.random() * 1000,
        branch: Math.floor(Math.random() * 4),
      };
    };

    for (let i = 0; i < targetParticleCount; i++) {
      particles.push(initParticle());
    }

    // Performance telemetry tracking
    let frameCount = 0;
    let lastFpsTime = performance.now();

    // Flow field vector evaluation per page
    const computeFlowVelocity = (x: number, y: number, time: number, pageId: PageId, p: Particle) => {
      let vx = 0;
      let vy = 0;

      const normX = x / Math.max(width, 1);
      const normY = y / Math.max(height, 1);

      switch (pageId) {
        case 'landing': {
          // Wind tunnel freestream around vehicle obstruction
          const obsX = width * 0.48;
          const obsY = height * 0.52;
          const dx = x - obsX;
          const dy = y - obsY;
          const distSq = dx * dx + dy * dy;
          const obsRadius = Math.min(width, height) * 0.22;

          // Freestream base velocity left to right
          vx = 2.4 * p.speed;
          vy = Math.sin((x * 0.005) + time * 0.002 + p.seed) * 0.4;

          // Deflection around vehicle body
          if (distSq < obsRadius * obsRadius * 1.8 && distSq > 100) {
            const dist = Math.sqrt(distSq);
            const deflect = (1 - dist / (obsRadius * 1.4)) * 3.5;
            vy += (dy > 0 ? 1 : -1) * deflect * p.speed;
            vx *= 0.65; // boundary stagnation
          }
          break;
        }

        case 'dashboard': {
          // Transonic wing wake: twin counter-rotating vortices
          const v1x = width * 0.35;
          const v1y = height * 0.5;
          const v2x = width * 0.65;
          const v2y = height * 0.5;

          vx = 2.0 * p.speed;
          vy = Math.cos(x * 0.004 + time * 0.001) * 0.5;

          // Vortex 1 (Clockwise)
          const d1x = x - v1x;
          const d1y = y - v1y;
          const r1 = Math.sqrt(d1x * d1x + d1y * d1y) + 30;
          const strength1 = (Math.min(width, height) * 120) / (r1 * r1);
          vx += -d1y * strength1 * 0.015;
          vy += d1x * strength1 * 0.015;

          // Vortex 2 (Counter-Clockwise)
          const d2x = x - v2x;
          const d2y = y - v2y;
          const r2 = Math.sqrt(d2x * d2x + d2y * d2y) + 30;
          const strength2 = (Math.min(width, height) * 120) / (r2 * r2);
          vx += d2y * strength2 * 0.015;
          vy += -d2x * strength2 * 0.015;
          break;
        }

        case 'projects': {
          // CAD Drafting Grid Flow: orthogonal step motions
          const gridMod = Math.floor(p.seed * 3) % 2;
          if (gridMod === 0) {
            vx = 2.2 * p.speed;
            vy = Math.sin(time * 0.001 + p.seed) > 0.8 ? 1.5 * p.speed : 0;
          } else {
            vx = Math.cos(time * 0.001 + p.seed) > 0.8 ? 1.5 * p.speed : 0;
            vy = 2.0 * p.speed;
          }
          break;
        }

        case 'geometry': {
          // Manifold 3-Way Runner Flow
          vx = 2.2 * p.speed;
          const branch = p.branch || 0;
          const targetY = height * (0.3 + branch * 0.15);
          vy = (targetY - y) * 0.035 * p.speed;
          break;
        }

        case 'setup': {
          // Prismatic dispersion: angular ray deflection
          const prismX = width * 0.45;
          if (x < prismX) {
            vx = 2.2 * p.speed;
            vy = 0;
          } else {
            const dispersionAngle = (p.seed % 1 - 0.5) * 0.65;
            vx = Math.cos(dispersionAngle) * 2.5 * p.speed;
            vy = Math.sin(dispersionAngle) * 2.5 * p.speed;
          }
          break;
        }

        case 'runner': {
          // Hyper-Kinetic Supersonic streaks with shock angle
          vx = 4.2 * p.speed;
          vy = (Math.sin(x * 0.008) * 0.3 - 0.2) * p.speed;
          break;
        }

        case 'sweeps': {
          // Airfoil Polar Split (Upper suction acceleration vs Lower compression)
          const foilX = width * 0.5;
          const foilY = height * 0.5;
          const dx = x - foilX;
          const dy = y - foilY;

          if (dy < 0) {
            // Upper camber: low pressure suction -> high velocity
            vx = 3.2 * p.speed;
            vy = -Math.sin(normX * Math.PI) * 1.5 * p.speed;
          } else {
            // Lower surface: high pressure -> slower velocity
            vx = 1.6 * p.speed;
            vy = Math.sin(normX * Math.PI) * 0.8 * p.speed;
          }
          break;
        }

        case 'results': {
          // Scalar Colormap Velocity Field
          vx = (1.8 + Math.sin(normY * 6 + time * 0.002) * 1.0) * p.speed;
          vy = Math.cos(normX * 5 + time * 0.002) * 0.8 * p.speed;
          break;
        }

        case 'ai': {
          // Neural Synaptic Pulses (Radial clusters and interconnects)
          const angle = Math.atan2(normY - 0.5, normX - 0.5) + Math.PI / 2;
          const radial = Math.sqrt(Math.pow(normX - 0.5, 2) + Math.pow(normY - 0.5, 2));
          vx = (Math.cos(angle) * 1.5 + Math.cos(p.seed + time * 0.003) * 0.8) * p.speed;
          vy = (Math.sin(angle) * 1.5 + Math.sin(p.seed + time * 0.003) * 0.8) * p.speed;
          break;
        }

        case 'reporting': {
          // Harmonic telemetry sine wave oscillations
          vx = 2.4 * p.speed;
          vy = Math.sin(x * 0.015 + time * 0.003) * 2.0 * p.speed;
          break;
        }

        case 'docs': {
          // Circuit Trace Orthogonal Routing
          const dir = Math.floor((time * 0.0005 + p.seed) % 4);
          if (dir === 0 || dir === 2) {
            vx = 2.5 * p.speed;
            vy = 0;
          } else {
            vx = 0;
            vy = (dir === 1 ? 1 : -1) * 2.0 * p.speed;
          }
          break;
        }

        default:
          vx = 2.0 * p.speed;
          vy = Math.sin(x * 0.005) * 0.5;
      }

      return { vx, vy };
    };

    // Main animation loop
    const render = (time: number) => {
      // FPS Calculation
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 500) {
        const calculatedFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
        if (onFpsUpdate) {
          onFpsUpdate(calculatedFps);
        }
        frameCount = 0;
        lastFpsTime = now;
      }

      // Clean clear: keeps the canvas 100% luminous and transparent without any dark overlay
      ctx.clearRect(0, 0, width, height);

      // Interactive mouse aerodynamics
      const mouse = mouseRef.current;
      const mouseActive = interactiveVortex && mouse.active;
      const mouseRadius = Math.min(width, height) * 0.18;
      const mouseRadiusSq = mouseRadius * mouseRadius;

      // Render particles in single batched pass
      ctx.lineWidth = performanceMode === 'ultra' ? 1.6 : 1.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Store trail history
        p.history.push([p.x, p.y]);
        if (p.history.length > 5) {
          p.history.shift();
        }

        // Calculate flow field forces
        const flow = computeFlowVelocity(p.x, p.y, time, page, p);
        p.vx = flow.vx;
        p.vy = flow.vy;

        // Interactive mouse wind tunnel disturbance (Repulsion + Vortex swirl)
        if (mouseActive) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDistSq = mdx * mdx + mdy * mdy;

          if (mDistSq < mouseRadiusSq && mDistSq > 25) {
            const mDist = Math.sqrt(mDistSq);
            const factor = (1 - mDist / mouseRadius);

            // Repulsion force
            const repelStrength = 4.5 * factor;
            p.vx += (mdx / mDist) * repelStrength;
            p.vy += (mdy / mDist) * repelStrength;

            // Tangential vortex rotation (adds realistic fluid swirl around mouse)
            const swirlStrength = 3.0 * factor;
            p.vx += (-mdy / mDist) * swirlStrength;
            p.vy += (mdx / mDist) * swirlStrength;

            // Inherit some cursor velocity
            p.vx += mouse.vx * factor * 0.4;
            p.vy += mouse.vy * factor * 0.4;
          }
        }

        // Advance position
        p.x += p.vx;
        p.y += p.vy;
        p.age++;

        // Wrap or respawn particle
        if (
          p.x > width + 40 ||
          p.x < -40 ||
          p.y > height + 40 ||
          p.y < -40 ||
          p.age >= p.maxAge
        ) {
          // Respawn at left edge or random boundary for fluid continuity
          p.x = Math.random() < 0.85 ? -10 : Math.random() * width;
          p.y = Math.random() * height;
          p.history = [[p.x, p.y]];
          p.age = 0;
          p.color = palette[Math.floor(Math.random() * palette.length)];
        }

        // Draw streamlined trail line from history
        const lifeAlpha = Math.min(
          p.age / 20,
          (p.maxAge - p.age) / 20,
          1
        );

        if (p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0][0], p.history[0][1]);
          for (let h = 1; h < p.history.length; h++) {
            ctx.lineTo(p.history[h][0], p.history[h][1]);
          }
          ctx.lineTo(p.x, p.y);

          ctx.strokeStyle = p.color;
          ctx.globalAlpha = lifeAlpha * (performanceMode === 'eco' ? 0.45 : 0.7);
          ctx.stroke();
        }

        // Draw luminous particle head
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = lifeAlpha * 0.85;
        ctx.fill();

        // Soft bright reflection dot on particle
        if (performanceMode === 'ultra') {
          ctx.beginPath();
          ctx.arc(p.x - 0.3, p.y - 0.3, p.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = lifeAlpha * 0.9;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [page, performanceMode, targetParticleCount, interactiveVortex, speedMultiplier, onFpsUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    />
  );
};
