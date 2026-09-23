import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { PageId } from '../../types';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Shapes,
  PlayCircle,
  BarChart3,
  User,
  ShieldCheck,
  Brain,
  Layers
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export const MobileBottomNav: React.FC = () => {
  const { page, setPage, queue } = usePlatform();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const runningCount = queue.filter((j) => j.status === 'running').length;

  const items: { id: PageId | 'auth'; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'geometry', label: 'Geometry', icon: Shapes },
    { id: 'runner', label: 'Workbench', icon: PlayCircle, badge: runningCount },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'auth', label: isAuthenticated ? (user?.name?.split(' ')[0] || 'Profile') : 'Sign In', icon: isAuthenticated ? User : ShieldCheck },
  ];

  const handleSelect = (itemId: PageId | 'auth') => {
    sound.playClick();
    if (itemId === 'auth') {
      openAuthModal(isAuthenticated ? 'security' : 'login');
    } else {
      setPage(itemId);
    }
  };

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-sky-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1 pb-safe transition-all"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === 'auth' ? false : page === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              onMouseEnter={() => sound.playHover()}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Highlight Pill for Active Page */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-gradient-to-t from-sky-100/90 to-cyan-50/70 rounded-xl -z-10 border border-sky-300/60 shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600 scale-110' : 'text-slate-500'} transition-transform`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
