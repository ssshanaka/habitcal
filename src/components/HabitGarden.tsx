import React, { useMemo } from 'react';
import { Habit } from '../types';
import { calculateStreak, categories } from '../utils';
import { Button } from './Button';
import { ArrowLeft, TreePine, Flower2, Leaf, Sprout, Flower, Wind, Sun, Cloud } from 'lucide-react';

interface HabitGardenProps {
  habits: Habit[];
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>;
  onHabitClick: (habit: Habit) => void;
  onBack: () => void;
}

const Plant = ({ 
  habit, 
  completions, 
  onClick 
}: { 
  habit: Habit; 
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>; 
  onClick: () => void 
}) => {
  const streak = useMemo(() => calculateStreak(habit, completions), [habit, completions]);
  
  // Growth factor: 0.5 (seed) to 1.5 (mature)
  const growth = Math.min(0.5 + (streak / 30), 1.5);
  
  const getPlantDetails = () => {
    const cat = habit.category || 'Other';
    switch (cat) {
      case 'Health': return { icon: Flower2, color: habit.color || '#f28b82', type: 'Flower' };
      case 'Mind': return { icon: Flower, color: habit.color || '#c58af9', type: 'Lotus' };
      case 'Work': return { icon: TreePine, color: habit.color || '#81c995', type: 'Tree' };
      case 'Personal': return { icon: Leaf, color: habit.color || '#fdd663', type: 'Shrub' };
      case 'Social': return { icon: Sprout, color: habit.color || '#8ab4f8', type: 'Grass' };
      default: return { icon: Sprout, color: habit.color || '#e8eaed', type: 'Small Plant' };
    }
  };

  const { icon: Icon, color, type } = getPlantDetails();

  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col items-center cursor-pointer transition-all duration-500 hover:scale-110"
      style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Plant Body */}
      <div 
        className="relative transition-all duration-1000 ease-out"
        style={{ 
          transform: `scale(${growth})`,
          animation: `sway ${3 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`
        }}
      >
        <Icon 
          size={48} 
          color={color} 
          strokeWidth={2.5} 
          className="drop-shadow-lg transition-colors duration-500 group-hover:brightness-125" 
        />
        
        {/* Growth Glow */}
        {streak > 0 && (
          <div 
            className="absolute -inset-2 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {/* Tooltip/Label */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 pointer-events-none z-10">
        <div className="bg-gcal-surface/90 backdrop-blur-md border border-gcal-border px-3 py-1 rounded-full shadow-xl">
          <p className="text-xs font-bold text-gcal-text whitespace-nowrap">
            {habit.title} <span className="text-gcal-blue ml-1">🔥 {streak}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const HabitGarden: React.FC<HabitGardenProps> = ({ habits, completions, onHabitClick, onBack }) => {
  const totalStreak = useMemo(() => {
    return habits.reduce((acc, h) => acc + calculateStreak(h, completions), 0);
  }, [habits, completions]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-200 via-sky-100 to-green-100 overflow-hidden flex flex-col">
      
      {/* Atmosphere */}
      <div className="absolute top-10 right-10 text-amber-400 animate-pulse">
        <Sun size={64} strokeWidth={1.5} />
      </div>
      <div className="absolute top-20 left-20 text-white opacity-60 animate-bounce" style={{ animationDuration: '8s' }}>
        <Cloud size={48} strokeWidth={1.5} />
      </div>
      <div className="absolute top-40 right-1/4 text-white opacity-40 animate-bounce" style={{ animationDuration: '10s' }}>
        <Cloud size={32} strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/3 left-1/3 text-blue-300 animate-pulse" style={{ animationDuration: '4s' }}>
        <Wind size={24} strokeWidth={1} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <Button variant="secondary" onClick={onBack} className="gap-2 rounded-full px-4 shadow-sm">
          <ArrowLeft size={18} />
          <span>Back to Grid</span>
        </Button>
        
        <div className="text-center">
          <h1 className="text-3xl font-light text-sky-800 tracking-tight">Your Habit Garden</h1>
          <p className="text-sm text-sky-600 font-medium">Total Growth: {totalStreak} days of discipline</p>
        </div>
        
        <div className="w-24" /> {/* Spacer for balance */}
      </div>

      {/* Garden Floor */}
      <div className="flex-1 relative flex items-end justify-center pb-20 px-10">
        {/* Grass Layer */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-400 to-transparent opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-green-500/40 backdrop-blur-sm border-t border-green-600/20 pointer-events-none" />

        {/* Plants Grid */}
        <div className="relative z-10 flex flex-wrap justify-center items-end gap-x-16 gap-y-12 max-w-5xl">
          {habits.length === 0 ? (
            <div className="text-center py-20 text-sky-800/50 italic">
              Your garden is empty. Start planting habits!
            </div>
          ) : (
            habits.map(habit => (
              <Plant 
                key={habit.id} 
                habit={habit} 
                completions={completions} 
                onClick={() => onHabitClick(habit)} 
              />
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="relative z-10 p-6 flex justify-center gap-6 overflow-x-auto">
        {categories.map(cat => {
          const details = {
            'Health': { icon: Flower2, label: 'Flower' },
            'Mind': { icon: Flower, label: 'Lotus' },
            'Work': { icon: TreePine, label: 'Tree' },
            'Personal': { icon: Leaf, label: 'Shrub' },
            'Social': { icon: Sprout, label: 'Grass' },
            'Finance': { icon: Flower, label: 'Cactus' },
            'Other': { icon: Sprout, label: 'Small Plant' },
          }[cat] || { icon: Sprout, label: 'Plant' };
          
          return (
            <div key={cat} className="flex items-center gap-2 text-xs font-medium text-sky-800/70 glassmorphism px-3 py-1 rounded-full border border-sky-200">
              <details.icon size={12} />
              <span>{cat}: {details.label}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-3deg) scale(var(--growth, 1)); }
          50% { transform: rotate(3deg) scale(var(--growth, 1)); }
        }
      `}</style>
    </div>
  );
};

export default HabitGarden;
