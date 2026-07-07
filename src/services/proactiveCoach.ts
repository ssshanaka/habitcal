import { Habit, HabitEnvironment } from '../types';
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
  weather: WeatherData | null,
  currentTime: Date = new Date()
): Insight[] => {
  // 1. Get base insights and stats from the pattern analysis utility
  const { insights: baseInsights, stats } = analyzeHabitPatterns(habits, completions);
  const finalInsights: Insight[] = [...baseInsights];

  if (!weather) return finalInsights;

  // 2. Weather-based Proactive Logic
  const currentHour = currentTime.getHours();
  let currentBucket: 'Morning' | 'Afternoon' | 'Evening' | 'Night' = 'Night';
  if (currentHour >= 5 && currentHour < 12) currentBucket = 'Morning';
  else if (currentHour >= 12 && currentHour < 17) currentBucket = 'Afternoon';
  else if (currentHour >= 17 && currentHour < 22) currentBucket = 'Evening';
  else currentBucket = 'Night';

  // Mapping of outdoor activities to indoor alternatives for the "Smart Swap" feature
  const SMART_SWAPS: Record<string, string> = {
    'run': '15-min yoga or indoor walking',
    'jog': 'indoor walking or stretching',
    'walk': 'reading or meditation',
    'cycle': 'bodyweight exercises',
    'gym': 'at-home fitness routine',
    'hiking': 'indoor stretching',
    'sport': 'light indoor activity',
    'exercise': 'stretching'
  };

  habits.forEach(habit => {
    const titleLower = habit.title.toLowerCase();
    const descLower = (habit.description || '').toLowerCase();
    
    // Use the new environment field if available, otherwise fallback to keyword detection
    const isOutdoor = habit.environment === HabitEnvironment.OUTDOOR || 
                     (habit.environment === HabitEnvironment.ANY && 
                      ['walk', 'run', 'gym', 'cycle', 'exercise', 'outdoor', 'jog', 'sport', 'hiking', 'yoga'].some(k => titleLower.includes(k) || descLower.includes(k)));
    
    const habitStats = stats[habit.id];
    const isVulnerable = habitStats ? (habitStats.momentum < 0.8 || habitStats.successRate < 0.5) : false;

    // Rainy Weather -> Warning and Smart Swap for outdoor habits
    if (weather.isRainy && isOutdoor) {
      const timeContext = habitStats?.typicalTimeOfDay && habitStats.typicalTimeOfDay !== currentBucket 
        ? ` Since you usually do this in the ${habitStats.typicalTimeOfDay}` 
        : "";

      // Determine the suggested swap
      let suggestedSwap = "an indoor activity";
      for (const [key, value] of Object.entries(SMART_SWAPS)) {
        if (titleLower.includes(key)) {
          suggestedSwap = value;
          break;
        }
      }

      if (isVulnerable) {
        finalInsights.push({
          habitId: habit.id,
          habitTitle: habit.title,
          message: `It's raining, and your momentum for "${habit.title}" has been dipping lately.${timeContext} 🌧️ I highly recommend swapping this for ${suggestedSwap} today to protect your streak!`,
          type: 'warning',
          color: 'text-red-500',
          priority: 6, // Ultra high priority for vulnerable habits
        });
      } else {
        finalInsights.push({
          habitId: habit.id,
          habitTitle: habit.title,
          message: `It's raining outside!${timeContext} 🌧️ Instead of "${habit.title}", how about ${suggestedSwap} to keep your streak alive?`,
          type: 'warning',
          color: 'text-amber-500',
          priority: 5, 
        });
      }
    }

    // Sunny Weather -> Encouragement for outdoor habits
    if (weather.isSunny && isOutdoor) {
      const timeContext = habitStats?.typicalTimeOfDay && habitStats.typicalTimeOfDay !== currentBucket 
        ? ` Since you usually do this in the ${habitStats.typicalTimeOfDay}` 
        : "";

      if (isVulnerable) {
        finalInsights.push({
          habitId: habit.id,
          habitTitle: habit.title,
          message: `The sun is out! ☀️ This is the perfect opportunity to boost your momentum with "${habit.title}" and get back on track.${timeContext}`,
          type: 'positive',
          color: 'text-green-600',
          priority: 3,
        });
      } else {
        finalInsights.push({
          habitId: habit.id,
          habitTitle: habit.title,
          message: `Perfect sunny weather! ☀️ It's a great day to get your "${habit.title}" done outdoors and soak up some Vitamin D.${timeContext}`,
          type: 'positive',
          color: 'text-green-500',
          priority: 2,
        });
      }
    }

    // Windy Weather -> Warning for wind-sensitive habits
    if (weather.isWindy && isOutdoor) {
      const timeContext = habitStats?.typicalTimeOfDay && habitStats.typicalTimeOfDay !== currentBucket 
        ? ` Since you usually do this in the ${habitStats.typicalTimeOfDay}` 
        : "";

      if (isVulnerable) {
        finalInsights.push({
          habitId: habit.id,
          habitTitle: habit.title,
          message: `It's quite windy today! 💨 Given your recent patterns, this might be a tough day for "${habit.title}.${timeContext} Consider a wind-shielded alternative.`,
          type: 'warning',
          color: 'text-blue-600',
          priority: 4,
        });
      } else {
        finalInsights.push({
          habitId: habit.id,
          habitTitle: habit.title,
          message: `It's quite windy today! 💨 If your "${habit.title}" is wind-sensitive, you might want to adjust your plan.${timeContext}`,
          type: 'warning',
          color: 'text-blue-400',
          priority: 3,
        });
      }
    }
  });

  // Sort by priority (descending)
  return finalInsights.sort((a, b) => b.priority - a.priority);
};
