import { CalendarAdapter, CalendarEvent } from './types';

export class OutlookCalendarAdapter implements CalendarAdapter {
  name = 'Outlook Calendar';
  private accessToken: string | null = null;
  private clientId: string = '';

  async setClientId(id: string) {
    this.clientId = id;
  }

  async authenticate(): Promise<{ success: boolean; token?: string; error?: string }> {
    if (!this.clientId) {
      return { success: false, error: 'Outlook Client ID not configured.' };
    }

    try {
      console.log(`Initiating Outlook OAuth2 flow with Client ID: ${this.clientId}`);
      this.accessToken = 'mock_outlook_access_token_' + Math.random().toString(36).substring(7);
      return { success: true, token: this.accessToken };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async fetchEvents(startTime: Date, endTime: Date): Promise<CalendarEvent[]> {
    if (!this.accessToken) throw new Error('Not authenticated with Outlook Calendar');

    console.log('Fetching events from Microsoft Graph API...');
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        id: 'out_1',
        summary: 'Meditation',
        start: new Date(),
        end: new Date(new Date().getTime() + 900000),
      }
    ];
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<string> {
    if (!this.accessToken) throw new Error('Not authenticated with Outlook Calendar');
    console.log(`Creating Outlook Calendar event: ${event.summary}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return 'out_' + Math.random().toString(36).substring(7);
  }

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<void> {
    if (!this.accessToken) throw new Error('Not authenticated with Outlook Calendar');
    console.log(`Updating Outlook Calendar event ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async deleteEvent(id: string): Promise<void> {
    if (!this.accessToken) throw new Error('Not authenticated with Outlook Calendar');
    console.log(`Deleting Outlook Calendar event ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
