import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Settings, 
  Search, 
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
  LogIn
} from 'lucide-react';
import { 
  getWeekStart, 
  getWeekDays, 
  formatDateKey, 
  isSameDay, 
  formatTime,
  generateId,
  colors
} from './utils';
import { Habit, Completion, SortMode } from './types';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { Login } from './components/Login';
import { useAuth } from './hooks/useAuth';

// --- Default Data ---
const DEFAULT_HABITS: Habit[] = [
  { id: '1', title: 'Morning Jog', timeStart: '07:00', timeEnd: '07:30', color: colors[0], order: 0 },
  { id: '2', title: 'Deep Work', timeStart: '09:00', timeEnd: '11:00', color: colors[1], order: 1 },
  { id: '3', title: 'Read Book', timeStart: '21:00', timeEnd: '21:30', color: colors[3], order: 2 },
];

function App() {
  // --- Auth ---
  const { user, loading, signOut } = useAuth();

  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>(SortMode.TIME);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Editing State
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  
  // Form State
  const [newHabitTitle, setNewHabitTitle] = useState('');
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

  // --- Effects ---
  
  // Initialize from local storage
  useEffect(() => {
    const savedCompletions = localStorage.getItem('habitCal_completions');
    if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
    
    const savedHabits = localStorage.getItem('habitCal_habits');
    if (savedHabits) setHabits(JSON.parse(savedHabits));

    const savedTheme = localStorage.getItem('habitCal_theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Persist Data
  useEffect(() => {
    localStorage.setItem('habitCal_completions', JSON.stringify(completions));
    localStorage.setItem('habitCal_habits', JSON.stringify(habits));
    localStorage.setItem('habitCal_theme', theme);
  }, [completions, habits, theme]);

  // Apply Theme
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  // Close dropdowns on click outside
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

  // --- Handlers ---
  const toggleCompletion = (habitId: string, date: Date) => {
    const key = `${habitId}_${formatDateKey(date)}`;
    setCompletions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    if (editingHabitId) {
      // Update existing
      setHabits(habits.map(h => h.id === editingHabitId ? {
        ...h,
        title: newHabitTitle,
        timeStart: newHabitTimeStart || undefined,
        timeEnd: newHabitTimeEnd || undefined,
        color: newHabitColor,
      } : h));
    } else {
      // Create new
      const newHabit: Habit = {
        id: generateId(),
        title: newHabitTitle,
        timeStart: newHabitTimeStart || undefined,
        timeEnd: newHabitTimeEnd || undefined,
        color: newHabitColor,
        order: habits.length,
      };
      setHabits([...habits, newHabit]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteHabit = (id: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      setHabits(habits.filter(h => h.id !== id));
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
    setNewHabitTimeStart(habit.timeStart || '');
    setNewHabitTimeEnd(habit.timeEnd || '');
    setNewHabitColor(habit.color);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setNewHabitTitle('');
    setNewHabitTimeStart('');
    setNewHabitTimeEnd('');
    setNewHabitColor(colors[0]);
    setEditingHabitId(null);
  };

  const moveHabit = (index: number, direction: 'up' | 'down') => {
    if (sortMode === SortMode.TIME) return; 
    
    const newHabits = [...habits];
    
    if (direction === 'up' && index > 0) {
      [newHabits[index], newHabits[index - 1]] = [newHabits[index - 1], newHabits[index]];
      newHabits.forEach((h, i) => h.order = i);
      setHabits(newHabits);
    } else if (direction === 'down' && index < newHabits.length - 1) {
      [newHabits[index], newHabits[index + 1]] = [newHabits[index + 1], newHabits[index]];
      newHabits.forEach((h, i) => h.order = i);
      setHabits(newHabits);
    }
  };

  const handleSignOut = () => {
    signOut();
    setIsProfileOpen(false);
  }

  // --- Early Returns ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gcal-bg text-gcal-text">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // --- Render ---
  return (
    <div className="flex flex-col h-screen bg-gcal-bg text-gcal-text overflow-hidden transition-colors duration-200">
      
      {/* --- Header --- */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gcal-border bg-gcal-bg flex-shrink-0 transition-colors duration-200">
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
              <div className="absolute right-0 top-full mt-2 w-56 bg-gcal-surface border border-gcal-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                 <div className="p-3 border-b border-gcal-border">
                   <h3 className="text-xs font-semibold text-gcal-muted uppercase tracking-wider">Settings</h3>
                 </div>
                 <div className="p-2">
                   <button 
                     onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                     className="w-full flex items-center justify-between p-2 rounded hover:bg-gcal-bg transition-colors text-sm"
                   >
                     <div className="flex items-center gap-2">
                       {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                       <span>Dark mode</span>
                     </div>
                     {/* Toggle Switch Visual */}
                     <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-gcal-blue' : 'bg-gcal-muted'}`}>
                       <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} style={{ left: theme === 'dark' ? '18px' : '2px' }} />
                     </div>
                   </button>
                 </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full bg-gcal-muted/20 hover:bg-gcal-muted/30 border border-gcal-border flex items-center justify-center text-gcal-text overflow-hidden focus:outline-none focus:ring-2 focus:ring-gcal-blue"
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-gcal-muted" />
              )}
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-gcal-surface border border-gcal-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-4">
                 <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gcal-bg border border-gcal-border flex items-center justify-center overflow-hidden">
                       {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-gcal-muted" />
                        )}
                    </div>
                    <div className="text-center overflow-hidden w-full">
                      <p className="font-medium text-gcal-text truncate">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs text-gcal-muted truncate">{user.email}</p>
                    </div>
                 </div>
                 
                 <Button className="w-full justify-center gap-2 text-red-400 hover:text-red-500 hover:bg-red-500/10" variant="ghost" onClick={handleSignOut}>
                    <LogOut size={16} /> Sign Out
                 </Button>
                 
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- Sidebar (Create Button & Mini Details) --- */}
        <aside className="w-64 p-4 hidden lg:flex flex-col gap-6 flex-shrink-0 transition-colors duration-200">
          <div 
             onClick={openCreateModal}
             className="cursor-pointer bg-gcal-surface hover:bg-gcal-fabHover text-gcal-text shadow-md hover:shadow-lg transition-all rounded-2xl p-4 flex items-center gap-3 w-40 border border-gcal-border"
          >
             <Plus size={24} className="text-gcal-blue" />
             <span className="font-medium text-lg">Create</span>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-gcal-muted uppercase tracking-wider mb-2">Filters & Sorting</h3>
            <div className="flex items-center gap-2 bg-gcal-surface p-2 rounded-lg border border-transparent hover:border-gcal-border transition-colors">
               <span className="text-sm">Sort by:</span>
               <select 
                  className="bg-transparent text-sm font-medium focus:outline-none text-gcal-blue cursor-pointer"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
               >
                 <option value={SortMode.TIME}>Time</option>
                 <option value={SortMode.MANUAL}>Manual</option>
               </select>
            </div>
          </div>
        </aside>

        {/* --- Grid View --- */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Grid Header (Days) */}
          <div className="flex border-b border-gcal-border flex-shrink-0 transition-colors duration-200">
             {/* Empty corner for habit names */}
             <div className="w-48 md:w-64 flex-shrink-0 border-r border-gcal-border p-4 flex items-end">
                <span className="text-xs font-medium text-gcal-muted">TIME</span>
             </div>
             
             {/* Day Columns */}
             <div className="flex-1 grid grid-cols-7">
               {weekDays.map((day, i) => {
                 const isToday = isSameDay(day, today);
                 return (
                   <div key={i} className="flex flex-col items-center justify-center py-4 border-r border-gcal-border last:border-r-0">
                     <span className={`text-xs font-medium uppercase mb-1 ${isToday ? 'text-gcal-blue' : 'text-gcal-muted'}`}>
                       {day.toLocaleDateString('en-US', { weekday: 'short' })}
                     </span>
                     <div className={`w-10 h-10 flex items-center justify-center rounded-full text-2xl font-normal transition-colors ${isToday ? 'bg-gcal-blue text-white' : 'text-gcal-text'}`}>
                       {day.getDate()}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>

          {/* Grid Body (Habits) */}
          <div className="flex-1 overflow-y-auto">
             {sortedHabits.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-gcal-muted">
                 <p className="text-lg">No habits yet.</p>
                 <Button variant="ghost" onClick={openCreateModal} className="text-gcal-blue mt-2">Create one</Button>
               </div>
             ) : (
               sortedHabits.map((habit, index) => (
                 <div key={habit.id} className="flex border-b border-gcal-border hover:bg-gcal-surface group transition-colors min-h-[80px]">
                    
                    {/* Habit Info Column */}
                    <div 
                      className="w-48 md:w-64 flex-shrink-0 border-r border-gcal-border p-4 flex flex-col justify-center relative group/habit cursor-pointer hover:bg-gcal-border/10 transition-colors"
                      onClick={() => openEditModal(habit)}
                    >
                       <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate pr-2" style={{ color: habit.color }}>{habit.title}</span>
                          {sortMode === SortMode.MANUAL && (
                            <div className="flex flex-col opacity-0 group-hover/habit:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => moveHabit(index, 'up')} disabled={index === 0} className="hover:text-gcal-text text-gcal-muted disabled:opacity-30 p-1"><ArrowUp size={12} /></button>
                              <button onClick={() => moveHabit(index, 'down')} disabled={index === habits.length - 1} className="hover:text-gcal-text text-gcal-muted disabled:opacity-30 p-1"><ArrowDown size={12} /></button>
                            </div>
                          )}
                       </div>
                       
                       {(habit.timeStart || habit.timeEnd) && (
                         <div className="text-xs text-gcal-muted flex items-center gap-1">
                           <Clock size={10} />
                           {formatTime(habit.timeStart)} {habit.timeEnd && `- ${formatTime(habit.timeEnd)}`}
                         </div>
                       )}
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
                             <label className="cursor-pointer w-full h-full flex items-center justify-center hover:bg-gcal-muted/5 transition-colors">
                               <input 
                                 type="checkbox" 
                                 className="sr-only"
                                 checked={completed}
                                 onChange={() => toggleCompletion(habit.id, day)}
                               />
                               <div 
                                 className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                   completed 
                                     ? `bg-opacity-20 border-transparent` 
                                     : 'border-gcal-border hover:border-gcal-muted'
                                 }`}
                                 style={{ 
                                   backgroundColor: completed ? habit.color : 'transparent',
                                   borderColor: completed ? 'transparent' : undefined
                                 }}
                               >
                                 {completed && (
                                   <Check size={20} style={{ color: habit.color }} strokeWidth={3} />
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
                  className="w-14 h-14 bg-gcal-surface hover:bg-gcal-fabHover rounded-2xl shadow-xl flex items-center justify-center text-gcal-text border border-gcal-border"
                >
                  <Plus size={32} className="text-gcal-blue" />
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
              <label className="block text-xs font-medium text-gcal-muted mb-1">Title</label>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Drink Water"
                className="w-full bg-gcal-bg border-b border-gcal-border focus:border-gcal-blue px-2 py-2 outline-none text-lg text-gcal-text transition-colors"
                value={newHabitTitle}
                onChange={e => setNewHabitTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gcal-muted mb-1">Start Time (Optional)</label>
                <input 
                  type="time" 
                  className="w-full bg-gcal-bg border-b border-gcal-border focus:border-gcal-blue px-2 py-2 outline-none text-gcal-text transition-colors"
                  value={newHabitTimeStart}
                  onChange={e => setNewHabitTimeStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gcal-muted mb-1">End Time (Optional)</label>
                <input 
                  type="time" 
                  className="w-full bg-gcal-bg border-b border-gcal-border focus:border-gcal-blue px-2 py-2 outline-none text-gcal-text transition-colors"
                  value={newHabitTimeEnd}
                  onChange={e => setNewHabitTimeEnd(e.target.value)}
                />
              </div>
            </div>

            <div>
               <label className="block text-xs font-medium text-gcal-muted mb-2">Color</label>
               <div className="flex gap-2 flex-wrap">
                 {colors.map(c => (
                   <button
                     type="button"
                     key={c}
                     onClick={() => setNewHabitColor(c)}
                     className={`w-8 h-8 rounded-full transition-transform ${newHabitColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-gcal-surface' : 'hover:scale-105'}`}
                     style={{ backgroundColor: c }}
                   />
                 ))}
               </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gcal-border">
               {editingHabitId ? (
                 <Button type="button" variant="ghost" onClick={() => handleDeleteHabit(editingHabitId)} className="text-red-400 hover:text-red-500 hover:bg-red-500/10 px-0 sm:px-4">
                    <Trash2 size={18} /> <span className="hidden sm:inline ml-2">Delete</span>
                 </Button>
               ) : <div></div>}
               
               <div className="flex gap-2">
                 <Button type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                 <Button type="submit" className="bg-gcal-blue hover:bg-gcal-blueHover text-white font-semibold px-6 rounded-full">
                    {editingHabitId ? 'Update' : 'Save'}
                 </Button>
               </div>
            </div>
         </form>
      </Modal>

    </div>
  );
}

export default App;