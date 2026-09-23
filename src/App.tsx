import React, { useState } from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { Navbar } from './components/Navigation/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { GeometryPage } from './pages/GeometryPage';
import { SimulationSetupPage } from './pages/SimulationSetupPage';
import { SimulationRunnerPage } from './pages/SimulationRunnerPage';
import { CfdWorkbenchView } from './components/CfdWorkbenchView';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { ReportingPage } from './pages/ReportingPage';
import { ParametricSweepsPage } from './pages/ParametricSweepsPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { SimulationQueueDrawer } from './components/SimulationQueue/SimulationQueueDrawer';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { OpenFoamExportModal } from './components/common/OpenFoamExportModal';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { GlobalShockwaveOverlay } from './components/common/GlobalShockwaveOverlay';
import { TelemetryPopupContainer } from './components/common/TelemetryPopupToast';
import { VideoBackground } from './components/Background/VideoBackground';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, ArrowRight } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    page,
    setPage,
    lightTheme,
    isQueueOpen,
    setIsQueueOpen,
    isOpenFoamModalOpen,
    setIsOpenFoamModalOpen,
    geometries,
    currentGeometryId,
    simConfig,
    projects,
    currentProjectId,
  } = usePlatform();

  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Keyboard navigation hook: Ctrl + [0-9], Ctrl + H, and '?' for help
  const { activeToast } = useKeyboardNavigation(setPage, () => setIsShortcutsModalOpen(true));

  const currentGeom = geometries.find((g) => g.id === currentGeometryId) || geometries[0];
  const currentProj = projects.find((p) => p.projectId === currentProjectId) || projects[0];

  const themeBgClass = {
    'sky-aero': 'theme-bg-sky-aero',
    'electric-azure': 'theme-bg-electric-azure',
    'solar-amber': 'theme-bg-solar-amber',
    'radiant-coral': 'theme-bg-radiant-coral',
    'aurora-emerald': 'theme-bg-aurora-emerald',
    'lavender-breeze': 'theme-bg-lavender-breeze',
  }[lightTheme] || 'theme-bg-sky-aero';

  return (
    <div className={`flex flex-col min-h-[100dvh] h-[100dvh] w-full max-w-[100vw] ${themeBgClass} font-sans antialiased overflow-hidden select-none relative transition-colors duration-300`}>
      {/* Dynamic 11-Page Assigned Loop Video Background Engine with Subtle Blur */}
      <VideoBackground />

      {/* Aerodynamic Global Shockwave & Sonic Click Ripple Engine */}
      <GlobalShockwaveOverlay />

      {/* Aerodynamic Telemetry Notification Popups System */}
      <TelemetryPopupContainer />

      {/* Global Application Header with Full Navigation & Sound Controls */}
      <Navbar onOpenShortcuts={() => setIsShortcutsModalOpen(true)} />

      {/* Main Screen Container with Fluid Animated Transitions */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex-1 flex flex-col overflow-hidden h-full w-full"
          >
            {page === 'landing' && <LandingPage />}
            {page === 'dashboard' && <DashboardPage />}
            {page === 'projects' && <ProjectsPage />}
            {page === 'geometry' && <GeometryPage />}
            {page === 'setup' && <SimulationSetupPage />}
            {page === 'runner' && <SimulationRunnerPage />}
            {page === 'sweeps' && <ParametricSweepsPage />}
            {page === 'results' && <CfdWorkbenchView />}
            {page === 'ai' && <AIAnalysisPage />}
            {page === 'reporting' && <ReportingPage />}
            {page === 'docs' && <DocumentationPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Keyboard Shortcut Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-sky-300/80 shadow-xl backdrop-blur-md text-slate-800 text-xs font-semibold ring-1 ring-sky-500/20">
              <div className="w-5 h-5 rounded-md bg-sky-500/15 text-sky-600 flex items-center justify-center">
                <Keyboard className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded text-[11px] font-bold">
                {activeToast.combo}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span>{activeToast.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Application Footer */}
      <footer className="py-2 sm:py-0 sm:h-7 bg-white/90 border-t border-sky-200/80 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-600 z-20 shrink-0 select-none pb-safe shadow-xs mb-14 lg:mb-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-mono text-[10px] whitespace-nowrap text-slate-700">OpenFOAM v2606 Engine Status: Ready</span>
          <span className="hidden md:inline text-slate-300">|</span>
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="hidden md:flex items-center gap-1 text-[10px] text-sky-600 hover:text-sky-800 font-medium cursor-pointer"
          >
            <Keyboard className="w-3 h-3" />
            <span>Shortcuts (Ctrl+1..9)</span>
          </button>
        </div>
        <div className="font-medium tracking-wide text-[10px] sm:text-[11px] text-slate-600 text-center sm:text-right">
          DEVELOPED by Akhil.A gmail :- akkedu01@gmail.com
        </div>
      </footer>

      {/* Mobile Persistent Action Bar (lg:hidden) */}
      <MobileBottomNav />

      {/* Authentication & Security Modal */}
      <AuthModal />

      {/* Simulation Queue Drawer */}
      <SimulationQueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        onOpenOpenFoamModal={() => {
          setIsQueueOpen(false);
          setIsOpenFoamModalOpen(true);
        }}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        onNavigate={(p) => {
          setPage(p);
          setIsShortcutsModalOpen(false);
        }}
      />

      {/* Full OpenFOAM Case ZIP Exporter Modal */}
      {currentGeom && (
        <OpenFoamExportModal
          isOpen={isOpenFoamModalOpen}
          onClose={() => setIsOpenFoamModalOpen(false)}
          geometry={currentGeom}
          simConfig={simConfig}
          projectName={currentProj?.name || currentGeom.name}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <AppContent />
      </PlatformProvider>
    </AuthProvider>
  );
}
