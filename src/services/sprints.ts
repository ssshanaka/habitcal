import { supabase } from '@/lib/supabase';

export interface GlobalSprint {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  targetCategory: string; // e.g., 'Mindset', 'Fitness'
  globalGoal: number; // Total community completions goal
  currentProgress: number;
}

export interface SprintUserProgress {
  sprintId: string;
  userId: string;
  completedDays: number;
  streak: number;
}

export const sprintsService = {
  async fetchActiveSprint(): Promise<GlobalSprint | null> {
    const { data, error } = await supabase
      .from('global_sprints')
      .select('*')
      .eq('active', true)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
      targetCategory: data.target_category,
      globalGoal: data.global_goal,
      currentProgress: data.current_progress
    };
  },

  async syncUserSprintProgress(userId: string, habitId: string, category: string, completed: boolean) {
    const sprint = await this.fetchActiveSprint();
    if (!sprint || category !== sprint.targetCategory) return;

    if (completed) {
      const { error } = await supabase
        .from('sprint_progress')
        .upsert({
          sprint_id: sprint.id,
          user_id: userId,
          last_completed: new Date().toISOString(),
          completed_days: (await this.getUserProgress(userId, sprint.id)).completedDays + 1
        }, { onConflict: 'sprint_id, user_id' });
      
      if (error) console.error('Error syncing sprint progress:', error);

      // Increment global progress
      await supabase.rpc('increment_global_sprint_progress', { sprint_id: sprint.id });
    }
  },

  async getUserProgress(userId: string, sprintId: string): Promise<SprintUserProgress> {
    const { data, error } = await supabase
      .from('sprint_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('sprint_id', sprintId)
      .single();

    if (error || !data) {
      return { sprintId, userId, completedDays: 0, streak: 0 };
    }

    return {
      sprintId: data.sprint_id,
      userId: data.user_id,
      completedDays: data.completed_days,
      streak: data.streak || 0
    };
  }
};
