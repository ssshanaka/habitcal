import React from 'react';
import { formatDateKey } from '@/utils';

interface HeatmapCalendarProps {
  heatmapData: Record<string, number>;
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ heatmapData }) => {
  // Generate last 12 weeks of dates (84 days rolling window)
  const generateCalendarData = () => {
    const weeks: Date[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the start of the current week (Sunday)
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    currentWeekStart.setDate(today.getDate() - dayOfWeek);
    
    // Go back 11 more weeks to get the start date (so current week will be week 12)
    const startDate = new Date(currentWeekStart);
    startDate.setDate(currentWeekStart.getDate() - (11 * 7));
    
    // Generate exactly 12 weeks of data
    let currentDate = new Date(startDate);
    
    for (let week = 0; week < 12; week++) {
      const weekDays: Date[] = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }
    
    return weeks;
  };

  const weeks = generateCalendarData();
  
  // Get color intensity based on completion count - using orange-red gradient like streaks
  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gcal-surface/10 border border-gcal-border/30';
    if (count === 1) return 'bg-gradient-to-r from-orange-500/30 to-red-500/30';
    if (count === 2) return 'bg-gradient-to-r from-orange-500/50 to-red-500/50';
    if (count === 3) return 'bg-gradient-to-r from-orange-500/70 to-red-500/70';
    if (count === 4) return 'bg-gradient-to-r from-orange-500/90 to-red-500/90';
    return 'bg-gradient-to-r from-orange-500 to-red-500 shadow-md';
  };

  // Get month labels for the calendar
  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, index) => {
      const firstDay = week[0];
      const month = firstDay.getMonth();
      
      if (month !== lastMonth) {
        labels.push({
          month: firstDay.toLocaleString('default', { month: 'short' }),
          weekIndex: index
        });
        lastMonth = month;
      }
    });
    
    return labels;
  };

  const monthLabels = getMonthLabels();
  const today = new Date();

  return (
    <div className="glassmorphism rounded-2xl p-4" style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}>
      {/* Month labels */}
      <div className="flex mb-2 ml-5" style={{ height: '14px' }}>
        {monthLabels.map((label, idx) => (
          <div
            key={idx}
            className="text-[9px] font-bold text-gcal-muted uppercase"
            style={{ 
              position: 'absolute',
              left: `${20 + label.weekIndex * 14}px`
            }}
          >
            {label.month}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex gap-[2px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] mr-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div
              key={idx}
              className="w-3 h-3 flex items-center justify-center text-[8px] font-bold text-gcal-muted"
              title={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx]}
            >
              {idx % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Week columns */}
        <div className="flex gap-[2px]">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[2px]">
              {week.map((date, dayIdx) => {
                const dateKey = formatDateKey(date);
                const count = heatmapData[dateKey] || 0;
                const isToday = 
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
                const isFuture = date > today;
                
                return (
                  <div
                    key={dayIdx}
                    className={`
                      w-3 h-3 rounded-[2px] transition-all duration-200 hover:scale-125
                      ${isFuture ? 'opacity-20' : ''}
                      ${isToday ? 'ring-1 ring-gcal-blue ring-offset-1 ring-offset-transparent' : ''}
                      ${getIntensityColor(count)}
                    `}
                    title={`${date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}: ${count} habit${count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3 text-[9px] text-gcal-muted">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 3, 5].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-[2px] ${getIntensityColor(level)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
