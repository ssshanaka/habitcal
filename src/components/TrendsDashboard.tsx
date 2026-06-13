import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  Clock,
  Flame
} from 'lucide-react';
import { Habit, Completion } from '../types';
import { formatDateKey, getPreviousDay } from '../utils';

interface TrendsDashboardProps {
  habits: Habit[];
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>;
  bestStreak: number;
}

interface HabitStats {
  habitId: string;
  title: string;
  color: string;
  streak: number;
  rate7d: number;
  rate30d: number;
  optimalWindow: string;
}

const TrendsDashboard: React.FC<TrendsDashboardProps> = ({ habits, completions, bestStreak }) => {
  
  const getOptimalWindow = (habit: Habit, completions: Record<string, any>) => {
    const timestamps: string[] = [];
    let totalCompletions = 0;
    
    Object.entries(completions).forEach(([key, value]) => {
      if (key.startsWith(`${habit.id}_`)) {
        const isCompleted = typeof value === 'boolean' ? value : value.completed;
        if (isCompleted) {
          totalCompletions++;
          if (value.timestamp) {
            timestamps.push(value.timestamp);
          }
        }
      }
    });

    if (totalCompletions < 3) {
      return habit.timeStart ? `Around ${habit.timeStart}` : 'Not enough data';
    }

    const hourCounts: Record<number, number> = {};
    timestamps.forEach(ts => {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        const h = d.getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
    });

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
      const start = `${maxHour.toString().padStart(2, '0')}:00`;
      const end = `${(maxHour + 1) % 24}`.padStart(2, '0') + ':00';
      const percent = Math.round((maxCount / totalCompletions) * 100);
      return `Peak: ${start}-${end} (${percent}%)`;
    }

    return habit.timeStart ? `Around ${habit.timeStart}` : 'Not enough data';
  };

  const habitStats = useMemo(() => {
    return habits.map(habit => {
      const completions7d = getCompletionsInRange(habit.id, 7);
      const completions30d = getCompletionsInRange(habit.id, 30);

      const optimalWindow = getOptimalWindow(habit, completions);

      return {
        habitId: habit.id,
        title: habit.title,
        color: habit.color,
        rate7d: Math.round((completions7d / 7) * 100),
        rate30d: Math.round((completions30d / 30) * 100),
        optimalWindow
      };
    });
  }, [habits, completions]);

  const total7d = useMemo(() => {
    let count = 0;
    let d = new Date();
    for (let i = 0; i < 7; i++) {
      Object.keys(completions).forEach(key => {
        const [hId, date] = key.split('_');
        if (date === formatDateKey(d)) count++;
      });
      d = getPreviousDay(d);
    }
    return count;
  }, [completions]);

  const total30d = useMemo(() => {
    let count = 0;
    let d = new Date();
    for (let i = 0; i < 30; i++) {
      Object.keys(completions).forEach(key => {
        const [hId, date] = key.split('_');
        if (date === formatDateKey(d)) count++;
      });
      d = getPreviousDay(d);
    }
    return count;
  }, [completions]);

  const avgRate = useMemo(() => {
    if (habits.length === 0) return 0;
    let recentCompletions = 0;
    let d = new Date();
    for (let i = 0; i < 30; i++) {
        const dk = formatDateKey(d);
        Object.keys(completions).forEach(key => {
            const [hId, date] = key.split('_');
            if (date === dk) recentCompletions++;
        });
        d = getPreviousDay(d);
    }
    return Math.round((recentCompletions / (habits.length * 30)) * 100);
  }, [habits, completions]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gcal-text">Insights & Trends</h1>
          <p className="text-gcal-muted mt-1">Visualize your consistency and progress.</p>
        </div>
        <div className="hidden sm:block">
           <div className="bg-gradient-to-r from-gcal-blue/10 to-purple-500/10 px-4 py-2 rounded-2xl border border-gcal-blue/20">
              <span className="text-sm font-medium text-gcal-blue flex items-center gap-2">
                <TrendingUp size={16} />
                Active Monitoring Enabled
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gcal-surface/50 border border-gcal-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Calendar size={20} />
            </div>
            <span className="text-[10px] font-bold text-gcal-muted uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="text-2xl font-bold text-gcal-text">{total7d}</div>
          <div className="text-xs text-gcal-muted mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-green-500" />
            Total Completions
          </div>
        </div>

        <div className="bg-gcal-surface/50 border border-gcal-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold text-gcal-muted uppercase tracking-widest">Last 30 Days</span>
          </div>
          <div className="text-2xl font-bold text-gcal-text">{total30d}</div>
          <div className="text-xs text-gcal-muted mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-purple-500" />
            Total Completions
          </div>
        </div>

        <div className="bg-gcal-surface/50 border border-gcal-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Flame size={20} />
            </div>
            <span className="text-[10px] font-bold text-gcal-muted uppercase tracking-widest">Peak Performance</span>
          </div>
          <div className="text-2xl font-bold text-gcal-text">{bestStreak} <span className="text-sm font-normal text-gcal-muted">days</span></div>
          <div className="text-xs text-gcal-muted mt-1 flex items-center gap-1">
            <Zap size={12} className="text-orange-500" />
            Best Streak
          </div>
        </div>

        <div className="bg-gcal-surface/50 border border-gcal-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
              <BarChart3 size={20} />
            </div>
            <span className="text-[10px] font-bold text-gcal-muted uppercase tracking-widest">Avg. Consistency</span>
          </div>
          <div className="text-2xl font-bold text-gcal-text">{avgRate}%</div>
          <div className="text-xs text-gcal-muted mt-1 flex items-center gap-1">
            <TrendingUp size={12} className="text-green-500" />
            Monthly Average
          </div>
        </div>
      </div>

      {/* --- Smart Insights Section --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold text-gcal-text flex items-center gap-2">
            <Sparkles size={20} className="text-purple-500" />
            Smart Insights
          </h2>
          <span className="text-[10px] font-bold text-gcal-muted uppercase tracking-widest bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full">
            AI-Powered
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habitStats.map(stat => (
            <div key={stat.habitId} className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group">
               <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gcal-text">{stat.title}</div>
                      <div className="text-xs text-gcal-muted">Optimal Window</div>
                    </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-purple-400">{stat.optimalWindow}</div>
                    <div className="text-[10px] text-gcal-muted mt-1 uppercase tracking-tighter">
                      Based on your habits and routine
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    <TrendingUp size={12} />
                    Increasing
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gcal-text px-1">Habit-Specific Progress</h2>
        <div className="bg-gcal-surface/30 border border-gcal-border rounded-3xl overflow-hidden">
          {habits.length === 0 ? (
            <div className="p-10 text-center text-gcal-muted">No data available.</div>
          ) : (
            <div className="divide-y divide-gcal-border">
              {habitStats.map(stat => (
                <div key={stat.habitId} className="p-5 flex flex-col md:flex-row md:items-center gap-6 hover:bg-gcal-surface/50 transition-all">
                  <div className="flex items-center gap-4 w-full md:w-1/3">
                    <div className="w-10 h-10 rounded-xl shadow-inner" style={{ backgroundColor: stat.color }} />
                    <div>
                      <div className="font-bold text-gcal-text">{stat.title}</div>
                      <div className="text-xs text-gcal-muted">ID: {stat.habitId.slice(0,8)}</div>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gcal-muted flex items-center gap-1"><Calendar size={12} /> 7-Day Rate</span>
                        <span className="text-gcal-text">{stat.rate7d}%</span>
                      </div>
                      <div className="w-full h-2 bg-gcal-surface/40 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${stat.rate7d}%`, backgroundColor: stat.color }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gcal-muted flex items-center gap-1"><Clock size={12} /> 30-Day Rate</span>
                        <span className="text-gcal-text">{stat.rate30d}%</span>
                      </div>
                      <div className="w-full h-2 bg-gcal-surface/40 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${stat.rate30d}%`, backgroundColor: stat.color, opacity: 0.7 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendsDashboard;
