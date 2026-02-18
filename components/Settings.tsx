
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

      {/* HELP ZONE / SYSTEM PHILOSOPHY */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <i className="fa-solid fa-scroll text-8xl text-white"></i>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
              <i className="fa-solid fa-book-open text-orange-500 text-xl"></i>
            </div>
            <h3 className="font-oswald text-2xl text-white uppercase italic tracking-wider">Help Zone</h3>
          </div>

          <div className="space-y-5 text-slate-400 text-[11px] font-medium leading-relaxed uppercase tracking-wide">
            <p>
              The workout was inspired by the <span className="text-orange-500 font-bold">"Saitama" aka "One Punch Man"</span> workout consisting of 100 push-ups, 100 sit-ups, 100 squats and a 10 K.M. run. 
            </p>
            <p>
              However personally I took and modified this workout to give it a structure on the philosophy of <span className="text-white italic">"Perform anywhere you are without needing anything"</span> hence the name <span className="text-orange-500 font-bold">"Sovereign Soul"</span>. Whether you are on an island, middle of a desert or in solitary confinement without any equipment giving a balanced approach to prepare for all types of scenario on the basis of strength, cardio, mobility, flexibility and endurance.
            </p>
            <p>
              This is also a personal project I made for myself to complete all the exercises at a stretch <span className="text-white font-bold">under 2 hours mark</span>. I give personal updates of some of the goals I am striving for on my social medias.
            </p>
            
            <div className="py-4 border-y border-slate-800/50">
              <p className="text-white font-black text-center italic tracking-[0.2em]">
                "The main goal is to reach the capability of doing all the exercises in a single one set. Simple as that."
              </p>
            </div>

            <p>
              One can easily go on self research on the impacts of the goals and types of exercises.
            </p>
            
            <p className="p-3 bg-red-950/10 border-l-2 border-red-900 text-[10px] text-red-400/80 italic font-bold">
              POINT TO BE NOTED THAT THIS IS A PERSONAL PROJECT AND ONE SHOULD CONSULT A PROFESSIONAL BEFORE ATTEMPTING SUCH ENDEAVOR.
            </p>

            <p>
              This means more to me than just a physical or mental training. For me this is a <span className="text-orange-500 font-bold">personal philosophical project</span>.
            </p>

            <div className="pt-4">
              <a 
                href="https://www.youtube.com/@sarkersanjidadvanevan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 rounded-xl text-red-500 transition-all group"
              >
                <i className="fa-brands fa-youtube text-lg group-hover:scale-110 transition-transform"></i>
                <span className="font-black tracking-widest text-[10px]">FIND ME ON YOUTUBE</span>
              </a>
            </div>
          </div>
        </div>
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
