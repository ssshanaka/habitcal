import React from 'react';
import { 
  Plus, 
  Target, 
  Sparkles, 
  BarChart3 
} from 'lucide-react';
import { Button } from './Button';
import { HeatmapCalendar } from './HeatmapCalendar';
import { SortMode } from '../types';

interface SidebarProps {
  openCreateModal: () => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  todayFocusOnly: boolean;
  setTodayFocusOnly: (val: boolean) => void;
  completionStats: {
    todayCompleted: number;
    todayTotal: number;
    weeklyCompleted: number;
    weeklyTotal: number;
    bestStreak: number;
  };
  todayProgressPercent: number;
  weeklyProgressPercent: number;
  setTodayForAllHabits: (completed: boolean) => Promise<void>;
  heatmapData: any;
}

const Sidebar: React.FC<SidebarProps> = ({
  openCreateModal,
  sortMode,
  setSortMode,
  todayFocusOnly,
  setTodayFocusOnly,
  completionStats,
  todayProgressPercent,
  weeklyProgressPercent,
  setTodayForAllHabits,
  heatmapData
}) => {
  return (
    <aside className="w-64 p-6 hidden lg:flex flex-col gap-6 flex-shrink-0 transition-colors duration-300">
      <div 
         onClick={openCreateModal}
         className="cursor-pointer bg-gradient-to-r from-gcal-blue to-purple-500 hover:from-gcal-blue-hover hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-3xl p-5 flex items-center gap-3 w-44 hover:scale-105 active:scale-95"
      >
         <Plus size={28} className="text-white" />
         <span className="font-bold text-lg">Create</span>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-gcal-muted uppercase tracking-wider mb-1">Filters & Sorting</h3>
        <div className="flex items-center gap-2 glassmorphism p-3 rounded-2xl transition-all hover:shadow-md" style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}>
           <span className="text-sm font-medium">Sort by:</span>
           <select 
              className="bg-transparent text-sm font-bold focus:outline-none bg-gradient-to-r from-gcal-blue to-purple-500 bg-clip-text text-transparent cursor-pointer"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
           >
             <option value={SortMode.TIME}>Time</option>
             <option value={SortMode.MANUAL}>Manual</option>
           </select>
        </div>
        <button
          onClick={() => setTodayFocusOnly(!todayFocusOnly)}
          className={`w-full text-left flex items-center justify-between gap-2 glassmorphism p-3 rounded-2xl transition-all hover:shadow-md text-sm ${
            todayFocusOnly ? 'ring-1 ring-gcal-blue' : ''
          }`}
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <span className="flex items-center gap-2 font-medium">
            <Target size={14} />
            Focus on today
          </span>
          <span className="text-gcal-muted">{todayFocusOnly ? 'On' : 'Off'}</span>
        </button>
      </div>

      <div className="glassmorphism rounded-2xl p-4 space-y-3" style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
        <h3 className="text-xs font-bold text-gcal-muted uppercase tracking-wider">Momentum</h3>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1"><Sparkles size={12} /> Today</span>
            <span className="font-bold">{completionStats.todayCompleted}/{completionStats.todayTotal}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gcal-surface/40 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gcal-blue to-purple-500" style={{ width: `${todayProgressPercent}%` }} />
          </div>
        </div>
        <div className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1"><BarChart3 size={12} /> Week rate</span>
          <span className="font-bold">{weeklyProgressPercent}%</span>
        </div>
        <div className="text-xs flex items-center justify-between">
          <span>Best streak</span>
          <span className="font-bold">{completionStats.bestStreak} day{completionStats.bestStreak === 1 ? '' : 's'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="secondary" className="text-xs px-2 py-2" onClick={() => setTodayForAllHabits(true)}>
            Complete today
          </Button>
          <Button variant="ghost" className="text-xs px-2 py-2" onClick={() => setTodayForAllHabits(false)}>
            Reset today
          </Button>
        </div>
      </div>

      {/* Heatmap Calendar */}
      <div className="mt-auto pt-6">
        <h3 className="text-xs font-bold text-gcal-muted uppercase tracking-wider mb-3">Activity</h3>
        <HeatmapCalendar heatmapData={heatmapData} />
      </div>
    </aside>
  );
};

export default Sidebar;
