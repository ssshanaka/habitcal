import { Habit } from '../types';
import { formatDateKey, getPreviousDay } from './index';

export interface Insight {
  habitTitle: string;
  message: string;
  type: 'warning' | 'positive' | 'neutral';
  color: string;
  priority: number; // Higher = more important to show
}

export interface HabitStats {
  successRate: number;
  momentum: number; // 7d rate / 30d rate. < 1 = declining, > 1 = improving
  typicalTimeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
}

export interface AnalysisResult {
  insights: Insight[];
  stats: Record<string, HabitStats>;
}

/**
 * Analyzes habit completion patterns to provide proactive coaching insights.
 */
export const analyzeHabitPatterns = (
  habits: Habit[],
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>
): AnalysisResult => {
  const insights: Insight[] = [];
  const stats: Record<string, HabitStats> = {};
  const today = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  habits.forEach(habit => {
    const habitId = habit.id;
    const history: { date: Date; completed: boolean; hour?: number }[] = [];
    
    // Analyze last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const key = `${habitId}_${formatDateKey(date)}`;
      const comp = completions[key];
      const isCompleted = typeof comp === 'boolean' ? comp : comp?.completed;
      let hour: number | undefined = undefined;
      if (isCompleted && typeof comp !== 'boolean' && comp?.timestamp) {
        hour = new Date(comp.timestamp).getHours();
      }
      history.push({ date, completed: !!isCompleted, hour });
    }

    const totalDays = history.length;
    const completedDays = history.filter(h => h.completed).length;
    const successRate = completedDays / totalDays;

    // Momentum calculation: last 7 days vs last 30 days
    const last7Days = history.slice(0, 7);
    const completed7Days = last7Days.filter(h => h.completed).length;
    const rate7d = completed7Days / last7Days.length;
    const momentum = successRate > 0 ? rate7d / successRate : (rate7d > 0 ? 2 : 1);

    // Time of Day Analysis
    const timeCounts = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    history.forEach(h => {
      if (h.completed && h.hour !== undefined) {
        const hour = h.hour;
        if (hour >= 5 && hour < 12) timeCounts.Morning++;
        else if (hour >= 12 && hour < 17) timeCounts.Afternoon++;
        else if (hour >= 17 && hour < 22) timeCounts.Evening++;
        else timeCounts.Night++;
      }
    });

    let typicalTimeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night' = 'Morning';
    let maxCount = -1;
    (Object.keys(timeCounts) as Array<'Morning' | 'Afternoon' | 'Evening' | 'Night'>).forEach(bucket => {
      if (timeCounts[bucket] > maxCount) {
        maxCount = timeCounts[bucket];
        typicalTimeOfDay = bucket;
      }
    });

    stats[habitId] = { successRate, momentum, typicalTimeOfDay };

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

  return { insights, stats };
};
