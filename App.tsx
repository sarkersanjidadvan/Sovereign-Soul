
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isShuttingDown) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isShuttingDown]);

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

  const lastSaveTime = useRef(0);
  useEffect(() => {
    if (!dailyProgress || isShuttingDown) return;

    const performSave = () => {
      const newHistory = [...statsRef.current.history];
      const idx = newHistory.findIndex(h => h.date === dailyProgress.date);
      if (idx > -1) newHistory[idx] = dailyProgress;
      else newHistory.push(dailyProgress);

      const updatedStats = { ...statsRef.current, history: newHistory };
      setStats(updatedStats);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStats));
      lastSaveTime.current = Date.now();
    };

    const timeSinceLastSave = Date.now() - lastSaveTime.current;
    if (timeSinceLastSave > 3000) {
      performSave();
    } else {
      const timeout = setTimeout(performSave, 3000 - timeSinceLastSave);
      return () => clearTimeout(timeout);
    }
  }, [dailyProgress, isShuttingDown]);

  const toggleRestDay = () => {
    if (!dailyProgress || isShuttingDown) return;
    const newState = !dailyProgress.isRestDay;
    setDailyProgress({ ...dailyProgress, isRestDay: newState });
    if (newState) {
      audioService.playDing();
    }
  };

  const updateProgress = useCallback((exerciseId: string, value: number, isWarmup: boolean = false) => {
    setDailyProgress(prev => {
      if (!prev || prev.isRestDay || isShuttingDown) return prev;
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
  }, [isShuttingDown]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const handleExit = () => {
    if(confirm("Terminate System Processes and Shutdown?")) {
      setIsShuttingDown(true);
      audioService.close(); 
      setTimeout(() => {
        try { window.close(); } catch (e) {}
      }, 500);
    }
  };

  if (isShuttingDown) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center text-center p-8 select-none overflow-hidden animate-in fade-in duration-1000">
        <div className="w-24 h-24 bg-red-950/10 rounded-full flex items-center justify-center mb-12 border border-red-900/20 relative">
          <div className="absolute inset-0 rounded-full border border-red-600/20 animate-ping"></div>
          <i className="fa-solid fa-power-off text-3xl text-red-700"></i>
        </div>
        <h1 className="font-oswald text-4xl text-slate-500 uppercase italic tracking-[0.3em] mb-4">SYSTEM DEACTIVATED</h1>
        <p className="text-red-900 font-black uppercase tracking-[0.4em] text-[10px] italic animate-pulse">Deep Sleep Protocol Active</p>
        
        <div className="mt-20 space-y-6 max-w-xs border-t border-slate-900 pt-8">
          <p className="text-slate-700 text-[10px] font-bold uppercase tracking-widest leading-loose italic">
            Background loops purged. <br/> Hardware disconnected. <br/> Discipline archived.
          </p>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="mt-24 px-12 py-5 bg-slate-900 border border-slate-800 text-slate-600 font-black uppercase tracking-widest text-[9px] rounded-full hover:text-white hover:border-slate-600 transition-all active:scale-90"
        >
          Re-Initialize
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onExit={handleExit} />
      
      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div key={activeTab} className="tab-content">
          {activeTab === 'logs' ? (
            <HistoryLog stats={stats} />
          ) : activeTab === 'settings' ? (
            <Settings stats={stats} onResetData={handleReset} />
          ) : activeTab === 'tools' ? (
            <QuickTools onBack={() => setActiveTab('workout')} />
          ) : (
            <div>
              <div className="mb-10 text-center">
                <div className="flex justify-between items-center mb-8">
                  <div className="text-left">
                    <p className="text-orange-600 font-black uppercase tracking-[0.25em] text-[10px] italic">Warrior Interface</p>
                    <h2 className="font-oswald text-3xl text-white uppercase italic tracking-tighter">Combat Readiness</h2>
                  </div>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 flex items-center gap-2.5 text-slate-500 hover:text-white transition-all active:scale-90"
                  >
                    <i className="fa-solid fa-gear text-sm"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">Sys Config</span>
                  </button>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/30 to-transparent"></div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3 italic">
                    Temporal Synchronicity
                  </div>
                  <div className="text-6xl font-oswald text-white tabular-nums tracking-[0.1em] mb-3 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-orange-600 font-black uppercase tracking-[0.3em] text-xs italic">
                    {formatDate(currentTime)}
                  </div>
                </div>
              </div>

              {dailyProgress?.isRestDay ? (
                <div className="flex flex-col items-center justify-center py-20 text-center tab-content">
                  <div className="w-24 h-24 bg-blue-600/5 rounded-full flex items-center justify-center mb-8 border border-blue-500/10 shadow-[0_0_40px_rgba(37,99,235,0.1)]">
                    <i className="fa-solid fa-couch text-4xl text-blue-500/50"></i>
                  </div>
                  <h2 className="font-oswald text-4xl text-white uppercase italic mb-4 tracking-wider">Soul Restoration</h2>
                  <p className="text-slate-600 font-bold uppercase tracking-[0.15em] text-xs italic max-w-xs leading-loose">The warrior who mastered the art of recovery is invincible in the field of battle.</p>
                  <button onClick={toggleRestDay} className="mt-12 px-10 py-4 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95">Re-Engage System</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
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
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-3xl border-t border-slate-900 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 px-6 z-50">
        <div className="max-w-md mx-auto flex items-center justify-around gap-10">
          <button 
            onClick={() => setActiveTab('workout')} 
            className={`flex flex-col items-center gap-2 transition-all flex-1 ${activeTab === 'workout' ? 'text-orange-500 scale-110' : 'text-slate-700 hover:text-slate-500'}`}
          >
            <i className="fa-solid fa-hand-fist text-2xl"></i>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Training</span>
          </button>
          
          <div className="relative -mt-16">
            <button 
              onClick={() => { audioService.playDing(); setActiveTab('tools'); }}
              className={`w-18 h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(234,88,12,0.3)] border-8 border-black transition-all active:scale-85 group overflow-hidden ${
                activeTab === 'tools' ? 'bg-white text-orange-600' : 'bg-gradient-to-br from-orange-500 to-orange-700 text-white'
              }`}
            >
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <i className="fa-solid fa-bolt text-3xl group-active:animate-ping"></i>
            </button>
          </div>

          <button 
            onClick={toggleRestDay} 
            className={`flex flex-col items-center gap-2 transition-all flex-1 ${dailyProgress?.isRestDay ? 'text-blue-500 scale-110' : 'text-slate-700 hover:text-blue-500'}`}
          >
            <i className={`fa-solid ${dailyProgress?.isRestDay ? 'fa-couch' : 'fa-bed'} text-2xl`}></i>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Rest</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
