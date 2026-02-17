
import React, { useState, useEffect, useRef } from 'react';
import { Exercise, ExerciseProgress } from '../types';
import { audioService } from '../services/audioService';

interface Props {
  exercise: Exercise;
  progress: ExerciseProgress;
  onUpdate: (value: number) => void;
  isWarmup?: boolean;
}

const ExerciseCard: React.FC<Props> = ({ exercise, progress, onUpdate, isWarmup = false }) => {
  const [isRunning, setIsRunning] = useState(false);
  const prevCompleteRef = useRef(progress.isComplete);
  const wakeLockRef = useRef<any>(null);
  const lastEmittedValueRef = useRef<number>(progress.currentValue);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // Sync internal ref with external progress changes
  useEffect(() => {
    if (!isRunning) {
      lastEmittedValueRef.current = progress.currentValue;
    }
  }, [progress.currentValue, isRunning]);

  // Screen Wake Lock Logic
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Sovereign Wake Lock: Engaged');
      } catch (err: any) {
        console.warn(`Wake Lock Error: ${err.message}`);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current !== null) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Sovereign Wake Lock: Released');
    }
  };

  // Completion Feedback
  useEffect(() => {
    if (progress.isComplete && !prevCompleteRef.current) {
      audioService.playThud();
      if (isRunning) setIsRunning(false);
    }
    prevCompleteRef.current = progress.isComplete;
  }, [progress.isComplete, isRunning]);

  // Timer Management
  useEffect(() => {
    let intervalId: number | null = null;

    if (isRunning && exercise.type === 'timer') {
      requestWakeLock();
      const startRealTime = Date.now();
      const startValue = progress.currentValue;

      intervalId = window.setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startRealTime) / 1000);
        const nextValue = startValue + elapsedSeconds;

        if (nextValue !== lastEmittedValueRef.current) {
          lastEmittedValueRef.current = nextValue;
          
          if (isWarmup && nextValue >= exercise.target) {
            onUpdateRef.current(exercise.target);
            setIsRunning(false);
          } else {
            onUpdateRef.current(nextValue);
          }
        }
      }, 100);
    } else {
      releaseWakeLock();
    }

    return () => {
      if (intervalId !== null) clearInterval(intervalId);
      releaseWakeLock();
    };
  }, [isRunning, exercise.type, exercise.target, isWarmup]);

  const handleTap = () => {
    if (exercise.type === 'counter') {
      const nextValue = progress.currentValue + 1;
      if (isWarmup && nextValue > exercise.target) return;
      onUpdate(nextValue);
    }
  };

  const handleBulkAdd = (amount: number) => {
    const nextValue = progress.currentValue + amount;
    if (isWarmup && nextValue > exercise.target) {
      onUpdate(exercise.target);
    } else {
      onUpdate(nextValue);
    }
  };

  const toggleTimer = () => {
    if (isWarmup && progress.currentValue >= exercise.target) return;
    const nextState = !isRunning;
    if (nextState) audioService.playDing();
    setIsRunning(nextState);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percent = Math.min(100, (progress.currentValue / exercise.target) * 100);
  const isOverTarget = !isWarmup && progress.currentValue > exercise.target;
  const isAtTarget = progress.currentValue >= exercise.target;

  return (
    <div className={`bg-slate-900/40 rounded-3xl border transition-all duration-300 overflow-hidden ${
      progress.isComplete ? 'border-orange-500 shadow-xl shadow-orange-950/10' : 'border-slate-800'
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-5">
          <div className="max-w-[80%]">
            <h3 className="font-oswald text-xl text-white uppercase italic tracking-tight leading-tight">{exercise.name}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 line-clamp-1">{exercise.description}</p>
          </div>
          {progress.isComplete && (
            <div className={`p-2.5 rounded-full border ${isOverTarget ? 'bg-orange-500 border-white/20' : 'bg-orange-500/10 border-orange-500/40'}`}>
              <i className={`fa-solid ${isOverTarget ? 'fa-fire text-white' : 'fa-check text-orange-500'} text-xs`}></i>
            </div>
          )}
        </div>

        <div className="relative w-full h-1.5 bg-black rounded-full mb-6 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${isOverTarget ? 'bg-gradient-to-r from-orange-400 to-orange-600 animate-pulse' : 'bg-orange-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex flex-col items-center">
          <div className={`text-4xl font-oswald mb-6 tabular-nums transition-colors duration-300 ${isOverTarget ? 'text-orange-400' : 'text-white'}`}>
            {exercise.type === 'timer' ? formatTime(progress.currentValue) : progress.currentValue}
            <span className="text-slate-600 text-lg ml-2 uppercase italic">/ {exercise.type === 'timer' ? formatTime(exercise.target) : exercise.target}</span>
          </div>

          <div className="w-full">
            {exercise.type === 'counter' ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleTap}
                  disabled={isWarmup && isAtTarget}
                  className={`w-full py-7 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 border-b-4 ${
                    isWarmup && isAtTarget 
                      ? 'bg-slate-800 border-slate-900 text-slate-600 grayscale opacity-50'
                      : progress.isComplete 
                        ? 'bg-orange-900/20 border-orange-600/30 text-orange-400' 
                        : 'bg-orange-500 border-orange-700 text-white shadow-lg shadow-orange-900/20'
                  }`}
                >
                  <i className={`fa-solid ${isWarmup && isAtTarget ? 'fa-check' : 'fa-hand-fist'} text-2xl mb-1`}></i>
                  <span className="font-black uppercase tracking-widest text-[10px]">
                    {isWarmup && isAtTarget ? 'WARMUP COMPLETE' : isOverTarget ? 'FORGE EXTRA SOUL' : 'RECORD REP'}
                  </span>
                </button>
                
                {!isWarmup && (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleBulkAdd(10)} 
                      className="py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black tracking-widest uppercase transition-colors"
                    >
                      +10 REPS
                    </button>
                    <button 
                      onClick={() => handleBulkAdd(50)} 
                      className="py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black tracking-widest uppercase transition-colors"
                    >
                      +50 REPS
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={toggleTimer}
                disabled={isWarmup && isAtTarget}
                className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 font-black transition-all border-b-4 ${
                  isWarmup && isAtTarget
                    ? 'bg-slate-800 border-slate-900 text-slate-600 grayscale opacity-50'
                    : isRunning 
                      ? 'bg-black border-red-900 text-red-500' 
                      : 'bg-orange-500 border-orange-700 text-white shadow-lg shadow-orange-900/20'
                }`}
              >
                <i className={`fa-solid ${isWarmup && isAtTarget ? 'fa-check' : isRunning ? 'fa-pause' : 'fa-play'}`}></i>
                <span className="uppercase tracking-[0.2em] text-xs">
                  {isWarmup && isAtTarget ? 'WARMUP COMPLETE' : isRunning ? 'PAUSE CLOCK' : (isOverTarget ? 'EXTEND HOLD' : 'START CLOCK')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
