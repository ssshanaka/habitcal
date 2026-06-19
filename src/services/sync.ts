import { habitsService } from './habits';
import { Habit, Completion } from '@/types';
import { formatDateKey } from '@/utils';

export const syncService = {
  async syncLocalToCloud(localHabits: Habit[], localCompletions: Record<string, boolean>) {
    console.log('Starting bulk sync...');
    
    try {
      // 1. Bulk Sync Habits
      if (localHabits.length > 0) {
        await habitsService.createHabits(localHabits);
      }
      
      // 2. Bulk Sync Completions
      const completionsToSync: Completion[] = [];
      Object.keys(localCompletions).forEach(key => {
        if (localCompletions[key]) {
          const lastUnderscore = key.lastIndexOf('_');
          if (lastUnderscore > 0) {
            const habitId = key.substring(0, lastUnderscore);
            const date = key.substring(lastUnderscore + 1);
            if (habitId && date) {
              completionsToSync.push({ habitId, date, completed: true });
            }
          }
        }
      });
      
      if (completionsToSync.length > 0) {
        // Supabase has a limit on number of rows per request, but usually it's high enough for this.
        // We can chunk if necessary, but for habit tracking, a few thousand is usually fine.
        await habitsService.createCompletions(completionsToSync);
      }
      
      console.log('Sync completed successfully.');
    } catch (err) {
      console.error('Sync failed:', err);
      throw err;
    }
  }
};
