import { type Session, type SetEntry, type BodyWeight, type MaxTest } from '@/db';

export const getWeeksRange = (weeks: number) => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (weeks * 7) + 1); // inclusive start
  const dates: string[] = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
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
    const date = new Date(sess.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Monday start
    const weekKey = weekStart.toISOString().split('T')[0];
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
    const date = new Date(s.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1;
  });
  return weekCounts;
};

export const getBodyWeightSeries = async (bodyweights: BodyWeight[]) => {
  const series: { date: string; kg: number }[] = [];
  bodyweights.forEach(bw => {
    series.push({ date: bw.date, kg: bw.kg });
  });
  series.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
  points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return points;
};