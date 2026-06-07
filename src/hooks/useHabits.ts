import { useState, useMemo, useEffect } from 'react';
import { Habit, SortMode } from '../types';
import { habitsService } from '../services/habits';
import { syncService } from '../services/sync';
import { getWeekStart, getWeekDays, formatDateKey, calculateStreak } from '../utils';
import { ToastType } from './useToast';

export function useHabits(user: any, loading: boolean, addToast?: (message: string, type?: ToastType) => void) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
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
    const key = `${habitId}_${formatDateKey(date)}`;
    const isNowCompleted = !completions[key];
    
    setCompletions(prev => ({ ...prev, [key]: isNowCompleted }));

    if (user) {
      try {
        await habitsService.toggleCompletion(habitId, date, isNowCompleted);
      } catch (err) {
        setCompletions(prev => ({ ...prev, [key]: !isNowCompleted }));
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

  const setTodayForAll = async (completed: boolean) => {
    const todayDate = new Date();
    const todayKey = formatDateKey(todayDate);
    const updates: Record<string, boolean> = {};
    habits.forEach(habit => {
      updates[`${habit.id}_${todayKey}`] = completed;
    });

    const prevCompletions = completions;
    setCompletions(prev => ({ ...prev, ...updates }));

    if (user) {
      try {
        await Promise.all(
          habits.map(habit => habitsService.toggleCompletion(habit.id, todayDate, completed))
        );
      } catch (error) {
        setCompletions(prevCompletions);
        addToast?.('Failed to update today\'s habits', 'error');
      }
    }
  };

  const moveHabit = async (index: number, direction: 'up' | 'down') => {
    if (index < 0 || (direction === 'up' && index === 0) || (direction === 'down' && index === habits.length - 1)) return;

    const newHabits = [...habits];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newHabits[index], newHabits[targetIndex]] = [newHabits[targetIndex], newHabits[index]];
    
    const updatedHabits = newHabits.map((h, i) => ({ ...h, order: i }));
    setHabits(updatedHabits);

    if (user) {
      try {
        await Promise.all([
          habitsService.updateHabit({ ...updatedHabits[index], order: index }),
          habitsService.updateHabit({ ...updatedHabits[targetIndex], order: targetIndex })
        ]);
      } catch (err) {
        addToast?.('Failed to persist habit order', 'error');
        setHabits(habits);
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
    moveHabit
  };
}
