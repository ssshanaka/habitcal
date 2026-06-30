import React from 'react';
import { X, CheckCircle2, Timer, Target } from 'lucide-react';
import { Button } from './Button';
import HabitTimer from './HabitTimer';
import { Habit } from '../types';

interface FocusModeProps {
  habit: Habit;
  onComplete: () => void;
  onExit: () => void;
  onTimerStop: (habitId: string, minutes: number) => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ habit, onComplete, onExit, onTimerStop }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-gcal-bg-solid/90 backdrop-blur-xl transition-all duration-500" 
        onClick={onExit}
      />
      
      {/* Content Card */}
      <div className="relative w-full max-w-2xl px-6 py-12 text-center animate-in zoom-in-95 duration-300">
        <button 
          onClick={onExit}
          className="absolute top-0 right-0 p-3 text-gcal-muted hover:text-gcal-text transition-colors rounded-full hover:bg-gcal-surface/50"
        >
          <X size={32} />
        </button>

        <div className="flex flex-col items-center gap-8">
          {/* Category Badge */}
          <div 
            className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm"
            style={{ 
              backgroundColor: `${habit.color}20`, 
              color: habit.color 
            }}
          >
            {habit.category || 'General'}
          </div>

          {/* Habit Header */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gcal-text">
              {habit.title}
            </h1>
            {habit.description && (
              <p className="text-lg md:text-xl text-gcal-muted max-w-md mx-auto leading-relaxed">
                {habit.description}
              </p>
            )}
          </div>

          {/* Timer Section */}
          <div className="flex flex-col items-center gap-6 py-12 px-8 rounded-3xl bg-gcal-surface/30 border border-gcal-border shadow-2xl backdrop-blur-sm relative group">
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gcal-bg-solid px-4 py-1 rounded-full border border-gcal-border flex items-center gap-2 text-xs font-medium text-gcal-muted uppercase tracking-wider">
               <Timer size={14} /> Tracking Session
             </div>
             
             <div className="scale-150 transform transition-transform group-hover:scale-160 duration-300">
               <HabitTimer 
                 onStop={(minutes) => onTimerStop(habit.id, minutes)} 
               />
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
            <Button 
              variant="gradient" 
              className="w-full py-6 text-xl rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
              onClick={onComplete}
            >
              <CheckCircle2 size={28} /> Mark as Complete
            </Button>
            <Button 
              variant="secondary" 
              className="w-full py-6 text-lg rounded-2xl transition-all"
              onClick={onExit}
            >
              Exit Focus
            </Button>
          </div>

          {/* Footer Hint */}
          <div className="flex items-center gap-2 text-gcal-muted/60 text-sm italic">
            <Target size={16} />
            <span>One thing at a time. Stay focused.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
