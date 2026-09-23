import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../utils/soundEffects';

interface ShockwaveWave {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const GlobalShockwaveOverlay: React.FC = () => {
  const [waves, setWaves] = useState<ShockwaveWave[]>([]);
  const [enabled, setEnabled] = useState(true);

  // Trigger custom global event for external components (like running solver)
  useEffect(() => {
    const handleCustomShockwave = (e: CustomEvent<{ x?: number; y?: number; color?: string }>) => {
      const x = e.detail?.x ?? window.innerWidth / 2;
      const y = e.detail?.y ?? window.innerHeight / 2;
      const color = e.detail?.color ?? 'rgba(6, 182, 212, 0.7)';
      addWave(x, y, color);
    };

    window.addEventListener('aero-shockwave' as any, handleCustomShockwave);
    return () => {
      window.removeEventListener('aero-shockwave' as any, handleCustomShockwave);
    };
  }, []);

  const addWave = useCallback((x: number, y: number, color: string) => {
    const newWave: ShockwaveWave = {
      id: Date.now() + Math.random(),
      x,
      y,
      color,
    };
    setWaves((prev) => [...prev.slice(-6), newWave]);
  }, []);

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    // Only generate on interactive clicks if enabled
    if (!enabled) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, input, select, [role="button"]')) {
      // Pick a soft luminous color based on click location
      const hue = 190 + Math.floor((e.clientX / window.innerWidth) * 60);
      const color = `hsla(${hue}, 85%, 55%, 0.45)`;
      addWave(e.clientX, e.clientY, color);
    }
  }, [enabled, addWave]);

  useEffect(() => {
    window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [handleGlobalClick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {waves.map((wave) => (
          <motion.div
            key={wave.id}
            initial={{ scale: 0.15, opacity: 0.8 }}
            animate={{ scale: 3.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.15, 0.85, 0.35, 1] }}
            onAnimationComplete={() => {
              setWaves((prev) => prev.filter((w) => w.id !== wave.id));
            }}
            style={{
              position: 'absolute',
              left: wave.x - 40,
              top: wave.y - 40,
              width: 80,
              height: 80,
              borderRadius: '9999px',
              border: `2px solid ${wave.color}`,
              boxShadow: `0 0 16px ${wave.color}, inset 0 0 12px ${wave.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Helper utility to trigger shockwave from anywhere
export const triggerShockwave = (x?: number, y?: number, color?: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aero-shockwave', {
        detail: { x, y, color },
      })
    );
  }
};
