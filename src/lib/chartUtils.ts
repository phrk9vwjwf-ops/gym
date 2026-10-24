import { type Session, type SetEntry, type BodyWeight, type MaxTest } from '@/db';
import { addDays, localDate, weekStart } from '@/lib/date';

// Every date from the Monday `weeks - 1` weeks ago through today, so each week bar is a full Mon–Sun week
export const getWeeksRange = (weeks: number) => {
  const today = localDate();
  const dates: string[] = [];
  for (let d = addDays(weekStart(today), -(weeks - 1) * 7); d <= today; d = addDays(d, 1)) {
    dates.push(d);
  }
  return dates;
};

export const aggregateTonnageByWeek = async (sets: SetEntry[], sessions: Session[]) => {
  const sessionMap = new Map<string, Session>();
  sessions.forEach(s => sessionMap.set(s.id, s));
  const weekTonnage: Record<string, number> = {};
  sets.forEach(set => {
    const sess = sessionMap.get(set.sessionId);
    if (!sess) return;
    const weekKey = weekStart(sess.date);
    const weight = set.weight ?? 0; // bodyweight treat as 0? maybe use estimated? For tonnage we ignore bodyweight? We'll treat as 0 for now.
    const tonnage = weight * set.reps;
    weekTonnage[weekKey] = (weekTonnage[weekKey] || 0) + tonnage;
  });
  return weekTonnage;
};

export const aggregateWorkoutsPerWeek = async (sessions: Session[]) => {
  const weekCounts: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.finishedAt === null) return;
    const weekKey = weekStart(s.date);
    weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1;
  });
  return weekCounts;
};

export const getBodyWeightSeries = async (bodyweights: BodyWeight[]) => {
  const series: { date: string; kg: number }[] = [];
  bodyweights.forEach(bw => {
    series.push({ date: bw.date, kg: bw.kg });
  });
  series.sort((a, b) => a.date.localeCompare(b.date));
  return series;
};

export const getExerciseProgress = async (exerciseId: string, sets: SetEntry[], sessions: Session[]) => {
  const sessionMap = new Map<string, Session>();
  sessions.forEach(s => sessionMap.set(s.id, s));
  const points: { date: string; estimatedMax: number; weight: number | null; reps: number }[] = [];
  sets.forEach(set => {
    if (set.exerciseId !== exerciseId) return;
    const sess = sessionMap.get(set.sessionId);
    if (!sess) return;
    const weight = set.weight ?? 0;
    const estimatedMax = weight * (1 + set.reps / 30);
    points.push({
      date: sess.date,
      estimatedMax,
      weight: set.weight,
      reps: set.reps
    });
  });
  points.sort((a, b) => a.date.localeCompare(b.date));
  return points;
};