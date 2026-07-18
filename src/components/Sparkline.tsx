import React from 'react';

interface SparklineProps {
  habitId: string;
  completions: Record<string, boolean | { completed: boolean; timestamp: string }>;
  isCompleted: (habitId: string, date: Date) => boolean;
  color: string;
}

const Sparkline: React.FC<SparklineProps> = ({ habitId, completions, isCompleted, color }) => {
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return isCompleted(habitId, d);
  });

  const width = 60;
  const height = 15;
  const barWidth = 6;
  const gap = 2;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((completed, i) => (
        <rect
          key={i}
          x={i * (barWidth + gap)}
          y={height - (completed ? height : 2)}
          width={barWidth}
          height={completed ? height : 2}
          rx="1"
          fill={completed ? color : '#e5e7eb'}
        />
      ))}
    </svg>
  );
};

export default Sparkline;
