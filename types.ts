
export type WorkoutType = 'counter' | 'timer';

export interface Exercise {
  id: string;
  name: string;
  target: number; 
  type: WorkoutType;
  description: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  currentValue: number;
  isComplete: boolean;
  isOneSet: boolean;
}

export interface DailyProgress {
  date: string; 
  exercises: ExerciseProgress[];
  warmupProgress: ExerciseProgress[];
  isAllOneSetDay: boolean;
  isRestDay?: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
}

export interface UserStats {
  unlockedChallenges: boolean;
  history: DailyProgress[];
  restDaysPreference: number[]; 
  profile?: UserProfile;
}

export enum ChallengeMode {
  NORMAL = 'NORMAL',
  TWO_HOUR = 'TWO_HOUR',
  ONE_HOUR = 'ONE_HOUR'
}

export type AppTab = 'warmup' | 'workout' | 'logs' | 'settings' | 'tools';
