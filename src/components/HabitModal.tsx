import React from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Habit, HabitFrequency } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingHabitId: string | null;
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string) => Promise<void>;
  newHabitTitle: string;
  setNewHabitTitle: (val: string) => void;
  newHabitDescription: string;
  setNewHabitDescription: (val: string) => void;
  newHabitTimeStart: string;
  setNewHabitTimeStart: (val: string) => void;
  newHabitTimeEnd: string;
  setNewHabitTimeEnd: (val: string) => void;
  newHabitColor: string;
  setNewHabitColor: (val: string) => void;
  newHabitCategory: string;
  setNewHabitCategory: (val: string) => void;
  newHabitDependencyId: string;
  setNewHabitDependencyId: (val: string) => void;
  newHabitFrequency: HabitFrequency;
  setNewHabitFrequency: (val: HabitFrequency) => void;
  newHabitDaysOfWeek: number[];
  setNewHabitDaysOfWeek: (val: number[]) => void;
  colors: string[];
  categories: string[];
  allHabits: Habit[];
}

const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  editingHabitId,
  onSave,
  onDelete,
  newHabitTitle,
  setNewHabitTitle,
  newHabitDescription,
  setNewHabitDescription,
  newHabitTimeStart,
  setNewHabitTimeStart,
  newHabitTimeEnd,
  setNewHabitTimeEnd,
  newHabitColor,
  setNewHabitColor,
  newHabitCategory,
  setNewHabitCategory,
  newHabitDependencyId,
  setNewHabitDependencyId,
  newHabitFrequency,
  setNewHabitFrequency,
  newHabitDaysOfWeek,
  setNewHabitDaysOfWeek,
  colors,
  categories,
  allHabits
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingHabitId ? "Edit habit" : "Add new habit"}
    >
       <form onSubmit={onSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">Title</label>
            <input 
              autoFocus
              type="text" 
              placeholder="e.g. Morning Meditation"
              className="w-full bg-transparent border-b-2 border-gcal-border focus:border-gcal-blue px-3 py-3 outline-none text-xl font-medium text-gcal-text transition-all duration-200 placeholder:text-gcal-muted/50"
              value={newHabitTitle}
              onChange={e => setNewHabitTitle(e.target.value)}
              style={{
                borderImage: newHabitTitle ? 'linear-gradient(to right, var(--gcal-blue), #a855f7) 1' : undefined
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">Description (optional)</label>
            <textarea
              rows={3}
              placeholder="What does success look like for this habit?"
              className="w-full bg-transparent border border-gcal-border focus:border-gcal-blue rounded-xl px-3 py-2 outline-none text-sm text-gcal-text transition-all duration-200 placeholder:text-gcal-muted/60 resize-none"
              value={newHabitDescription}
              onChange={e => setNewHabitDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">Start Time</label>
              <input 
                type="time" 
                className="w-full bg-transparent border-b-2 border-gcal-border focus:border-gcal-blue px-3 py-2 outline-none text-gcal-text transition-all duration-200 font-medium"
                value={newHabitTimeStart}
                onChange={e => setNewHabitTimeStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">End Time</label>
              <input 
                type="time" 
                className="w-full bg-transparent border-b-2 border-gcal-border focus:border-gcal-blue px-3 py-2 outline-none text-gcal-text transition-all duration-200 font-medium"
                value={newHabitTimeEnd}
                onChange={e => setNewHabitTimeEnd(e.target.value)}
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gcal-muted mb-3 uppercase tracking-wider">Category</label>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
               {categories.map(cat => (
                 <button
                   type="button"
                   key={cat}
                   onClick={() => setNewHabitCategory(cat)}
                   className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                     newHabitCategory === cat 
                       ? 'bg-gcal-blue text-white border-gcal-blue shadow-md scale-105' 
                       : 'bg-transparent border-gcal-border text-gcal-text hover:border-gcal-blue hover:bg-gcal-surface/50'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gcal-muted mb-2 uppercase tracking-wider">Depends On (Habit Chain)</label>
             <select 
               className="w-full bg-transparent border-b-2 border-gcal-border focus:border-gcal-blue px-3 py-3 outline-none text-sm text-gcal-text transition-all duration-200 font-medium"
               value={newHabitDependencyId}
               onChange={e => setNewHabitDependencyId(e.target.value)}
             >
               <option value="">No dependency</option>
               {allHabits
                 .filter(h => h.id !== editingHabitId)
                 .map(h => (
                   <option key={h.id} value={h.id}>{h.title}</option>
                 ))
               }
             </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-gcal-muted mb-3 uppercase tracking-wider">Frequency</label>
             <div className="flex gap-3 mb-4">
               {(Object.values(HabitFrequency) as HabitFrequency[]).map(freq => (
                 <button
                   type="button"
                   key={freq}
                   onClick={() => {
                     setNewHabitFrequency(freq);
                     if (freq === HabitFrequency.DAILY) setNewHabitDaysOfWeek([]);
                   }}
                   className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                     newHabitFrequency === freq 
                       ? 'border-gcal-blue bg-gcal-blue/10 text-gcal-blue' 
                       : 'border-gcal-border text-gcal-muted hover:border-gcal-muted'
                   }`}
                 >
                   {freq === HabitFrequency.DAILY ? 'Daily' : 'Weekly'}
                 </button>
               ))}
             </div>

             {newHabitFrequency === HabitFrequency.WEEKLY && (
               <div className="flex justify-between gap-2 mb-6">
                 {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                   <button
                     type="button"
                     key={i}
                     onClick={() => {
                       if (newHabitDaysOfWeek.includes(i)) {
                         setNewHabitDaysOfWeek(newHabitDaysOfWeek.filter(d => d !== i));
                       } else {
                         setNewHabitDaysOfWeek([...newHabitDaysOfWeek, i].sort());
                       }
                     }}
                     className={`w-10 h-10 rounded-full text-xs font-bold transition-all duration-200 border-2 ${
                       newHabitDaysOfWeek.includes(i)
                         ? 'bg-gcal-blue border-gcal-blue text-white shadow-md scale-110'
                         : 'border-gcal-border text-gcal-muted hover:border-gcal-muted'
                     }`}
                   >
                     {day}
                   </button>
                 ))}
               </div>
             )}
          </div>

          <div>
             <label className="block text-xs font-bold text-gcal-muted mb-3 uppercase tracking-wider">Color</label>
             <div className="flex gap-3 flex-wrap">
               {colors.map(c => (
                 <button
                   type="button"
                   key={c}
                   onClick={() => setNewHabitColor(c)}
                   className={`w-10 h-10 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${
                     newHabitColor === c 
                       ? 'scale-125 ring-4 ring-gcal-blue ring-offset-2 ring-offset-transparent' 
                       : 'hover:scale-110'
                   }`}
                   style={{ backgroundColor: c }}
                 />
               ))}
             </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-5 border-t border-gcal-border/50">
             {editingHabitId ? (
               <Button type="button" variant="ghost" onClick={() => onDelete(editingHabitId)} className="text-red-400 hover:text-red-500 hover:bg-red-500/10 px-2 sm:px-4 font-medium">
                  <Trash2 size={20} /> <span className="hidden sm:inline ml-2">Delete</span>
               </Button>
             ) : <div></div>}
             
             <div className="flex gap-3">
               <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
               <Button type="submit" variant="gradient" className="px-8 shadow-lg">
                  {editingHabitId ? 'Update' : 'Save'}
               </Button>
             </div>
          </div>
       </form>
    </Modal>
  );
};

export default HabitModal;
