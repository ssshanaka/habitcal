import { habitsService } from './habits';
import { Habit } from '@/types';

export interface ExternalEvent {
  keyword: string;
  timestamp: Date;
  value?: number;
  unit?: string;
}

/**
 * Simulates an external API (like Google Calendar or Apple Health) 
 * that returns events or metrics.
 */
async function fetchMockExternalEvents(): Promise<ExternalEvent[]> {
  console.log('Fetching mock external events...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // In a real app, this would be a fetch call to an API
  const today = new Date();
  return [
    { keyword: 'Gym', timestamp: today },
    { keyword: 'Read', timestamp: today },
    { keyword: 'Water', timestamp: today },
    { keyword: 'Meditation', timestamp: today },
    { keyword: 'Exercise', timestamp: today },
  ];
}

export const externalSyncService = {
  /**
   * Syncs external events to habit completions.
   * Matches external keywords against habit titles.
   */
  async syncExternalEvents() {
    try {
      const habits = await habitsService.fetchHabits();
      const externalEvents = await fetchMockExternalEvents();
      const today = new Date();
      let matchedCount = 0;

      console.log(`Analyzing ${externalEvents.length} external events against ${habits.length} habits...`);

      for (const event of externalEvents) {
        // Find a habit that matches the keyword in its title
        const matchingHabit = habits.find(h => 
          h.title.toLowerCase().includes(event.keyword.toLowerCase())
        );

        if (matchingHabit) {
          console.log(`Match found: External event "${event.keyword}" -> Habit "${matchingHabit.title}"`);
          await habitsService.toggleCompletion(matchingHabit.id, today, true);
          matchedCount++;
        }
      }

      console.log(`External sync completed. Marked ${matchedCount} habits as completed.`);
      return { success: true, matchedCount };
    } catch (error) {
      console.error('External sync failed:', error);
      throw error;
    }
  }
};
