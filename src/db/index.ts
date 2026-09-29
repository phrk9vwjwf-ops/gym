import Dexie, { Table } from 'dexie';

export interface Exercise {
  id: string;
  name: string;
  muscle: 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core';
  cue: string;
  unit: 'kg' | 'bodyweight' | 'machine';
}

export interface ProgramDay {
  id: 'mon' | 'wed' | 'fri';
  name: string;
  warmup: string;
  items: ProgramItem[];
}

export interface ProgramItem {
  exerciseId: string;
  sets: number;
  repsLow: number;
  repsHigh: number;
  restSec: number;
  startWeight: number | null;
  supersetWith?: string;
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  dayId: 'mon' | 'wed' | 'fri';
  startedAt: number;
  finishedAt: number | null;
  note: string;
}

export interface SetEntry {
  id: string;
  sessionId: string;
  exerciseId: string;
  index: number; // set number within exercise
  weight: number | null; // kg, null for bodyweight
  reps: number;
  done: boolean;
  at: number; // timestamp
}

export interface BodyWeight {
  date: string;
  kg: number;
}

export interface MaxTest {
  date: string;
  kind: 'pullup' | 'dip';
  reps: number;
}

export interface Settings {
  theme: 'auto' | 'light' | 'dark';
  units: 'metric' | 'imperial';
  cycleStart: string; // YYYY-MM-DD
  weightTarget: number | null;
}

export class GymDB extends Dexie {
  exercises!: Table<Exercise, string>;
  program!: Table<ProgramDay, string>;
  sessions!: Table<Session, string>;
  sets!: Table<SetEntry, string>;
  bodyweight!: Table<BodyWeight, string>;
  maxes!: Table<MaxTest, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('GymDB');
    this.version(1).stores({
      exercises: '++id, name',
      program: '++id',
      sessions: '++id, date, dayId',
      sets: '++id, sessionId, exerciseId, at',
      bodyweight: '++id, date',
      maxes: '++id, date, kind',
      settings: '++id',
    });
  }
}

export const db = new GymDB();
