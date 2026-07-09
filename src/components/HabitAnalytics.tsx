import React from 'react';
import { TrendingUp, Target, Flame, BarChart3, Award } from 'lucide-react';
import { Habit } from '../types';
import { calculateAnalytics, AnalyticsSummary } from '../utils/analytics';
import { Button } from './Button';

interface HabitAnalyticsProps {
  habits: Habit[];
  completions: Record<string, any>;
}

const StatsCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; description: string }> = ({ title, value, icon, color, description }) => (
  <div className="glassmorphism p-6 rounded-2xl border border-gcal-border flex flex-col gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="flex justify-between items-start">
      <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-current`}>
        {icon}
      </div>
      <TrendingUp size={16} className="text-gcal-muted" />
    </div>
    <div>
      <p className="text-xs font-bold text-gcal-muted uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-black text-gcal-text mt-1">{value}</h3>
      <p className="text-xs text-gcal-muted mt-1">{description}</p>
    </div>
  </div>
);

const HabitAnalytics: React.FC<HabitAnalyticsProps> = ({ habits, completions }) => {
  const stats = calculateAnalytics(habits, completions);

  return (
    <div className="p-6 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gcal-text">Consistency Analytics</h2>
          <p className="text-gcal-muted">Deep dive into your habit performance</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => window.print()} className="text-xs">Export Report</Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Completion Rate" 
          value={`${stats.totalCompletionRate}%`} 
          icon={<Target size={20} />} 
          color="text-gcal-blue bg-gcal-blue"
          description="Avg. across all habits (last 90d)" 
        />
        <StatsCard 
          title="Best Streak" 
          value={`${stats.bestStreak}d`} 
          icon={<Flame size={20} />} 
          color="text-orange-500 bg-orange-500"
          description="Longest consistency run" 
        />
        <StatsCard 
          title="Current Streak" 
          value={`${stats.currentStreak}d`} 
          icon={<Award size={20} />} 
          color="text-purple-500 bg-purple-500"
          description="Active consistency run" 
        />
        <StatsCard 
          title="Total Wins" 
          value={stats.totalCompletions} 
          icon={<CheckCircle size={20} />} 
          color="text-green-500 bg-green-500"
          description="Total completions (last 90d)" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 glassmorphism p-6 rounded-2xl border border-gcal-border">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-gcal-blue" />
            <h3 className="font-bold text-gcal-text">Category Performance</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.categoryPerformance).map(([cat, rate]) => (
              <div key={cat} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gcal-text">{cat}</span>
                  <span className="text-xs font-bold text-gcal-blue">{rate}%</span>
                </div>
                <div className="w-full h-2 bg-gcal-muted/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gcal-blue to-purple-500 transition-all duration-1000 rounded-full" 
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(stats.categoryPerformance).length === 0 && (
              <p className="text-center text-gcal-muted py-8">No category data available.</p>
            )}
          </div>
        </div>

        {/* Insight Card */}
        <div className="glassmorphism p-6 rounded-2xl border border-gcal-blue/30 bg-gcal-blue/5 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
             <Award size={120} className="text-gcal-blue" />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-gcal-text mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-gcal-blue" />
              Zero's Analysis
            </h3>
            <div className="text-sm text-gcal-muted leading-relaxed space-y-4">
              {stats.totalCompletionRate > 80 
                ? "Your consistency is elite. You're operating at a high-performance level. Focus on expanding your horizons with new, challenging habits." 
                : stats.totalCompletionRate > 50 
                ? "Good progress. You've built a solid foundation. To reach the next level, identify the 'friction points' in your lowest performing category." 
                : "The start is always the hardest. Focus on just ONE habit for the next 7 days to build momentum. Small wins lead to big victories."}
              
              <div className="p-3 rounded-xl bg-gcal-surface/50 border border-gcal-border italic">
                "{stats.bestStreak > 0 ? `Your peak was ${stats.bestStreak} days. You know you're capable of it. Let's get back there.` : 'Every streak starts with a single checkmark. Start today.'}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon since Lucide import might be missing
const CheckCircle = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default HabitAnalytics;
