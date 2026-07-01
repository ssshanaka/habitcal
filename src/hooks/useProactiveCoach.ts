import { useEffect, useRef } from 'react';
import { useWeather } from './useWeather';
import { useToast } from './useToast';
import { generateProactiveInsight } from '../services/proactiveCoach';
import { Habit } from '../types';

export const useProactiveCoach = (habits: Habit[], completions: Record<string, any>) => {
  const { weather, loading } = useWeather();
  const { addToast } = useToast();
  const lastInsightRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !dataLoaded(habits, completions)) return;

    const insights = generateProactiveInsight(habits, completions, weather);
    
    if (insights.length > 0) {
      const topInsight = insights[0];
      const insightId = `${topInsight.habitTitle}_${topInsight.message}`;

      if (lastInsightRef.current !== insightId) {
        addToast(
          `Coach Tip: ${topInsight.message}`, 
          topInsight.type === 'positive' ? 'success' : topInsight.type === 'warning' ? 'warning' : 'info'
        );
        lastInsightRef.current = insightId;
      }
    }
  }, [weather, habits, completions, loading, addToast]);
};

// Helper to check if data is loaded
function dataLoaded(habits: Habit[], completions: Record<string, any>) {
  return habits.length > 0 || Object.keys(completions).length > 0;
}
