
import React from 'react';
import { UserStats } from '../types';

interface Props {
  stats: UserStats;
  onResetData: () => void;
}

const Settings: React.FC<Props> = ({ stats, onResetData }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="text-center mb-8">
        <h2 className="font-oswald text-3xl text-white uppercase italic tracking-widest mb-2">Settings</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">System protocols and data management</p>
      </div>

      <div className="bg-red-950/10 border border-red-900/20 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
        </div>
        <h3 className="font-oswald text-2xl text-red-500 uppercase italic mb-2 tracking-wider">Danger Zone</h3>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed max-w-xs mx-auto">
          Resetting will erase all training logs, soul records, and system progress forever. This action is irreversible.
        </p>
        <button 
          onClick={() => { if(confirm("Are you certain? The Sovereign Soul never retreats, but sometimes we must restart the journey.")) onResetData(); }}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-oswald uppercase italic tracking-widest py-5 rounded-2xl shadow-xl transition-all active:scale-95"
        >
          WIPE ALL DATA
        </button>
      </div>
    </div>
  );
};

export default Settings;
