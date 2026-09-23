import { useEffect, useState, useCallback } from 'react';
import { PageId } from '../types';
import { sound } from '../utils/soundEffects';

export interface ShortcutItem {
  key: string;
  combination: string;
  label: string;
  pageId: PageId;
  description: string;
}

export const NAVIGATION_SHORTCUTS: ShortcutItem[] = [
  { key: '1', combination: 'Ctrl + 1', label: 'Dashboard', pageId: 'dashboard', description: 'Overview of simulations & active cases' },
  { key: '2', combination: 'Ctrl + 2', label: 'Geometry', pageId: 'geometry', description: 'Airfoil CAD geometry & surface mesh' },
  { key: '3', combination: 'Ctrl + 3', label: 'Setup', pageId: 'setup', description: 'Boundary conditions & physics setup' },
  { key: '4', combination: 'Ctrl + 4', label: 'Runner', pageId: 'runner', description: 'Real-time solver & residual convergence' },
  { key: '5', combination: 'Ctrl + 5', label: 'Sweeps', pageId: 'sweeps', description: 'Multi-parameter aerodynamic sweep matrix' },
  { key: '6', combination: 'Ctrl + 6', label: 'Results', pageId: 'results', description: '3D streamline & pressure field post-processing' },
  { key: '7', combination: 'Ctrl + 7', label: 'AI Analysis', pageId: 'ai', description: 'Fourier Neural Operators & PINN inference' },
  { key: '8', combination: 'Ctrl + 8', label: 'Reporting', pageId: 'reporting', description: 'Automated compliance certificates & Excel export' },
  { key: '9', combination: 'Ctrl + 9', label: 'Projects', pageId: 'projects', description: 'Project management workspace' },
  { key: '0', combination: 'Ctrl + 0', label: 'Docs', pageId: 'docs', description: 'OpenFOAM configuration & user guide' },
  { key: 'h', combination: 'Ctrl + H', label: 'Home', pageId: 'landing', description: 'Platform landing page' },
];

export function useKeyboardNavigation(
  setPage: (page: PageId) => void,
  onOpenShortcutsHelp?: () => void
) {
  const [activeToast, setActiveToast] = useState<{ label: string; combo: string } | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check for '?' key to open keyboard shortcuts helper
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        sound.playTick();
        if (onOpenShortcutsHelp) onOpenShortcutsHelp();
        return;
      }

      // Check Ctrl or Meta (Command on macOS) key combinations
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();

        const match = NAVIGATION_SHORTCUTS.find((s) => s.key === key);
        if (match) {
          e.preventDefault();
          sound.playClick();
          setPage(match.pageId);

          setActiveToast({
            label: match.label,
            combo: match.combination,
          });

          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setActiveToast(null);
          }, 1800);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [setPage, onOpenShortcutsHelp]);

  return { activeToast };
}
