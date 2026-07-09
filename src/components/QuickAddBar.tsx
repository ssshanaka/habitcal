import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Habit, HabitFrequency } from '../types';
import { colors, categories } from '../utils';
import { generateId } from '../utils';
import { useToast } from '../hooks/useToast';

interface QuickAddBarProps {
  onAdd: (habit: Habit) => Promise<void>;
  currentHabitCount: number;
}

const colorMap: Record<string, string> = {
  'blue': '#8ab4f8',
  'red': '#f28b82',
  'yellow': '#fdd663',
  'green': '#81c995',
  'purple': '#c58af9',
  'pink': '#f6bfbc',
  'grey': '#e8eaed',
  'gray': '#e8eaed',
};

const convertTo24h = (timeStr: string): string => {
  let [time, modifier] = timeStr.toLowerCase().split(/\s*(am|pm)?/);
  let [hours, minutes] = time.split(':');

  if (!minutes) minutes = '00';
  let hoursNum = parseInt(hours, 10);

  if (modifier === 'pm' && hoursNum < 12) hoursNum += 12;
  if (modifier === 'am' && hoursNum === 12) hoursNum = 0;

  return `${String(hoursNum).padStart(2, '0')}:${minutes}`;
};

const parseQuickAdd = (text: string) => {
  let title = text;
  let timeStart: string | undefined;
  let color: string | undefined;
  let category: string | undefined;

  // 1. Extract Time (e.g., "7am", "7:30pm", "14:00")
  const timeRegex = /(\d{1,2}(?::\d{2})?\s?(?:am|pm|AM|PM))/g;
  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    const rawTime = timeMatch[0];
    timeStart = convertTo24h(rawTime);
    title = title.replace(rawTime, '').trim();
  }

  // 2. Extract Color
  for (const [name, hex] of Object.entries(colorMap)) {
    const colorRegex = new RegExp(`\\b${name}\\b`, 'i');
    if (colorRegex.test(title)) {
      color = hex;
      title = title.replace(colorRegex, '').trim();
      break;
    }
  }

  // 3. Extract Category
  const categoryRegex = /(?:in|category)\s+(Health|Work|Mind|Finance|Personal|Social|Other)/i;
  const catMatch = text.match(categoryRegex);
  if (catMatch) {
    category = catMatch[1];
    title = title.replace(catMatch[0], '').trim();
  }

  // Cleanup title
  title = title.replace(/\s+/g, ' ')
               .replace(/\s+at\s+/i, ' ')
               .replace(/\s+every\s+day/i, '')
               .trim();

  return { title, timeStart, color, category };
};

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAdd, currentHabitCount }) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    setIsProcessing(true);
    const { title, timeStart, color, category } = parseQuickAdd(inputValue);

    if (!title) {
      addToast('Please enter a habit name', 'error');
      setIsProcessing(false);
      return;
    }

    try {
      const newHabit: Habit = {
        id: generateId(),
        title,
        timeStart,
        color: color || colors[0],
        category: category || categories[0],
        order: currentHabitCount,
        frequency: HabitFrequency.DAILY,
      };
      
      await onAdd(newHabit);
      setInputValue('');
      addToast(`Created habit: ${title}`, 'success');
    } catch (err) {
      addToast('Failed to create habit', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleAdd} className="relative flex items-center w-full max-w-lg group">
      <div className="absolute left-4 text-gcal-blue group-focus-within:text-purple-500 transition-colors duration-200">
        <Sparkles size={18} />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Quick add (e.g. 'Meditation 7am blue')"
        className="w-full bg-gcal-surface/50 border border-gcal-border rounded-full py-2.5 pl-12 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-gcal-blue/50 transition-all duration-200 placeholder:text-gcal-muted/50 group-hover:bg-gcal-surface/80"
        disabled={isProcessing}
      />
      <div className="absolute right-2 flex items-center">
        <Button 
          type="submit" 
          variant="gradient" 
          className="rounded-full h-8 px-4 text-xs font-bold flex items-center gap-1 shadow-md disabled:opacity-50"
          disabled={isProcessing || !inputValue.trim()}
        >
          {isProcessing ? (
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Add</span>
              <ArrowRight size={14} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
