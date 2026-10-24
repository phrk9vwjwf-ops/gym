import type { Exercise } from '@/db';

export type Muscle = Exercise['muscle'];

export const MUSCLES: Muscle[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];

export const MUSCLE_LABEL: Record<Muscle, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  legs: 'Ноги',
  core: 'Пресс',
};
