import React, { useState } from 'react';
import { ReflectionReason } from '../types';
import Modal from './Modal';
import { AlertCircle, Check } from 'lucide-react';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitTitle: string;
  date: string;
  onSave: (reason: ReflectionReason, note: string) => Promise<void>;
  isSaving: boolean;
}

const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onClose,
  habitTitle,
  date,
  onSave,
  isSaving
}) => {
  const [selectedReason, setSelectedReason] = useState<ReflectionReason | null>(null);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedReason) return;
    await onSave(selectedReason, note);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reflect on Missed Habit">
      <div className="flex flex-col gap-6 p-2">
        <div className="bg-gcal-surface/50 p-4 rounded-xl border border-gcal-border flex items-start gap-3">
          <div className="p-2 rounded-full bg-orange-500/10 text-orange-500">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gcal-text">Why was "{habitTitle}" missed on {date}?</p>
            <p className="text-xs text-gcal-muted mt-1">Understanding the root cause helps your AI coach optimize your routine.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gcal-muted mb-1">Select Reason</p>
          {Object.values(ReflectionReason).map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium ${
                selectedReason === reason 
                  ? 'bg-gcal-blue/10 border-gcal-blue text-gcal-blue shadow-sm ring-1 ring-gcal-blue/30' 
                  : 'bg-gcal-surface border-gcal-border text-gcal-text hover:border-gcal-muted'
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gcal-muted mb-1">Additional Note (Optional)</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any specifics? (e.g. 'Power outage', 'Sudden meeting')"
            className="w-full bg-gcal-surface border border-gcal-border rounded-xl p-3 text-sm text-gcal-text focus:outline-none focus:ring-2 focus:ring-gcal-blue/50 transition-all"
            rows={3}
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gcal-muted hover:text-gcal-text transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!selectedReason || isSaving}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-gcal-blue text-white shadow-lg hover:bg-gcal-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check size={16} />
                Save Reflection
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReflectionModal;
