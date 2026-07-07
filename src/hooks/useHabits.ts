import { useState, useMemo, useEffect } from 'react';
import { Habit, SortMode } from '../types';
import { habitsService } from '../services/habits';
import { syncService } from '../services/sync';
import { getWeekStart, getWeekDays, formatDateKey, calculateStreak } from '../utils';
import { ToastType } from './useToast';

export function useHabits(user: any, loading: boolean, addToast?: (message: string, type?: ToastType) => void) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean | { completed: boolean; timestamp: string }>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Default Data
  const DEFAULT_HABITS: Habit[] = [
    { id: '11111111-1111-4111-8111-111111111111', title: 'Morning Jog', timeStart: '07:00', timeEnd: '07:30', color: '#4ade80', order: 0 },
    { id: '22222222-2222-4222-8222-222222222222', title: 'Deep Work', timeStart: '09:00', timeEnd: '11:00', color: '#60a5fa', order: 1 },
    { id: '33333333-3333-4333-8333-333333333333', title: 'Read Book', timeStart: '21:00', timeEnd: '21:30', color: '#facc15', order: 2 },
  ];

  useEffect(() => {
    async function loadData() {
      if (loading) return;

      if (user) {
        try {
          const fetchedHabits = await habitsService.fetchHabits();
          const fetchedCompletions = await habitsService.fetchCompletions();
          setHabits(fetchedHabits);
          setCompletions(fetchedCompletions);
        } catch (error) {
          console.error('Failed to load user data', error);
          addToast?.('Failed to load user data', 'error');
        }
      } else {
        const savedHabits = localStorage.getItem('habitCal_habits');
        const savedCompletions = localStorage.getItem('habitCal_completions');
        
        if (savedHabits) {
          setHabits(JSON.parse(savedHabits));
        } else {
          setHabits(DEFAULT_HABITS);
        }
        
        if (savedCompletions) {
          setCompletions(JSON.parse(savedCompletions));
        }
      }
      setDataLoaded(true);
    }
    loadData();
  }, [user, loading]);

  useEffect(() => {
    if (!user && dataLoaded) {
      localStorage.setItem('habitCal_completions', JSON.stringify(completions));
      localStorage.setItem('habitCal_habits', JSON.stringify(habits));
    }
  }, [completions, habits, user, dataLoaded]);

  useEffect(() => {
    const performSync = async () => {
       if (user && !loading) {
           const localHabitsRaw = localStorage.getItem('habitCal_habits');
           const localCompletionsRaw = localStorage.getItem('habitCal_completions');
           
           if (localHabitsRaw) {
               const localHabits = JSON.parse(localHabitsRaw);
               const localCompletions = JSON.parse(localCompletionsRaw || '{}');
               
               if (localHabits.length > 0) {
                   await syncService.syncLocalToCloud(localHabits, localCompletions);
                   localStorage.removeItem('habitCal_habits');
                   localStorage.removeItem('habitCal_completions');
                   
                   const fetchedHabits = await habitsService.fetchHabits();
                   const fetchedCompletions = await habitsService.fetchCompletions();
                   setHabits(fetchedHabits);
                   setCompletions(fetchedCompletions);
               }
           }
       }
    };
    performSync();
  }, [user, loading]);

  const toggleCompletion = async (habitId: string, date: Date) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Dependency Check
    if (habit.dependencyId) {
      const dependencyHabit = habits.find(h => h.id === habit.dependencyId);
      if (dependencyHabit) {
        const depKey = `${habit.dependencyId}_${formatDateKey(date)}`;
        const isDepCompleted = !!completions[depKey];
        if (!isDepCompleted) {
          addToast?.(`Please complete "${dependencyHabit.title}" first!`, 'error');
          return;
        }
      }
    }

    const key = `${habitId}_${formatDateKey(date)}`;
    const prevComp = completions[key];
    const isNowCompleted = typeof prevComp === 'boolean' ? !prevComp : !prevComp?.completed;
    
    setCompletions(prev => ({ 
      ...prev, 
      [key]: isNowCompleted 
        ? { completed: true, timestamp: new Date().toISOString() } 
        : false 
    }));

    if (user) {
      try {
        await habitsService.toggleCompletion(habitId, date, isNowCompleted);
        
        // Bi-directional sync: Push to calendar if completed
        if (isNowCompleted) {
          import('../services/externalSync').then(({ externalSyncService }) => {
            externalSyncService.pushHabitToCalendar(habit.title, date).catch(err => {
              console.error('Failed to push habit completion to calendar:', err);
            });
          });
        }
      } catch (err) {
        // Rollback to previous state
        setCompletions(prev => {
          const restored = { ...prev };
          if (prevComp === undefined) {
            delete restored[key];
          } else {
            restored[key] = prevComp;
          }
          return restored;
        });
        addToast?.('Failed to update completion', 'error');
      }
    }
  };

  const saveHabit = async (habit: Habit, isEdit: boolean) => {
    let updatedHabits = [...habits];
    if (isEdit) {
      updatedHabits = habits.map(h => h.id === habit.id ? habit : h);
    } else {
      updatedHabits = [...habits, habit];
    }
    setHabits(updatedHabits);

    if (user) {
      try {
        if (isEdit) {
          await habitsService.updateHabit(habit);
        } else {
          await habitsService.createHabit(habit);
        }
      } catch (err) {
        addToast?.('Failed to save habit', 'error');
      }
    }
  };

  const deleteHabit = async (id: string) => {
    const prevHabits = habits;
    setHabits(habits.filter(h => h.id !== id));
    if (user) {
      try {
        await habitsService.deleteHabit(id);
      } catch (err) {
        addToast?.('Failed to delete habit', 'error');
        setHabits(prevHabits);
      }
    }
  };

  const setCompletionsForDate = async (date: Date, completed: boolean) => {
    const prevCompletions = completions;
    const dateKey = formatDateKey(date);

    // Optimistic update
    const newCompletions: Record<string, any> = { ...prevCompletions };
    habits.forEach(habit => {
      const key = `${habit.id}_${dateKey}`;
      newCompletions[key] = completed 
        ? { completed: true, timestamp: new Date().toISOString() } 
        : false;
    });
    setCompletions(newCompletions);

    if (user) {
      try {
        await habitsService.setCompletionsForDate(date, completed);
      } catch (error) {
        setCompletions(prevCompletions);
        addToast?.(`Failed to update completions for ${dateKey}`, 'error');
      }
    }
  };

  const setTodayForAll = async (completed: boolean) => {
    await setCompletionsForDate(new Date(), completed);
  };

  const clearAllCompletions = async () => {
    const prevCompletions = completions;
    setCompletions({});

    if (user) {
      try {
        await habitsService.clearAllCompletions();
      } catch (err) {
        setCompletions(prevCompletions);
        addToast?.('Failed to clear completions', 'error');
      }
    }
  };

  const moveHabit = (index: number, direction: 'up' | 'down') => {
    const newHabits = [...habits];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newHabits.length) {
      [newHabits[index], newHabits[targetIndex]] = [newHabits[targetIndex], newHabits[index]];
      newHabits.forEach((h, i) => h.order = i);
      setHabits(newHabits);
      if (user) {
         habitsService.reorderHabits(newHabits);
      }
    }
  };

  return {
    habits,
    setHabits,
    completions,
    setCompletions,
    dataLoaded,
    toggleCompletion,
    saveHabit,
    deleteHabit,
    setTodayForAll,
    setCompletionsForDate,
    moveHabit,
    clearAllCompletions
  };
}
