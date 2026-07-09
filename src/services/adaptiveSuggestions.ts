import { Habit } from '../types';
import { WeatherData } from './weather';
import { aiRoutineArchitect } from './aiRoutineArchitect';

export interface Suggestion {
  originalHabitId: string;
  originalTitle: string;
  suggestedTitle: string;
  reason: string;
  suggestedColor: string;
}

export const adaptiveSuggestions = {
  async getSuggestions(habits: Habit[], weather: WeatherData | null): Promise<Suggestion[]> {
    if (!weather) return [];

    const suggestions: Suggestion[] = [];
    const condition = weather.condition.toLowerCase();

    const weatherSensitiveKeywords = ['run', 'jog', 'walk', 'outdoor', 'gym', 'hike', 'cycling', 'swim', 'park'];
    const badWeatherConditions = ['rainy', 'stormy', 'rain', 'storm', 'heavy rain'];
    const isBadWeather = badWeatherConditions.some(c => condition.includes(c));

    for (const habit of habits) {
      const title = habit.title.toLowerCase();
      const isSensitive = weatherSensitiveKeywords.some(keyword => title.includes(keyword));

      if (isSensitive && isBadWeather) {
        try {
          const response = await aiRoutineArchitect.generatePackage({
            goal: `indoor alternative for ${habit.title} due to ${weather.condition} weather`
          });

          if (response.habits.length > 0) {
            const suggested = response.habits[0];
            suggestions.push({
              originalHabitId: habit.id,
              originalTitle: habit.title,
              suggestedTitle: suggested.title,
              reason: `It's ${weather.condition} outside. How about this instead?`,
              suggestedColor: suggested.color
            });
          }
        } catch (err) {
          console.error('AI suggestion generation failed:', err);
          if (title.includes('run') || title.includes('jog')) {
            suggestions.push({
              originalHabitId: habit.id,
              originalTitle: habit.title,
              suggestedTitle: 'Indoor Cardio',
              reason: 'Rainy weather detected. Switch to indoor training.',
              suggestedColor: '#3B82F6'
            });
          }
        }
      }
    }

    return suggestions;
  }
};
