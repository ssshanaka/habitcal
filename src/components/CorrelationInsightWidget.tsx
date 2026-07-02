import React from 'react';
import { LucideIcon } from 'lucide-react';
import { CorrelationInsight } from '../services/correlationService';

interface CorrelationInsightWidgetProps {
  insight: CorrelationInsight;
}

const IconMap: Record<string, any> = {
  Clock: 'Clock',
  Zap: 'Zap',
  CloudRain: 'CloudRain',
  Sun: 'Sun',
  TrendingUp: 'TrendingUp',
};

// Since we are using Lucide icons by name, we need a way to render them.
// For simplicity in this implementation, we'll import them and map them.
import * as Icons from 'lucide-react';

const CorrelationInsightWidget: React.FC<CorrelationInsightWidgetProps> = ({ insight }) => {
  const IconComponent = (Icons as any)[insight.iconName] || Icons.Sparkles;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <IconComponent size={20} />
          </div>
          <div>
            <div className="font-bold text-gcal-text">{insight.title}</div>
            <div className="text-[10px] text-gcal-muted uppercase tracking-tighter">
              {insight.type.replace('-', ' ')}
            </div>
          </div>
        </div>
      </div>

      <div className={`text-xs font-medium leading-relaxed p-3 rounded-2xl border ${insight.color.replace('text-', 'bg-').replace('400', '50/10')} ${insight.color}`}>
        {insight.message}
      </div>
    </div>
  );
};

export default CorrelationInsightWidget;
