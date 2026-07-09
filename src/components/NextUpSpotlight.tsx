import React from 'react';
import { Sparkles } from 'lucide-react';
import { Insight } from '../utils/analysis';

interface NextUpSpotlightProps {
  insight: Insight | null;
}

const NextUpSpotlight: React.FC<NextUpSpotlightProps> = ({ insight }) => {
  return (
    <div className="px-4 py-3 mb-4 glassmorphism rounded-2xl border border-gcal-blue/20 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gcal-blue/10 rounded-lg">
          <Sparkles className="text-gcal-blue" size={18} />
        </div>
        <div className="flex-1">
          {insight ? (
            <>
              <p className="text-xs font-bold text-gcal-blue uppercase tracking-wider mb-0.5">Coach's Recommendation</p>
              <p className="text-sm text-gcal-text font-medium leading-relaxed">
                {insight.message}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-gcal-muted uppercase tracking-wider mb-0.5">Ready to go?</p>
              <p className="text-sm text-gcal-text font-medium leading-relaxed">
                Select a habit to begin your routine.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextUpSpotlight;
