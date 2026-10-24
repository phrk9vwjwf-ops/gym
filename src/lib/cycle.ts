import { addDays, parseLocalDate, weekStart } from '@/lib/date';

export const CYCLE_LENGTH = 8;
export const DAYS = ['mon', 'wed', 'fri'] as const;

export type WeekKind = 'intro' | 'build' | 'deload';

export interface CycleWeek {
  mode: string;
  kind: WeekKind;
  note: string;
}

// From the prototype: weeks 1–2 ease in, 3–7 build, 8 deload and test
export const CYCLE_WEEKS: CycleWeek[] = [
  { mode: 'Втягивание', kind: 'intro', note: 'Запас 3–4 повтора, подходов на один меньше' },
  { mode: 'Втягивание', kind: 'intro', note: 'Запас 3–4 повтора, подходов на один меньше' },
  { mode: 'Набор', kind: 'build', note: 'Запас 1–2, полные подходы' },
  { mode: 'Набор', kind: 'build', note: 'Запас 1–2, полные подходы' },
  { mode: 'Набор + вес на брусья', kind: 'build', note: 'Брусья 15+ чисто — подход 6–8 с поясом +5 кг' },
  { mode: 'Набор', kind: 'build', note: 'Запас 1–2, полные подходы' },
  { mode: 'Набор', kind: 'build', note: 'Запас 1–2, полные подходы' },
  { mode: 'Разгрузка + тест', kind: 'deload', note: 'Половина подходов, веса те же; в пятницу тест турника и брусьев' },
];

// Monday-to-Sunday dates of cycle week n (1-based); the cycle starts on the Monday of cycleStart's week
export const cycleWeekRange = (cycleStart: string, n: number) => {
  const from = addDays(weekStart(cycleStart), (n - 1) * 7);
  return { from, to: addDays(from, 6) };
};

// 1-based week of the cycle for the date; < 1 before the start, > CYCLE_LENGTH after the end
export const cycleWeekOf = (cycleStart: string, date: string) => {
  const days = Math.round((parseLocalDate(weekStart(date)).getTime() - parseLocalDate(weekStart(cycleStart)).getTime()) / 86400000);
  return Math.floor(days / 7) + 1;
};
