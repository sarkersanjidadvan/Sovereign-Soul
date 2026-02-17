
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
  const timerRef = useRef<number | null>(null);
  const prevCompleteRef = useRef(progress.isComplete);

  // Play thud on completion
  useEffect(() => {
    if (progress.isComplete && !prevCompleteRef.current) {
      audioService.playThud();
    }
    prevCompleteRef.current = progress.isComplete;
  }, [progress.isComplete]);

  useEffect(() => {
    if (isRunning && exercise.type === 'timer') {
      timerRef.current = window.setInterval(() => {
        // For warmup, cap the value update if needed
        const nextValue = progress.currentValue + 1;
        if (isWarmup && nextValue > exercise.target) {
          setIsRunning(false);
          onUpdate(exercise.target);
        } else {
          onUpdate(nextValue);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, progress.currentValue, exercise.target, exercise.type, onUpdate, isWarmup]);

  const handleTap = () => {
    if (exercise.type === 'counter') {
      const nextValue = progress.currentValue + 1;
      if (isWarmup && nextValue > exercise.target) {
        return; // Don't add more for warmup
      }
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
    if (nextState) {
      audioService.playDing();
    }
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
    <div className={`bg-slate-800/50 rounded-2xl border transition-all duration-300 overflow-hidden ${
      progress.isComplete ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'border-slate-700'
    }`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-oswald text-xl text-white uppercase tracking-tight">{exercise.name}</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{exercise.description}</p>
          </div>
          {progress.isComplete && (
            <div className={`p-2 rounded-full border transition-all duration-300 ${isOverTarget ? 'bg-orange-500 border-white/40' : 'bg-orange-500/20 border-orange-500/50'}`}>
              <i className={`fa-solid ${isOverTarget ? 'fa-fire text-white' : 'fa-check text-orange-500'} text-sm`}></i>
            </div>
          )}
        </div>

        <div className="relative w-full h-2 bg-slate-900 rounded-full mb-6 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isOverTarget ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-orange-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex flex-col items-center">
          <div className={`text-4xl font-oswald mb-6 transition-colors duration-300 ${isOverTarget ? 'text-orange-400 animate-pulse' : 'text-white'}`}>
            {exercise.type === 'timer' ? formatTime(progress.currentValue) : progress.currentValue}
            <span className="text-slate-500 text-lg ml-2 uppercase">/ {exercise.type === 'timer' ? formatTime(exercise.target) : exercise.target}</span>
          </div>

          {exercise.type === 'counter' ? (
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleTap}
                disabled={isWarmup && isAtTarget}
                className={`w-full py-8 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-lg border-2 ${
                  isWarmup && isAtTarget 
                    ? 'bg-slate-800 border-slate-700 text-slate-600 grayscale cursor-not-allowed'
                    : progress.isComplete 
                      ? 'bg-orange-950/40 border-orange-500/50 text-orange-400' 
                      : 'bg-orange-500 border-orange-400 text-white shadow-orange-500/20'
                }`}
              >
                <i className={`fa-solid ${isWarmup && isAtTarget ? 'fa-check' : 'fa-hand-fist'} text-3xl mb-1`}></i>
                <span className="font-bold uppercase tracking-widest text-sm">
                  {isWarmup && isAtTarget ? 'WARMUP READY' : isOverTarget ? 'EXTRA SOUL REP' : 'TAP REP'}
                </span>
              </button>
              
              {!isWarmup && (
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleBulkAdd(10)} 
                    className="py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold transition-colors uppercase"
                  >
                    +10
                  </button>
                  <button 
                    onClick={() => handleBulkAdd(50)} 
                    className="py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold transition-colors uppercase"
                  >
                    +50
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full">
              <button
                onClick={toggleTimer}
                disabled={isWarmup && isAtTarget}
                className={`w-full py-6 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg border-2 ${
                  isWarmup && isAtTarget
                    ? 'bg-slate-800 border-slate-700 text-slate-600 grayscale cursor-not-allowed'
                    : isRunning 
                      ? 'bg-slate-900 border-red-500 text-red-500 shadow-red-500/10' 
                      : 'bg-orange-500 border-orange-400 text-white shadow-orange-500/20'
                }`}
              >
                <i className={`fa-solid ${isWarmup && isAtTarget ? 'fa-check' : isRunning ? 'fa-pause' : 'fa-play'}`}></i>
                <span className="uppercase tracking-widest">
                  {isWarmup && isAtTarget ? 'WARMUP READY' : isRunning ? 'PAUSE SOUL' : (isOverTarget ? 'ADD MORE TIME' : 'START TIMER')}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isOverTarget && (
        <div className="bg-orange-500/10 py-1 text-center border-t border-orange-500/20 animate-pulse">
          <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest italic">
            Sovereign Discipline: Above and Beyond
          </span>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;
