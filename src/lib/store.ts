import { create } from 'zustand';
import { db, type Exercise, type ProgramDay, type ProgramItem, type Session, type SetEntry, type BodyWeight, type MaxTest, type Settings } from '../db';
import { DEFAULT_EXERCISES, DEFAULT_PROGRAM } from '@/lib/seed';
import { localDate } from '@/lib/date';

interface GymState {
  ready: boolean;
  error: string | null;
  init: () => Promise<void>;
  // Program
  getProgramDay: (dayId: 'mon' | 'wed' | 'fri') => Promise<ProgramDay | undefined>;
  getExercise: (id: string) => Promise<Exercise | undefined>;
  getAllExercises: () => Promise<Exercise[]>;
  // Sessions
  addSession: (session: Omit<Session, 'id'>) => Promise<string>;
  getSessionById: (id: string) => Promise<Session | undefined>;
  getSessionsByDate: (date: string) => Promise<Session[]>;
  getActiveSessionToday: () => Promise<Session | null>;
  finishSession: (id: string, note: string) => Promise<void>;
  // Sets
  getSetsBySession: (sessionId: string) => Promise<SetEntry[]>;
  addSet: (set: Omit<SetEntry, 'id'>) => Promise<string>;
  // Body weight
  // Latest entry on or before the date
  getBodyWeight: (date: string) => Promise<BodyWeight | undefined>;
  // One entry per date: replaces that day's value
  addBodyWeight: (weight: Omit<BodyWeight, 'id'>) => Promise<string>;
  // Max test
  getMaxTest: (date: string, kind: 'pullup' | 'dip') => Promise<MaxTest | undefined>;
  addMaxTest: (test: Omit<MaxTest, 'id'>) => Promise<string>;
  // Settings
  getSettings: () => Promise<Settings>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

export const useGymStore = create<GymState>((set, get) => ({
  ready: false,
  error: null,

  init: async () => {
    try {
      // Seed exercises if empty
      const exCount = await db.exercises.count();
      if (exCount === 0) {
        for (const ex of DEFAULT_EXERCISES) {
          await db.exercises.put(ex);
        }
      }
      // Seed program if empty
      const progCount = await db.program.count();
      if (progCount === 0) {
        for (const dayId of ['mon', 'wed', 'fri'] as const) {
          const day = DEFAULT_PROGRAM[dayId];
          await db.program.put({ id: dayId, ...day });
        }
      }
      set({ ready: true, error: null });
    } catch (err: any) {
      console.error('Failed to init gym DB', err);
      set({ ready: false, error: err.message ?? String(err) });
    }
  },

  // Program
  getProgramDay: async (dayId) => {
    await get().init();
    return db.program.get(dayId);
  },

  getExercise: async (id) => {
    await get().init();
    return db.exercises.get(id);
  },

  getAllExercises: async () => {
    await get().init();
    return db.exercises.toArray();
  },

  // Sessions
  addSession: async (session) => {
    await get().init();
    const id = crypto.randomUUID();
    await db.sessions.put({ ...session, id });
    return id;
  },

  getSessionById: async (id) => {
    await get().init();
    return db.sessions.get(id);
  },

  getSessionsByDate: async (date) => {
    await get().init();
    return db.sessions.where('date').equals(date).toArray();
  },

  getActiveSessionToday: async () => {
    await get().init();
    const today = localDate();
    const sessions = await db.sessions.where('date').equals(today).toArray();
    const active = sessions.find(s => !s.finishedAt);
    return active ?? null;
  },

  finishSession: async (id, note) => {
    await get().init();
    await db.sessions.update(id, { finishedAt: Date.now(), note });
  },

  // Sets
  getSetsBySession: async (sessionId) => {
    await get().init();
    return db.sets.where('sessionId').equals(sessionId).toArray();
  },

  addSet: async (set) => {
    await get().init();
    const id = crypto.randomUUID();
    await db.sets.put({ ...set, id });
    return id;
  },

  // Body weight
  getBodyWeight: async (date) => {
    await get().init();
    return db.bodyweight.where('date').belowOrEqual(date).last();
  },

  addBodyWeight: async (weight) => {
    await get().init();
    return db.transaction('rw', db.bodyweight, async () => {
      // Reuse the day's entry and drop duplicates left by older versions
      const existing = await db.bodyweight.where('date').equals(weight.date).primaryKeys();
      const id = existing[0] ?? crypto.randomUUID();
      await db.bodyweight.bulkDelete(existing.slice(1));
      await db.bodyweight.put({ ...weight, id });
      return id;
    });
  },

  // Max test
  getMaxTest: async (date, kind) => {
    await get().init();
    return db.maxes.where({ date, kind }).first();
  },

  addMaxTest: async (test) => {
    await get().init();
    const id = crypto.randomUUID();
    await db.maxes.put({ ...test, id });
    return id;
  },

  // Settings
  getSettings: async () => {
    await get().init();
    const defaults: Settings = {
      id: 1,
      theme: 'auto',
      units: 'metric',
      cycleStart: localDate(),
      weightTarget: null,
      heightCm: 180,
      age: 22,
    };
    const settings = await db.settings.get(1);
    if (!settings) {
      await db.settings.put(defaults);
      return defaults;
    }
    // Rows saved before a field existed get its default
    return { ...defaults, ...settings };
  },
  updateSettings: async (changes) => {
    await get().init();
    await db.settings.update(1, changes);
  },
}));
