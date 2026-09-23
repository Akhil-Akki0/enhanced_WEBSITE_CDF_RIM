import React, { useState, useEffect } from 'react';
import { usePlatform, LIGHT_THEMES } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { PageId, LightThemeId } from '../../types';
import { CfdLogo } from '../common/CfdLogo';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  LayoutDashboard,
  FolderKanban,
  Shapes,
  Settings,
  PlayCircle,
  BarChart3,
  Brain,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Palette,
  Check,
  Sparkles,
  TrendingUp,
  BookOpen,
  ListOrdered,
  FolderArchive,
  Keyboard,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Sliders
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { EffectsStudioModal } from '../common/EffectsStudioModal';

interface NavbarProps {
  onOpenShortcuts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShortcuts }) => {
  const {
    page,
    setPage,
    soundEnabled,
    toggleSound,
    lightTheme,
    setLightTheme,
    activeThemeConfig,
    queue,
    setIsQueueOpen,
    setIsOpenFoamModalOpen,
  } = usePlatform();

  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [showThemePicker, setShowThemePicker] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEffectsStudioOpen, setIsEffectsStudioOpen] = useState(false);

  const runningJobsCount = queue.filter((j) => j.status === 'running').length;

  const navItems: { id: PageId; label: string; icon: React.FC<{ className?: string }>; shortcut?: string }[] = [
    { id: 'landing', label: 'Landing', icon: Globe, shortcut: 'Ctrl+H' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'Ctrl+1' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, shortcut: 'Ctrl+9' },
    { id: 'geometry', label: 'Geometry', icon: Shapes, shortcut: 'Ctrl+2' },
    { id: 'setup', label: 'Setup', icon: Settings, shortcut: 'Ctrl+3' },
    { id: 'runner', label: 'Run', icon: PlayCircle, shortcut: 'Ctrl+4' },
    { id: 'sweeps', label: 'Sweeps & Polars', icon: TrendingUp, shortcut: 'Ctrl+5' },
    { id: 'results', label: 'Results', icon: BarChart3, shortcut: 'Ctrl+6' },
    { id: 'ai', label: 'AI Analysis', icon: Brain, shortcut: 'Ctrl+7' },
    { id: 'reporting', label: 'Reports', icon: FileSpreadsheet, shortcut: 'Ctrl+8' },
    { id: 'docs', label: 'Documentation', icon: BookOpen, shortcut: 'Ctrl+0' },
  ];

  // Close mobile menu whenever the active page changes
  const handleNavClick = (id: PageId) => {
    setPage(id);
    setMobileMenuOpen(false);
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-sky-200/70 shadow-xs px-3 sm:px-5 flex items-center justify-between select-none z-40 shrink-0 sticky top-0 transition-colors w-full">
        {/* Brand & Official Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('landing')}
            className="group text-left transition-transform active:scale-95 flex items-center min-h-[44px] min-w-[44px] py-1"
            title="CFD Platform — Home (Ctrl+H)"
            aria-label="CFD Platform Home"
          >
            <CfdLogo size="sm" showText={true} />
          </button>

          <div className="h-5 w-px bg-slate-200 hidden xl:block mx-1"></div>

          {/* Live CFD Engine Badge */}
          <div className="hidden 2xl:flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live CFD Engine</span>
          </div>
        </div>

        {/* Center Navigation Links (Desktop - lg and above) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-none py-1 max-w-[55vw] xl:max-w-[60vw]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                title={`${item.label} (${item.shortcut})`}
                className={`group flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap relative cursor-pointer min-h-[36px] transition-all ${
                  isActive
                    ? 'text-sky-700 bg-sky-100/90 font-bold shadow-xs border border-sky-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/80 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-500 group-hover:text-sky-600'}`} />
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="hidden xl:inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-white/80 text-slate-400 group-hover:text-sky-600 border border-slate-200 group-hover:border-sky-200 opacity-60 group-hover:opacity-100 transition-opacity">
                    {item.shortcut.replace('Ctrl+', '')}
                  </span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-sky-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Keyboard Shortcuts Trigger Button */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts Cheat Sheet (Ctrl+1..9 or ?)"
              aria-label="Keyboard Shortcuts"
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-lg border border-sky-200 bg-sky-50/80 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden xl:inline font-mono">Shortcuts</span>
              <span className="text-[10px] font-mono px-1 rounded bg-white text-sky-600 border border-sky-200 shadow-2xs">
                ?
              </span>
            </button>
          )}

          {/* Simulation Queue Button */}
          <button
            onClick={() => setIsQueueOpen(true)}
            title="Open Simulation Queue & Terminal Logs"
            aria-label="Simulation Queue"
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <ListOrdered className="w-4 h-4 text-sky-600" />
            <span className="hidden md:inline font-mono">Queue</span>
            {runningJobsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-mono animate-pulse">
                {runningJobsCount}
              </span>
            )}
          </button>

          {/* Desktop Soft Theme Palette Picker */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              title="Change Soft Color Theme"
              aria-label="Soft Color Theme Picker"
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-lg border border-sky-200 bg-white hover:bg-sky-50 text-sky-800 text-xs font-medium transition-all shadow-2xs cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden xl:inline font-sans">{activeThemeConfig.badge}</span>
              <span
                className="w-2.5 h-2.5 rounded-full border border-white shadow-xs"
                style={{ backgroundColor: activeThemeConfig.accentColor }}
              />
            </button>

            {showThemePicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemePicker(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-sky-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-sky-500/10">
                  <div className="text-[11px] font-semibold text-sky-800 px-2 py-1 flex items-center justify-between border-b border-sky-100 mb-1">
                    <span>Soft Color Palettes</span>
                    <Sparkles className="w-3 h-3 text-sky-600" />
                  </div>
                  <div className="space-y-1">
                    {(Object.keys(LIGHT_THEMES) as LightThemeId[]).map((themeKey) => {
                      const theme = LIGHT_THEMES[themeKey];
                      const isSelected = lightTheme === themeKey;
                      return (
                        <button
                          key={themeKey}
                          onClick={() => {
                            setLightTheme(themeKey);
                            setShowThemePicker(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-100 text-sky-700 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                              style={{ backgroundColor: theme.accentColor }}
                            />
                            <span>{theme.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* OpenFOAM Export Quick Button (Desktop) */}
          <button
            onClick={() => setIsOpenFoamModalOpen(true)}
            title="Export Production OpenFOAM Case ZIP"
            aria-label="Export OpenFOAM Case"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-lg border border-sky-200 bg-white hover:bg-sky-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <FolderArchive className="w-3.5 h-3.5 text-sky-600" />
            <span>OpenFOAM</span>
          </button>

          {/* FX & Audio Studio Trigger Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsEffectsStudioOpen(true);
            }}
            title="FX & Audio Studio: Interactive Synthesizer, Aerodynamic Color Grading & Shaders"
            aria-label="FX & Audio Studio"
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-lg border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 text-sky-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer aero-pulse-glow"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin-slow" />
            <span className="hidden md:inline font-mono">FX Studio</span>
          </button>

          {/* Sound Effects Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
            aria-label="Toggle Sound"
            className={`p-2.5 min-h-[44px] min-w-[44px] hidden sm:flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-sky-100 text-sky-700 border-sky-200'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Authentication & Security Button */}
          <button
            onClick={openAuthModal}
            title={isAuthenticated ? `Logged in as ${user?.name} (${user?.role})` : 'Sign in / Security Center'}
            aria-label="Account Security"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-lg border transition-all cursor-pointer text-xs font-semibold shadow-2xs ${
              isAuthenticated
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-sky-200 bg-white text-slate-700 hover:bg-sky-50'
            }`}
          >
            {isAuthenticated ? <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />}
            <span className="hidden sm:inline truncate max-w-[100px]">
              {isAuthenticated ? user?.name?.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Quick Simulation CTA on Desktop */}
          {page !== 'runner' && (
            <button
              onClick={() => handleNavClick('runner')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-white" />
              <span>Workbench</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button (lg:hidden) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            className="flex lg:hidden items-center justify-center p-2.5 min-h-[44px] min-w-[44px] rounded-lg border border-sky-200 bg-white text-sky-700 shadow-2xs hover:bg-sky-50 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-in Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-sky-950/20 backdrop-blur-xs z-50 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-white shadow-2xl z-50 flex flex-col lg:hidden border-l border-sky-200 pt-safe pb-safe"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-sky-100 flex items-center justify-between bg-sky-50/60">
                <div className="flex items-center gap-2">
                  <CfdLogo size="sm" showText={true} />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation drawer"
                  className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links Scrollable List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                  Navigation
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = page === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer ${
                        isActive
                          ? 'bg-sky-100 text-sky-800 font-bold border border-sky-300'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.shortcut && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                            {item.shortcut}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </button>
                  );
                })}

                {/* Additional Quick Controls in Mobile Drawer */}
                <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                    Utilities & Environment
                  </div>

                  {onOpenShortcuts && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenShortcuts();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm bg-sky-50 text-sky-800 min-h-[44px]"
                    >
                      <div className="flex items-center gap-3">
                        <Keyboard className="w-5 h-5 text-sky-600" />
                        <span>Keyboard Shortcuts</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-sky-700">
                        Ctrl+1..9
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsQueueOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm bg-slate-50 text-slate-700 min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <ListOrdered className="w-5 h-5 text-sky-600" />
                      <span>Open Simulation Queue</span>
                    </div>
                    {runningJobsCount > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-sky-600 text-white font-mono">
                        {runningJobsCount} running
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsOpenFoamModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm bg-slate-50 text-slate-700 min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <FolderArchive className="w-5 h-5 text-sky-600" />
                      <span>Export OpenFOAM Case</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsEffectsStudioOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-sky-800 font-semibold min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-sky-600 animate-spin-slow" />
                      <span>FX & Audio Studio</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-sky-600">
                      LIVE
                    </span>
                  </button>

                  <button
                    onClick={toggleSound}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm bg-slate-50 text-slate-700 min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-slate-400" />
                      )}
                      <span>Sound Effects</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-500">
                      {soundEnabled ? 'ENABLED' : 'MUTED'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-sky-100 bg-sky-50/50 text-center text-xs text-slate-500">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[11px] text-slate-700">OpenFOAM v2606 Engine</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  DEVELOPED by Akhil.A
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FX & Audio Studio Modal */}
      <EffectsStudioModal
        isOpen={isEffectsStudioOpen}
        onClose={() => setIsEffectsStudioOpen(false)}
      />
    </>
  );
};
