
import React from 'react';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onExit: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onExit }) => {
  const renderButton = (tab: AppTab, label: string) => (
    <button 
      key={tab}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveTab(tab);
      }}
      className={`py-4 rounded-2xl font-oswald text-[11px] uppercase italic border transition-all duration-300 flex items-center justify-center ${
        activeTab === tab 
          ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-900/20 translate-y-[-2px]' 
          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="bg-slate-950 border-b border-slate-900 py-3 px-4 relative z-[10] backdrop-blur-xl">
      <div className="max-w-5xl mx-auto flex flex-col gap-20 pt-2">
        {/* Top utility row */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="accent-pulse-glow w-1.5 h-1.5 rounded-full animate-blipper"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">SOVEREIGN SOUL</span>
          </div>
          <button 
            onClick={onExit}
            className="text-[8px] text-red-500 font-black uppercase tracking-widest px-4 py-2.5 bg-red-950/10 rounded-xl border border-red-900/20 hover:bg-red-900/20 transition-colors"
          >
            EXIT SYSTEM
          </button>
        </div>

        {/* Navigation Grid */}
        <nav className="grid grid-cols-3 gap-x-2 gap-y-3 pb-6">
          {renderButton('warmup', 'WARMUP')}
          {renderButton('workout', 'WORKOUT')}
          {renderButton('logs', 'LOGS')}
          
          <div />
          {renderButton('settings', 'SETTINGS')}
          <div />
        </nav>
      </div>
    </header>
  );
};

export default Header;
