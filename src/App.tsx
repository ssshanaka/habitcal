import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Settings, 
  Menu, 
  Check, 
  Trash2,
  User,
  Moon,
  Sun,
  LogOut,
  Target,
  Sparkles,
  BarChart3,
  Search,
  RefreshCw,
  Zap,
  X
} from 'lucide-react';
import { 
  getWeekStart, 
  getWeekDays, 
  formatDateKey, 
  isSameDay, 
  generateId,
  colors,
  categories,
  calculateStreak
} from './utils';
import { Habit, SortMode } from './types';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { useAuth } from './hooks/useAuth';
import { useHabits } from './hooks/useHabits';
import { useNotifications } from './hooks/useNotifications';
import { useProactiveCoach } from './hooks/useProactiveCoach';
import { AuthReminder } from './components/AuthReminder';
import { ProfileLoginPopup } from './components/ProfileLoginPopup';
import { HeatmapCalendar } from './components/HeatmapCalendar';
import { NoticeModal } from './components/NoticeModal';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';
import { habitsService } from './services/habits';
import { syncService } from './services/sync';
import { externalSyncService } from './services/externalSync';
import FocusMode from './components/FocusMode';
import HabitGrid from './components/HabitGrid';
import Sidebar from './components/Sidebar';
import HabitModal from './components/HabitModal';
import { AIRoutineArchitect } from './components/AIRoutineArchitect';

function App() {
  // --- Auth ---
  const { user, loading, signOut, signInWithGoogle } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  
  // --- Data ---
  const {
    habits,
    setHabits,
    completions,
    dataLoaded,
    toggleCompletion,
    saveHabit,
    deleteHabit,
    setTodayForAll,
    moveHabit,
    clearAllCompletions
  } = useHabits(user, loading, addToast);

  const { notificationsEnabled, toggleNotifications } = useNotifications(habits);
  useProactiveCoach(habits, completions);

  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Streak State - Calculated from completions
  const streaks = useMemo(() => {
    const streakMap: Record<string, number> = {};
    habits.forEach(habit => {
      streakMap[habit.id] = calculateStreak(habit, completions);
    });
    return streakMap;
  }, [habits, completions]);
  
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRefresh = async () => {
      setIsSyncing(true);
      try {
          const fetchedHabits = await habitsService.fetchHabits();
          const fetchedCompletions = await habitsService.fetchCompletions();
          setHabits(fetchedHabits);
          addToast('Data synchronized', 'success');
      } catch (err) {
          addToast('Failed to sync data', 'error');
      } finally {
          setIsSyncing(false);
      }
  };
  
  const handleExternalSync = async () => {
      try {
          const result = await externalSyncService.syncExternalEvents();
          if (result.matchedCount > 0) {
              addToast(`Synced ${result.matchedCount} habits from external sources`, 'success');
          } else {
              addToast('No external events matched your habits', 'info');
          }
          // Refresh the UI
          await handleRefresh();
      } catch (err) {
          addToast('External sync failed', 'error');
      }
  };
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAIArchitectOpen, setIsAIArchitectOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>(SortMode.TIME);
  const [todayFocusOnly, setTodayFocusOnly] = useState(false);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [showHabitDetails, setShowHabitDetails] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Focus Mode Habit
  const focusedHabit = useMemo(() => {
    if (!focusModeActive) return null;
    // Find the first incomplete habit for today
    return visibleHabits.find(h => !completions[`${h.id}_${todayKey}`]) || visibleHabits[0];
  }, [focusModeActive, visibleHabits, completions, todayKey]);
  
  useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 1024);
  }, []);
  
  // Reminder State
  const [showAuthReminder, setShowAuthReminder] = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);

  // Editing State
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  
  // Form State
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitTimeStart, setNewHabitTimeStart] = useState('');
  const [newHabitTimeEnd, setNewHabitTimeEnd] = useState('');
  const [newHabitColor, setNewHabitColor] = useState(colors[0]);
  const [newHabitCategory, setNewHabitCategory] = useState(categories[0]);
  const [newHabitDependencyId, setNewHabitDependencyId] = useState('');
  const [newHabitGoalCount, setNewHabitGoalCount] = useState<number | undefined>(undefined);
  const [newHabitFrequency, setNewHabitFrequency] = useState<HabitFrequency>(HabitFrequency.DAILY);
  const [newHabitDaysOfWeek, setNewHabitDaysOfWeek] = useState<number[]>([]);

  // Refs for click outside
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // --- Computed ---
  const weekStart = getWeekStart(currentDate);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const today = new Date();
  const todayKey = formatDateKey(today);

  const completionStats = useMemo(() => {
    if (habits.length === 0) {
      return { todayCompleted: 0, todayTotal: 0, weeklyCompleted: 0, weeklyTotal: 0, bestStreak: 0 };
    }

    const todayCompleted = habits.filter(h => completions[`${h.id}_${todayKey}`]).length;
    const weeklyCompleted = habits.reduce((acc, habit) => {
      const habitCount = weekDays.reduce((dayAcc, day) => {
        const key = `${habit.id}_${formatDateKey(day)}`;
        return dayAcc + (completions[key] ? 1 : 0);
      }, 0);
      return acc + habitCount;
    }, 0);

    const bestStreak = habits.reduce((max, habit) => Math.max(max, streaks[habit.id] || 0), 0);

    return {
      todayCompleted,
      todayTotal: habits.length,
      weeklyCompleted,
      weeklyTotal: habits.length * weekDays.length,
      bestStreak
    };
  }, [habits, completions, todayKey, weekDays, streaks]);

  const todayProgressPercent = completionStats.todayTotal
    ? Math.round((completionStats.todayCompleted / completionStats.todayTotal) * 100)
    : 0;
  const weeklyProgressPercent = completionStats.weeklyTotal
    ? Math.round((completionStats.weeklyCompleted / completionStats.weeklyTotal) * 100)
    : 0;

  // Heatmap Data calculation
  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    Object.keys(completions).forEach(key => {
      if (completions[key]) {
        // key format is `${habitId}_${dateKey}`
        const lastUnderscore = key.lastIndexOf('_');
        if (lastUnderscore > 0) {
          const dateKey = key.substring(lastUnderscore + 1);
          data[dateKey] = (data[dateKey] || 0) + 1;
        }
      }
    });
    return data;
  }, [completions]);

  // --- Effects ---

  // 1. Theme (Independent)
  useEffect(() => {
    const savedTheme = localStorage.getItem('habitCal_theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
    localStorage.setItem('habitCal_theme', theme);
  }, [theme]);

  // Notice Modal Check
  useEffect(() => {
    const acknowledged = localStorage.getItem('habitCal_notice_acknowledged');
    if (!acknowledged) {
      setIsNoticeOpen(true);
    }
  }, []);

  const handleCloseNotice = () => {
    localStorage.setItem('habitCal_notice_acknowledged', 'true');
    setIsNoticeOpen(false);
  };

  // 2. Auth Reminder Timer
  useEffect(() => {
    if (!user && !loading && !reminderDismissed) {
      const timer = setTimeout(() => {
        setShowAuthReminder(true);
      }, 60000); // 1 minute
      return () => clearTimeout(timer);
    }
  }, [user, loading, reminderDismissed]);

  // 3. Click Outside
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


  // --- Sorting ---
  const sortedHabits = useMemo(() => {
    const list = [...habits];
    
    return list.sort((a, b) => {
      // 1. Sort by Category first
      const catA = a.category || 'Uncategorized';
      const catB = b.category || 'Uncategorized';
      
      const catOrder = categories.indexOf(catA);
      const catOrderB = categories.indexOf(catB);
      
      const finalCatA = catOrder === -1 ? categories.length : catOrder;
      const finalCatB = catOrderB === -1 ? categories.length : catOrderB;
      
      if (finalCatA !== finalCatB) {
        return finalCatA - finalCatB;
      }

      // 2. Sort within category by Time or Manual Order
      if (sortMode === SortMode.TIME) {
        if (!a.timeStart && !b.timeStart) return a.order - b.order;
        if (!a.timeStart) return 1;
        if (!b.timeStart) return -1;
        return a.timeStart.localeCompare(b.timeStart);
      } else {
        return a.order - b.order;
      }
    });
  }, [habits, sortMode]);

  const visibleHabits = useMemo(() => {
    let list = sortedHabits;
    
    if (searchQuery.trim()) {
      list = list.filter(habit => 
        habit.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (todayFocusOnly) {
      list = list.filter(habit => !completions[`${habit.id}_${todayKey}`]);
    }

    return list;
  }, [sortedHabits, todayFocusOnly, completions, todayKey, searchQuery]);

  // --- Handlers ---
  const isCompleted = (habitId: string, date: Date) => {
    const key = `${habitId}_${formatDateKey(date)}`;
    return !!completions[key];
  };

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const setTodayForAllHabits = async (completed: boolean) => {
    await setTodayForAll(completed);
  };

  const handleSaveHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    let habitToSave: Habit;

    if (editingHabitId) {
       const existing = habits.find(h => h.id === editingHabitId);
       if (!existing) return;
       
       habitToSave = {
        ...existing,
        title: newHabitTitle,
        description: newHabitDescription || undefined,
        timeStart: newHabitTimeStart || undefined,
        timeEnd: newHabitTimeEnd || undefined,
        color: newHabitColor,
        category: newHabitCategory,
        dependencyId: newHabitDependencyId || undefined,
        goalCount: newHabitGoalCount,
        frequency: newHabitFrequency,
        daysOfWeek: newHabitDaysOfWeek,
      };
    } else {
      habitToSave = {
        id: generateId(),
        title: newHabitTitle,
        description: newHabitDescription || undefined,
        timeStart: newHabitTimeStart || undefined,
        timeEnd: newHabitTimeEnd || undefined,
        color: newHabitColor,
        category: newHabitCategory,
        dependencyId: newHabitDependencyId || undefined,
        order: habits.length,
        goalCount: newHabitGoalCount,
        frequency: newHabitFrequency,
        daysOfWeek: newHabitDaysOfWeek,
      };
    }

    await saveHabit(habitToSave, !!editingHabitId);
    setIsModalOpen(false);
    resetForm();
    addToast(editingHabitId ? 'Habit updated successfully' : 'Habit created successfully', 'success');
  };

  const handleDeleteHabit = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(id);
      setIsModalOpen(false);
      addToast('Habit deleted successfully', 'success');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingHabitId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setNewHabitTitle(habit.title);
    setNewHabitDescription(habit.description || '');
    setNewHabitTimeStart(habit.timeStart || '');
    setNewHabitTimeEnd(habit.timeEnd || '');
    setNewHabitColor(habit.color);
    setNewHabitCategory(habit.category || categories[0]);
    setNewHabitDependencyId(habit.dependencyId || '');
    setNewHabitGoalCount(habit.goalCount);
    setNewHabitFrequency(habit.frequency);
    setNewHabitDaysOfWeek(habit.daysOfWeek || []);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setNewHabitTitle('');
    setNewHabitDescription('');
    setNewHabitTimeStart('');
    setNewHabitTimeEnd('');
    setNewHabitColor(colors[0]);
    setNewHabitCategory(categories[0]);
    setNewHabitDependencyId('');
    setNewHabitGoalCount(undefined);
    setNewHabitFrequency(HabitFrequency.DAILY);
    setNewHabitDaysOfWeek([]);
    setEditingHabitId(null);
  };

  const handleSignOut = () => {
    signOut();
    setIsProfileOpen(false);
  }
  
  const handleFocusComplete = async (habitId: string) => {
    const todayKey = formatDateKey(new Date());
    await toggleCompletion(habitId, new Date());
    addToast('Habit completed!', 'success');
    
    // Small delay before exiting focus mode to show the completion state
    setTimeout(() => {
      setFocusModeActive(false);
    }, 1000);
  };

  // --- Timer Handler ---
  const handleTimerStop = async (habitId: string, minutes: number) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const updatedHabit = {
        ...habit,
        duration_minutes: (habit.duration_minutes || 0) + minutes
      };

      await saveHabit(updatedHabit, true);
      addToast(`Added ${minutes}m to ${habit.title}`, 'success');
    } catch (err) {
      console.error('Error updating timer duration:', err);
      addToast('Failed to save duration', 'error');
    }
  };

  // --- Render ---
  
  if (loading && !dataLoaded) {
      return (
        <div className="flex items-center justify-center h-screen bg-gcal-bg-solid text-gcal-text">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-gcal-bg-solid text-gcal-text overflow-hidden transition-colors duration-300">
      
      {/* --- Header --- */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gcal-border glassmorphism flex-shrink-0 transition-all duration-300 shadow-md relative z-10" style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <Button variant="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
               <Menu size={24} />
             </Button>
             <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-gcal-blue rounded-lg flex items-center justify-center text-white">
                  <Check size={20} strokeWidth={3} />
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

          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setIsAIArchitectOpen(true)}
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
            <Button variant="icon" onClick={handleRefresh} className={isSyncing ? 'animate-spin' : ''}>
                <RefreshCw size={20} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block relative" ref={settingsRef}>
            <Button variant="icon" onClick={() => setIsSettingsOpen(!isSettingsOpen)}><Settings size={20} /></Button>
            
            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 glassmorphism rounded-2xl shadow-xl z-50 overflow-hidden animate-scale" style={{
                background: 'var(--glass-popup)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
              }}>
                 <div className="p-4 border-b border-gcal-border">
                   <h3 className="text-xs font-bold text-gcal-muted uppercase tracking-wider">Settings</h3>
                 </div>
                 <div className="p-3">
                   <button 
                     onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                     className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gcal-surface/50 transition-all text-sm font-medium"
                   >
                     <div className="flex items-center gap-3">
                       {theme === 'dark' ? <Moon size={18} className="text-gcal-blue" /> : <Sun size={18} className="text-gcal-blue" />}
                       <span>Dark mode</span>
                     </div>
                     <div className={`w-11 h-6 rounded-full relative transition-all shadow-inner ${theme === 'dark' ? 'bg-gradient-to-r from-gcal-blue to-purple-500' : 'bg-gcal-muted'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
                     </div>
                   </button>
                   <button 
                     onClick={toggleNotifications}
                     className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gcal-surface/50 transition-all text-sm font-medium"
                   >
                     <div className="flex items-center gap-3">
                       <Zap size={18} className="text-gcal-blue" />
                       <span>Notifications</span>
                     </div>
                     <div className={`w-11 h-6 rounded-full relative transition-all shadow-inner ${notificationsEnabled ? 'bg-gradient-to-r from-gcal-blue to-purple-500' : 'bg-gcal-muted'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${notificationsEnabled ? 'left-6' : 'left-1'}`} />
                     </div>
                   </button>
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

      <div className="flex flex-1 overflow-hidden">
        
        {/* --- Mobile Sidebar Overlay --- */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-gcal-bg-solid border-r border-gcal-border shadow-2xl animate-slide-right overflow-y-auto z-50">
              <div className="flex items-center justify-between p-4 border-b border-gcal-border">
                <span className="font-bold text-lg text-gcal-text">Menu</span>
                <Button variant="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <Sidebar
                openCreateModal={() => { openCreateModal(); setIsSidebarOpen(false); }}
                sortMode={sortMode}
                setSortMode={setSortMode}
                todayFocusOnly={todayFocusOnly}
                setTodayFocusOnly={(val) => setTodayFocusOnly(val)}
                completionStats={completionStats}
                todayProgressPercent={todayProgressPercent}
                weeklyProgressPercent={weeklyProgressPercent}
                setTodayForAllHabits={setTodayForAllHabits}
                heatmapData={heatmapData}
                onExternalSync={handleExternalSync}
              />
            </div>
          </div>
        )}

        {/* --- Desktop Sidebar --- */}
        {isSidebarOpen && (
          <div className="hidden lg:block">
            <Sidebar
              openCreateModal={openCreateModal}
              sortMode={sortMode}
              setSortMode={setSortMode}
              todayFocusOnly={todayFocusOnly}
              setTodayFocusOnly={(val) => setTodayFocusOnly(val)}
              completionStats={completionStats}
              todayProgressPercent={todayProgressPercent}
              weeklyProgressPercent={weeklyProgressPercent}
              setTodayForAllHabits={setTodayForAllHabits}
              heatmapData={heatmapData}
              onExternalSync={handleExternalSync}
            />
          </div>
        )}

        {/* --- Grid View --- */}
        <HabitGrid
          allHabitsCount={habits.length}
          visibleHabits={visibleHabits}
          weekDays={weekDays}
          completions={completions}
          isCompleted={isCompleted}
          toggleCompletion={toggleCompletion}
          openEditModal={openEditModal}
          handleDeleteHabit={handleDeleteHabit}
          moveHabit={moveHabit}
          sortMode={sortMode}
          todayFocusOnly={todayFocusOnly}
          streaks={streaks}
          openCreateModal={openCreateModal}
          onTimerStop={handleTimerStop}
        />
      </div>

      {/* --- Add/Edit Habit Modal --- */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingHabitId={editingHabitId}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        newHabitTitle={newHabitTitle}
        setNewHabitTitle={setNewHabitTitle}
        newHabitDescription={newHabitDescription}
        setNewHabitDescription={setNewHabitDescription}
        newHabitTimeStart={newHabitTimeStart}
        setNewHabitTimeStart={setNewHabitTimeStart}
        newHabitTimeEnd={newHabitTimeEnd}
        setNewHabitTimeEnd={setNewHabitTimeEnd}
        newHabitColor={newHabitColor}
        setNewHabitColor={setNewHabitColor}
        newHabitCategory={newHabitCategory}
        setNewHabitCategory={setNewHabitCategory}
        newHabitDependencyId={newHabitDependencyId}
        setNewHabitDependencyId={setNewHabitDependencyId}
        colors={colors}
        categories={categories}
        allHabits={habits}
      />

      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Sign In">
          <ProfileLoginPopup onClose={() => setIsLoginModalOpen(false)} />
      </Modal>

      <AuthReminder 
         visible={showAuthReminder}
         onLogin={handleLoginClick}
         onClose={() => {
             setReminderDismissed(true);
             setShowAuthReminder(false);
         }} 
      />

      <NoticeModal isOpen={isNoticeOpen} onClose={handleCloseNotice} />

      <Toast toasts={toasts} onRemove={removeToast} />

      <Modal isOpen={isAIArchitectOpen} onClose={() => setIsAIArchitectOpen(false)} title="AI Routine Architect">
        <AIRoutineArchitect 
          habits={habits} 
          saveHabit={saveHabit}
          onPackageGenerated={async (pkg) => {
            for (const h of pkg.habits) {
              await saveHabit({ ...h, id: generateId() }, false);
            }
            addToast(`Routine "${pkg.packageName}" applied!`, 'success');
            setIsAIArchitectOpen(false);
          }} 
        />
      </Modal>

      {focusModeActive && focusedHabit && (
        <FocusMode 
          habit={focusedHabit}
          onExit={() => setFocusModeActive(false)}
          onComplete={() => handleFocusComplete(focusedHabit.id)}
          onTimerStop={handleTimerStop}
        />
      )}

    </div>
  );
}

export default App;
