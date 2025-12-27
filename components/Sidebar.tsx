import React from 'react';
import { Home, Type, Image as ImageIcon, ShieldAlert, ScanText, Settings, Shield, MessageSquareText } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  hasResult: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, hasResult }) => {
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, disabled: false },
    { id: 'chat', label: 'Cyberfriend', icon: MessageSquareText, disabled: false },
    { id: 'text', label: 'Text Analysis', icon: Type, disabled: false },
    { id: 'image', label: 'Image Analysis', icon: ImageIcon, disabled: false },
    { id: 'risk', label: 'Risk Management', icon: ShieldAlert, disabled: !hasResult },
    { id: 'ocr', label: 'OCR Extraction', icon: ScanText, disabled: !hasResult },
    { id: 'settings', label: 'Settings', icon: Settings, disabled: false },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 glass border-r border-border flex flex-col z-40 transition-all duration-300 bg-surface/50 backdrop-blur-xl">
      {/* Brand */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-border">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Shield className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-textMain">
            FraudShield <span className="text-indigo-400">AI</span>
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && onChangeView(item.id as ViewState)}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                ${isActive 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                  : 'text-textMuted hover:bg-surfaceHighlight hover:text-textMain'
                }
                ${item.disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-textMuted'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-medium text-textMuted">System Operational</span>
        </div>
        <p className="text-[10px] text-textMuted/60">
            Powered by Gemini 2.0 Flash
            <br />
            v1.2.0-stable
        </p>
      </div>
    </div>
  );
};

export default Sidebar;