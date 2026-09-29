import { create } from 'zustand';
import { db, type Exercise, type ProgramDay, type ProgramItem, type Session, type SetEntry, type BodyWeight, type MaxTest, type Settings } from '../db';
import { DEFAULT_EXERCISES, DEFAULT_PROGRAM } from '@/lib/seed';

interface GymState {
  ready: boolean;
  error: string | null;
  init: () => Promise<void>;
  getProgramDay: (dayId: 'mon' | 'wed' | 'fri') => Promise<ProgramDay | undefined>;
  getExercise: (id: string) => Promise<Exercise | undefined>;
  addSession: (session: Omit<Session, 'id'>) => Promise<string>;
  getSetsBySession: (sessionId: string) => Promise<SetEntry[]>;
  addSet: (set: Omit<SetEntry, 'id'>) => Promise<string>;
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

  getProgramDay: async (dayId) => {
    await get().init();
    return db.program.get(dayId);
  },

  getExercise: async (id) => {
    await get().init();
    return db.exercises.get(id);
  },

  addSession: async (session) => {
    await get().init();
    const id = crypto.randomUUID();
    await db.sessions.put({ ...session, id });
    return id;
  },

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
}));
