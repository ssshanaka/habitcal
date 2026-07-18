import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Menu, 
  User, 
  Moon, 
  Sun, 
  LogOut,
  Target,
  Sparkles,
  RefreshCw,
  Zap,
  Search,
  Activity
} from 'lucide-react';
import { Button } from './Button';
import { ProfileLoginPopup } from './ProfileLoginPopup';
import { ThemeMode } from '../hooks/useTheme';

interface HeaderProps {
  weekStart: Date;
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
  handleToday: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  user: any;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  handleSignOut: () => void;
  handleLoginClick: () => void;
  showAuthReminder: boolean;
  setReminderDismissed: (val: boolean) => void;
  setShowAuthReminder: (val: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (val: boolean) => void;
  onMenuClick: () => void;
  
  // Additional features from App.tsx
  onOpenAIArchitect: () => void;
  focusModeActive: boolean;
  setFocusModeActive: (active: boolean) => void;
  intensityScore: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

const Header: React.FC<HeaderProps> = ({
  weekStart,
  handlePrevWeek,
  handleNextWeek,
  handleToday,
  themeMode,
  setThemeMode,
  user,
  signOut,
  signInWithGoogle,
  handleSignOut,
  handleLoginClick,
  showAuthReminder,
  setReminderDismissed,
  setShowAuthReminder,
  isLoginModalOpen,
  setIsLoginModalOpen,
  onMenuClick,
  onOpenAIArchitect,
  focusModeActive,
  setFocusModeActive,
  intensityScore,
  searchQuery,
  setSearchQuery,
  onRefresh,
  isSyncing
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gcal-border glassmorphism flex-shrink-0 transition-all duration-300 shadow-md relative z-10" style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
           <Button variant="icon" onClick={onMenuClick}><Menu size={24} /></Button>
           <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-gcal-blue rounded-lg flex items-center justify-center text-white">
                <span className="text-lg font-bold">H</span>
              </div>
              <span className="text-xl font-normal tracking-tight ml-2 text-gcal-text">HabitCal</span>
           </div>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-8">
          <Button variant="secondary" onClick={handleToday}>Today</Button>
          <div className="flex items-center gap-1">
            <Button variant="icon" onClick={handlePrevWeek}><ChevronLeft size={20} /></Button>
            <Button variant="icon" onClick={handleNextWeek}><ChevronRight size={20} /></Button>
          </div>
          <h2 className="text-xl font-normal ml-2 text-gcal-text">
            {weekStart.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-2 ml-4">
            <Button 
              variant="secondary" 
              onClick={onOpenAIArchitect}
              className="hidden md:flex items-center gap-2 px-4 bg-gradient-to-r from-gcal-blue/20 to-purple-500/20 text-gcal-blue hover:from-gcal-blue/30 hover:to-purple-500/30 border border-gcal-blue/20"
            >
              <Sparkles size={18} />
              <span>AI Architect</span>
            </Button>
            <Button 
              variant={focusModeActive ? "gradient" : "secondary"} 
              onClick={() => setFocusModeActive(!focusModeActive)}
              className="hidden md:flex items-center gap-2 px-4"
            >
              <Zap size={18} className={focusModeActive ? "text-white" : "text-gcal-blue"} />
              <span>{focusModeActive ? "Exit Focus" : "Focus Mode"}</span>
            </Button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-gcal-surface/50 border border-gcal-border transition-all duration-300">
              <Activity size={16} className={intensityScore > 70 ? 'text-red-500' : intensityScore > 40 ? 'text-amber-500' : 'text-green-500'} />
              <span className="text-xs font-medium text-gcal-text">Intensity: {intensityScore}%</span>
            </div>

            <div className="relative max-w-xs hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gcal-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search habits..." 
                className="w-full bg-gcal-surface/50 border border-gcal-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gcal-blue transition-all placeholder:text-gcal-muted/50"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="icon" onClick={onRefresh} className={isSyncing ? 'animate-spin' : ''}>
                <RefreshCw size={20} />
            </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block relative" ref={settingsRef}>
          <Button variant="icon" onClick={() => setIsSettingsOpen(!isSettingsOpen)}><Settings size={20} /></Button>
          
          {/* Settings Dropdown */}
          {isSettingsOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 glassmorphism rounded-2xl shadow-xl z-50 overflow-hidden animate-scale" style={{
              background: 'var(--glass-popup)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            }}>
               <div className="p-4 border-b border-gcal-border">
                 <h3 className="text-xs font-bold text-gcal-muted uppercase tracking-wider">Settings</h3>
               </div>
               <div className="p-3 flex flex-col gap-4">
                 <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-bold text-gcal-muted uppercase px-3">Appearance</span>
                   <button 
                     onClick={() => setThemeMode('light')}
                     className={`w-full flex items-center gap-3 p-2 px-3 rounded-xl transition-all text-sm ${themeMode === 'light' ? 'bg-gcal-blue/10 text-gcal-blue' : 'hover:bg-gcal-surface/50 text-gcal-text'}`}
                   >
                     <Sun size={16} />
                     <span>Light</span>
                   </button>
                   <button 
                     onClick={() => setThemeMode('dark')}
                     className={`w-full flex items-center gap-3 p-2 px-3 rounded-xl transition-all text-sm ${themeMode === 'dark' ? 'bg-gcal-blue/10 text-gcal-blue' : 'hover:bg-gcal-surface/50 text-gcal-text'}`}
                   >
                     <Moon size={16} />
                     <span>Dark</span>
                   </button>
                   <button 
                     onClick={() => setThemeMode('focus')}
                     className={`w-full flex items-center gap-3 p-2 px-3 rounded-xl transition-all text-sm ${themeMode === 'focus' ? 'bg-gcal-blue/10 text-gcal-blue' : 'hover:bg-gcal-surface/50 text-gcal-text'}`}
                   >
                     <Target size={16} />
                     <span>Focus</span>
                   </button>
                   <button 
                     onClick={() => setThemeMode('zen')}
                     className={`w-full flex items-center gap-3 p-2 px-3 rounded-xl transition-all text-sm ${themeMode === 'zen' ? 'bg-gcal-blue/10 text-gcal-blue' : 'hover:bg-gcal-surface/50 text-gcal-text'}`}
                   >
                     <Sparkles size={16} />
                     <span>Zen</span>
                   </button>
                   <button 
                     onClick={() => setThemeMode('auto')}
                     className={`w-full flex items-center gap-3 p-2 px-3 rounded-xl transition-all text-sm ${themeMode === 'auto' ? 'bg-gcal-blue/10 text-gcal-blue' : 'hover:bg-gcal-surface/50 text-gcal-text'}`}
                   >
                     <RefreshCw size={16} />
                     <span>Auto (Dynamic)</span>
                   </button>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-gcal-blue to-purple-500 hover:shadow-lg hover:scale-110 border-2 border-white/20 flex items-center justify-center text-white overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gcal-blue focus:ring-offset-2 shadow-md"
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={22} className="text-white" />
            )}
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-3 w-80 glassmorphism rounded-3xl shadow-2xl z-50 overflow-hidden animate-scale p-6" style={{
              background: 'var(--glass-popup)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            }}>
              {user ? (
                <>
                  <div className="flex flex-col items-center gap-3 mb-5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gcal-blue to-purple-500 border-4 border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} className="text-white" />
                      )}
                    </div>
                    <div className="text-center overflow-hidden w-full">
                      <p className="font-bold text-lg text-gcal-text truncate">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-sm text-gcal-muted truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full justify-center gap-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 font-medium" 
                    variant="ghost" 
                    onClick={handleSignOut}
                  >
                    <LogOut size={18} /> Sign Out
                  </Button>
                </>
              ) : (
                <ProfileLoginPopup onClose={() => setIsProfileOpen(false)} />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
