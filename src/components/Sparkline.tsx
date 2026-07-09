import React from 'react';

interface SparklineProps {
  habitId: string;
  completions: Record<string, any>;
  isCompleted: (habitId: string, date: Date) => boolean;
  color: string;
}

const Sparkline: React.FC<SparklineProps> = ({ habitId, completions, isCompleted, color }) => {
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(isCompleted(habitId, d));
  }

  const width = 60;
  const height = 20;
  const padding = 2;
  
  const points = days.map((completed, i) => {
    const x = (i * (width / (days.length - 1)));
    const y = completed ? padding : height - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex items-center justify-center px-1">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="transition-all duration-500"
        />
        {days.map((completed, i) => (
          <circle
            key={i}
            cx={(i * (width / (days.length - 1)))}
            cy={completed ? padding : height - padding}
            r="1.5"
            fill={completed ? color : 'var(--gcal-border)'}
            className="transition-all duration-500"
          />
        ))}
      </svg>
    </div>
  );
};

export default Sparkline;
