import React from 'react';
import { Mood } from '../types';
import { Smile, Meh, Frown } from 'lucide-react';

interface MoodCheckinProps {
  onSelect: (mood: Mood) => void;
  selectedMood: Mood | null;
}

const MoodCheckin: React.FC<MoodCheckinProps> = ({ onSelect, selectedMood }) => {
  if (selectedMood) return null; // Hide if already selected today

  return (
    <div className="mb-8 glass-panel p-6 rounded-2xl border border-primary/20 animate-fade-in-down">
      <h3 className="text-lg font-semibold text-white mb-4">How are you feeling today? 🧠</h3>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onSelect(Mood.GREAT)}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-card hover:bg-success/20 hover:border-success/50 border border-transparent transition-all group"
        >
          <Smile className="w-8 h-8 text-success mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-gray-300">Great</span>
        </button>
        <button
          onClick={() => onSelect(Mood.OKAY)}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-card hover:bg-warning/20 hover:border-warning/50 border border-transparent transition-all group"
        >
          <Meh className="w-8 h-8 text-warning mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-gray-300">Okay</span>
        </button>
        <button
          onClick={() => onSelect(Mood.EXHAUSTED)}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-card hover:bg-alert/20 hover:border-alert/50 border border-transparent transition-all group"
        >
          <Frown className="w-8 h-8 text-alert mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-gray-300">Exhausted</span>
        </button>
      </div>
    </div>
  );
};

export default MoodCheckin;
