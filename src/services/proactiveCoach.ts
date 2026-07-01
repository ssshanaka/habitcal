import { Habit } from '../types';
import { analyzeHabitPatterns, Insight } from '../utils/analysis';
import { WeatherData } from '../types';

/**
 * ProactiveCoach handles the logic of combining habit patterns, 
 * environmental data (weather), and user state to provide 
 * "AI-like" proactive coaching tips.
 */
export const generateProactiveInsight = (
  habits: Habit[],
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>,
  weather: WeatherData | null
): Insight[] => {
  // 1. Get base insights from the pattern analysis utility
  const baseInsights = analyzeHabitPatterns(habits, completions);
  const finalInsights: Insight[] = [...baseInsights];

  if (!weather) return finalInsights;

  // 2. Weather-based Proactive Logic
  // Keywords that suggest a habit is typically outdoor or environment-sensitive
  const outdoorKeywords = ['walk', 'run', 'gym', 'cycle', 'exercise', 'outdoor', 'jog', 'sport', 'hiking', 'yoga'];
  const indoorKeywords = ['read', 'code', 'meditate', 'study', 'write', 'clean', 'cook'];

  habits.forEach(habit => {
    const titleLower = habit.title.toLowerCase();
    const descLower = (habit.description || '').toLowerCase();
    const isOutdoor = outdoorKeywords.some(k => titleLower.includes(k) || descLower.includes(k)) || habit.category === 'Health';
    const isIndoor = indoorKeywords.some(k => titleLower.includes(k) || descLower.includes(k));

    // Rainy Weather -> Warning for outdoor habits
    if (weather.isRainy && isOutdoor) {
      finalInsights.push({
        habitTitle: habit.title,
        message: `It's raining outside! 🌧️ Consider swapping your "${habit.title}" for an indoor activity or moving it to a different time to keep your streak alive.`,
        type: 'warning',
        color: 'text-amber-500',
        priority: 5, // High priority
      });
    }

    // Sunny Weather -> Encouragement for outdoor habits
    if (weather.isSunny && isOutdoor) {
      finalInsights.push({
        habitTitle: habit.title,
        message: `Perfect sunny weather! ☀️ It's a great day to get your "${habit.title}" done outdoors and soak up some Vitamin D.`,
        type: 'positive',
        color: 'text-green-500',
        priority: 2,
      });
    }

    // Windy Weather -> Warning for wind-sensitive habits
    if (weather.isWindy && isOutdoor) {
      finalInsights.push({
        habitTitle: habit.title,
        message: `It's quite windy today! 💨 If your "${habit.title}" is wind-sensitive, you might want to adjust your plan.`,
        type: 'warning',
        color: 'text-blue-400',
        priority: 3,
      });
    }
  });

  // Sort by priority (descending)
  return finalInsights.sort((a, b) => b.priority - a.priority);
};
