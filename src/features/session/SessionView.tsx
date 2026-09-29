import React, { useEffect, useState } from 'react';
import { useGymStore } from '@/lib/store';

export const SessionView: React.FC = () => {
  const [dayId, setDayId] = useState<'mon' | 'wed' | 'fri'>('mon');
  const [program, setProgram] = useState<any>(null);
  const [exerciseMap, setExerciseMap] = useState<Record<string, string>>({});
  const [today, setToday] = useState<string>('');

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

  if (!program) {
    return <div className="session-view">Загрузка программы...</div>;
  }

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
    // TODO: navigate to active session screen
  }
};

export default SessionView;
