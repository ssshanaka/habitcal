import { Habit } from '../types';
import { formatDateKey, getPreviousDay } from './index';

export interface Insight {
  habitTitle: string;
  message: string;
  type: 'warning' | 'positive' | 'neutral';
  color: string;
  priority: number; // Higher = more important to show
}

/**
 * Analyzes habit completion patterns to provide proactive coaching insights.
 */
export const analyzeHabitPatterns = (
  habits: Habit[],
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>
): Insight[] => {
  const insights: Insight[] = [];
  const today = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  habits.forEach(habit => {
    const habitId = habit.id;
    const history: { date: Date; completed: boolean }[] = [];
    
    // Analyze last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const key = `${habitId}_${formatDateKey(date)}`;
      const comp = completions[key];
      const isCompleted = typeof comp === 'boolean' ? comp : comp?.completed;
      history.push({ date, completed: !!isCompleted });
    }

    const totalDays = history.length;
    const completedDays = history.filter(h => h.completed).length;
    const successRate = completedDays / totalDays;

    // 1. Day-of-Week Correlation
    const dayCounts = new Array(7).fill(0);
    const dayCompletions = new Array(7).fill(0);

    history.forEach(h => {
      const day = h.date.getDay();
      dayCounts[day]++;
      if (h.completed) dayCompletions[day]++;
    });

    let weakestDayIdx = -1;
    let minRate = 1.1;

    dayCounts.forEach((count, idx) => {
      if (count > 0) {
        const rate = dayCompletions[idx] / count;
        if (rate < minRate) {
          minRate = rate;
          weakestDayIdx = idx;
        }
      }
    });

    if (weakestDayIdx !== -1 && minRate < 0.5 && completedDays > 0) {
      insights.push({
        habitTitle: habit.title,
        message: `I've noticed your consistency with "${habit.title}" often dips on ${daysOfWeek[weakestDayIdx]}s. Try scheduling it at a different time or setting a stronger reminder for that day.`,
        type: 'warning',
        color: 'text-amber-500',
        priority: 3,
      });
    }

    // 2. High Success Rate (Positive reinforcement)
    if (successRate > 0.8 && completedDays > 5) {
      insights.push({
        habitTitle: habit.title,
        message: `You're absolutely crushing "${habit.title}" with a ${Math.round(successRate * 100)}% success rate this month! Your momentum is incredible.`,
        type: 'positive',
        color: 'text-green-500',
        priority: 1,
      });
    }

    // 3. Recovery Opportunity (Low success but recent win)
    if (successRate < 0.3 && history[0].completed) {
      insights.push({
        habitTitle: habit.title,
        message: `Great job getting back on track with "${habit.title}" today! Let's turn this into a new streak.`,
        type: 'positive',
        color: 'text-blue-500',
        priority: 2,
      });
    }
  });

  return insights;
};
