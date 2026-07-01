import { Habit } from '../types';
import { WeatherData } from './weather';

export interface Suggestion {
  originalHabitId: string;
  originalTitle: string;
  suggestedTitle: string;
  reason: string;
  suggestedColor: string;
}

export const adaptiveSuggestions = {
  getSuggestions(habits: Habit[], weather: WeatherData | null): Suggestion[] {
    if (!weather) return [];

    const suggestions: Suggestion[] = [];
    const condition = weather.condition.toLowerCase();
    
    const weatherMappings: Record<string, { keyword: string; alt: string; reason: string; color: string }>[] = {
      rainy: [
        { keyword: 'run', alt: 'Indoor Cardio', reason: 'It\'s raining outside! Keep the momentum indoors.', color: '#3B82F6' },
        { keyword: 'jog', alt: 'Treadmill Session', reason: 'Rainy weather detected. Switch to treadmill.', color: '#3B82F6' },
        { keyword: 'walk', alt: 'Yoga / Stretching', reason: 'Bad weather for a walk. How about some indoor yoga?', color: '#10B981' },
        { keyword: 'outdoor', alt: 'Indoor Alternative', reason: 'Avoid the rain with an indoor session.', color: '#8B5CF6' },
      ],
      cloudy: [
        { keyword: 'sun', alt: 'Reading / Study', reason: 'Cloudy day — perfect for deep focus and learning.', color: '#F59E0B' },
      ],
      clear: [
        { keyword: 'gym', alt: 'Outdoor Park Workout', reason: 'The weather is beautiful! Take your workout outside.', color: '#EF4444' },
      ],
      stormy: [
        { keyword: 'run', alt: 'Home HIIT', reason: 'Stormy weather is dangerous for running. Try HIIT at home.', color: '#EF4444' },
        { keyword: 'walk', alt: 'Meditation', reason: 'Stay safe indoors. Use this time for mindfulness.', color: '#10B981' },
      ]
    };

    const currentCondition = Object.keys(weatherMappings).find(c => condition.includes(c)) || 'clear';
    const mappings = weatherMappings[currentCondition] || [];

    habits.forEach(habit => {
      const title = habit.title.toLowerCase();
      const match = mappings.find(m => title.includes(m.keyword));
      
      if (match) {
        suggestions.push({
          originalHabitId: habit.id,
          originalTitle: habit.title,
          suggestedTitle: match.alt,
          reason: match.reason,
          suggestedColor: match.color
        });
      }
    });

    return suggestions;
  }
};
