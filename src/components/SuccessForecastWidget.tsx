import React, { useMemo } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Habit, WeatherData } from '../types';
import { formatDateKey } from '../utils';
import { analyzeHabitPatterns, Insight } from '../utils/analysis';

interface SuccessForecastWidgetProps {
  habits: Habit[];
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>;
  weather: WeatherData | null;
}

interface ForecastResult {
  habitTitle: string;
  message: string;
  type: 'warning' | 'positive' | 'neutral';
  color: string;
}

const SuccessForecastWidget: React.FC<SuccessForecastWidgetProps> = ({ habits, completions, weather }) => {
  const forecast = useMemo(() => {
    if (habits.length === 0) return null;

    // 1. Get data-driven insights from the analysis engine
    const dataInsights = analyzeHabitPatterns(habits, completions);
    
    // Sort insights by priority (highest first)
    const topDataInsight = dataInsights.sort((a, b) => b.priority - a.priority)[0];

    // 2. Calculate Heuristic-based insights (Weather/Time)
    let heuristicInsight: ForecastResult | null = null;
    if (weather) {
      const today = new Date();
      
      for (const habit of habits) {
        // Heuristic: Rainy weather vs "Outdoor" habits
        const isOutdoorHabit = /outdoor|run|walk|jog|bike|gym|park|nature|garden/i.test(habit.title + ' ' + (habit.description || ''));
        if (weather.isRainy && isOutdoorHabit) {
          heuristicInsight = {
            habitTitle: habit.title,
            message: `It's raining! Your consistency with "${habit.title}" usually drops in this weather. Try moving it indoors or adjusting your timing.`,
            type: 'warning',
            color: 'text-amber-500',
          };
          break;
        }

        // Heuristic: Sunny weather vs "Indoor" habits
        const isIndoorHabit = /read|study|meditate|write|code|watch|listen|yoga/i.test(habit.title + ' ' + (habit.description || ''));
        if (weather.isSunny && isIndoorHabit) {
          heuristicInsight = {
            habitTitle: habit.title,
            message: `Perfect sunny day! It's a great time to stay focused on "${habit.title}" before heading out.`,
            type: 'positive',
            color: 'text-green-500',
          };
          break;
        }
      }
    }

    // Time-based heuristic (Global check)
    const hour = new Date().getHours();
    const earlyMorningHabit = habits.find(h => h.timeStart && parseInt(h.timeStart.split(':')[0]) < 8);
    if (hour >= 22 && earlyMorningHabit) {
      heuristicInsight = {
        habitTitle: earlyMorningHabit.title,
        message: `To stay consistent with "${earlyMorningHabit.title}" tomorrow morning, try heading to bed soon!`,
        type: 'warning',
        color: 'text-blue-400',
      };
    }

    // 3. Final Selection Logic:
    // Priority: Data-driven Warning > Heuristic Warning > Data-driven Positive > Heuristic Positive > General
    
    if (topDataInsight && topDataInsight.type === 'warning') return topDataInsight;
    if (heuristicInsight && heuristicInsight.type === 'warning') return heuristicInsight;
    if (topDataInsight && topDataInsight.type === 'positive') return topDataInsight;
    if (heuristicInsight && heuristicInsight.type === 'positive') return heuristicInsight;
    if (topDataInsight) return topDataInsight;
    if (heuristicInsight) return heuristicInsight;

    return {
      habitTitle: 'General Consistency',
      message: "You're on track! Keep up the great momentum today.",
      type: 'neutral',
      color: 'text-gcal-text',
    };
  }, [habits, completions, weather]);

  if (!forecast) return null;

  const Icon = forecast.type === 'warning' ? AlertTriangle :
              forecast.type === 'positive' ? CheckCircle2 :
              forecast.type === 'neutral' ? Sparkles : Info;

  const bgClass = forecast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                  forecast.type === 'positive' ? 'bg-green-500/10 border-green-500/20' :
                  'bg-blue-500/10 border-blue-500/20';

  return (
    <div className={`col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br ${bgClass} border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}>
      {/* Decorative Background Icon */}
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
        <Icon size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${forecast.type === 'warning' ? 'bg-amber-500/20 text-amber-500' : 
                                                       forecast.type === 'positive' ? 'bg-green-500/20 text-green-500' : 
                                                       'bg-blue-500/20 text-blue-500'}`}>
            <Icon size={22} />
          </div>
          <div>
            <h3 className="font-bold text-gcal-text text-lg">Success Forecast</h3>
            <div className="text-xs text-gcal-muted uppercase tracking-widest font-medium">
              {forecast.habitTitle}
            </div>
          </div>
        </div>

        <p className={`text-sm md:text-base leading-relaxed ${forecast.type === 'warning' ? 'text-amber-700/80' : 
                                                      forecast.type === 'positive' ? 'text-green-700/80' : 
                                                      'text-gcal-text/80'}`}>
          {forecast.message}
        </p>
      </div>
    </div>
  );
};

export default SuccessForecastWidget;
