import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-full fade-in duration-300 border ${
            toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
            toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
            'bg-gcal-blue/90 border-blue-400 text-white'
          } backdrop-blur-md`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
          <button 
            onClick={() => onRemove(toast.id)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
