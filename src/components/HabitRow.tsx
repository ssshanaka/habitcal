import React, { useState, useMemo } from 'react';
import { Check, Trash2, Clock, ArrowUp, ArrowDown, Timer, Lock, Target, Link2, Sparkles } from 'lucide-react';
import { Habit, SortMode, HabitFrequency } from '../types';
import { formatTime, calculateMonthlyCompletion } from '../utils';
import HabitTimer from './HabitTimer';
import Sparkline from './Sparkline';

interface HabitRowProps {
  habit: Habit;
  index: number;
  totalHabits: number;
  weekDays: Date[];
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>;
  isCompleted: (habitId: string, date: Date) => boolean;
  toggleCompletion: (habitId: string, date: Date) => void;
  openEditModal: (habit: Habit) => void;
  handleDeleteHabit: (id: string) => Promise<void>;
  moveHabit: (index: number, direction: 'up' | 'down') => void;
  sortMode: SortMode;
  todayFocusOnly: boolean;
  streak: number;
  onTimerStop: (habitId: string, minutes: number) => void;
  allHabits: Habit[];
  isSpotlight?: boolean;
}

const HabitRow: React.FC<HabitRowProps> = ({
  habit,
  index,
  totalHabits,
  weekDays,
  completions,
  isCompleted,
  toggleCompletion,
  openEditModal,
  handleDeleteHabit,
  moveHabit,
  sortMode,
  todayFocusOnly,
  streak,
  onTimerStop,
  allHabits,
  isSpotlight = false
}) => {
  const [isTimerActive, setIsTimerActive] = useState(false);

  const dependencyHabit = allHabits.find(h => h.id === habit.dependencyId);
  const isProvider = allHabits.some(h => h.dependencyId === habit.id);
  const isDependent = !!habit.dependencyId;
  const isPartOfChain = isProvider || isDependent;

  const monthlyProgress = useMemo(() => {
    if (!habit.goalCount) return null;
    const completedCount = calculateMonthlyCompletion(habit.id, completions);
    const percentage = Math.min(Math.round((completedCount / habit.goalCount) * 100), 100);
    return { completedCount, percentage };
  }, [habit.id, habit.goalCount, completions]);

  return (
    <div className={`flex border-b border-gcal-border hover:bg-gcal-surface/50 group transition-all duration-200 min-h-[90px] hover:shadow-md ${
      isSpotlight 
        ? 'ring-2 ring-gcal-blue ring-inset bg-gcal-blue/5 animate-pulse-slow' 
        : ''
    }`}>
      {/* Habit Info Column */}
      <div 
        className={`w-48 md:w-72 flex-shrink-0 border-r border-gcal-border p-4 flex flex-col justify-center relative group/habit cursor-pointer hover:bg-gcal-surface/50 transition-all duration-200 ${
          isSpotlight ? 'bg-gcal-blue/5' : ''
        }`}
        onClick={() => openEditModal(habit)}
      >
         {isSpotlight && (
           <div className="absolute -top-2 -left-1 px-2 py-0.5 rounded bg-gcal-blue text-white text-[9px] font-black uppercase tracking-tighter shadow-lg z-10 flex items-center gap-1">
             <Sparkles size={8} />
             Spotlight
           </div>
         )}
         {isProvider && (
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gcal-blue/40 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
         )}
         <div className="pr-8">
            <div className="flex items-center justify-between mb-1">
               <div className="flex flex-col">
                 <span className="font-bold truncate text-lg" style={{ color: habit.color }}>{habit.title}</span>
                 <div className="flex flex-wrap gap-1 mt-0.5">
                   {habit.category && (
                     <span className="text-[10px] font-bold uppercase tracking-wider text-gcal-muted px-1.5 py-0.5 rounded bg-gcal-surface w-fit">
                       {habit.category}
                     </span>
                   )}
                   {isPartOfChain && (
                     <div className="text-[10px] font-bold uppercase tracking-wider text-gcal-blue px-1.5 py-0.5 rounded bg-gcal-blue/10 w-fit flex items-center gap-1 border border-gcal-blue/20">
                       <Link2 size={8} />
                       {isDependent ? `Chain: ${dependencyHabit?.title}` : (isProvider ? 'Anchor' : 'Chain')}
                     </div>
                   )}
                 </div>
               </div>
            </div>
            
            {(habit.timeStart || habit.timeEnd) && (
              <div className="text-xs text-gcal-muted flex items-center gap-1">
                <Clock size={10} />
                {formatTime(habit.timeStart)} {habit.timeEnd && `- ${formatTime(habit.timeEnd)}`}
              </div>
            )}
            {habit.description && (
              <p className="text-xs text-gcal-muted mt-1 line-clamp-1">{habit.description}</p>
            )}
            
            <div className="flex items-center gap-3 mt-2">
              {/* Streak Counter */}
              {streak > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">🔥</span>
                    <span className="font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      {streak} day{streak !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Sparkline 
                    habitId={habit.id} 
                    completions={completions} 
                    isCompleted={isCompleted} 
                    color={habit.color} 
                  />
                </div>
              )}

              {/* Duration Display */}
              {habit.duration_minutes !== undefined && habit.duration_minutes > 0 && (
                <div className="flex items-center gap-1 text-xs text-gcal-muted">
                  <Timer size={12} />
                  <span className="font-medium">{habit.duration_minutes}m</span>
                </div>
              )}
            </div>

            {/* Monthly Goal Progress */}
            {monthlyProgress && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gcal-muted uppercase tracking-wider flex items-center gap-1">
                    <Target size={10} /> Goal
                  </span>
                  <span className="text-[10px] font-bold text-gcal-text">
                    {monthlyProgress.completedCount}/{habit.goalCount}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gcal-muted/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500 rounded-full" 
                    style={{ 
                      width: `${monthlyProgress.percentage}%`, 
                      backgroundColor: habit.color 
                    }}
                  />
                </div>
              </div>
            )}
         </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 bg-gcal-bg-solid/80 backdrop-blur-sm pl-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-0.5 mb-2">
                <HabitTimer 
                  onStop={(mins) => {
                    onTimerStop(habit.id, mins);
                    setIsTimerActive(false);
                  }}
                  onCancel={() => setIsTimerActive(false)}
                />
            </div>

            {sortMode === SortMode.MANUAL && !todayFocusOnly && (
              <>
                <button onClick={() => moveHabit(index, 'up')} disabled={index === 0} className="hover:text-gcal-text text-gcal-muted disabled:opacity-30 p-1"><ArrowUp size={12} /></button>
                <button onClick={() => moveHabit(index, 'down')} disabled={index === totalHabits - 1} className="hover:text-gcal-text text-gcal-muted disabled:opacity-30 p-1"><ArrowDown size={12} /></button>
              </>
            )}
            <button onClick={() => handleDeleteHabit(habit.id)} className="hover:text-red-400 text-gcal-muted p-1" title="Delete"><Trash2 size={12} /></button>
         </div>
      </div>

      {/* Checkbox Columns */}
      <div className="flex-1 grid grid-cols-7">
        {weekDays.map((day, i) => {
          const completed = isCompleted(habit.id, day);
          const isLocked = habit.dependencyId && !isCompleted(habit.dependencyId, day);
          
          // Frequency Check
          const dayOfWeek = day.getDay();
          const isScheduled = habit.frequency === HabitFrequency.DAILY || 
                              (habit.frequency === HabitFrequency.WEEKLY && habit.daysOfWeek?.includes(dayOfWeek));

          return (
            <div 
              key={`${habit.id}-${i}`} 
              className={`border-r border-gcal-border last:border-r-0 flex items-center justify-center relative ${!isScheduled ? 'bg-gcal-muted/10' : (isLocked ? 'bg-red-500/[0.03]' : '')}`}
            >
               {habit.dependencyId && (
                 <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gcal-blue/30" />
               )}
               {isScheduled ? (
                 <label className={`cursor-pointer w-full h-full flex items-center justify-center transition-all duration-200 ${isLocked ? 'cursor-not-allowed group/locked' : 'hover:bg-gcal-muted/5 hover:scale-105'}`}>
                   <input 
                     type="checkbox" 
                     className="sr-only"
                     checked={completed}
                     disabled={isLocked}
                     onChange={() => toggleCompletion(habit.id, day)}
                   />
                   <div 
                     className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                       completed 
                         ? `bg-opacity-30 border-transparent shadow-lg scale-110` 
                         : isLocked 
                          ? 'border-gcal-muted/20 bg-gcal-muted/5'
                          : 'border-gcal-border hover:border-gcal-blue hover:scale-105'
                     }`}
                     style={{ 
                       backgroundColor: completed ? habit.color : undefined,
                       borderColor: completed ? habit.color : undefined,
                       boxShadow: completed ? `0 0 15px ${habit.color}40` : undefined
                     }}
                   >
                     {completed ? (
                       <Check size={24} style={{ color: 'var(--gcal-bg-solid)' }} strokeWidth={3} className="animate-in" />
                     ) : isLocked ? (
                       <Lock size={16} className="text-red-400/50" />
                     ) : null}
                   </div>
                   {isLocked && (
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow-lg z-50 pointer-events-none whitespace-nowrap opacity-0 group-hover/locked:opacity-100 transition-opacity">
                       LOCKED: Complete "{dependencyHabit?.title}" first
                     </div>
                   )}
                 </label>
               ) : (
                 <div className="w-full h-full pointer-events-none" />
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitRow;
