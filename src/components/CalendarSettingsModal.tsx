import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { calendarManager } from '../services/calendar/manager';
import { CalendarProvider } from '../services/calendar/types';
import { Calendar, Key, CheckCircle2 } from 'lucide-react';

interface CalendarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarSettingsModal: React.FC<CalendarSettingsModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<CalendarProvider>(calendarManager.getProvider());
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = async () => {
    setStatus(null);
    try {
      await calendarManager.setProvider(provider, clientId);
      
      if (provider !== 'none') {
        const authResult = await calendarManager.authenticate();
        if (authResult.success) {
          setStatus({ success: true, message: 'Calendar connected successfully!' });
          setTimeout(() => {
            setStatus(null);
            onClose();
          }, 2000);
        } else {
          setStatus({ success: false, message: authResult.error || 'Authentication failed' });
        }
      } else {
        setStatus({ success: true, message: 'Calendar sync disabled' });
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      setStatus({ success: false, message: (error as Error).message });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calendar Integration">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gcal-text flex items-center gap-2">
            <Calendar size={16} className="text-gcal-blue" />
            Select Provider
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['google', 'outlook', 'apple'] as CalendarProvider[]).map(p => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`py-2 px-3 rounded-xl text-sm capitalize transition-all ${
                  provider === p 
                    ? 'bg-gcal-blue text-white ring-2 ring-gcal-blue/20' 
                    : 'bg-gcal-surface hover:bg-gcal-surface/80 text-gcal-text'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setProvider('none')}
            className={`w-full mt-2 py-2 rounded-xl text-xs text-center transition-all ${
              provider === 'none' ? 'bg-red-500/10 text-red-500' : 'text-gcal-muted hover:text-gcal-text'
            }`}
          >
            Disable Calendar Sync
          </button>
        </div>

        {provider !== 'none' && (
          <div className="flex flex-col gap-2 animate-in">
            <label className="text-sm font-medium text-gcal-text flex items-center gap-2">
              <Key size={16} className="text-gcal-blue" />
              Client ID / API Key
            </label>
            <input 
              type="text" 
              placeholder={`Enter ${provider} Client ID...`}
              className="w-full bg-gcal-surface border border-gcal-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gcal-blue"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
            />
            <p className="text-[10px] text-gcal-muted">
              Your credentials are saved locally in your browser.
            </p>
          </div>
        )}

        {status && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${status.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {status.success && <CheckCircle2 size={14} />}
            <span>{status.message}</span>
          </div>
        )}

        <Button 
          className="w-full py-3 rounded-xl font-bold" 
          onClick={handleSave}
          disabled={provider !== 'none' && !clientId}
        >
          Connect Calendar
        </Button>
      </div>
    </Modal>
  );
};

export default CalendarSettingsModal;
