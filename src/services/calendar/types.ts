export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  description?: string;
}

export interface CalendarAdapter {
  name: string;
  authenticate(): Promise<{ success: boolean; token?: string; error?: string }>;
  fetchEvents(startTime: Date, endTime: Date): Promise<CalendarEvent[]>;
  createEvent(event: Omit<CalendarEvent, 'id'>): Promise<string>;
  updateEvent(id: string, event: Partial<CalendarEvent>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
}

export type CalendarProvider = 'google' | 'outlook' | 'apple' | 'none';
