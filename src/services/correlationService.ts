import { Habit, Completion } from '../types';
import { WeatherData } from './weather';

export interface CorrelationInsight {
  type: 'weather' | 'habit-to-habit' | 'time-of-day';
  title: string;
  message: string;
  iconName: string;
  color: string;
}

export const correlationService = {
  async getInsights(
    habits: Habit[],
    completions: Record<string, any>,
    currentWeather: WeatherData | null
  ): Promise<CorrelationInsight[]> {
    const insights: CorrelationInsight[] = [];

    const timeInsight = this.analyzeTimeOfDay(habits, completions);
    if (timeInsight) insights.push(timeInsight);

    const habitInsight = this.analyzeHabitConnections(habits, completions);
    if (habitInsight) insights.push(habitInsight);

    const weatherInsight = this.analyzeWeather(currentWeather);
    if (weatherInsight) insights.push(weatherInsight);

    return insights;
  },

  private analyzeTimeOfDay(habits: Habit[], completions: Record<string, any>): CorrelationInsight | null {
    const hourCounts: Record<number, number> = {};
    let total = 0;

    Object.entries(completions).forEach(([key, value]) => {
      const isCompleted = typeof value === 'boolean' ? value : value.completed;
      if (isCompleted && value.timestamp) {
        const hour = new Date(value.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        total++;
      }
    });

    if (total < 10) return null;

    let maxHour = -1;
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([hStr, count]) => {
      const h = parseInt(hStr, 10);
      if (count > maxCount) {
        maxCount = count;
        maxHour = h;
      }
    });

    if (maxHour !== -1) {
      const period = this.getPeriod(maxHour);
      const percentage = Math.round((maxCount / total) * 100);
      return {
        type: 'time-of-day',
        title: 'Peak Productivity',
        message: `Your peak completion time is in the ${period}, accounting for ${percentage}% of your activity.`,
        iconName: 'Clock',
        color: 'text-purple-400'
      };
    }

    return null;
  },

  private analyzeHabitConnections(habits: Habit[], completions: Record<string, any>): CorrelationInsight | null {
    // Find most frequent habit
    const habitCounts: Record<string, number> = {};
    Object.entries(completions).forEach(([key, value]) => {
      const isCompleted = typeof value === 'boolean' ? value : value.completed;
      if (isCompleted) {
        const [hId] = key.split('_');
        habitCounts[hId] = (habitCounts[hId] || 0) + 1;
      }
    });

    const sortedHabits = Object.entries(habitCounts).sort((a, b) => b[1] - a[1]);
    if (sortedHabits.length < 2) return null;

    // Check for co-occurrence on the same day
    // For simplicity, let's just find if the top 2 habits often happen on the same day
    const top1Id = sortedHabits[0][0];
    const top2Id = sortedHabits[1][0];
    
    let bothCount = 0;
    let top1Count = 0;

    Object.entries(completions).forEach(([key, value]) => {
      const isCompleted = typeof value === 'boolean' ? value : value.completed;
      if (isCompleted) {
        const [hId, date] = key.split('_');
        if (hId === top1Id) top1Count++;
        if (hId === top1Id || hId === top2Id) {
           // This is not quite right for co-occurrence. 
           // We need to check if BOTH exist for the same date.
        }
      }
    });

    // Let's try a different approach for co-occurrence:
    // Iterate over all dates present in completions
    const dates = new Set<string>();
    Object.keys(completions).forEach(k => dates.add(k.split('_')[1]));

    let coOccurrence = 0;
    dates.forEach(date => {
      const hasTop1 = completions[`${top1Id}_${date}`]?.completed || completions[`${top1Id}_${date}`];
      const hasTop2 = completions[`${top2Id}_${date}`]?.completed || completions[`${top2Id}_${date}`];
      if (hasTop1 && hasTop2) coOccurrence++;
    });

    if (coOccurrence > 0 && top1Count > 0) {
      const habit1 = habits.find(h => h.id === top1Id);
      const habit2 = habits.find(h => h.id === top2Id);
      if (habit1 && habit2) {
        return {
          type: 'habit-to-habit',
          title: 'Habit Synergy',
          message: `You're ${Math.round((coOccurrence / top1Count) * 100)}% more likely to complete "${habit2.title}" when you finish "${habit1.title}".`,
          iconName: 'Zap',
          color: 'text-orange-400'
        };
      }
    }

    return null;
  },

  private analyzeWeather(weather: WeatherData | null): CorrelationInsight | null {
    // Since we don't have historical weather, we provide a "momentum" insight
    // based on current weather and the user's general trends.
    if (!weather) return null;

    if (weather.isRainy) {
      return {
        type: 'weather',
        title: 'Weather Context',
        message: 'It is raining. You might want to focus on your indoor habits today!',
        iconName: 'CloudRain',
        color: 'text-blue-400'
      };
    }

    if (weather.isSunny) {
      return {
        type: 'weather',
        title: 'Weather Context',
        message: 'Sunny day! Great time for those outdoor routines.',
        iconName: 'Sun',
        color: 'text-orange-400'
      };
    }

    return null;
  },

  private getPeriod(hour: number): string {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 22) return 'Evening';
    return 'Night';
  }
};
