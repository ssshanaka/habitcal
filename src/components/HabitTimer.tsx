import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { Button } from './Button';

interface HabitTimerProps {
  onStop: (minutes: number) => void;
  onCancel?: () => void;
}

const HabitTimer: React.FC<HabitTimerProps> = ({ onStop, onCancel }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => setIsActive(!isActive);

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const handleFinish = () => {
    const minutes = Math.round(seconds / 60);
    onStop(minutes);
    setIsActive(false);
    setSeconds(0);
  };

  return (
    <div className="flex items-center gap-2 bg-gcal-surface/50 p-1 rounded-full border border-gcal-border">
      <div className="px-3 py-1 font-mono text-sm font-medium text-gcal-text tabular-nums">
        {formatTime(seconds)}
      </div>
      
      <div className="flex border-l border-gcal-border pl-1 gap-0.5">
        <button
          onClick={handleToggle}
          className="p-1.5 hover:bg-gcal-muted rounded-full transition-colors text-gcal-muted hover:text-gcal-text"
          title={isActive ? "Pause" : "Start"}
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <button
          onClick={handleReset}
          className="p-1.5 hover:bg-gcal-muted rounded-full transition-colors text-gcal-muted hover:text-red-400"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {isActive || seconds > 0 ? (
        <button
          onClick={handleFinish}
          className="ml-1 p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-600 rounded-full transition-colors"
          title="Finish and Save"
        >
          <Check size={16} />
        </button>
      ) : (
        onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-gcal-muted rounded-full transition-colors text-gcal-muted hover:text-red-400"
            title="Cancel"
          >
            <RotateCcw size={16} />
          </button>
        )
      )}
    </div>
  );
};

export default HabitTimer;
