import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Habit } from '../types';
import { useWeather } from '../hooks/useWeather';
import { generateProactiveInsight } from '../services/proactiveCoach';

interface NextUpSpotlightProps {
  habits: Habit[];
  completions: Record<string, any>;
}

const NextUpSpotlight: React.FC<NextUpSpotlightProps> = ({ habits, completions }) => {
  const { weather, loading } = useWeather();

  const topInsight = useMemo(() => {
    if (loading) return null;
    const insights = generateProactiveInsight(habits, completions, weather, new Date());
    return insights.length > 0 ? insights[0] : null;
  }, [habits, completions, weather, loading]);

  if (loading) return null;

  return (
    <div className="px-4 py-3 mb-4 glassmorphism rounded-2xl border border-gcal-blue/20 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gcal-blue/10 rounded-lg">
          <Sparkles className="text-gcal-blue" size={18} />
        </div>
        <div className="flex-1">
          {topInsight ? (
            <>
              <p className="text-xs font-bold text-gcal-blue uppercase tracking-wider mb-0.5">Coach's Recommendation</p>
              <p className="text-sm text-gcal-text font-medium leading-relaxed">
                {topInsight.message}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-gcal-muted uppercase tracking-wider mb-0.5">Ready to go?</p>
              <p className="text-sm text-gcal-text font-medium leading-relaxed">
                Select a habit to begin your routine.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextUpSpotlight;
