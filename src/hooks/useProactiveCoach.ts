import { useEffect, useRef, useState } from 'react';
import { useWeather } from './useWeather';
import { useToast } from './useToast';
import { generateProactiveInsight, getNextHabit } from '../services/proactiveCoach';
import { Habit, Insight } from '../types';

export const useProactiveCoach = (habits: Habit[], completions: Record<string, any>) => {
  const { weather, loading } = useWeather();
  const { addToast } = useToast();
  const lastInsightRef = useRef<string | null>(null);
  const [nextHabit, setNextHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (loading || !dataLoaded(habits, completions)) {
      setNextHabit(null);
      return;
    }

    const currentTime = new Date();
    const insights = generateProactiveInsight(habits, completions, weather, currentTime);
    
    if (insights.length > 0) {
      const topInsight = insights[0];
      const insightId = `${topInsight.habitTitle}_${topInsight.message}`;

      if (lastInsightRef.current !== insightId) {
        addToast(
          `Coach Tip: ${topInsight.message}`, 
          topInsight.type === 'positive' ? 'success' : topInsight.type === 'warning' ? 'info' : 'info'
        );
        lastInsightRef.current = insightId;
      }
    }

    const habit = getNextHabit(habits, completions, currentTime);
    setNextHabit(habit);
  }, [weather, habits, completions, loading, addToast]);

  return { nextHabit };
};

// Helper to check if data is loaded
function dataLoaded(habits: Habit[], completions: Record<string, any>) {
  return habits.length > 0 || Object.keys(completions).length > 0;
}
