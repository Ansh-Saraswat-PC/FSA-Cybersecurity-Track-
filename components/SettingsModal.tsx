import React, { useState, useEffect } from 'react';
import { X, Save, Sliders } from 'lucide-react';
import { RiskThresholds } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThresholds: RiskThresholds;
  onSave: (newThresholds: RiskThresholds) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentThresholds, onSave }) => {
  const [localThresholds, setLocalThresholds] = useState<RiskThresholds>(currentThresholds);

  useEffect(() => {
    setLocalThresholds(currentThresholds);
  }, [currentThresholds, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof RiskThresholds, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setLocalThresholds(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const handleSave = () => {
    // Basic validation to ensure order
    if (localThresholds.low < localThresholds.medium && localThresholds.medium < localThresholds.high) {
        onSave(localThresholds);
        onClose();
    } else {
        alert("Thresholds must be in ascending order (Low < Medium < High).");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10 relative animate-in zoom-in-95 duration-200 bg-[#09090b]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400">
                <Sliders className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Risk Thresholds</h2>
                <p className="text-xs text-zinc-400">Customize sensitivity levels for analysis</p>
            </div>
        </div>

        <div className="space-y-8">
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-400 font-medium">Safe / Low Risk</span>
                    <span className="bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-300 font-mono">0 - {localThresholds.low}</span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="90" 
                    value={localThresholds.low} 
                    onChange={(e) => handleChange('low', e.target.value)}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-yellow-400 font-medium">Suspicious</span>
                    <span className="bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-300 font-mono">{localThresholds.low + 1} - {localThresholds.medium}</span>
                </div>
                <input 
                    type="range" 
                    min={localThresholds.low + 1} 
                    max="95" 
                    value={localThresholds.medium} 
                    onChange={(e) => handleChange('medium', e.target.value)}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-orange-400 font-medium">High Risk</span>
                    <span className="bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-300 font-mono">{localThresholds.medium + 1} - {localThresholds.high}</span>
                </div>
                <input 
                    type="range" 
                    min={localThresholds.medium + 1} 
                    max="99" 
                    value={localThresholds.high} 
                    onChange={(e) => handleChange('high', e.target.value)}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-end pt-1">
                   <span className="text-xs text-red-400 font-medium">Critical: {localThresholds.high + 1} - 100</span>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
                <Save className="w-4 h-4" />
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;