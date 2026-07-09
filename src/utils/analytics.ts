import { Habit } from '../types';

export interface AnalyticsSummary {
  totalCompletionRate: number;
  bestStreak: number;
  currentStreak: number;
  totalCompletions: number;
  categoryPerformance: Record<string, number>;
}

export const calculateAnalytics = (
  habits: Habit[], 
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>
): AnalyticsSummary => {
  let totalPossible = 0;
  let totalCompleted = 0;
  let globalBestStreak = 0;
  let globalCurrentStreak = 0;
  const categoryCounts: Record<string, { completed: number; possible: number }> = {};

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  habits.forEach(habit => {
    const cat = habit.category || 'Uncategorized';
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { completed: 0, possible: 0 };
    }

    let habitBestStreak = 0;
    let habitCurrentStreak = 0;
    let tempStreak = 0;

    // We'll analyze the last 90 days for streak and rate
    for (let i = 0; i < 90; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      // Check if habit was scheduled for this day
      const dayOfWeek = d.getDay();
      const isScheduled = habit.frequency === 'DAILY' || 
                          (habit.frequency === 'WEEKLY' && habit.daysOfWeek?.includes(dayOfWeek));

      if (isScheduled) {
        totalPossible++;
        const completed = completions[habit.id]?.[d.toISOString().split('T')[0]] || false;
        const isActuallyCompleted = typeof completed === 'object' ? completed.completed : completed;

        if (isActuallyCompleted) {
          totalCompleted++;
          categoryCounts[cat].completed++;
          categoryCounts[cat].possible++;
          tempStreak++;
        } else {
          habitBestStreak = Math.max(habitBestStreak, tempStreak);
          tempStreak = 0;
        }
      }
    }
    
    habitBestStreak = Math.max(habitBestStreak, tempStreak);
    globalBestStreak = Math.max(globalBestStreak, habitBestStreak);
    
    // Calculate current streak (counting backwards from today)
    let currentStreak = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayOfWeek = d.getDay();
      const isScheduled = habit.frequency === 'DAILY' || 
                          (habit.frequency === 'WEEKLY' && habit.daysOfWeek?.includes(dayOfWeek));
      
      if (isScheduled) {
        const completed = completions[habit.id]?.[d.toISOString().split('T')[0]] || false;
        const isActuallyCompleted = typeof completed === 'object' ? completed.completed : completed;
        if (isActuallyCompleted) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    globalCurrentStreak = Math.max(globalCurrentStreak, currentStreak);
  });

  const categoryPerformance: Record<string, number> = {};
  for (const cat in categoryCounts) {
    const { completed, possible } = categoryCounts[cat];
    categoryPerformance[cat] = possible === 0 ? 0 : Math.round((completed / possible) * 100);
  }

  return {
    totalCompletionRate: totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100),
    bestStreak: globalBestStreak,
    currentStreak: globalCurrentStreak,
    totalCompletions: totalCompleted,
    categoryPerformance
  };
};
