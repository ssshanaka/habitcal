import React, { useState } from 'react';
import { Button } from './Button';
import { aiRoutineArchitect, AIResponse } from '../services/aiRoutineArchitect';
import { Sparkles, Loader2, Check, X, Calendar } from 'lucide-react';

interface AIRoutineArchitectProps {
  onPackageGenerated: (pkg: AIResponse) => void;
}

export function AIRoutineArchitect({ onPackageGenerated }: AIRoutineArchitectProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const generated = await aiRoutineArchitect.generatePackage({ goal: prompt });
      setResult(generated);
    } catch (err) {
      console.error('AI Generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onPackageGenerated(result);
      setResult(null);
      setPrompt('');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {!result ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-gcal-blue/10 to-purple-500/10 border border-gcal-blue/20 flex gap-3">
            <Sparkles size={20} className="text-gcal-blue flex-shrink-0" />
            <p className="text-xs text-gcal-muted leading-relaxed">
              Describe your goals (e.g., "I want to train for a 5k while learning TypeScript") and our AI will architect an optimized routine for you.
            </p>
          </div>

          <div className="space-y-3">
            <textarea 
              placeholder="Describe your ideal routine or goal..."
              className="w-full bg-gcal-surface/50 border border-gcal-border rounded-2xl px-4 py-3 outline-none text-sm text-gcal-text resize-none focus:border-gcal-blue transition-all"
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <Button 
              className="w-full py-3 shadow-lg bg-gradient-to-r from-gcal-blue to-purple-600 hover:from-gcal-blue hover:to-purple-700 text-white"
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Architecting Routine...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gcal-surface border border-gcal-border shadow-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gcal-text">{result.packageName}</h3>
                <p className="text-xs text-gcal-muted">{result.description}</p>
              </div>
              <div className="p-2 bg-gcal-blue/10 rounded-xl text-gcal-blue">
                <Calendar size={20} />
              </div>
            </div>

            <div className="space-y-3">
              {result.habits.map((habit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gcal-surface/50 border border-gcal-border/50 group hover:border-gcal-blue/30 transition-all">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: habit.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gcal-text truncate">{habit.title}</span>
                      <span className="text-[10px] text-gcal-muted font-mono">{habit.timeStart} - {habit.timeEnd}</span>
                    </div>
                    {habit.description && <p className="text-[11px] text-gcal-muted truncate">{habit.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1 py-3" 
              onClick={() => setResult(null)}
            >
              <X size={18} className="mr-2" />
              Discard
            </Button>
            <Button 
              className="flex-1 py-3 shadow-lg bg-gcal-blue text-white" 
              onClick={handleApply}
            >
              <Check size={18} className="mr-2" />
              Apply Routine
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
