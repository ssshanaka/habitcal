import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface AuthReminderProps {
  onLogin: () => void;
  onClose: () => void;
  visible: boolean;
}

export const AuthReminder: React.FC<AuthReminderProps> = ({ onLogin, onClose, visible }) => {
  if (!visible) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 max-w-sm w-full glassmorphism shadow-xl rounded-3xl p-6 z-50 animate-slide-up border border-gcal-border"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gcal-blue to-purple-500 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <h3 className="font-bold text-gcal-text text-lg">Save Your Progress</h3>
        </div>
        <button 
          onClick={onClose} 
          className="text-gcal-muted hover:text-gcal-text transition-colors p-1 hover:bg-gcal-surface rounded-full"
        >
          <X size={18} />
        </button>
      </div>
      <p className="text-sm text-gcal-muted mb-5 leading-relaxed">
        Sign in with Google to sync your habits across all devices and never lose your progress.
      </p>
      <div className="flex gap-3">
        <Button 
          onClick={onLogin} 
          variant="gradient"
          className="flex-1 justify-center shadow-lg"
        >
          Sign In
        </Button>
        <Button 
          onClick={onClose} 
          variant="secondary" 
          className="flex-1 justify-center"
        >
          Later
        </Button>
      </div>
    </div>
  );
};
