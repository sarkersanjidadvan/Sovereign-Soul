
import React from 'react';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onExit: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onExit }) => {
  return (
    <header className="bg-slate-950 border-b border-slate-900 py-4 px-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        {/* Top Utility Bar */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.8)]"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">SOVEREIGN V10.0</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`text-slate-500 hover:text-orange-500 transition-colors p-1 ${activeTab === 'settings' ? 'text-orange-500' : ''}`}
              title="Settings"
            >
              <i className="fa-solid fa-gear text-sm"></i>
            </button>
            <button 
              onClick={onExit}
              className="text-[9px] text-red-500 hover:text-red-400 font-black uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 bg-red-950/10 rounded border border-red-900/20 transition-all"
            >
              <i className="fa-solid fa-power-off text-[8px]"></i>
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation: Warmup | Training | Logs */}
        <div className="flex items-center justify-center gap-3 md:gap-6">
          <button 
            onClick={() => setActiveTab('warmup')}
            className={`px-6 md:px-10 py-3 rounded-full font-oswald text-base uppercase italic transition-all border flex items-center justify-center gap-2 flex-1 ${
              activeTab === 'warmup' 
                ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-900/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-orange-500/50'
            }`}
          >
            <i className="fa-solid fa-person-running text-xs"></i>
            <span>Warmup</span>
          </button>

          <button 
            onClick={() => setActiveTab('workout')}
            className={`px-6 md:px-10 py-3 rounded-full font-oswald text-base uppercase italic transition-all border flex items-center justify-center gap-2 flex-1 ${
              activeTab === 'workout' 
                ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-900/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-orange-500/50'
            }`}
          >
            <i className="fa-solid fa-hand-fist text-xs"></i>
            <span>Workout</span>
          </button>

          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-6 md:px-10 py-3 rounded-full font-oswald text-base uppercase italic transition-all border flex items-center justify-center gap-2 flex-1 ${
              activeTab === 'logs' 
                ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-900/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-orange-500/50'
            }`}
          >
            <i className="fa-solid fa-calendar-days text-xs"></i>
            <span>Logs</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
