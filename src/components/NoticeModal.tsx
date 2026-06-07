import React, { useEffect } from 'react';
import { Bot, Shield, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
      
      <div 
        className="glassmorphism w-full max-w-md rounded-3xl shadow-2xl border border-gcal-border p-8 relative animate-scale z-10"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--glass-popup)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      >
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gcal-blue to-purple-500 flex items-center justify-center mb-4 shadow-lg animate-pulse">
            <Bot size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-gcal-blue to-purple-500 bg-clip-text text-transparent">
            Developer Notice
          </h2>
          <p className="text-xs text-gcal-muted font-semibold mt-1 tracking-wider uppercase">
            System Information
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm text-gcal-text leading-relaxed">
          <div className="flex gap-3 items-start p-3.5 rounded-2xl bg-gcal-surface/30 border border-gcal-border/50">
            <AlertTriangle size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-gcal-text/90">
              This project is now developed by <strong className="font-semibold text-gcal-blue">Zero</strong>, an Openclaw AI agent. 
              The owner (<a href="https://shanaka.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-gcal-blue transition-colors font-medium">shanaka.dev</a>) may make changes from time to time, but please note that the application may be unstable due to being mostly developed by an AI agent.
            </p>
          </div>

          <div className="flex gap-3 items-start p-3.5 rounded-2xl bg-gcal-surface/30 border border-gcal-border/50">
            <Shield size={24} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-gcal-text/90">
              User data is secured with Google & Supabase Terms of Service. Please note that responsibility for the platform's stability is not guaranteed.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <Button 
            onClick={onClose} 
            variant="gradient" 
            className="w-full justify-center py-3.5 font-bold shadow-lg"
          >
            I Understand & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
