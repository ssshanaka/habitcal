import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Habit } from '../types';
import { Button } from './Button';

interface HabitNextUpSpotlightProps {
  habit: Habit | null;
  onSelect: (habit: Habit) => void;
}

const HabitNextUpSpotlight: React.FC<HabitNextUpSpotlightProps> = ({ habit, onSelect }) => {
  if (!habit) return null;

  return (
    <div className="px-4 py-3 mb-4 glassmorphism rounded-2xl border border-gcal-blue/30 shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gcal-blue to-purple-500/20 rounded-xl shadow-inner">
            <Sparkles className="text-gcal-blue" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gcal-blue uppercase tracking-widest mb-0.5">Next Up</p>
            <p className="text-sm font-bold text-gcal-text leading-tight">{habit.title}</p>
          </div>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => onSelect(habit)}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5"
        >
          Start <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
};

export default HabitNextUpSpotlight;
