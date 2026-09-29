import React, { useEffect, useState } from 'react';
import { useGymStore } from '@/lib/store';
import { format } from 'date-fns';

export const SessionView: React.FC = () => {
  const [dayId, setDayId] = useState<'mon' | 'wed' | 'fri' | null>(null);
  const [program, setProgram] = useState<any>(null);
  const [today, setToday] = useState<string>('');

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setToday(todayStr);
    // Determine dayId based on weekday (0=Sun,1=Mon,...)
    const day = new Date().getDay();
    let id: 'mon' | 'wed' | 'fri' | null = null;
    if (day === 1) id = 'mon';
    else if (day === 3) id = 'wed';
    else if (day === 5) id = 'fri';
    setDayId(id);
  }, []);

  useEffect(() => {
    if (dayId) {
      (async () => {
        const prog = await useGymStore.getState().getProgramDay(dayId);
        setProgram(prog);
      })();
    }
  }, [dayId]);

  if (!dayId || !program) {
    return <div className="session-view">Сегодня нет тренировки</div>;
  }

  return (
    <section className="session-view">
      <div className="dayhead">
        <div>
          <h2>{program.title}</h2>
          <p className="lead">{program.lead}</p>
        </div>
        <button className="pri" onClick={handleStart}>
          Начать тренировку
        </button>
      </div>
      <div className="warm">{program.warm}</div>
      <ol className="ex">
        {program.items.map((item: any, idx: number) => (
          <li key={idx} className={item.supersetWith ? 'ss' : ''}>
            <div className="row1">
              <span className="num">{idx + 1}</span>
              <h3>{item.n}</h3>
            </div>
            <div className="meta">
              <span className="sets">{item.s}</span>
              <span className="rest">отдых {item.r}</span>
            </div>
            {item.t && <p className="tip">{item.t}</p>}
            <div className="wt">
              <span>
                Старт: <b>{item.w}</b>{item.was ? ` · было {item.was}` : ''}
              </span>
              <label>
                Мой вес <input type="text" inputmode="decimal" defaultValue="" />
              </label>
            </div>
          </li>
        ))}
      </ol>
      <p className="lead" style={{ marginTop: '14px' }}>
        По желанию в конце: пресс 3×15–20.
      </p>
    </section>
  );

  async function handleStart() {
    // Create a new session
    const id = await useGymStore.getState().addSession({
      date: today,
      dayId,
      startedAt: Date.now(),
      finishedAt: null,
      note: '',
    });
    // TODO: navigate to active session screen
    alert(`Сессия создана: ${id}`);
  }
};

export default SessionView;
