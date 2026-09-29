import React, { useEffect, useState } from 'react';
import { useGymStore } from '@/lib/store';
import { getWeeksRange, aggregateTonnageByWeek, aggregateWorkoutsPerWeek, getBodyWeightSeries, getExerciseProgress } from '@/lib/chartUtils';
import WeightChart from './WeightChart';
import WorkoutsChart from './WorkoutsChart';
import ExerciseProgressChart from './ExerciseProgressChart';
import TonnageChart from './TonnageChart';

export const ChartsView: React.FC = () => {
  const { ready, getAllExercises, getSessionsByDate, getSetsBySession, getBodyWeight, addBodyWeight } = useGymStore();
  const [exercises, setExercises] = useState<Array<any>>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [bodyweightSeries, setBodyweightSeries] = useState<Array<{date: string; kg: number}>>([]);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<Record<string, number>>({});
  const [tonnagePerWeek, setTonnagePerWeek] = useState<Record<string, number>>({});
  const [exerciseProgress, setExerciseProgress] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!ready) return;
      setLoading(true);
      try {
        const exList = await getAllExercises();
        setExercises(exList);
        if (exList.length > 0 && !selectedExerciseId) {
          setSelectedExerciseId(exList[0].id);
        }
        // bodyweight
        const bwAll = await db.bodyweight.toArray();
        setBodyweightSeries(await getBodyWeightSeries(bwAll));
        // sessions
        const sessionsAll = await db.sessions.toArray();
        const setsAll = await db.sets.toArray();
        // workouts per week (last 8 weeks)
        const weeks8 = getWeeksRange(8);
        const recentSessions = sessionsAll.filter(s => weeks8.includes(s.date));
        setWorkoutsPerWeek(await aggregateWorkoutsPerWeek(recentSessions));
        // tonnage per week (last 8 weeks)
        setTonnagePerWeek(await aggregateTonnageByWeek(setsAll, recentSessions));
        // exercise progress
        if (selectedExerciseId) {
          const prog = await getExerciseProgress(selectedExerciseId, setsAll, sessionsAll);
          setExerciseProgress(prog);
        }
      } catch (e) {
        console.error('Failed to load chart data', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [ready, selectedExerciseId]);

  if (loading) return <div className="charts-view">Загрузка...</div>;

  return (
    <div className="charts-view">
      <div className="charts-header">
        <h2>Графики прогресса</h2>
        {exercises.length > 0 && (
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="exercise-select"
          >
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="charts-grid">
        <WeightChart series={bodyweightSeries} />
        <WorkoutsChart data={workoutsPerWeek} />
        <ExerciseProgressChart series={exerciseProgress} exerciseId={selectedExerciseId} />
        <TonnageChart data={tonnagePerWeek} />
      </div>
    </div>
  );
};