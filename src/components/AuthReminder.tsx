import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface AuthReminderProps {
  onLogin: () => void;
  onClose: () => void;
  visible: boolean;
}

export const AuthReminder: React.FC<AuthReminderProps> = ({ onLogin, onClose, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-gcal-surface border border-gcal-border shadow-2xl rounded-xl p-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gcal-text">Save your habits</h3>
        <button onClick={onClose} className="text-gcal-muted hover:text-gcal-text transition-colors">
          <X size={16} />
        </button>
      </div>
      <p className="text-sm text-gcal-muted mb-4">
        Sign in with Google to sync your habits across all your devices and never lose your progress.
      </p>
      <div className="flex gap-2">
         <Button onClick={onLogin} className="flex-1 bg-gcal-blue hover:bg-gcal-blueHover text-white justify-center">
            Sign In
         </Button>
         <Button onClick={onClose} variant="secondary" className="flex-1 justify-center">
            Later
         </Button>
      </div>
    </div>
  );
};
