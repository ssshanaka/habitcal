import React, { useMemo } from 'react';
import { Habit } from '../types';
import { analyzeHabitPatterns, calculateDailyDensity, Insight, DensityWarning } from '../utils/analysis';
import { Button } from './Button';
import { AlertTriangle, CheckCircle2, TrendingUp, Clock, ArrowRight, BrainCircuit, ArrowLeft, Sparkles } from 'lucide-react';

interface RoutineConsultantProps {
  habits: Habit[];
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>;
  onBack: () => void;
}

const InsightCard = ({ insight }: { insight: Insight }) => {
  const isWarning = insight.type === 'warning';
  const isPositive = insight.type === 'positive';

  return (
    <div className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
      isWarning ? 'bg-amber-500/5 border-amber-500/20' : 
      isPositive ? 'bg-green-500/5 border-green-500/20' : 
      'bg-gcal-surface/50 border-gcal-border'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isWarning ? 'bg-amber-500/20 text-amber-500' : isPositive ? 'bg-green-500/20 text-green-500' : 'bg-gcal-blue/20 text-gcal-blue'}`}>
          {isWarning ? <AlertTriangle size={18} /> : isPositive ? <CheckCircle2 size={18} /> : <BrainCircuit size={18} />}
        </div>
        <div>
          <p className={`text-sm font-bold mb-1 ${isWarning ? 'text-amber-600' : isPositive ? 'text-green-600' : 'text-gcal-text'}`}>
            {insight.habitTitle}
          </p>
          <p className="text-xs text-gcal-text/80 leading-relaxed">{insight.message}</p>
        </div>
      </div>
    </div>
  );
};

const RoutineConsultant: React.FC<RoutineConsultantProps> = ({ habits, completions, onBack }) => {
  const analysis = useMemo(() => analyzeHabitPatterns(habits, completions), [habits, completions]);
  const density = useMemo(() => calculateDailyDensity(habits), [habits]);

  return (
    <div className="w-full h-full bg-gcal-bg-solid overflow-y-auto p-6 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={onBack} className="rounded-full px-4 gap-2">
            <ArrowLeft size={18} />
            <span>Back to Grid</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gcal-text">Routine Consultant</h1>
            <p className="text-sm text-gcal-muted">Cognitive load & pattern analysis</p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 transition-all ${
          density.intensityScore > 70 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
          density.intensityScore > 40 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
          'bg-green-500/10 border-green-500/20 text-green-500'
        }`}>
          <Clock size={18} />
          <span className="text-sm font-bold">Intensity: {density.intensityScore}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Load Analysis */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glassmorphism p-6 rounded-3xl border border-gcal-border shadow-sm">
            <h3 className="text-sm font-bold text-gcal-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Density Warnings
            </h3>
            
            {density.warnings.length === 0 ? (
              <div className="text-sm text-gcal-muted italic py-4 text-center">
                Your routine is well-balanced. No overload detected.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {density.warnings.map((w, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gcal-surface border border-gcal-border group hover:border-amber-500/50 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gcal-text">{w.startTime} → {w.endTime}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-bold">
                        {w.totalMinutes}m load
                      </span>
                    </div>
                    <p className="text-[11px] text-gcal-muted leading-tight">
                      Too many tasks packed in this window. Consider moving one habit to a quieter time.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glassmorphism p-6 rounded-3xl border border-gcal-border shadow-sm">
            <h3 className="text-sm font-bold text-gcal-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-gcal-blue" />
              Growth Metrics
            </h3>
            <div className="space-y-4">
              {Object.entries(analysis.stats).slice(0, 5).map(([id, stat]) => {
                const habit = habits.find(h => h.id === id);
                return (
                  <div key={id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-gcal-text truncate max-w-[120px]">{habit?.title}</span>
                      <span className="font-bold text-gcal-blue">{Math.round(stat.successRate * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gcal-surface overflow-hidden">
                      <div 
                        className="h-full bg-gcal-blue transition-all duration-1000" 
                        style={{ width: `${stat.successRate * 100}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
              {habits.length > 5 && <p className="text-center text-[10px] text-gcal-muted">And {habits.length - 5} more habits...</p>}
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Pattern Insights */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glassmorphism p-6 rounded-3xl border border-gcal-border shadow-sm h-full">
            <h3 className="text-sm font-bold text-gcal-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <BrainCircuit size={16} className="text-purple-500" />
              Behavioral Insights
            </h3>
            
            {analysis.insights.length === 0 ? (
              <div className="text-sm text-gcal-muted italic py-20 text-center">
                Not enough data yet. Keep tracking your habits to unlock AI insights!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.insights
                  .sort((a, b) => b.priority - a.priority)
                  .map((insight, i) => (
                    <InsightCard key={i} insight={insight} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optimization Footer */}
      <div className="mt-auto p-6 glassmorphism rounded-3xl border border-gcal-border flex items-center justify-between bg-gradient-to-r from-gcal-blue/5 to-purple-500/5">
        <div>
          <h4 className="text-sm font-bold text-gcal-text">Ready to optimize?</h4>
          <p className="text-xs text-gcal-muted">I can suggest a new staggered schedule to eliminate your burnout risks.</p>
        </div>
        <Button 
          variant="gradient" 
          className="gap-2 rounded-full px-6"
          onClick={() => {
             // Trigger AI Architect with a specific prompt
             window.dispatchEvent(new CustomEvent('open-ai-architect', { detail: 'optimize_load' }));
          }}
        >
          <Sparkles size={16} />
          <span>Optimize Routine</span>
        </Button>
      </div>
    </div>
  );
};

export default RoutineConsultant;
