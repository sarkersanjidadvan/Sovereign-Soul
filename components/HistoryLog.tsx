
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { EXERCISES } from '../constants';

interface Props {
  stats: UserStats;
}

const HistoryLog: React.FC<Props> = ({ stats }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const today = new Date();
  const daysInMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay(); 

  // Sovereign Week Starts Saturday (6)
  const sovereignFirstDay = (firstDayOfMonth + 1) % 7;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: sovereignFirstDay }, (_, i) => i);

  const selectedProgress = stats.history.find(h => h.date === selectedDate);

  const getStatusColor = (dateStr: string) => {
    const progress = stats.history.find(h => h.date === dateStr);
    if (!progress) return 'bg-slate-800/50 text-slate-600';
    if (progress.isRestDay) return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    const isComplete = progress.exercises.every(e => e.isComplete);
    if (isComplete) return 'bg-orange-500 text-white shadow-lg shadow-orange-500/20';
    return 'bg-orange-500/30 text-orange-300 border border-orange-500/50';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700 flex flex-col items-center">
        <div className="text-5xl font-oswald text-orange-500 tracking-widest mb-2">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>
        <div className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] italic">
          {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-oswald text-xl text-white uppercase italic tracking-wider">Soul Records</h3>
          <span className="text-xs text-orange-500 font-black uppercase tracking-widest">{today.toLocaleString('default', { month: 'long' })} cycle</span>
        </div>
        
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'].map(d => (
            <div key={d} className="text-[10px] font-black text-slate-600 tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {blanks.map(b => <div key={`b-${b}`} className="aspect-square" />)}
          {days.map(d => {
            const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={d}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative ${getStatusColor(dateStr)} ${
                  isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110 z-10' : 'hover:scale-105'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800/40 rounded-3xl border border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-700/30 border-b border-slate-700 flex justify-between items-center">
          <h4 className="font-oswald text-white uppercase italic tracking-wider">Cycle Detail: {selectedDate}</h4>
        </div>
        <div className="p-6">
          {selectedProgress ? (
            <div className="space-y-4">
              {selectedProgress.isRestDay ? (
                <div className="text-center py-6">
                  <i className="fa-solid fa-couch text-4xl text-blue-500 mb-2"></i>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Rest and Recovery Day</p>
                </div>
              ) : (
                selectedProgress.exercises.map(ex => {
                  const def = EXERCISES.find(d => d.id === ex.exerciseId);
                  const percent = Math.min(100, (ex.currentValue / (def?.target || 1)) * 100);
                  return (
                    <div key={ex.exerciseId}>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        <span>{def?.name}</span>
                        <span className={ex.isComplete ? 'text-orange-500' : ''}>
                          {ex.currentValue} / {def?.target}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${ex.isComplete ? 'bg-orange-500' : 'bg-orange-500/30'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600 font-bold uppercase tracking-widest text-[10px]">
              No cycle data found for this period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryLog;
