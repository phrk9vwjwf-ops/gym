import React, { useEffect, useState, useRef } from 'react';
import { useGymStore } from '@/lib/store';

export const SessionView: React.FC = () => {
  const [dayId, setDayId] = useState<'mon' | 'wed' | 'fri'>('mon');
  const [program, setProgram] = useState<any>(null);
  const [exerciseMap, setExerciseMap] = useState<Record<string, string>>({});
  const [today, setToday] = useState<string>('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [sets, setSets] = useState<any[]>([]);
  // Rest timer state
  const [restTimeLeft, setRestTimeLeft] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastCompletedSetIndex, setLastCompletedSetIndex] = useState<number>(-1);

  // Determine nearest training day: mon/wed/fri, default to mon, but if today is tue/thu/sat/sun show next
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setToday(todayStr);
    const day = new Date().getDay(); // 0 Sun,1 Mon,2 Tue,3 Wed,4 Thu,5 Fri,6 Sat
    let id: 'mon' | 'wed' | 'fri' = 'mon';
    if (day === 0 || day === 2 || day === 4 || day === 6) {
      // Sun/Tue/Thu/Sat -> next is Mon
      id = 'mon';
    } else if (day === 1) id = 'mon';
    else if (day === 3) id = 'wed';
    else if (day === 5) id = 'fri';
    setDayId(id);
  }, []);

  useEffect(() => {
    if (dayId) {
      (async () => {
        const prog = await useGymStore.getState().getProgramDay(dayId);
        setProgram(prog);
        // Load all exercises to map id -> name
        const allEx = await useGymStore.getState().getAllExercises();
        const map: Record<string, string> = {};
        allEx.forEach((ex: any) => {
          map[ex.id] = ex.name;
        });
        setExerciseMap(map);
      })();
    }
  }, [dayId]);

  useEffect(() => {
    (async () => {
      const active = await useGymStore.getState().getActiveSessionToday();
      setActiveSession(active);
      if (active) {
        const allSets = await useGymStore.getState().getSetsBySession(active.id);
        setSets(allSets);
      }
    });
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    };
  }, []);

  const startRestTimer = (restSec: number) => {
    setRestTimeLeft(restSec);
    setIsResting(true);
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    restIntervalRef.current = setInterval(() => {
      setRestTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(restIntervalRef.current!);
          restIntervalRef.current = null;
          setIsResting(false);
          // Vibrate if supported
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]); // short pattern
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
    setIsResting(false);
    setRestTimeLeft(0);
  };

  if (!program) {
    return <div className="session-view">Загрузка программы...</div>;
  }

  // If there is an active session, show active view
  if (activeSession) {
    return (
      <section className="session-view">
        {/* Rest timer overlay */}
        {isResting && (
          <div className="rest-timer-overlay">
            <div className="rest-timer-circle">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#95A2AE" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#5AA9F5"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - restTimeLeft / (program.items.find((i: any) => i.exerciseId === sets[lastCompletedSetIndex]?.exerciseId)?.restSec || 15))}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="rest-timer-text">{restTimeLeft}с</div>
            </div>
            <button className="rest-timer-skip" onClick={skipRest}>
              Пропустить
            </button>
          </div>
        )}
        <div className="dayhead">
          <div>
            <h2>Тренировка в процессе</h2>
            <p className="lead">{new Date(activeSession.date).toLocaleDateString()}</p>
          </div>
          <button className="pri" onClick={() => useGymStore.getState().finishSession(activeSession.id, 'Завершено досрочно')}>
            Завершить тренировку
          </button>
        </div>
        <ol className="ex">
          {sets.map((set: any, idx: number) => {
            const exName = exerciseMap[set.exerciseId] ?? set.exerciseId;
            return (
              <li key={idx} className={set.supersetWith ? 'ss' : ''}>
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
                    Вес: <input type="number" step="0.5" min="0" placeholder="кг" value={set.weight ?? ''} onChange={(e) => {
                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                      // update set weight optimistically? We'll just store locally and push to db on completion
                    }} />
                  </div>
                  <div>
                    Повторы: <input type="number" step="1" min="0" placeholder="повт" value={set.reps ?? ''} onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    }} />
                  </div>
                  <button className="pri" onClick={() => {
                    // Complete set: save to DB, start rest timer
                    const updatedSet = {
                      ...set,
                      weight: set.weight ?? null, // keep as is
                      reps: set.reps ?? 0,
                      done: true,
                      at: Date.now()
                    };
                    useGymStore.getState().addSet(updatedSet).then(() => {
                      setSets((prev) => prev.map((s, i) => (i === idx ? updatedSet : s)));
                      setLastCompletedSetIndex(idx);
                      // Find restSec from program item
                      const item = program.items.find((i: any) => i.exerciseId === set.exerciseId);
                      const restSec = item ? item.restSec : 15;
                      startRestTimer(restSec);
                    });
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
  }

  // No active session -> show normal view for planning/starting
  return (
    <section className="session-view">
      <div className="dayhead">
        <div>
          <h2>{program.title}</h2>
          <p className="lead">{program.lead}</p>
        </div>
        <div className="segments">
          <button
            className={dayId === 'mon' ? 'active' : ''}
            onClick={() => setDayId('mon')}
          >
            Пн
          </button>
          <button
            className={dayId === 'wed' ? 'active' : ''}
            onClick={() => setDayId('wed')}
          >
            Ср
          </button>
          <button
            className={dayId === 'fri' ? 'active' : ''}
            onClick={() => setDayId('fri')}
          >
            Пт
          </button>
        </div>
        <button className="pri" onClick={handleStart}>
          Начать тренировку
        </button>
      </div>
      <div className="warm">{program.warm}</div>
      <ol className="ex">
        {program.items.map((item: any, idx: number) => {
          const exName = exerciseMap[item.exerciseId] ?? item.exerciseId;
          return (
            <li key={idx} className={item.supersetWith ? 'ss' : ''}>
              <div className="row1">
                <span className="num">{idx + 1}</span>
                <h3>{exName}</h3>
              </div>
              <div className="meta">
                <span className="sets">{item.sets}×{item.repsLow}–{item.repsHigh}</span>
                <span className="rest">отдых {item.restSec}с</span>
              </div>
              {item.t && <p className="tip">{item.t}</p>}
              <div className="wt">
                <span>
                  Старт: <b>{item.startWeight ?? '-'}</b>{item.was ? ` · было {item.was}` : ''}
                </span>
                <label>
                  Мой вес <input type="text" inputmode="decimal" defaultValue="" />
                </label>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="lead" style={{ marginTop: '14px' }}>
        По желанию в конце: пресс 3×15–20.
      </p>
    </section>
  );

  async function handleStart() {
    const id = await useGymStore.getState().addSession({
      date: today,
      dayId,
      startedAt: Date.now(),
      finishedAt: null,
      note: '',
    });
    // TODO: navigate to active session screen (will reload via useEffect)
  }
};