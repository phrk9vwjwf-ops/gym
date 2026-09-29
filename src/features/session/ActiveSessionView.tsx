import React, { useEffect, useState } from 'react';
import { useGymStore } from '@/lib/store';

export const ActiveSessionView: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [sets, setSets] = useState<any[]>([]);
  const [exerciseMap, setExerciseMap] = useState<Record<string, string>>({});
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      const active = await useGymStore.getState().getActiveSessionToday();
      if (!active) {
        setSession(null);
        return;
      }
      setSession(active);
      const allSets = await useGymStore.getState().getSetsBySession(active.id);
      setSets(allSets);
      const allEx = await useGymStore.getState().getAllExercises();
      const map: Record<string, string> = {};
      allEx.forEach((ex: any) => {
        map[ex.id] = ex.name;
      });
      setExerciseMap(map);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (restEndTime !== null) {
      const now = Date.now();
      if (now >= restEndTime) {
        setIsResting(false);
        setRestTimer(null);
        setRestEndTime(null);
      } else {
        setRestTimer(Math.ceil((restEndTime - now) / 1000));
      }
    }
  }, [restEndTime]);

  const startRest = (seconds: number) => {
    setIsResting(true);
    setRestEndTime(Date.now() + seconds * 1000);
    setRestTimer(seconds);
  };

  const handleSetDone = (weight: number | null, reps: number) => {
    if (!session) return;
    const currentSet = sets[currentSetIndex];
    // Update set
    useGymStore.getState().addSet({
      sessionId: session.id,
      exerciseId: currentSet.exerciseId,
      index: currentSet.index,
      weight,
      reps,
      done: true,
      at: Date.now(),
    });
    // Move to next set or exercise
    const nextSetIndex = currentSetIndex + 1;
    if (nextSetIndex < sets.length) {
      setCurrentSetIndex(nextSetIndex);
      // Start rest if not last set of exercise? Simplify: rest after each set
      const restSec = sets[nextSetIndex].restSec ?? 0;
      if (restSec > 0) startRest(restSec);
    } else {
      // Move to next exercise
      const nextExIndex = currentExerciseIndex + 1;
      // We need to group sets by exercise; for simplicity assume sets ordered by exercise then index.
      // We'll just finish session if no more sets.
      setCurrentExerciseIndex(nextExIndex);
      setCurrentSetIndex(0);
      if (nextExIndex >= Math.max(...sets.map(s => s.index)) + 1) {
        // Finished all sets
        useGymStore.getState().finishSession(session.id, '');
        setSession(null);
      } else {
        const restSec = sets[0].restSec ?? 0;
        if (restSec > 0) startRest(restSec);
      }
    }
  };

  if (!session) {
    return <div className="session-view">Активной тренировки нет. Начните новую на вкладке «Тренировка».</div>;
  }

  return (
    <section className="session-view">
      <div className="dayhead">
        <div>
          <h2>Тренировка в процессе</h2>
          <p className="lead">{new Date(session.date).toLocaleDateString()}</p>
        </div>
        <button className="pri" onClick={() => useGymStore.getState().finishSession(session.id, 'Завершено досрочно')}>
          Завершить тренировку
        </button>
      </div>
      {isResting && restTimer !== null && (
        <div className="warm">
          Отдых: <b>{restTimer}</b> секунд
        </div>
      )}
      <ol className="ex">
        {sets.map((set: any, idx: number) => {
          const exName = exerciseMap[set.exerciseId] ?? set.exerciseId;
          const isCurrent = idx === currentSetIndex && !isResting;
          return (
            <li key={idx} className={`${set.supersetWith ? 'ss' : ''} ${isCurrent ? 'active-set' : ''}`}>
              <div className="row1">
                <span className="num">{set.index + 1}</span>
                <h3>{exName}</h3>
              </div>
              <div className="meta">
                <span className="sets">{set.sets}×{set.repsLow}–{set.repsHigh}</span>
                <span className="rest">отдых {set.restSec}с</span>
              </div>
              {set.t && <p className="tip">{set.t}</p>}
              <div className="wt">
                <div>
                  Вес: <input type="number" step="0.5" min="0" placeholder="кг" onChange={(e) => { /* handle */ }} />
                </div>
                <div>
                  Повторы: <input type="number" step="1" min="0" placeholder="повт" onChange={(e) => { /* handle */ }} />
                </div>
                <button className="pri" onClick={() => {
                  // For demo, just finish set with placeholder
                  handleSetDone(null, 0);
                }}>
                  Завершить подход
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
