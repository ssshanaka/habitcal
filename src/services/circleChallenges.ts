import { supabase } from '../lib/supabase';
import { CircleChallenge } from '../types';

export const circleChallengesService = {
  async getChallenges(circleId: string): Promise<CircleChallenge[]> {
    const { data, error } = await supabase
      .from('circle_challenges')
      .select('*')
      .eq('circle_id', circleId);
    
    if (error) throw error;
    return data || [];
  },

  async createChallenge(circleId: string, title: string, description: string, targetHabitId: string, goalStreak: number): Promise<CircleChallenge> {
    const { data, error } = await supabase
      .from('circle_challenges')
      .insert({ circle_id: circleId, title, description, target_habit_id: targetHabitId, goal_streak: goalStreak })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
