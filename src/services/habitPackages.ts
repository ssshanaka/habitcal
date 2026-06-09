import { supabase } from '@/lib/supabase';
import { Habit, HabitPackage } from '@/types';

export const habitPackagesService = {
  async fetchPackages() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('habit_packages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching packages:', error);
      return [];
    }

    return data as HabitPackage[];
  },

  async createPackage(name: string, description: string, habits: Omit<Habit, 'id' | 'user_id' | 'created_at'>[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('habit_packages').insert({
      user_id: user.id,
      name,
      description,
      habits
    });

    if (error) throw error;
  },

  async importPackage(pkg: HabitPackage) {
    const { habits } = pkg;
    const { habitsService } = await import('./habits');
    const newHabits = habits.map(h => ({
      ...h,
      id: crypto.randomUUID() // Ensure new IDs are generated on import
    }));
    await habitsService.createHabits(newHabits as Habit[]);
  }
};
