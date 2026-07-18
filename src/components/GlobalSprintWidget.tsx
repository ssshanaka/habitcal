import React, { useEffect, useState } from 'react';
import { Users, Trophy, Zap } from 'lucide-react';
import { GlobalSprint, SprintUserProgress, sprintsService } from '../services/sprints';
import { supabase } from '@/lib/supabase';

const GlobalSprintWidget: React.FC = () => {
  const [sprint, setSprint] = useState<GlobalSprint | null>(null);
  const [userProgress, setUserProgress] = useState<SprintUserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSprintData() {
      try {
        const activeSprint = await sprintsService.fetchActiveSprint();
        if (activeSprint) {
          setSprint(activeSprint);
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const progress = await sprintsService.getUserProgress(user.id, activeSprint.id);
            setUserProgress(progress);
          }
        }
      } catch (e) {
        console.error('Sprint load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSprintData();
  }, []);

  if (loading) return null;
  if (!sprint) return null;

  const globalPercentage = Math.min(Math.round((sprint.currentProgress / sprint.globalGoal) * 100), 100);

  return (
    <div className="w-full max-w-md p-4 rounded-2xl bg-gradient-to-br from-gcal-blue/20 via-purple-500/10 to-transparent border border-gcal-blue/30 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-gcal-blue/20 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gcal-blue text-white animate-pulse">
            <Zap size={14} fill="currentColor" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gcal-blue">Global Sprint</span>
        </div>
        <div className="flex items-center gap-1 text-gcal-muted">
          <Users size={12} />
          <span className="text-[10px] font-bold">{sprint.currentProgress.toLocaleString()} completions</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gcal-text mb-1 group-hover:text-gcal-blue transition-colors">
        {sprint.title}
      </h3>
      <p className="text-xs text-gcal-muted mb-4 line-clamp-1">
        {sprint.description}
      </p>

      <div className="space-y-3">
        {/* Global Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold uppercase text-gcal-muted tracking-tighter">Community Progress</span>
            <span className="text-xs font-black text-gcal-blue">{globalPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gcal-muted/20 rounded-full overflow-hidden border border-gcal-border/50">
            <div 
              className="h-full bg-gradient-to-r from-gcal-blue to-purple-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${globalPercentage}%` }}
            />
          </div>
        </div>

        {/* User Progress */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gcal-surface/50 border border-gcal-border transition-all duration-200 group-hover:bg-gcal-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
              <Trophy size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gcal-muted">Your Contribution</p>
              <p className="text-sm font-bold text-gcal-text">
                {userProgress?.completedDays || 0} days completed
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-gcal-blue bg-gcal-blue/10 px-2 py-1 rounded-lg">
              +{userProgress?.completedDays || 0} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSprintWidget;
