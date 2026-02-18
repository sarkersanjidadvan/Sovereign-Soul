
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ExerciseCard from './components/ExerciseCard';
import HistoryLog from './components/HistoryLog';
import Settings from './components/Settings';
import QuickTools from './components/QuickTools';
import VisualEffects from './components/VisualEffects';
import { EXERCISES, WARMUP_EXERCISES } from './constants';
import { DailyProgress, UserStats, ExerciseProgress, AppTab } from './types';
import { audioService } from './services/audioService';

const STORAGE_KEY = 'sovereign_soul_user_data_v13';
const SOULLESS_TIME = 7200; // 2 hours
const ANIMATION_DURATION = 1600; // Matches CSS exactly
const CLEANUP_BUFFER = 100; // Extra time to ensure no clipping

const App: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    unlockedChallenges: false,
    history: [],
    restDaysPreference: [],
    profile: { name: 'Sovereign Warrior', age: 0, gender: 'Warrior' }
  });
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('workout');
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  
  const [activationIcon, setActivationIcon] = useState<'skeleton' | 'snowflake' | 'lightning' | null>(null);
  const iconTimeoutRef = useRef<number | null>(null);

  const [soullessTimeRemaining, setSoullessTimeRemaining] = useState<number | null>(null);
  const [isSoullessActive, setIsSoullessActive] = useState(false);

  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  const clearIcon = useCallback(() => {
    if (iconTimeoutRef.current) window.clearTimeout(iconTimeoutRef.current);
    iconTimeoutRef.current = window.setTimeout(() => setActivationIcon(null), ANIMATION_DURATION + CLEANUP_BUFFER);
  }, []);

  const triggerTargetEffect = useCallback(() => {
    setActivationIcon('lightning');
    clearIcon();
  }, [clearIcon]);

  useEffect(() => {
    let interval: number;
    if (isSoullessActive && soullessTimeRemaining !== null && soullessTimeRemaining > 0) {
      interval = window.setInterval(() => {
        setSoullessTimeRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (soullessTimeRemaining === 0 && isSoullessActive) {
      setIsSoullessActive(false);
      audioService.playFanfare();
    }
    return () => clearInterval(interval);
  }, [isSoullessActive, soullessTimeRemaining]);

  const toggleSoullessProtocol = () => {
    if (isSoullessActive) {
      setIsSoullessActive(false);
      setSoullessTimeRemaining(null);
    } else {
      setSoullessTimeRemaining(SOULLESS_TIME);
      setIsSoullessActive(true);
      setActivationIcon('skeleton');
      clearIcon();
      if (dailyProgress?.isRestDay) {
        setDailyProgress(prev => prev ? { ...prev, isRestDay: false } : prev);
      }
      audioService.playDing();
      setActiveTab('workout');
    }
  };

  const toggleRestMode = () => {
    setDailyProgress(prev => {
      if (!prev) return prev;
      const isNowRest = !prev.isRestDay;
      if (isNowRest) {
        setIsSoullessActive(false);
        setSoullessTimeRemaining(null);
        setActivationIcon('snowflake');
        clearIcon();
      }
      return { ...prev, isRestDay: isNowRest };
    });
  };

  const initializeDay = useCallback((currentStats: UserStats) => {
    const today = new Date().toISOString().split('T')[0];
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
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed);
        initializeDay(parsed);
      } catch (e) {
        console.error("Error loading stats", e);
      }
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
    if (!dailyProgress || isShuttingDown) return;
    const performSave = () => {
      const newHistory = [...statsRef.current.history];
      const idx = newHistory.findIndex(h => h.date === dailyProgress.date);
      if (idx > -1) newHistory[idx] = dailyProgress;
      else newHistory.push(dailyProgress);
      const updatedStats = { ...statsRef.current, history: newHistory };
      setStats(updatedStats);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStats));
    };
    const timeout = setTimeout(performSave, 2000);
    return () => clearTimeout(timeout);
  }, [dailyProgress, isShuttingDown]);

  const updateProgress = useCallback((exerciseId: string, value: number, isWarmup: boolean = false) => {
    setDailyProgress(prev => {
      if (!prev || prev.isRestDay || isShuttingDown) return prev;
      const pool = isWarmup ? WARMUP_EXERCISES : EXERCISES;
      const exercise = pool.find(e => e.id === exerciseId);
      if (!exercise) return prev;
      
      const currentEntry = (isWarmup ? prev.warmupProgress : prev.exercises).find(e => e.exerciseId === exerciseId);
      
      if (currentEntry && value >= exercise.target && currentEntry.currentValue < exercise.target) {
        triggerTargetEffect();
        audioService.playFanfare();
      }

      const finalValue = isWarmup ? Math.min(value, exercise.target) : value;
      const updateList = (list: ExerciseProgress[]) => list.map(ex => {
        if (ex.exerciseId === exerciseId) {
          return { ...ex, currentValue: finalValue, isComplete: finalValue >= exercise.target };
        }
        return ex;
      });
      return isWarmup ? { ...prev, warmupProgress: updateList(prev.warmupProgress) } : { ...prev, exercises: updateList(prev.exercises) };
    });
  }, [isShuttingDown, triggerTargetEffect]);

  if (isShuttingDown) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-red-950/20 rounded-full flex items-center justify-center mb-8 border border-red-900/40">
          <i className="fa-solid fa-power-off text-3xl text-red-600"></i>
        </div>
        <h1 className="font-oswald text-3xl text-slate-500 uppercase italic tracking-[0.2em] mb-4">SYSTEM DEACTIVATED</h1>
        <button onClick={() => window.location.reload()} className="mt-12 px-10 py-4 bg-slate-900 border border-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-full">Re-Initialize</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black flex flex-col transition-colors duration-700 ${isSoullessActive ? 'soulless-mode' : ''} ${dailyProgress?.isRestDay ? 'rest-mode' : ''}`}>
      <VisualEffects isSoulless={isSoullessActive} activationIcon={activationIcon} />
      
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onExit={() => { if(confirm("Shutdown Sovereign System?")) setIsShuttingDown(true); }} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-10 overflow-x-hidden">
        <div className="tab-content" key={activeTab}>
          {activeTab === 'logs' ? (
            <HistoryLog stats={stats} />
          ) : activeTab === 'settings' ? (
            <Settings stats={stats} onResetData={() => { localStorage.clear(); window.location.reload(); }} />
          ) : activeTab === 'tools' ? (
            <QuickTools onBack={() => setActiveTab('workout')} />
          ) : (
            <div className="flex flex-col gap-6">
              {isSoullessActive && soullessTimeRemaining !== null && (
                <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-3xl flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-skull text-red-500"></i>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">SOULLESS ACTIVE</span>
                  </div>
                  <div className="text-3xl font-oswald text-white tabular-nums">
                    {Math.floor(soullessTimeRemaining / 3600)}:{(Math.floor(soullessTimeRemaining / 60) % 60).toString().padStart(2, '0')}:{(soullessTimeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}

              {dailyProgress?.isRestDay ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <i className="fa-solid fa-couch text-5xl text-blue-500/20 mb-6"></i>
                  <h2 className="font-oswald text-3xl text-white uppercase italic mb-2">Soul Restoration</h2>
                  <button onClick={toggleRestMode} className="mt-8 px-10 py-4 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase">Re-Engage System</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                    {(activeTab === 'warmup' ? WARMUP_EXERCISES : EXERCISES).map((ex) => {
                      const pool = activeTab === 'warmup' ? dailyProgress?.warmupProgress : dailyProgress?.exercises;
                      const prog = pool?.find(p => p.exerciseId === ex.id) || { exerciseId: ex.id, currentValue: 0, isComplete: false, isOneSet: false };
                      return (
                        <ExerciseCard key={ex.id} exercise={ex} progress={prog} onUpdate={(val) => updateProgress(ex.id, val, activeTab === 'warmup')} isWarmup={activeTab === 'warmup'} />
                      );
                    })}
                  </div>
                  <div className="flex justify-center pb-20">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-500 shadow-xl shadow-black/50 hover:bg-slate-800 active:scale-90 transition-all bounce-in">
                      <i className="fa-solid fa-arrow-up text-xl"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-3xl border-t border-slate-900 pt-5 pb-8 px-6 z-50">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button onClick={toggleSoullessProtocol} className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${isSoullessActive ? 'text-red-500 scale-105' : activeTab === 'workout' ? 'text-orange-500' : 'text-slate-700'}`}>
            <i className={`fa-solid ${isSoullessActive ? 'fa-skull' : 'fa-hand-fist'} text-2xl`}></i>
            <span className="text-[9px] font-black uppercase tracking-widest">SOULLESS</span>
          </button>
          
          <div className="relative -mt-14">
            <button onClick={() => { audioService.playDing(); setActiveTab('tools'); }} className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-black shadow-xl transition-all" style={{ background: isSoullessActive ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : dailyProgress?.isRestDay ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #fb923c, #ea580c)' }}>
              <i className="fa-solid fa-bolt text-2xl text-white"></i>
            </button>
          </div>

          <button onClick={toggleRestMode} className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${dailyProgress?.isRestDay ? 'text-blue-500' : 'text-slate-700'}`}>
            <i className={`fa-solid ${dailyProgress?.isRestDay ? 'fa-couch' : 'fa-bed'} text-2xl`}></i>
            <span className="text-[9px] font-black uppercase tracking-widest">REST</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
