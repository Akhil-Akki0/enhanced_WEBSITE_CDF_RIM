import React from 'react';
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
import { OpenFoamExportModal } from './components/common/OpenFoamExportModal';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const {
    page,
    lightTheme,
    themeMode,
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

  const currentGeom = geometries.find((g) => g.id === currentGeometryId) || geometries[0];
  const currentProj = projects.find((p) => p.projectId === currentProjectId) || projects[0];

  const themeBgClass = themeMode === 'dark'
    ? 'bg-[#090D16] text-slate-100'
    : ({
        'sky-aero': 'theme-bg-sky-aero',
        'electric-azure': 'theme-bg-electric-azure',
        'solar-amber': 'theme-bg-solar-amber',
        'radiant-coral': 'theme-bg-radiant-coral',
        'aurora-emerald': 'theme-bg-aurora-emerald',
        'lavender-breeze': 'theme-bg-lavender-breeze',
      }[lightTheme] || 'theme-bg-sky-aero');

  return (
    <div className={`flex flex-col min-h-[100dvh] h-[100dvh] w-full max-w-[100vw] ${themeBgClass} font-sans antialiased overflow-hidden select-none relative transition-colors duration-300`}>
      {/* Radiant Aerodynamic Ambient Streamlines & Luminous Washes in Background */}
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${themeMode === 'dark' ? 'opacity-20' : 'opacity-40'} z-0`}>
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <path
            d="M -100 200 C 300 120, 700 320, 1100 180 C 1300 110, 1500 250, 1600 220"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="8 6"
            className="text-[#0284C7]/60"
          />
          <path
            d="M -50 350 C 350 260, 750 480, 1150 320 C 1350 240, 1550 390, 1650 360"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-[#0EA5E9]/50"
          />
          <path
            d="M -80 520 C 320 440, 720 620, 1120 480 C 1320 410, 1520 540, 1620 500"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeDasharray="12 8"
            className="text-[#06B6D4]/60"
          />
          {/* Luminous colorful radial ambient light washes */}
          <circle cx="12%" cy="18%" r="420" fill="#38BDF8" fillOpacity="0.14" filter="blur(90px)" />
          <circle cx="85%" cy="80%" r="450" fill="#0EA5E9" fillOpacity="0.12" filter="blur(110px)" />
          <circle cx="70%" cy="15%" r="350" fill="#F59E0B" fillOpacity="0.10" filter="blur(95px)" />
          <circle cx="35%" cy="65%" r="380" fill="#10B981" fillOpacity="0.09" filter="blur(100px)" />
        </svg>
      </div>

      {/* Global Application Header with Full Navigation & Sound Controls */}
      <Navbar />

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

      {/* Global Application Footer */}
      <footer className="py-2 sm:py-0 sm:h-7 bg-white/85 dark:bg-slate-900/85 border-t border-[#BAE6FD]/60 dark:border-slate-800 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-600 dark:text-slate-400 z-20 shrink-0 select-none pb-safe">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-mono text-[10px] whitespace-nowrap">OpenFOAM v2606 Engine Status: Ready</span>
        </div>
        <div className="font-medium tracking-wide text-[10px] sm:text-[11px] text-center sm:text-right">
          DEVELOPED by Akhil.A gmail :- akkedu01@gmail.com
        </div>
      </footer>

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
