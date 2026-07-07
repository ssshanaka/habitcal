import { habitsService } from './habits';
import { calendarManager } from './calendar/manager';
import { CalendarEvent } from './calendar/types';

export const externalSyncService = {
  /**
   * Syncs external calendar events to habit completions.
   * Matches calendar event summaries against habit titles.
   */
  async syncExternalEvents() {
    try {
      const provider = calendarManager.getProvider();
      if (provider === 'none') {
        console.log('No calendar provider configured. Skipping external sync.');
        return { success: false, reason: 'No provider configured' };
      }

      const adapter = await calendarManager.getAdapter();
      
      // Check auth
      try {
        // In a real app, we'd check if the token is expired
        // For this implementation, we assume if they have a provider, they are authed
        // or the adapter handles it.
      } catch (e) {
        return { success: false, reason: 'Authentication failed' };
      }

      const habits = await habitsService.fetchHabits();
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const externalEvents = await adapter.fetchEvents(today, tomorrow);
      let matchedCount = 0;

      console.log(`Analyzing ${externalEvents.length} calendar events against ${habits.length} habits...`);

      for (const event of externalEvents) {
        const matchingHabit = habits.find(h => 
          h.title.toLowerCase().includes(event.summary.toLowerCase())
        );

        if (matchingHabit) {
          console.log(`Match found: Calendar event "${event.summary}" -> Habit "${matchingHabit.title}"`);
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
  },

  /**
   * Pushes a habit completion to the external calendar.
   * Bi-directional sync: HabitCal -> External
   */
  async pushHabitToCalendar(habitTitle: string, date: Date) {
    try {
      const provider = calendarManager.getProvider();
      if (provider === 'none') return { success: false, reason: 'No provider configured' };

      const adapter = await calendarManager.getAdapter();
      
      const eventId = await adapter.createEvent({
        summary: `✅ Habit Completed: ${habitTitle}`,
        start: date,
        end: new Date(date.getTime() + 15 * 60000), // 15 min event
        description: 'Automatically synced from HabitCal',
      });

      console.log(`Pushed habit "${habitTitle}" to ${provider} calendar. Event ID: ${eventId}`);
      return { success: true, eventId };
    } catch (error) {
      console.error('Failed to push habit to calendar:', error);
      return { success: false, error: (error as Error).message };
    }
  }
};
