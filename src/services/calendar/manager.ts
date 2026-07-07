import { GoogleCalendarAdapter } from './google';
import { OutlookCalendarAdapter } from './outlook';
import { CalendarAdapter, CalendarProvider } from './types';

class CalendarManager {
  private providers: Map<CalendarProvider, CalendarAdapter> = new Map();
  private currentProvider: CalendarProvider = 'none';

  constructor() {
    this.providers.set('google', new GoogleCalendarAdapter());
    this.providers.set('outlook', new OutlookCalendarAdapter());
    
    this.loadSettings();
  }

  private loadSettings() {
    const savedProvider = localStorage.getItem('habitcal_calendar_provider') as CalendarProvider;
    if (savedProvider && this.providers.has(savedProvider)) {
      this.currentProvider = savedProvider;
    }

    // Load Client IDs
    const googleId = localStorage.getItem('habitcal_google_client_id');
    const outlookId = localStorage.getItem('habitcal_outlook_client_id');

    if (googleId) (this.providers.get('google') as any).setClientId(googleId);
    if (outlookId) (this.providers.get('outlook') as any).setClientId(outlookId);
  }

  async setProvider(provider: CalendarProvider, clientId?: string) {
    this.currentProvider = provider;
    localStorage.setItem('habitcal_calendar_provider', provider);

    if (provider === 'google' && clientId) {
      localStorage.setItem('habitcal_google_client_id', clientId);
      (this.providers.get('google') as any).setClientId(clientId);
    } else if (provider === 'outlook' && clientId) {
      localStorage.setItem('habitcal_outlook_client_id', clientId);
      (this.providers.get('outlook') as any).setClientId(clientId);
    }
  }

  getProvider(): CalendarProvider {
    return this.currentProvider;
  }

  async getAdapter(): Promise<CalendarAdapter> {
    const adapter = this.providers.get(this.currentProvider);
    if (!adapter) {
      throw new Error('No calendar provider selected or supported.');
    }
    return adapter;
  }

  async authenticate(): Promise<{ success: boolean; token?: string; error?: string }> {
    const adapter = await this.getAdapter();
    return adapter.authenticate();
  }
}

export const calendarManager = new CalendarManager();
