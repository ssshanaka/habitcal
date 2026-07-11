import { Habit } from '@/types';
import { habitsService } from './habits';

export interface EvolutionProposal {
  habitId: string;
  currentTitle: string;
  proposedTitle: string;
  currentGoal: number | undefined;
  proposedGoal: number | undefined;
  reason: string;
}

export const evolutionService = {
  /**
   * Analyzes if a habit is ready for evolution based on recent consistency.
   * Threshold: 14 days with >= 90% completion.
   */
  async checkForEvolution(habit: Habit, completions: Record<string, any>): Promise<EvolutionProposal | null> {
    if (habit.level && habit.level >= 10) return null; // Cap level at 10

    // Calculate consistency for the last 14 days
    const today = new Date();
    let completedCount = 0;
    let scheduledCount = 0;

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Check if habit was scheduled for this day
      const dayOfWeek = date.getDay();
      const isScheduled = habit.frequency === 'DAILY' || 
                          (habit.frequency === 'WEEKLY' && habit.daysOfWeek?.includes(dayOfWeek));
      
      if (isScheduled) {
        scheduledCount++;
        const key = `${habit.id}_${date.toISOString().split('T')[0]}`;
        if (completions[key]?.completed) {
          completedCount++;
        }
      }
    }

    if (scheduledCount === 0) return null;
    const completionRate = completedCount / scheduledCount;

    if (completionRate >= 0.9 && scheduledCount >= 7) {
      return this.generateProposal(habit);
    }

    return null;
  },

  private generateProposal(habit: Habit): EvolutionProposal {
    let proposedTitle = habit.title;
    let proposedGoal = habit.goalCount;

    // Logic for scaling numerical goals in title (e.g., "Read 10 pages" -> "Read 15 pages")
    const numberMatch = habit.title.match(/(\d+)/);
    if (numberMatch) {
      const currentVal = parseInt(numberMatch[1]);
      const newVal = Math.ceil(currentVal * 1.2); // Increase by 20%
      proposedTitle = habit.title.replace(numberMatch[1], newVal.toString());
    } else {
      proposedTitle = `${habit.title} (Advanced)`;
    }

    if (habit.goalCount) {
      proposedGoal = Math.ceil(habit.goalCount * 1.1); // Slight increase in monthly goal
    }

    return {
      habitId: habit.id,
      currentTitle: habit.title,
      proposedTitle,
      currentGoal: habit.goalCount,
      proposedGoal,
      reason: `You've maintained incredible consistency! Time to push your limits.`
    };
  },

  async evolveHabit(habitId: string, proposal: EvolutionProposal) {
    const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // We'll use the existing updateHabit but add level and evolution date
    // Note: habitsService.updateHabit needs to be updated to support these new fields
    const { data: habit } = await (await import('@/lib/supabase')).supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    const updatedHabit = {
      ...habit,
      title: proposal.proposedTitle,
      goal_count: proposal.proposedGoal,
      level: (habit.level || 0) + 1,
      last_evolution_date: new Date().toISOString()
    };

    const { error } = await (await import('@/lib/supabase')).supabase
      .from('habits')
      .update(updatedHabit)
      .eq('id', habitId);

    if (error) throw error;
  }
};
