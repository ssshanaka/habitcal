import React from 'react';
import { Plus, Target, CheckCircle2, Circle } from 'lucide-react';
import { Habit, SortMode } from '../types';
import { isSameDay } from '../utils';
import { Button } from './Button';
import HabitRow from './HabitRow';

interface HabitGridProps {
  allHabitsCount: number;
  visibleHabits: Habit[];
  weekDays: Date[];
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>;
  isCompleted: (habitId: string, date: Date) => boolean;
  toggleCompletion: (habitId: string, date: Date) => void;
  setCompletionsForDate: (date: Date, completed: boolean) => Promise<void>;
  openEditModal: (habit: Habit) => void;
  handleDeleteHabit: (id: string) => Promise<void>;
  moveHabit: (index: number, direction: 'up' | 'down') => void;
  sortMode: SortMode;
  todayFocusOnly: boolean;
  streaks: Record<string, number>;
  openCreateModal: () => void;
  onTimerStop: (habitId: string, minutes: number) => void;
}

const HabitGrid: React.FC<HabitGridProps> = ({
  allHabitsCount,
  visibleHabits,
  weekDays,
  completions,
  isCompleted,
  toggleCompletion,
  openEditModal,
  handleDeleteHabit,
  moveHabit,
  sortMode,
  todayFocusOnly,
  streaks,
  openCreateModal,
  onTimerStop
}) => {
  const today = new Date();

  const handleTimerStop = (habitId: string, minutes: number) => {
    onTimerStop(habitId, minutes);
  };

  return (
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
             
             // Calculate if all visible habits are completed for this day
             const allCompleted = visibleHabits.length > 0 && visibleHabits.every(h => isCompleted(h.id, day));

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
                 {/* New: Date/Month Display */}
                 <span className="text-[10px] text-gcal-muted uppercase mt-1 mb-3">{day.toLocaleDateString('en-US', { month: 'short' })}</span>
                 
                 {/* Bulk Completion Toggle */}
                 <button 
                   onClick={() => setCompletionsForDate(day, !allCompleted)}
                   className={`group flex items-center justify-center p-1.5 rounded-lg transition-all duration-200 ${
                     allCompleted 
                       ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20' 
                       : 'text-gcal-muted hover:text-gcal-blue bg-gcal-surface/50 hover:bg-gcal-surface'
                   }`}
                   title={allCompleted ? "Clear all completions for this day" : "Complete all habits for this day"}
                 >
                   {allCompleted ? (
                     <CheckCircle2 size={16} className="animate-in zoom-in-50" />
                   ) : (
                     <Circle size={16} />
                   )}
                 </button>
               </div>
             );
           })}  
         </div>
      </div>

      {/* Grid Body (Habits) */}
      <div className="flex-1 overflow-y-auto">
         {allHabitsCount === 0 ? (
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
           <>
             {visibleHabits.reduce((acc: JSX.Element[], habit, index) => {
               const currentCat = habit.category || 'Uncategorized';
               const prevHabit = visibleHabits[index - 1];
               const prevCat = prevHabit ? (prevHabit.category || 'Uncategorized') : null;

               const elements = [];

               // Render category header if it's the first habit or category changed
               if (currentCat !== prevCat) {
                 elements.push(
                   <div 
                     key={`cat-header-${currentCat}`} 
                     className="flex items-center gap-3 py-4 px-4 bg-gcal-surface/20 border-y border-gcal-border/50 sticky top-0 z-10"
                   >
                     <span className="text-[10px] font-black text-gcal-muted uppercase tracking-[0.2em]">
                       {currentCat}
                     </span>
                     <div className="flex-1 h-px bg-gradient-to-r from-gcal-border/50 to-transparent" />
                   </div>
                 );
               }

               elements.push(
                 <HabitRow 
                   key={habit.id}
                   habit={habit}
                   index={index}
                   totalHabits={visibleHabits.length}
                   weekDays={weekDays}
                   completions={completions}
                   isCompleted={isCompleted}
                   toggleCompletion={toggleCompletion}
                   openEditModal={openEditModal}
                   handleDeleteHabit={handleDeleteHabit}
                   moveHabit={moveHabit}
                   sortMode={sortMode}
                   todayFocusOnly={todayFocusOnly}
                   streak={streaks[habit.id] || 0}
                   onTimerStop={handleTimerStop}
                   allHabits={visibleHabits}
                 />
               );

               return [...acc, ...elements];
             }, [])}
           </>
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
  );
};

export default HabitGrid;
