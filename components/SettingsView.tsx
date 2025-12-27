import React from 'react';
import { Save, Sliders, Moon, Sun, History as HistoryIcon, Trash2, ChevronRight } from 'lucide-react';
import { RiskThresholds, HistoryItem } from '../types';

interface SettingsViewProps {
  thresholds: RiskThresholds;
  onSaveThresholds: (newThresholds: RiskThresholds) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onLoadHistoryItem: (item: HistoryItem) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    thresholds, 
    onSaveThresholds, 
    theme, 
    onToggleTheme,
    history,
    onClearHistory,
    onLoadHistoryItem
}) => {
  const [localThresholds, setLocalThresholds] = React.useState<RiskThresholds>(thresholds);

  const handleChange = (key: keyof RiskThresholds, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setLocalThresholds(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const handleSave = () => {
    if (localThresholds.low < localThresholds.medium && localThresholds.medium < localThresholds.high) {
        onSaveThresholds(localThresholds);
        alert("Thresholds saved successfully!");
    } else {
        alert("Thresholds must be in ascending order (Low < Medium < High).");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-textMain">Settings</h2>
      </div>

      <div className="grid gap-8">
          
          {/* Appearance */}
          <section className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                      {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <h3 className="text-lg font-semibold text-textMain">Appearance</h3>
              </div>
              
              <div className="flex items-center justify-between">
                  <div>
                      <p className="text-sm font-medium text-textMain">Interface Theme</p>
                      <p className="text-xs text-textMuted">Toggle between light and dark mode.</p>
                  </div>
                  <button 
                    onClick={onToggleTheme}
                    className="relative inline-flex h-8 w-14 items-center rounded-full bg-surfaceHighlight transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                      <span className={`${theme === 'light' ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white transition-transform`} />
                  </button>
              </div>
          </section>

          {/* Risk Thresholds */}
          <section className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                    <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-textMain">Risk Thresholds</h3>
            </div>
            
            <div className="space-y-6 max-w-xl">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-emerald-500 font-medium">Safe / Low Risk</span>
                        <span className="bg-surfaceHighlight px-2 py-1 rounded text-xs text-textMain font-mono">0 - {localThresholds.low}</span>
                    </div>
                    <input 
                        type="range" min="1" max="90" 
                        value={localThresholds.low} 
                        onChange={(e) => handleChange('low', e.target.value)}
                        className="w-full h-2 bg-surfaceHighlight rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-yellow-500 font-medium">Suspicious</span>
                        <span className="bg-surfaceHighlight px-2 py-1 rounded text-xs text-textMain font-mono">{localThresholds.low + 1} - {localThresholds.medium}</span>
                    </div>
                    <input 
                        type="range" min={localThresholds.low + 1} max="95" 
                        value={localThresholds.medium} 
                        onChange={(e) => handleChange('medium', e.target.value)}
                        className="w-full h-2 bg-surfaceHighlight rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-orange-500 font-medium">High Risk</span>
                        <span className="bg-surfaceHighlight px-2 py-1 rounded text-xs text-textMain font-mono">{localThresholds.medium + 1} - {localThresholds.high}</span>
                    </div>
                    <input 
                        type="range" min={localThresholds.medium + 1} max="99" 
                        value={localThresholds.high} 
                        onChange={(e) => handleChange('high', e.target.value)}
                        className="w-full h-2 bg-surfaceHighlight rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Thresholds
                    </button>
                </div>
            </div>
          </section>

          {/* History */}
          <section className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <HistoryIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-textMain">Analysis History</h3>
                </div>
                {history.length > 0 && (
                    <button onClick={onClearHistory} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Clear
                    </button>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {history.length === 0 ? (
                      <p className="text-sm text-textMuted italic">No analysis history available.</p>
                  ) : (
                      history.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border hover:bg-surfaceHighlight transition-colors group">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className={`w-2 h-2 rounded-full ${
                                          item.riskScore > 80 ? 'bg-red-500' : 
                                          item.riskScore > 50 ? 'bg-orange-500' : 
                                          item.riskScore > 20 ? 'bg-yellow-500' : 'bg-emerald-500'
                                      }`} />
                                      <span className="text-sm font-medium text-textMain">{item.verdict}</span>
                                      <span className="text-[10px] text-textMuted bg-surfaceHighlight px-1.5 rounded uppercase">{item.type}</span>
                                  </div>
                                  <p className="text-xs text-textMuted">{item.date}</p>
                              </div>
                              <button 
                                onClick={() => onLoadHistoryItem(item)}
                                className="p-2 rounded-lg text-textMuted hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                              >
                                  <ChevronRight className="w-4 h-4" />
                              </button>
                          </div>
                      ))
                  )}
              </div>
          </section>

      </div>
    </div>
  );
};

export default SettingsView;