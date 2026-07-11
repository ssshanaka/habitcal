import React from 'react';
import { EvolutionProposal } from '../services/evolution';
import Modal from './Modal';
import { TrendingUp, Check, X } from 'lucide-react';

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: EvolutionProposal | null;
  onAccept: (proposal: EvolutionProposal) => Promise<void>;
  isSaving: boolean;
}

const EvolutionModal: React.FC<EvolutionModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onAccept,
  isSaving
}) => {
  if (!isOpen || !proposal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Habit Evolution! 🚀">
      <div className="flex flex-col gap-6 p-2 text-center">
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="absolute inset-0 bg-gcal-blue/30 blur-xl rounded-full animate-pulse" />
          <div className="relative p-4 rounded-full bg-gradient-to-br from-gcal-blue to-purple-600 text-white shadow-2xl">
            <TrendingUp size={48} className="animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gcal-text">You've Mastered This!</h3>
          <p className="text-sm text-gcal-muted px-4">
            {proposal.reason} Your consistency has been flawless. Ready to level up the challenge?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gcal-surface border border-gcal-border opacity-60">
            <p className="text-[10px] font-bold uppercase text-gcal-muted mb-1">Current</p>
            <p className="text-sm font-bold truncate">{proposal.currentTitle}</p>
            {proposal.currentGoal && (
              <p className="text-[10px] text-gcal-muted">Goal: {proposal.currentGoal}/mo</p>
            )}
          </div>
          <div className="p-4 rounded-2xl bg-gcal-blue/10 border border-gcal-blue text-gcal-blue shadow-sm ring-1 ring-gcal-blue/20">
            <p className="text-[10px] font-bold uppercase text-gcal-blue mb-1">Proposed</p>
            <p className="text-sm font-bold truncate">{proposal.proposedTitle}</p>
            {proposal.proposedGoal && (
              <p className="text-[10px] text-gcal-blue/70">Goal: {proposal.proposedGoal}/mo</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gcal-muted hover:text-gcal-text transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} />
            Stay Here
          </button>
          <button 
            onClick={() => onAccept(proposal)}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-gcal-blue to-purple-600 text-white shadow-lg hover:scale-105 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check size={16} />
                Accept Challenge
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EvolutionModal;
