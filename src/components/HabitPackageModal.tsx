import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { HabitPackage } from '../types';
import { useHabitPackages } from '../hooks/useHabitPackages';
import { useToast } from '../hooks/useToast';
import { AIRoutineArchitect } from './AIRoutineArchitect';
import { AIResponse } from '../services/aiRoutineArchitect';
import { 
  Package, 
  Download, 
  Plus, 
  Trash2, 
  Info, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface HabitPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHabits: any[];
}

export function HabitPackageModal({ isOpen, onClose, currentHabits }: HabitPackageModalProps) {
  const { packages, loading, importPackage, createPackage } = useHabitPackages();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'ai'>('browse');
  
  // Form state for creating a package
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgDesc, setNewPkgDesc] = useState('');

  const handleImport = async (pkg: HabitPackage) => {
    if (window.confirm(`Are you sure you want to import "${pkg.name}"? This will create new habits in your tracker.`)) {
      await importPackage(pkg);
      addToast(`Imported package: ${pkg.name}`, 'success');
      onClose();
    }
  };

  const handleCreateFromCurrent = async () => {
    if (currentHabits.length === 0) {
      return;
    }
    if (!newPkgName.trim()) {
      return;
    }

    const habitsToSave = currentHabits.map(h => ({
      title: h.title,
      description: h.description,
      timeStart: h.timeStart,
      timeEnd: h.timeEnd,
      color: h.color,
      category: h.category,
      order: h.order || 0, // Ensure order is defined
    }));

    await createPackage(newPkgName, newPkgDesc, habitsToSave);
    setNewPkgName('');
    setNewPkgDesc('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Habit Packages">
      <div className="flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex p-1 bg-gcal-surface/50 rounded-2xl">
          <button 
            onClick={() => setActiveTab('browse')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'browse' ? 'bg-gcal-blue text-white shadow-lg' : 'text-gcal-muted hover:text-gcal-text'
            }`}
          >
            <Download size={16} />
            Browse
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'create' ? 'bg-gcal-blue text-white shadow-lg' : 'text-gcal-muted hover:text-gcal-text'
            }`}
          >
            <Plus size={16} />
            Create
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'ai' ? 'bg-gcal-blue text-white shadow-lg' : 'text-gcal-muted hover:text-gcal-text'
            }`}
          >
            <Sparkles size={16} />
            AI
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'browse' ? (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-gcal-muted">
                  <RefreshCw size={20} className="animate-spin mr-2" />
                  Loading packages...
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-10 text-gcal-muted">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No packages available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {packages.map(pkg => (
                    <div 
                      key={pkg.id} 
                      className="p-4 rounded-2xl border border-gcal-border bg-gcal-surface/30 hover:bg-gcal-surface/60 transition-all flex items-center justify-between group"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <h4 className="font-bold text-gcal-text truncate">{pkg.name}</h4>
                        <p className="text-xs text-gcal-muted truncate">{pkg.description || 'No description'}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] bg-gcal-blue/10 text-gcal-blue px-2 py-0.5 rounded-full font-bold uppercase">
                            {pkg.habits.length} Habits
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="secondary" 
                        onClick={() => handleImport(pkg)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Import
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'create' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gcal-blue/5 border border-gcal-blue/20 flex gap-3">
                <Info size={20} className="text-gcal-blue flex-shrink-0" />
                <p className="text-xs text-gcal-muted leading-relaxed">
                  Create a template from your current active habits. This allows you to quickly deploy the same routine later or share it.
                </p>
              </div>
              
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">Package Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Morning Zen"
                    className="w-full bg-transparent border-b border-gcal-border focus:border-gcal-blue px-3 py-2 outline-none text-gcal-text"
                    value={newPkgName}
                    onChange={e => setNewPkgName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">Description</label>
                  <textarea 
                    placeholder="What is this routine for?"
                    className="w-full bg-transparent border border-gcal-border rounded-xl px-3 py-2 outline-none text-sm text-gcal-text resize-none"
                    rows={3}
                    value={newPkgDesc}
                    onChange={e => setNewPkgDesc(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full py-3 shadow-lg"
                  onClick={handleCreateFromCurrent}
                  disabled={currentHabits.length === 0 || !newPkgName.trim() || loading}
                >
                  {loading ? 'Creating...' : 'Save from Current Habits'}
                </Button>
                {currentHabits.length === 0 && (
                  <p className="text-center text-xs text-red-400 font-medium">
                    You need at least one active habit to create a package.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <AIRoutineArchitect 
              onPackageGenerated={async (res) => {
                await createPackage(res.packageName, res.description, res.habits);
                addToast(`AI routine "${res.packageName}" saved to library!`, 'success');
                setActiveTab('browse');
              }} 
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
