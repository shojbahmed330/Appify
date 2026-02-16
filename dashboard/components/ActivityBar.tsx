
import React from 'react';
import { Files, Search, Settings, History, Code2, Sparkles } from 'lucide-react';

interface ActivityBarProps {
  activeView: 'explorer' | 'search' | 'history' | 'config';
  onViewChange: (view: any) => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onViewChange }) => {
  const items = [
    { id: 'explorer', icon: Files, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'config', icon: Settings, label: 'Config' },
  ];

  return (
    <div className="w-14 bg-[#09090b] border-r border-white/5 flex flex-col items-center py-4 gap-4 shrink-0">
      <div className="mb-4 text-pink-500">
        <Sparkles size={24} />
      </div>
      
      {items.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            title={item.label}
            className={`p-3 rounded-xl transition-all relative group ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-pink-500 rounded-r-full shadow-[0_0_10px_#ec4899]"></div>}
            <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''} />
          </button>
        );
      })}

      <div className="mt-auto">
        <button 
          onClick={() => onViewChange('config')}
          className="p-3 text-zinc-600 hover:text-white transition-colors"
        >
          <Code2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default ActivityBar;
