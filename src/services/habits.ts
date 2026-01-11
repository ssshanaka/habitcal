import { supabase } from '@/lib/supabase';
import { Habit, Completion } from '@/types';
import { formatDateKey } from '@/utils';

export const habitsService = {
  async fetchHabits() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }

    return data.map((h: any) => ({
      id: h.id,
      user_id: h.user_id,
      title: h.title,
      description: h.description,
      timeStart: h.start_time?.slice(0, 5), // 'HH:mm:ss' -> 'HH:mm'
      timeEnd: h.end_time?.slice(0, 5),
      color: h.color,
      order: 0, // Schema doesn't have order yet, default to 0
      created_at: h.created_at
    })) as Habit[];
  },

  async createHabit(habit: Habit) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('habits').insert({
      id: habit.id, // Use the UUID generated locally
      user_id: user.id,
      title: habit.title,
      description: habit.description,
      start_time: habit.timeStart ? `${habit.timeStart}:00` : null,
      end_time: habit.timeEnd ? `${habit.timeEnd}:00` : null,
      color: habit.color,
      active: true
    });

    if (error) throw error;
  },

  async updateHabit(habit: Habit) {
    const { error } = await supabase
      .from('habits')
      .update({
        title: habit.title,
        description: habit.description,
        start_time: habit.timeStart ? `${habit.timeStart}:00` : null,
        end_time: habit.timeEnd ? `${habit.timeEnd}:00` : null,
        color: habit.color
      })
      .eq('id', habit.id);

    if (error) throw error;
  },

  async deleteHabit(habitId: string) {
    // Soft delete or hard delete? Schema has active boolean, let's use that if avoiding data loss, 
    // but user asked for delete. Let's hard delete for now to match local behavior, 
    // or set active=false if using soft delete. 
    // Given the schema has 'active', let's set active = false.
    const { error } = await supabase
      .from('habits')
      .delete() // Actually, let's hard delete to be simple and clean
      .eq('id', habitId);
      
    if (error) throw error;
  },

  async fetchCompletions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    // We need to join with habits to filter by user, or assuming RLS handles it?
    // Let's assume we can fetch logs for the user's habits. 
    // But logs table doesn't have user_id, only habit_id.
    // We first get habits, then logs.
    
    // Better: Select logs where habit_id in (user_habits)
    // Or if RLS policies exist on habits, maybe we can just query logs if RLS checks join.
    // Let's safe fetch:
    const { data: habits } = await supabase.from('habits').select('id').eq('user_id', user.id);
    if (!habits?.length) return {};

    const habitIds = habits.map(h => h.id);
    const { data: logs, error } = await supabase
      .from('habit_logs')
      .select('habit_id, date, completed')
      .in('habit_id', habitIds)
      .eq('completed', true);

    if (error) {
     console.error('Error fetching logs:', error);
     return {};
    }

    const completionsMap: Record<string, boolean> = {};
    logs.forEach((log: any) => {
      // log.date is YYYY-MM-DD
      const key = `${log.habit_id}_${log.date}`;
      completionsMap[key] = true;
    });

    return completionsMap;
  },

  async toggleCompletion(habitId: string, date: Date, isCompleted: boolean) {
    const dateKey = formatDateKey(date);
    
    if (isCompleted) {
      // Insert
      const { error } = await supabase.from('habit_logs').upsert({
         habit_id: habitId,
         date: dateKey,
         completed: true
      }, { onConflict: 'habit_id, date' }); // Assuming unique constraint
      if (error) throw error;
    } else {
      // Delete (or set false)
      const { error } = await supabase.from('habit_logs').delete().match({
        habit_id: habitId,
        date: dateKey
      });
      if (error) throw error;
    }
  }
};
