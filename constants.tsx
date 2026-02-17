
import { Exercise } from './types';

export const EXERCISES: Exercise[] = [
  {
    id: 'knuckle-pushups',
    name: 'Knuckle Push Ups',
    target: 100,
    type: 'counter',
    description: 'Strengthen wrists and knuckles while building chest and triceps.'
  },
  {
    id: 'squats',
    name: 'Squats',
    target: 100,
    type: 'counter',
    description: 'Foundation of lower body strength.'
  },
  {
    id: 'crunches',
    name: 'Crunches / Sit Ups',
    target: 100,
    type: 'counter',
    description: 'Core stability and abdominal strength.'
  },
  {
    id: 'sapate',
    name: 'Sapate (Indian Burpees)',
    target: 1000,
    type: 'counter',
    description: 'Combo of Hindu Push Ups & Hindu Squats. The ultimate endurance builder.'
  },
  {
    id: 'skipping',
    name: 'Shadow / Normal Skipping',
    target: 1000,
    type: 'counter',
    description: 'Light on your feet, heavy on your cardio.'
  },
  {
    id: 'plank',
    name: 'Plank',
    target: 600, // 10 minutes in seconds
    type: 'timer',
    description: 'Total body isometric hold. Absolute mental discipline.'
  }
];

export const WARMUP_EXERCISES: Exercise[] = [
  { id: 'neck-nods-lr', name: 'Head Nods (L & R)', target: 100, type: 'counter', description: 'Neck mobility side to side.' },
  { id: 'neck-nods-ud', name: 'Head Nods (U & D)', target: 100, type: 'counter', description: 'Neck mobility up and down.' },
  { id: 'head-tuck-l', name: 'Head Tucks (Left)', target: 10, type: 'counter', description: 'Manual head tuck with hands to the left.' },
  { id: 'head-tuck-r', name: 'Head Tucks (Right)', target: 10, type: 'counter', description: 'Manual head tuck with hands to the right.' },
  { id: 'head-rot-cw', name: 'Head Rotations (CW)', target: 10, type: 'counter', description: 'Rotate head 360° clockwise.' },
  { id: 'head-rot-ccw', name: 'Head Rotations (CCW)', target: 10, type: 'counter', description: 'Rotate head 360° anti-clockwise.' },
  { id: 'belly-tucks', name: 'Belly Tucks', target: 100, type: 'counter', description: 'Pushing the belly in and out.' },
  { id: 'wake-up-stretch', name: 'Wake Up Stretches', target: 100, type: 'counter', description: 'Hands overhead, back stretch with forward belly bulge.' },
  { id: 'boxing-stretch', name: 'Boxing Stretch', target: 100, type: 'counter', description: 'Boxing stance, chest wide stretch to the back.' },
  { id: 'boxing-rot', name: 'Boxing Rotations', target: 100, type: 'counter', description: 'Boxing stance rotations CW & CCW.' },
  { id: 'arm-rotations', name: 'Arm Rotations', target: 100, type: 'counter', description: 'Full arm rotations CW & CCW.' },
  { id: 'palm-slaps', name: 'Palm Slaps', target: 100, type: 'counter', description: '100 slaps with both palms on an object.' },
  { id: 'finger-punches', name: 'Finger Punches', target: 100, type: 'counter', description: '100 finger strikes with both hands.' },
  { id: 'knee-strikes', name: 'Knee Strikes', target: 100, type: 'counter', description: '100 knee strikes with both legs.' },
  { id: 'elbow-strikes', name: 'Elbow Strikes', target: 100, type: 'counter', description: '100 elbow strikes with both hands.' },
  { id: 'heel-ups', name: 'Heel Ups', target: 100, type: 'counter', description: 'Extend heels, weight on toes (fingers of legs).' }
];
