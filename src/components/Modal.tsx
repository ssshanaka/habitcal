import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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
        className="glassmorphism w-full max-w-md rounded-3xl shadow-xl border border-gcal-border p-6 relative animate-scale z-10"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gcal-text">{title}</h2>
          <Button variant="icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </Button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};