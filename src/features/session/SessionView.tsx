import React, { useEffect, useState, useRef } from 'react';
import { useGymStore } from '@/lib/store';
import { localDate, parseLocalDate } from '@/lib/date';
import type { ProgramDay, ProgramItem, Session, SetEntry } from '@/db';

type DayId = ProgramDay['id'];
type Draft = { weight: string; reps: string };
type Summary = { tonnage: number; minutes: number; sets: number };

// "3×6–8", "3×15" when the range is a single number, "3 подх." when reps are open (to failure)
const formatSets = (sets: number | null, repsLow: number | null, repsHigh: number | null) => {
  if (!sets) return null;
  if (repsLow == null && repsHigh == null) return `${sets} подх.`;
  if (repsLow == null || repsHigh == null || repsLow === repsHigh) return `${sets}×${repsLow ?? repsHigh}`;
  return `${sets}×${repsLow}–${repsHigh}`;
};

const draftKey = (exerciseId: string, index: number) => `${exerciseId}:${index}`;

// Training day for today: Mon/Wed/Fri as is, other days show the next one
const dayForToday = (): DayId => {
  const day = new Date().getDay(); // 0 Sun … 6 Sat
  if (day === 3) return 'wed';
  if (day === 5) return 'fri';
  return 'mon';
};

const RING = 2 * Math.PI * 40;

export const SessionView: React.FC = () => {
  const [dayId, setDayId] = useState<DayId>(dayForToday);
  const [program, setProgram] = useState<ProgramDay | null>(null);
  const [exerciseMap, setExerciseMap] = useState<Record<string, string>>({});
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  // Rest timer counts down to a timestamp, so it stays correct after the phone sleeps
  const [rest, setRest] = useState<{ endAt: number; total: number } | null>(null);
  const [now, setNow] = useState(Date.now());
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const prog = await useGymStore.getState().getProgramDay(dayId);
      setProgram(prog ?? null);
      const allEx = await useGymStore.getState().getAllExercises();
      const map: Record<string, string> = {};
      allEx.forEach(ex => {
        map[ex.id] = ex.name;
      });
      setExerciseMap(map);
    })();
  }, [dayId]);

  useEffect(() => {
    (async () => {
      const active = await useGymStore.getState().getActiveSessionToday();
      if (!active) return;
      // The session's own day, not today's default
      setDayId(active.dayId);
      setActiveSession(active);
      setSets(await useGymStore.getState().getSetsBySession(active.id));
    })();
  }, []);

  // Prefill weight and reps from the last finished session with each exercise
  useEffect(() => {
    if (!activeSession || !program || activeSession.dayId !== program.id) return;
    (async () => {
      const next: Record<string, Draft> = {};
      for (const item of program.items) {
        const last = await useGymStore.getState().getLastWorkingSet(item.exerciseId);
        const weight = last?.weight ?? item.startWeight;
        const reps = last?.reps ?? item.repsLow;
        for (let i = 0; i < (item.sets ?? 1); i++) {
          next[draftKey(item.exerciseId, i)] = { weight: weight != null ? String(weight) : '', reps: reps != null ? String(reps) : '' };
        }
      }
      // Keep anything the user already typed
      setDrafts(prev => ({ ...next, ...prev }));
    })();
  }, [activeSession, program]);

  const stopRest = () => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
    setRest(null);
  };

  useEffect(() => {
    if (!rest) return;
    restIntervalRef.current = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= rest.endAt) {
        stopRest();
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      }
    }, 250);
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [rest]);

  const startRest = (restSec: number) => {
    const t = Date.now();
    setNow(t);
    setRest({ endAt: t + restSec * 1000, total: restSec });
  };

  const updateDraft = (key: string, field: keyof Draft, value: string) => {
    setDrafts(prev => ({ ...prev, [key]: { ...(prev[key] ?? { weight: '', reps: '' }), [field]: value } }));
  };

  const completeSet = async (item: ProgramItem, index: number) => {
    if (!activeSession) return;
    const key = draftKey(item.exerciseId, index);
    const draft = drafts[key] ?? { weight: '', reps: '' };
    const reps = parseInt(draft.reps, 10);
    if (!(reps > 0)) {
      document.getElementById(`reps-${key}`)?.focus();
      return;
    }
    const weight = draft.weight.trim() === '' ? null : parseFloat(draft.weight.replace(',', '.'));
    const entry: Omit<SetEntry, 'id'> = {
      sessionId: activeSession.id,
      exerciseId: item.exerciseId,
      index,
      weight: weight !== null && Number.isFinite(weight) ? weight : null,
      reps,
      done: true,
      at: Date.now(),
    };
    const id = await useGymStore.getState().addSet(entry);
    setSets(prev => [...prev, { ...entry, id }]);
    if (item.restSec && item.restSec > 0) startRest(item.restSec);
  };

  const handleStart = async () => {
    const id = await useGymStore.getState().addSession({
      date: localDate(),
      dayId,
      startedAt: Date.now(),
      finishedAt: null,
      note: '',
    });
    const session = await useGymStore.getState().getSessionById(id);
    setSummary(null);
    setSets([]);
    setDrafts({});
    setActiveSession(session ?? null);
  };

  const handleFinish = async () => {
    if (!activeSession) return;
    stopRest();
    await useGymStore.getState().finishSession(activeSession.id, '');
    const done = await useGymStore.getState().getSetsBySession(activeSession.id);
    setSummary({
      tonnage: done.reduce((sum, s) => sum + (s.weight ?? 0) * s.reps, 0),
      minutes: Math.max(1, Math.round((Date.now() - activeSession.startedAt) / 60000)),
      sets: done.length,
    });
    setActiveSession(null);
    setSets([]);
    setDrafts({});
  };

  if (!program) {
    return <div className="session-view">Загрузка программы...</div>;
  }

  if (summary) {
    return (
      <section className="session-view">
        <div className="summary-card" role="status">
          <h2>Тренировка завершена</h2>
          <div className="summary-grid">
            <div className="result-item">
              <span>Тоннаж</span>
              <strong>{summary.tonnage.toLocaleString('ru-RU')} кг</strong>
            </div>
            <div className="result-item">
              <span>Время</span>
              <strong>{summary.minutes} мин</strong>
            </div>
            <div className="result-item">
              <span>Подходов</span>
              <strong>{summary.sets}</strong>
            </div>
          </div>
          <button className="pri" onClick={() => setSummary(null)}>
            Готово
          </button>
        </div>
      </section>
    );
  }

  // If there is an active session, show active view
  if (activeSession) {
    const restLeft = rest ? Math.max(0, Math.ceil((rest.endAt - now) / 1000)) : 0;
    const restProgress = rest ? Math.min(1, Math.max(0, (rest.endAt - now) / (rest.total * 1000))) : 0;
    return (
      <section className="session-view">
        {rest && (
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
                  strokeDasharray={RING}
                  strokeDashoffset={RING * (1 - restProgress)}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="rest-timer-text">{restLeft}с</div>
            </div>
            <button className="rest-timer-skip" onClick={stopRest}>
              Пропустить
            </button>
          </div>
        )}
        <div className="dayhead">
          <div>
            <h2>{program.title}</h2>
            <p className="lead">Тренировка идёт · {parseLocalDate(activeSession.date).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
        <ol className="ex">
          {program.items.map((item, idx) => {
            const exName = exerciseMap[item.exerciseId] ?? item.exerciseId;
            const rows = Array.from({ length: item.sets ?? 1 }, (_, i) => i);
            return (
              <li key={idx} className={item.supersetWith ? 'ss' : ''}>
                <div className="row1">
                  <span className="num">{idx + 1}</span>
                  <h3>{exName}</h3>
                </div>
                <div className="meta">
                  {formatSets(item.sets, item.repsLow, item.repsHigh) && <span className="sets">{formatSets(item.sets, item.repsLow, item.repsHigh)}</span>}
                  {item.restSec ? <span className="rest">отдых {item.restSec}с</span> : null}
                </div>
                <div className="set-rows">
                  {rows.map(i => {
                    const key = draftKey(item.exerciseId, i);
                    const done = sets.find(s => s.exerciseId === item.exerciseId && s.index === i);
                    const draft = drafts[key] ?? { weight: '', reps: '' };
                    return (
                      <div key={key} className={`set-row${done ? ' done' : ''}`}>
                        <button
                          className="set-dot"
                          aria-label={done ? `Подход ${i + 1} записан` : `Записать подход ${i + 1}`}
                          disabled={!!done}
                          onClick={() => completeSet(item, i)}
                        >
                          {done ? '✓' : i + 1}
                        </button>
                        <label className="set-field">
                          <input
                            type="text"
                            inputMode="decimal"
                            aria-label={`Вес, подход ${i + 1}`}
                            placeholder="—"
                            value={done ? (done.weight ?? '') : draft.weight}
                            disabled={!!done}
                            onChange={(e) => updateDraft(key, 'weight', e.target.value)}
                          />
                          <span>кг</span>
                        </label>
                        <label className="set-field">
                          <input
                            id={`reps-${key}`}
                            type="text"
                            inputMode="numeric"
                            aria-label={`Повторы, подход ${i + 1}`}
                            placeholder="—"
                            value={done ? done.reps : draft.reps}
                            disabled={!!done}
                            onChange={(e) => updateDraft(key, 'reps', e.target.value)}
                          />
                          <span>повт</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
        <button className="pri finish-btn" onClick={handleFinish}>
          Завершить тренировку
        </button>
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
      <div className="warm">{program.warmup}</div>
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
                {formatSets(item.sets, item.repsLow, item.repsHigh) && <span className="sets">{formatSets(item.sets, item.repsLow, item.repsHigh)}</span>}
                {item.restSec ? <span className="rest">отдых {item.restSec}с</span> : null}
              </div>
              {item.t && <p className="tip">{item.t}</p>}
              <div className="wt">
                <span>
                  Старт: <b>{item.startWeight ?? '-'}</b>{item.was ? ` · было ${item.was}` : ''}
                </span>
                <label>
                  Мой вес <input type="text" inputMode="decimal" defaultValue="" />
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
};

export default SessionView;
