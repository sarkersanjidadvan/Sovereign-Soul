
import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';

type ToolView = 'selector' | 'tapper' | 'stopwatch';

interface Props {
  onBack: () => void;
}

const QuickTools: React.FC<Props> = ({ onBack }) => {
  const [view, setView] = useState<ToolView>('selector');

  // Tapper State
  const [tapCount, setTapCount] = useState(0);

  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swRef = useRef<number | null>(null);

  useEffect(() => {
    if (swRunning) {
      swRef.current = window.setInterval(() => {
        setSwTime(prev => prev + 1);
      }, 1000);
    } else {
      if (swRef.current) clearInterval(swRef.current);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  const formatStopwatch = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToolSelect = (tool: ToolView) => {
    audioService.playDing();
    setView(tool);
  };

  const renderSelector = () => (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-10">
        <h2 className="font-oswald text-3xl text-white uppercase italic tracking-widest">SOVEREIGN TOOLS</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic mt-2">Specialized utilities for the elite</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => handleToolSelect('tapper')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center justify-between group hover:border-orange-500/50 transition-all"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <i className="fa-solid fa-arrow-pointer text-2xl"></i>
            </div>
            <div className="text-left">
              <h3 className="font-oswald text-xl text-white uppercase italic">The Tapper</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Unlimited Count Protocol</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-slate-700"></i>
        </button>

        <button 
          onClick={() => handleToolSelect('stopwatch')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center justify-between group hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <i className="fa-solid fa-stopwatch text-2xl"></i>
            </div>
            <div className="text-left">
              <h3 className="font-oswald text-xl text-white uppercase italic">Stopwatch</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Infinite Temporal Tracking</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-slate-700"></i>
        </button>
      </div>

      <button 
        onClick={onBack}
        className="w-full mt-8 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i> Return to Training
      </button>
    </div>
  );

  const renderTapper = () => (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-right duration-300 py-10">
      <div className="text-center">
        <h3 className="font-oswald text-xl text-slate-500 uppercase italic tracking-widest">TAPPER PROTOCOL</h3>
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Tap to Forge Your Record</p>
      </div>

      <div className="text-7xl font-oswald text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        {tapCount}
      </div>

      <button 
        onClick={() => { setTapCount(c => c + 1); audioService.playThud(); }}
        className="w-64 h-64 bg-orange-600 rounded-full shadow-[0_0_50px_rgba(234,88,12,0.3)] border-8 border-slate-950 flex items-center justify-center active:scale-90 transition-transform"
      >
        <i className="fa-solid fa-hand-fist text-white text-6xl"></i>
      </button>

      <div className="flex gap-4 w-full max-w-xs">
        <button 
          onClick={() => { setTapCount(0); audioService.playDing(); }}
          className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors"
        >
          Reset Count
        </button>
        <button 
          onClick={() => setView('selector')}
          className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );

  const renderStopwatch = () => (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-right duration-300 py-10">
      <div className="text-center">
        <h3 className="font-oswald text-xl text-blue-500 uppercase italic tracking-widest">ELITE STOPWATCH</h3>
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Precision Time Tracking</p>
      </div>

      <div className="text-6xl font-oswald text-white tabular-nums border-y border-slate-800 py-6 px-10 rounded-2xl bg-slate-950">
        {formatStopwatch(swTime)}
      </div>

      <div className="flex gap-6">
        <button 
          onClick={() => { setSwRunning(!swRunning); audioService.playDing(); }}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl transition-all shadow-xl ${
            swRunning 
              ? 'bg-red-600 text-white shadow-red-900/20 rotate-90' 
              : 'bg-green-600 text-white shadow-green-900/20'
          }`}
        >
          <i className={`fa-solid ${swRunning ? 'fa-pause' : 'fa-play'}`}></i>
        </button>

        <button 
          onClick={() => { setSwTime(0); setSwRunning(false); }}
          className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 text-2xl hover:text-white transition-all"
        >
          <i className="fa-solid fa-rotate-left"></i>
        </button>
      </div>

      <button 
        onClick={() => setView('selector')}
        className="mt-4 px-10 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors"
      >
        Back to Menu
      </button>
    </div>
  );

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      {view === 'selector' && renderSelector()}
      {view === 'tapper' && renderTapper()}
      {view === 'stopwatch' && renderStopwatch()}
    </div>
  );
};

export default QuickTools;
