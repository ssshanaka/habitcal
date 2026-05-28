import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Settings, 
  Menu, 
  Check, 
  Trash2,
  Clock,
  ArrowUp,
  ArrowDown,
  User,
  Moon,
  Sun,
  LogOut,
  Target,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { 
  getWeekStart, 
  getWeekDays, 
  formatDateKey, 
  isSameDay, 
  formatTime,
  generateId,
  colors,
  calculateStreak
} from './utils';
import { Habit, SortMode } from './types';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { Login } from './components/Login';
import { useAuth } from './hooks/useAuth';
import { AuthReminder } from './components/AuthReminder';
import { ProfileLoginPopup } from './components/ProfileLoginPopup';
import { HeatmapCalendar } from './components/HeatmapCalendar';
import { habitsService } from './services/habits';
import { syncService } from './services/sync';

// --- Default Data with UUID-like IDs ---
// Removed DEFAULT_HABITS from here as it is now managed in useHabits hook.

function App() {
  // --- Auth ---
  const { user, loading, signOut, signInWithGoogle } = useAuth();
  
  // --- Data ---
  const {
    habits,
    completions,
    dataLoaded,
    toggleCompletion,
    saveHabit,
    deleteHabit,
    setTodayForAll,
    moveHabit
  } = useHabits(user, loading);

  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Streak State - Calculated from completions
  const streaks = useMemo(() => {
    const streakMap: Record<string, number> = {};
    habits.forEach(habit => {
      streakMap[habit.id] = calculateStreak(habit.id, completions);
    });
    return streakMap;
  }, [habits, completions]);
  
  // Heatmap Data - Count completions per day
  const heatmapData = useMemo(() => {
    const heatmap: Record<string, number> = {};
    Object.keys(completions).forEach(key => {
      const parts = key.split('_');
      if (parts.length >= 2) {
        const dateStr = parts.slice(1).join('_');
        if (completions[key]) {
          heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
        }
      }
    });
    return heatmap;
  }, [completions]);
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>(SortMode.TIME);
  const [todayFocusOnly, setTodayFocusOnly] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
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
    if (sortMode === SortMode.TIME) {
      return list.sort((a, b) => {
        if (!a.timeStart && !b.timeStart) return a.order - b.order;
        if (!a.timeStart) return 1;
        if (!b.timeStart) return -1;
        return a.timeStart.localeCompare(b.timeStart);
      });
    } else {
      return list.sort((a, b) => a.order - b.order);
    }
  }, [habits, sortMode]);

  const visibleHabits = useMemo(() => {
    if (!todayFocusOnly) return sortedHabits;
    return sortedHabits.filter(habit => !completions[`${habit.id}_${todayKey}`]);
  }, [sortedHabits, todayFocusOnly, completions, todayKey]);

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
      };
    } else {
      habitToSave = {
        id: generateId(),
        title: newHabitTitle,
        description: newHabitDescription || undefined,
        timeStart: newHabitTimeStart || undefined,
        timeEnd: newHabitTimeEnd || undefined,
        color: newHabitColor,
        order: habits.length,
      };
    }

    await saveHabit(habitToSave, !!editingHabitId);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteHabit = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(id);
      if (isModalOpen) setIsModalOpen(false);
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
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setNewHabitTitle('');
    setNewHabitDescription('');
    setNewHabitTimeStart('');
    setNewHabitTimeEnd('');
    setNewHabitColor(colors[0]);
    setEditingHabitId(null);
  };

  const handleSignOut = () => {
    signOut();
    setIsProfileOpen(false);
  }
  
  const handleLoginClick = () => {
      setIsLoginModalOpen(true);
      if (showAuthReminder) {
          setReminderDismissed(true);
          setShowAuthReminder(false);
      }
  }

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
             <Button variant="icon"><Menu size={24} /></Button>
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
                 <div className="p-3">
                   <button 
                     onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                     className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gcal-surface/50 transition-all text-sm font-medium"
                   >
                     <div className="flex items-center gap-3">
                       {theme === 'dark' ? <Moon size={18} className="text-gcal-blue" /> : <Sun size={18} className="text-gcal-blue" />}
                       <span>Dark mode</span>
                     </div>
                     {/* Toggle Switch Visual */}
                     <div className={`w-11 h-6 rounded-full relative transition-all shadow-inner ${theme === 'dark' ? 'bg-gradient-to-r from-gcal-blue to-purple-500' : 'bg-gcal-muted'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
                     </div>
                   </button>
                 </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            {/* Profile Icon - Always visible */}
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
                  /* Authenticated User View */
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
                  /* Guest User - Login Options */
                  <ProfileLoginPopup onClose={() => setIsProfileOpen(false)} />
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- Sidebar (Create Button & Mini Details) --- */}
        <aside className="w-64 p-6 hidden lg:flex flex-col gap-6 flex-shrink-0 transition-colors duration-300">
          <div 
             onClick={openCreateModal}
             className="cursor-pointer bg-gradient-to-r from-gcal-blue to-purple-500 hover:from-gcal-blue-hover hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-3xl p-5 flex items-center gap-3 w-44 hover:scale-105 active:scale-95"
          >
             <Plus size={28} className="text-white" />
             <span className="font-bold text-lg">Create</span>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gcal-muted uppercase tracking-wider mb-1">Filters & Sorting</h3>
            <div className="flex items-center gap-2 glassmorphism p-3 rounded-2xl transition-all hover:shadow-md" style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
               <span className="text-sm font-medium">Sort by:</span>
               <select 
                  className="bg-transparent text-sm font-bold focus:outline-none bg-gradient-to-r from-gcal-blue to-purple-500 bg-clip-text text-transparent cursor-pointer"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
               >
                 <option value={SortMode.TIME}>Time</option>
                 <option value={SortMode.MANUAL}>Manual</option>
               </select>
            </div>
            <button
              onClick={() => setTodayFocusOnly(prev => !prev)}
              className={`w-full text-left flex items-center justify-between gap-2 glassmorphism p-3 rounded-2xl transition-all hover:shadow-md text-sm ${
                todayFocusOnly ? 'ring-1 ring-gcal-blue' : ''
              }`}
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <span className="flex items-center gap-2 font-medium">
                <Target size={14} />
                Focus on today
              </span>
              <span className="text-gcal-muted">{todayFocusOnly ? 'On' : 'Off'}</span>
            </button>
          </div>

          <div className="glassmorphism rounded-2xl p-4 space-y-3" style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}>
            <h3 className="text-xs font-bold text-gcal-muted uppercase tracking-wider">Momentum</h3>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1"><Sparkles size={12} /> Today</span>
                <span className="font-bold">{completionStats.todayCompleted}/{completionStats.todayTotal}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gcal-surface/40 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gcal-blue to-purple-500" style={{ width: `${todayProgressPercent}%` }} />
              </div>
            </div>
            <div className="text-xs flex items-center justify-between">
              <span className="flex items-center gap-1"><BarChart3 size={12} /> Week rate</span>
              <span className="font-bold">{weeklyProgressPercent}%</span>
            </div>
            <div className="text-xs flex items-center justify-between">
              <span>Best streak</span>
              <span className="font-bold">{completionStats.bestStreak} day{completionStats.bestStreak === 1 ? '' : 's'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="secondary" className="text-xs px-2 py-2" onClick={() => setTodayForAllHabits(true)}>
                Complete today
              </Button>
              <Button variant="ghost" className="text-xs px-2 py-2" onClick={() => setTodayForAllHabits(false)}>
                Reset today
              </Button>
            </div>
          </div>

          {/* Heatmap Calendar */}
          <div className="mt-auto pt-6">
            <h3 className="text-xs font-bold text-gcal-muted uppercase tracking-wider mb-3">Activity</h3>
            <HeatmapCalendar heatmapData={heatmapData} />
          </div>
        </aside>

        {/* --- Grid View --- */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-0">
          
          {/* Grid Header (Days) */}
          <div className="flex border-b border-gcal-border flex-shrink-0 transition-colors duration-300 glassmorphism" style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}>
             {/* Empty corner for habit names */}
             <div className="w-48 md:w-64 flex-shrink-0 border-r border-gcal-border p-4 flex items-end">
                <span className="text-xs font-bold text-gcal-muted uppercase tracking-wider">TIME</span>
             </div>
             
             {/* Day Columns */}
             <div className="flex-1 grid grid-cols-7">
               {weekDays.map((day, i) => {
                 const isToday = isSameDay(day, today);
                 return (
                   <div key={i} className="flex flex-col items-center justify-center py-4 border-r border-gcal-border last:border-r-0">
                     <span className={`text-xs font-bold uppercase mb-2 tracking-wider ${isToday ? 'bg-gradient-to-r from-gcal-blue to-purple-500 bg-clip-text text-transparent' : 'text-gcal-muted'}`}>
                       {day.toLocaleDateString('en-US', { weekday: 'short' })}
                     </span>
                     <div className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold transition-all duration-200 ${
                       isToday 
                         ? 'bg-gradient-to-br from-gcal-blue to-purple-500 text-white shadow-lg scale-110' 
                         : 'text-gcal-text hover:bg-gcal-surface/30'
                     }`}>
                       {day.getDate()}
                     </div>
                   </div>
                 );
               })}  
             </div>
          </div>

          {/* Grid Body (Habits) */}
          <div className="flex-1 overflow-y-auto">
             {habits.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-gcal-muted py-20">
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gcal-blue/20 to-purple-500/20 flex items-center justify-center mb-4">
                   <Plus size={48} className="text-gcal-muted" />
                 </div>
                 <p className="text-xl font-medium mb-2">No habits yet.</p>
                 <Button variant="gradient" onClick={openCreateModal} className="mt-2 shadow-lg">Create your first habit</Button>
               </div>
             ) : visibleHabits.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-gcal-muted py-20 px-6 text-center">
                 <Target size={42} className="mb-3" />
                 <p className="text-lg font-semibold">Everything for today is complete 🎉</p>
                 <p className="text-sm mt-1">Turn off &quot;Focus on today&quot; to see all habits.</p>
               </div>
             ) : (
               visibleHabits.map((habit, index) => (
                 <div key={habit.id} className="flex border-b border-gcal-border hover:bg-gcal-surface/50 group transition-all duration-200 min-h-[90px] hover:shadow-md">
                    
                    {/* Habit Info Column */}
                    <div 
                      className="w-48 md:w-64 flex-shrink-0 border-r border-gcal-border p-4 flex flex-col justify-center relative group/habit cursor-pointer hover:bg-gcal-surface/50 transition-all duration-200"
                      onClick={() => openEditModal(habit)}
                    >
                       <div className="pr-8">
                          <div className="flex items-center justify-between mb-1">
                             <span className="font-bold truncate text-lg" style={{ color: habit.color }}>{habit.title}</span>
                          </div>
                          
                          {(habit.timeStart || habit.timeEnd) && (
                            <div className="text-xs text-gcal-muted flex items-center gap-1">
                              <Clock size={10} />
                              {formatTime(habit.timeStart)} {habit.timeEnd && `- ${formatTime(habit.timeEnd)}`}
                            </div>
                          )}
                          {habit.description && (
                            <p className="text-xs text-gcal-muted mt-1">{habit.description}</p>
                          )}
                          
                          {/* Streak Counter */}
                          {streaks[habit.id] > 0 && (
                            <div className="flex items-center gap-1 text-sm mt-1">
                              <span className="text-base">🔥</span>
                              <span className="font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                {streaks[habit.id]} day{streaks[habit.id] !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                       </div>

                       <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                          {sortMode === SortMode.MANUAL && !todayFocusOnly && (
                            <>
                              <button onClick={() => moveHabit(index, 'up')} disabled={index === 0} className="hover:text-gcal-text text-gcal-muted disabled:opacity-30 p-1"><ArrowUp size={12} /></button>
                              <button onClick={() => moveHabit(index, 'down')} disabled={index === visibleHabits.length - 1} className="hover:text-gcal-text text-gcal-muted disabled:opacity-30 p-1"><ArrowDown size={12} /></button>
                            </>
                          )}
                          <button onClick={() => handleDeleteHabit(habit.id)} className="hover:text-red-400 text-gcal-muted p-1" title="Delete"><Trash2 size={12} /></button>
                       </div>
                    </div>

                    {/* Checkbox Columns */}
                    <div className="flex-1 grid grid-cols-7">
                      {weekDays.map((day, i) => {
                        const completed = isCompleted(habit.id, day);
                        const dayKey = formatDateKey(day);
                        
                        return (
                          <div 
                            key={`${habit.id}-${dayKey}`} 
                            className="border-r border-gcal-border last:border-r-0 flex items-center justify-center relative"
                          >
                             <label className="cursor-pointer w-full h-full flex items-center justify-center hover:bg-gcal-muted/5 transition-all duration-200">
                               <input 
                                 type="checkbox" 
                                 className="sr-only"
                                 checked={completed}
                                 onChange={() => toggleCompletion(habit.id, day)}
                               />
                               <div 
                                 className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                   completed 
                                     ? `bg-opacity-30 border-transparent shadow-lg scale-110` 
                                     : 'border-gcal-border hover:border-gcal-blue hover:scale-105'
                                 }`}
                                 style={{ 
                                   backgroundColor: completed ? habit.color : 'transparent',
                                   borderColor: completed ? habit.color : undefined,
                                   boxShadow: completed ? `0 0 15px ${habit.color}40` : undefined
                                 }}
                               >
                                 {completed && (
                                   <Check size={24} style={{ color: 'var(--gcal-bg-solid)' }} strokeWidth={3} className="animate-in" />
                                 )}
                               </div>
                             </label>
                          </div>
                        );
                      })}
                    </div>
                 </div>
               ))
             )}
             
             {/* Mobile/Floating Add Button */}
             <div className="lg:hidden absolute bottom-6 right-6">
                <button 
                  onClick={openCreateModal}
                  className="w-16 h-16 bg-gradient-to-br from-gcal-blue to-purple-500 hover:from-gcal-blue-hover hover:to-purple-600 rounded-full shadow-2xl hover:shadow-xl flex items-center justify-center text-white border-4 border-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Plus size={32} className="text-white" strokeWidth={3} />
                </button>
             </div>
          </div>

        </main>
      </div>

      {/* --- Add/Edit Habit Modal --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingHabitId ? "Edit habit" : "Add new habit"}
      >
         <form onSubmit={handleSaveHabit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">Title</label>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Morning Meditation"
                className="w-full bg-transparent border-b-2 border-gcal-border focus:border-gcal-blue px-3 py-3 outline-none text-xl font-medium text-gcal-text transition-all duration-200 placeholder:text-gcal-muted/50"
                value={newHabitTitle}
                onChange={e => setNewHabitTitle(e.target.value)}
                style={{
                  borderImage: newHabitTitle ? 'linear-gradient(to right, var(--gcal-blue), #a855f7) 1' : undefined
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">Description (optional)</label>
              <textarea
                rows={3}
                placeholder="What does success look like for this habit?"
                className="w-full bg-transparent border border-gcal-border focus:border-gcal-blue rounded-xl px-3 py-2 outline-none text-sm text-gcal-text transition-all duration-200 placeholder:text-gcal-muted/60 resize-none"
                value={newHabitDescription}
                onChange={e => setNewHabitDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">Start Time</label>
                <input 
                  type="time" 
                  className="w-full bg-transparent border-b-2 border-gcal-border focus:border-gcal-blue px-3 py-2 outline-none text-gcal-text transition-all duration-200 font-medium"
                  value={newHabitTimeStart}
                  onChange={e => setNewHabitTimeStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">End Time</label>
                <input 
                  type="time" 
                  className="w-full bg-transparent border-b-2 border-gcal-border focus:border-gcal-blue px-3 py-2 outline-none text-gcal-text transition-all duration-200 font-medium"
                  value={newHabitTimeEnd}
                  onChange={e => setNewHabitTimeEnd(e.target.value)}
                />
              </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-gcal-muted mb-3 uppercase tracking-wider">Color</label>
               <div className="flex gap-3 flex-wrap">
                 {colors.map(c => (
                   <button
                     type="button"
                     key={c}
                     onClick={() => setNewHabitColor(c)}
                     className={`w-10 h-10 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${
                       newHabitColor === c 
                         ? 'scale-125 ring-4 ring-gcal-blue ring-offset-2 ring-offset-transparent' 
                         : 'hover:scale-110'
                     }`}
                     style={{ backgroundColor: c }}
                   />
                 ))}
               </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-5 border-t border-gcal-border/50">
               {editingHabitId ? (
                 <Button type="button" variant="ghost" onClick={() => handleDeleteHabit(editingHabitId)} className="text-red-400 hover:text-red-500 hover:bg-red-500/10 px-2 sm:px-4 font-medium">
                    <Trash2 size={20} /> <span className="hidden sm:inline ml-2">Delete</span>
                 </Button>
               ) : <div></div>}
               
               <div className="flex gap-3">
                 <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                 <Button type="submit" variant="gradient" className="px-8 shadow-lg">
                    {editingHabitId ? 'Update' : 'Save'}
                 </Button>
               </div>
            </div>
         </form>
      </Modal>

      {/* Login Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Sign In">
          <Login />
      </Modal>

      {/* Guest Mode Reminder */}
      <AuthReminder 
         visible={showAuthReminder}
         onLogin={handleLoginClick}
         onClose={() => {
             setReminderDismissed(true);
             setShowAuthReminder(false);
         }} 
      />

    </div>
  );
}

export default App;
