import { habitsService } from './habits';
import { Habit } from '@/types';
import { formatDateKey } from '@/utils';

export const syncService = {
  async syncLocalToCloud(localHabits: Habit[], localCompletions: Record<string, boolean>) {
    console.log('Starting sync...', localHabits);
    
    // 1. Sync Habits
    for (const habit of localHabits) {
      try {
        // Check if ID is a valid UUID? If we used crypto.randomUUID, it is.
        // If it's legacy '1', '2', etc., we might fail constraint.
        // We will TRY to insert. If it fails due to UUID format, we might need to skip or regenerate.
        // For now, assuming we fixed IDs or new habits use UUIDs.
        
        await habitsService.createHabit(habit);
        
        // 2. Sync Completions for this habit
        // keys are "habitId_YYYY-MM-DD"
        const relevantKeys = Object.keys(localCompletions).filter(k => k.startsWith(habit.id));
        
        for (const key of relevantKeys) {
            if (localCompletions[key]) {
                const datePart = key.split('_')[1];
                if (datePart) {
                    await habitsService.toggleCompletion(habit.id, new Date(datePart), true);
                }
            }
        }
        
      } catch (err) {
        console.error('Failed to sync habit:', habit.title, err);
        // Continue with others
      }
    }
    
    // Clear local storage logic should be handled by caller or we simply stop using it.
  }
};
