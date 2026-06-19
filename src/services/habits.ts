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
      category: h.category,
      order: h.order || 0,
      goalCount: h.goal_count || null,
      duration_minutes: h.duration_minutes || 0,
      created_at: h.created_at
    })) as Habit[];
  },

  async createHabit(habit: Habit) {
    await this.createHabits([habit]);
  },

  async createHabits(habits: Habit[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const rows = habits.map(habit => ({
      id: habit.id,
      user_id: user.id,
      title: habit.title,
      description: habit.description,
      start_time: habit.timeStart ? `${habit.timeStart}:00` : null,
      end_time: habit.timeEnd ? `${habit.timeEnd}:00` : null,
      color: habit.color,
      category: habit.category || null,
      order: habit.order || 0,
      goal_count: habit.goalCount || null,
      duration_minutes: habit.duration_minutes || 0,
      active: true
    }));

    const { error } = await supabase.from('habits').insert(rows);
    if (error) throw error;
  },

  async createCompletions(completions: Completion[]) {
    const { error } = await supabase.from('habit_logs').upsert(
      completions.map(c => ({
        habit_id: c.habitId,
        date: c.date,
        completed: c.completed
      }))
    );
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
        color: habit.color,
        category: habit.category || null,
        order: habit.order,
        goal_count: habit.goalCount || null,
        duration_minutes: habit.duration_minutes || 0
      })
      .eq('id', habit.id);

    if (error) throw error;
  },

  async deleteHabit(habitId: string) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);
      
    if (error) throw error;
  },

  async reorderHabits(habits: Habit[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const rows = habits.map(habit => ({
      id: habit.id,
      order: habit.order
    }));

    const { error } = await supabase.from('habits').upsert(rows);
    if (error) throw error;
  },

  async fetchCompletions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data: habits } = await supabase.from('habits').select('id').eq('user_id', user.id);
    if (!habits?.length) return {};

    const habitIds = habits.map(h => h.id);
    const { data: logs, error } = await supabase
      .from('habit_logs')
      .select('*')
      .in('habit_id', habitIds)
      .eq('completed', true);

    if (error) {
     console.error('Error fetching logs:', error);
     return {};
    }

    const completionsMap: Record<string, { completed: boolean; timestamp: string }> = {};
    logs.forEach((log: any) => {
      const key = `${log.habit_id}_${log.date}`;
      completionsMap[key] = { 
        completed: log.completed,
        timestamp: log.created_at || log.date 
      };
    });

    return completionsMap;
  },

  async toggleCompletion(habitId: string, date: Date, isCompleted: boolean) {
    const dateKey = formatDateKey(date);
    
    if (isCompleted) {
      const { error } = await supabase.from('habit_logs').upsert({
         habit_id: habitId,
         date: dateKey,
         completed: true
      }, { onConflict: 'habit_id, date' });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('habit_logs').delete().match({
        habit_id: habitId,
        date: dateKey
      });
      if (error) throw error;
    }
  },

  async setCompletionsForDate(date: Date, completed: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const dateKey = formatDateKey(date);

    const { data: habits } = await supabase.from('habits').select('id').eq('user_id', user.id);
    if (!habits?.length) return;
    const habitIds = habits.map(h => h.id);

    if (completed) {
      const rows = habitIds.map(id => ({
        habit_id: id,
        date: dateKey,
        completed: true
      }));
      const { error } = await supabase.from('habit_logs').upsert(rows, { onConflict: 'habit_id, date' });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('habit_logs').delete().in('habit_id', habitIds).eq('date', dateKey);
      if (error) throw error;
    }
  },

  async clearAllCompletions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: habits } = await supabase.from('habits').select('id').eq('user_id', user.id);
    if (!habits?.length) return;

    const habitIds = habits.map(h => h.id);
    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .in('habit_id', habitIds);

    if (error) throw error;
  }
};
