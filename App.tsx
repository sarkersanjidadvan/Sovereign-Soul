
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ExerciseCard from './components/ExerciseCard';
import HistoryLog from './components/HistoryLog';
import Settings from './components/Settings';
import QuickTools from './components/QuickTools';
import { EXERCISES, WARMUP_EXERCISES } from './constants';
import { DailyProgress, UserStats, ExerciseProgress, AppTab } from './types';
import { audioService } from './services/audioService';

const STORAGE_KEY = 'sovereign_soul_user_data_v10';

const App: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    unlockedChallenges: false,
    history: [],
    restDaysPreference: [],
    profile: { name: 'Sovereign Warrior', age: 0, gender: 'Warrior' }
  });
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('workout');
  const [currentTime, setCurrentTime] = useState(new Date());

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const initializeDay = useCallback((currentStats: UserStats) => {
    const today = getTodayStr();
    const todaysLog = currentStats.history.find(h => h.date === today);

    if (todaysLog) {
      setDailyProgress({ ...todaysLog });
    } else {
      setDailyProgress({
        date: today,
        exercises: EXERCISES.map(ex => ({ exerciseId: ex.id, currentValue: 0, isComplete: false, isOneSet: false })),
        warmupProgress: WARMUP_EXERCISES.map(ex => ({ exerciseId: ex.id, currentValue: 0, isComplete: false, isOneSet: false })),
        isAllOneSetDay: false,
        isRestDay: false
      });
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const loadedStats: UserStats = JSON.parse(saved);
      setStats(loadedStats);
      initializeDay(loadedStats);
    } else {
      const initial: UserStats = { 
        unlockedChallenges: false, 
        history: [], 
        restDaysPreference: [],
        profile: { name: 'Sovereign Warrior', age: 0, gender: 'Warrior' }
      };
      setStats(initial);
      initializeDay(initial);
    }
  }, [initializeDay]);

  useEffect(() => {
    if (dailyProgress) {
      const newHistory = [...stats.history];
      const idx = newHistory.findIndex(h => h.date === dailyProgress.date);
      if (idx > -1) newHistory[idx] = dailyProgress;
      else newHistory.push(dailyProgress);

      const updatedStats = { ...stats, history: newHistory };
      setStats(updatedStats);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStats));
    }
  }, [dailyProgress]);

  const toggleRestDay = () => {
    if (!dailyProgress) return;
    const newState = !dailyProgress.isRestDay;
    setDailyProgress({ ...dailyProgress, isRestDay: newState });
    if (newState) {
      audioService.playDing();
    }
  };

  const updateProgress = useCallback((exerciseId: string, value: number, isWarmup: boolean = false) => {
    setDailyProgress(prev => {
      if (!prev || prev.isRestDay) return prev;
      const pool = isWarmup ? WARMUP_EXERCISES : EXERCISES;
      const exercise = pool.find(e => e.id === exerciseId);
      if (!exercise) return prev;
      const finalValue = isWarmup ? Math.min(value, exercise.target) : value;
      const updateList = (list: ExerciseProgress[]) => list.map(ex => {
        if (ex.exerciseId === exerciseId) {
          const isComplete = finalValue >= exercise.target;
          return { ...ex, currentValue: finalValue, isComplete };
        }
        return ex;
      });
      return isWarmup ? { ...prev, warmupProgress: updateList(prev.warmupProgress) } : { ...prev, exercises: updateList(prev.exercises) };
    });
  }, []);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onExit={() => { if(confirm("Exit Arena?")) window.location.href="about:blank"; }} />
      
      <main className="max-w-4xl mx-auto px-4 pt-8">
        {activeTab === 'logs' ? (
          <HistoryLog stats={stats} />
        ) : activeTab === 'settings' ? (
          <Settings stats={stats} onResetData={handleReset} />
        ) : activeTab === 'tools' ? (
          <QuickTools onBack={() => setActiveTab('workout')} />
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                  <p className="text-orange-500 font-black uppercase tracking-[0.2em] text-[10px] italic">Protocol</p>
                  <h2 className="font-oswald text-2xl text-white uppercase italic tracking-tight">Warrior Status</h2>
                </div>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-2 text-slate-400 hover:text-white transition-all"
                >
                  <i className="fa-solid fa-gear text-sm"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">
                  Current Temporal Marker
                </div>
                <div className="text-5xl font-oswald text-white tabular-nums tracking-wider mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  {formatTime(currentTime)}
                </div>
                <div className="text-orange-500 font-bold uppercase tracking-[0.2em] text-xs">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>

            {dailyProgress?.isRestDay ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
                  <i className="fa-solid fa-couch text-3xl text-blue-500"></i>
                </div>
                <h2 className="font-oswald text-3xl text-white uppercase italic mb-3">Sovereign Rest</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic max-w-xs leading-loose">The warrior who knows when to heal is the warrior who lives to conquer.</p>
                <button onClick={toggleRestDay} className="mt-10 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors">Resume Protocol</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {(activeTab === 'warmup' ? WARMUP_EXERCISES : EXERCISES).map((ex) => {
                  const pool = activeTab === 'warmup' ? dailyProgress?.warmupProgress : dailyProgress?.exercises;
                  const prog = pool?.find(p => p.exerciseId === ex.id) || { exerciseId: ex.id, currentValue: 0, isComplete: false, isOneSet: false };
                  return (
                    <ExerciseCard key={ex.id} exercise={ex} progress={prog} onUpdate={(val) => updateProgress(ex.id, val, activeTab === 'warmup')} isWarmup={activeTab === 'warmup'} />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-slate-950/95 backdrop-blur-xl border-t border-slate-900 p-4 z-50">
        <div className="max-w-md mx-auto flex items-center justify-around gap-6">
          <button 
            onClick={() => setActiveTab('workout')} 
            className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${activeTab === 'workout' ? 'text-orange-500 scale-105' : 'text-slate-700 hover:text-slate-500'}`}
          >
            <i className="fa-solid fa-hand-fist text-xl"></i>
            <span className="text-[9px] font-black uppercase tracking-widest">Train</span>
          </button>
          
          <div className="relative -mt-10">
            <button 
              onClick={() => { audioService.playDing(); setActiveTab('tools'); }}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-orange-950 border-4 border-slate-950 transition-all active:scale-90 group overflow-hidden ${
                activeTab === 'tools' ? 'bg-white text-orange-600' : 'bg-gradient-to-br from-orange-500 to-orange-700 text-white'
              }`}
            >
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <i className="fa-solid fa-bolt text-2xl group-active:animate-ping"></i>
            </button>
          </div>

          <button 
            onClick={toggleRestDay} 
            className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${dailyProgress?.isRestDay ? 'text-blue-500 scale-105' : 'text-slate-700 hover:text-blue-400'}`}
          >
            <i className={`fa-solid ${dailyProgress?.isRestDay ? 'fa-couch' : 'fa-bed'} text-xl`}></i>
            <span className="text-[9px] font-black uppercase tracking-widest">Rest</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
