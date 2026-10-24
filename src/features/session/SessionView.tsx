import React, { useEffect, useState, useRef } from 'react';
import { useGymStore } from '@/lib/store';
import { localDate, parseLocalDate } from '@/lib/date';
import type { Exercise, ProgramDay, ProgramItem, Session, SetEntry } from '@/db';

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

// Adds delta to a typed number ("32,5" works too), never below zero
const bump = (value: string, delta: number) => {
  const v = parseFloat(value.replace(',', '.'));
  const next = Math.max(0, (Number.isFinite(v) ? v : 0) + delta);
  return String(Math.round(next * 100) / 100);
};

const formatRest = (sec: number) => (sec >= 60 ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : `${sec}с`);

const Stepper: React.FC<{
  id?: string;
  value: string;
  unit: string;
  step: number;
  label: string;
  inputMode: 'decimal' | 'numeric';
  onChange: (value: string) => void;
}> = ({ id, value, unit, step, label, inputMode, onChange }) => (
  <div className="stepper">
    <button type="button" className="step-btn" aria-label={`${label}: −${String(step).replace('.', ',')}`} onClick={() => onChange(bump(value, -step))}>
      −
    </button>
    <label className="stepper-field">
      <input id={id} type="text" inputMode={inputMode} aria-label={label} placeholder="—" value={value} onChange={(e) => onChange(e.target.value)} />
      <span>{unit}</span>
    </label>
    <button type="button" className="step-btn" aria-label={`${label}: +${String(step).replace('.', ',')}`} onClick={() => onChange(bump(value, step))}>
      +
    </button>
  </div>
);

// Ring sweeps around and the check springs in once the set is recorded
const SetDot: React.FC<{ n: number; done: boolean; label: string; onClick: () => void }> = ({ n, done, label, onClick }) => (
  <button className="set-dot" aria-label={label} disabled={done} onClick={onClick}>
    <svg className="dot-ring" viewBox="0 0 44 44" aria-hidden="true">
      <circle className="dot-track" cx="22" cy="22" r="20" />
      <circle className="dot-fill" cx="22" cy="22" r="20" pathLength={100} />
    </svg>
    {done ? (
      <svg className="dot-check" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.5 12.5l4.2 4.2L18.5 8" pathLength={100} />
      </svg>
    ) : (
      <span className="dot-num">{n}</span>
    )}
  </button>
);

const HowTo: React.FC<{ cue?: string }> = ({ cue }) =>
  cue ? (
    <details className="howto">
      <summary>Как делать</summary>
      <p>{cue}</p>
    </details>
  ) : null;

export const SessionView: React.FC = () => {
  const [dayId, setDayId] = useState<DayId>(dayForToday);
  const [program, setProgram] = useState<ProgramDay | null>(null);
  const [exerciseMap, setExerciseMap] = useState<Record<string, Exercise>>({});
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  // Rest timer counts down to a timestamp, so it stays correct after the phone sleeps
  const [rest, setRest] = useState<{ endAt: number; total: number } | null>(null);
  const [now, setNow] = useState(Date.now());
  // Once collapsed, later rests also start as the top bar
  const [restCollapsed, setRestCollapsed] = useState(false);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const prog = await useGymStore.getState().getProgramDay(dayId);
      setProgram(prog ?? null);
      const allEx = await useGymStore.getState().getAllExercises();
      const map: Record<string, Exercise> = {};
      allEx.forEach(ex => {
        map[ex.id] = ex;
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
    // Last ten seconds: re-keyed every second so a short pulse replays on each tick
    const ending = !!rest && restLeft <= 10;
    const pulseKey = ending ? restLeft : 'steady';
    const doneOf = (item: ProgramItem) => sets.filter(s => s.exerciseId === item.exerciseId && s.index < (item.sets ?? 1)).length;
    const totalSets = program.items.reduce((sum, item) => sum + (item.sets ?? 1), 0);
    const doneSets = program.items.reduce((sum, item) => sum + doneOf(item), 0);
    const currentIdx = program.items.findIndex(item => doneOf(item) < (item.sets ?? 1));
    return (
      <section className="session-view">
        {rest && restCollapsed && (
          <div className={`rest-bar${ending ? ' ending' : ''}`} role="timer" aria-label={`Отдых, осталось ${formatRest(restLeft)}`}>
            <div className="rest-bar-fill" style={{ transform: `scaleX(${restProgress})` }} />
            <button className="rest-bar-main" onClick={() => setRestCollapsed(false)} aria-label="Развернуть таймер">
              Отдых <b key={pulseKey}>{formatRest(restLeft)}</b>
            </button>
            <button className="rest-bar-skip" onClick={stopRest}>
              Пропустить
            </button>
          </div>
        )}
        {rest && !restCollapsed && (
          <div className={`rest-timer-overlay${ending ? ' ending' : ''}`}>
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
              <div key={pulseKey} className="rest-timer-text">
                {formatRest(restLeft)}
              </div>
            </div>
            <div className="rest-timer-actions">
              <button className="rest-timer-skip secondary" onClick={() => setRestCollapsed(true)}>
                Свернуть
              </button>
              <button className="rest-timer-skip" onClick={stopRest}>
                Пропустить
              </button>
            </div>
          </div>
        )}
        <div className="dayhead">
          <div>
            <h2>{program.title}</h2>
            <p className="lead">Тренировка идёт · {parseLocalDate(activeSession.date).toLocaleDateString('ru-RU')}</p>
          </div>
          <div className="workout-progress">
            <div
              className="workout-bar"
              role="progressbar"
              aria-label="Прогресс тренировки"
              aria-valuemin={0}
              aria-valuemax={totalSets}
              aria-valuenow={doneSets}
            >
              <div className="workout-bar-fill" style={{ transform: `scaleX(${totalSets ? doneSets / totalSets : 0})` }} />
            </div>
            <span className="workout-count">
              {doneSets} из {totalSets} подходов
            </span>
          </div>
        </div>
        <ol className="ex">
          {program.items.map((item, idx) => {
            const exercise = exerciseMap[item.exerciseId];
            const rows = Array.from({ length: item.sets ?? 1 }, (_, i) => i);
            const doneAt = (i: number) => sets.find(s => s.exerciseId === item.exerciseId && s.index === i);
            // The next set to do gets the ± controls
            const currentRow = rows.find(i => !doneAt(i));
            const done = doneOf(item);
            const classes = [`m-${exercise?.muscle ?? 'core'}`, item.supersetWith && 'ss', idx === currentIdx && 'current', currentRow === undefined && 'complete'];
            return (
              <li key={idx} className={classes.filter(Boolean).join(' ')}>
                <div className="row1">
                  <span className="num">{idx + 1}</span>
                  <h3>{exercise?.name ?? item.exerciseId}</h3>
                  <span className="ex-count" aria-label={`Сделано ${done} из ${rows.length}`}>
                    {done} из {rows.length}
                  </span>
                </div>
                <div className="meta">
                  {formatSets(item.sets, item.repsLow, item.repsHigh) && <span className="sets">{formatSets(item.sets, item.repsLow, item.repsHigh)}</span>}
                  {item.restSec ? <span className="rest">отдых {item.restSec}с</span> : null}
                </div>
                <HowTo cue={exercise?.cue} />
                <div className="set-rows">
                  {rows.map(i => {
                    const key = draftKey(item.exerciseId, i);
                    const doneSet = doneAt(i);
                    const draft = drafts[key] ?? { weight: '', reps: '' };
                    if (i === currentRow) {
                      return (
                        <div key={key} className="set-row current">
                          <SetDot n={i + 1} done={false} label={`Записать подход ${i + 1}`} onClick={() => completeSet(item, i)} />
                          <div className="steppers">
                            <Stepper value={draft.weight} unit="кг" step={2.5} label={`Вес, подход ${i + 1}`} inputMode="decimal" onChange={(v) => updateDraft(key, 'weight', v)} />
                            <Stepper id={`reps-${key}`} value={draft.reps} unit="повт" step={1} label={`Повторы, подход ${i + 1}`} inputMode="numeric" onChange={(v) => updateDraft(key, 'reps', v)} />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={key} className={`set-row${doneSet ? ' done' : ''}`}>
                        <SetDot n={i + 1} done={!!doneSet} label={doneSet ? `Подход ${i + 1} записан` : `Записать подход ${i + 1}`} onClick={() => completeSet(item, i)} />
                        <label className="set-field">
                          <input
                            type="text"
                            inputMode="decimal"
                            aria-label={`Вес, подход ${i + 1}`}
                            placeholder="—"
                            value={doneSet ? (doneSet.weight ?? '') : draft.weight}
                            disabled={!!doneSet}
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
                            value={doneSet ? doneSet.reps : draft.reps}
                            disabled={!!doneSet}
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
          const exercise = exerciseMap[item.exerciseId];
          return (
            <li key={idx} className={[`m-${exercise?.muscle ?? 'core'}`, item.supersetWith && 'ss'].filter(Boolean).join(' ')}>
              <div className="row1">
                <span className="num">{idx + 1}</span>
                <h3>{exercise?.name ?? item.exerciseId}</h3>
              </div>
              <div className="meta">
                {formatSets(item.sets, item.repsLow, item.repsHigh) && <span className="sets">{formatSets(item.sets, item.repsLow, item.repsHigh)}</span>}
                {item.restSec ? <span className="rest">отдых {item.restSec}с</span> : null}
              </div>
              <div className="wt">
                <span>
                  Старт: <b>{item.startWeight ?? '-'}</b>{item.was ? ` · было ${item.was}` : ''}
                </span>
              </div>
              <HowTo cue={exercise?.cue} />
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
