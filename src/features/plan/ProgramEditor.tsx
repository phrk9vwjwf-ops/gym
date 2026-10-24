import React, { useEffect, useState } from 'react';
import { useGymStore } from '@/lib/store';
import { DAYS } from '@/lib/cycle';
import { MUSCLES, MUSCLE_LABEL } from '@/lib/muscles';
import type { Exercise, ProgramDay, ProgramItem } from '@/db';

type DayId = ProgramDay['id'];
const DAY_LABEL: Record<DayId, string> = { mon: 'Пн', wed: 'Ср', fri: 'Пт' };

// Fields are kept as typed text; the program is saved only when every row parses
interface Row {
  exerciseId: string;
  sets: string;
  repsLow: string;
  repsHigh: string;
  restSec: string;
  startWeight: string;
  supersetWith?: string;
}
type Field = Exclude<keyof Row, 'exerciseId' | 'supersetWith'>;

const toText = (v: number | null) => (v == null ? '' : String(v));
const toRow = (item: ProgramItem): Row => ({
  exerciseId: item.exerciseId,
  sets: toText(item.sets),
  repsLow: toText(item.repsLow),
  repsHigh: toText(item.repsHigh),
  restSec: toText(item.restSec),
  startWeight: toText(item.startWeight),
  supersetWith: item.supersetWith,
});

// Empty means "not set"; returns undefined when the text is not a valid value
const parseInt0 = (text: string, max: number) => {
  if (text.trim() === '') return null;
  const n = Number(text);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : undefined;
};
const parseWeight = (text: string) => {
  if (text.trim() === '') return null;
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 && n <= 500 ? n : undefined;
};

const validate = (row: Row): { item?: ProgramItem; errors: Partial<Record<Field, string>> } => {
  const errors: Partial<Record<Field, string>> = {};
  const sets = parseInt0(row.sets, 10);
  const repsLow = parseInt0(row.repsLow, 100);
  const repsHigh = parseInt0(row.repsHigh, 100);
  const restSec = parseInt0(row.restSec, 600);
  const startWeight = parseWeight(row.startWeight);
  if (sets === undefined || sets === 0) errors.sets = 'Подходов 1–10';
  if (repsLow === undefined || repsLow === 0) errors.repsLow = 'Повторов 1–100';
  if (repsHigh === undefined || repsHigh === 0) errors.repsHigh = 'Повторов 1–100';
  if (repsLow != null && repsHigh != null && repsLow > repsHigh) errors.repsHigh = '«До» меньше «от»';
  if (restSec === undefined) errors.restSec = 'Отдых 0–600 с';
  if (startWeight === undefined) errors.startWeight = 'Вес 0–500 кг';
  if (Object.keys(errors).length > 0) return { errors };
  return {
    errors,
    item: {
      exerciseId: row.exerciseId,
      sets: sets ?? null,
      repsLow: repsLow ?? null,
      repsHigh: repsHigh ?? null,
      restSec: restSec ?? null,
      startWeight: startWeight ?? null,
      supersetWith: row.supersetWith,
    },
  };
};

const ExerciseSelect: React.FC<{ id?: string; value: string; exercises: Exercise[]; label: string; onChange: (id: string) => void; placeholder?: string }> = ({
  id,
  value,
  exercises,
  label,
  onChange,
  placeholder,
}) => (
  <select id={id} className="edit-select" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
    {placeholder && <option value="">{placeholder}</option>}
    {MUSCLES.map(m => {
      const group = exercises.filter(ex => ex.muscle === m);
      return group.length ? (
        <optgroup key={m} label={MUSCLE_LABEL[m]}>
          {group.map(ex => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </optgroup>
      ) : null;
    })}
  </select>
);

export const ProgramEditor: React.FC = () => {
  const [dayId, setDayId] = useState<DayId>('mon');
  const [day, setDay] = useState<ProgramDay | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [adding, setAdding] = useState('');
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    useGymStore.getState().getAllExercises().then(setExercises);
  }, []);

  useEffect(() => {
    (async () => {
      const d = await useGymStore.getState().getProgramDay(dayId);
      setDay(d ?? null);
      setRows(d ? d.items.map(toRow) : []);
      setStatus(null);
    })();
  }, [dayId]);

  const results = rows.map(validate);

  const commit = async (next: Row[]) => {
    setRows(next);
    if (!day) return;
    const checked = next.map(validate);
    if (checked.some(r => !r.item)) {
      setStatus({ kind: 'error', text: 'Есть ошибки — изменения не сохранены' });
      return;
    }
    const updated: ProgramDay = { ...day, items: checked.map(r => r.item!) };
    await useGymStore.getState().updateProgramDay(updated);
    setDay(updated);
    setStatus({ kind: 'ok', text: 'Сохранено' });
  };

  const setField = (i: number, field: Field, value: string) => commit(rows.map((r, k) => (k === i ? { ...r, [field]: value } : r)));
  const setExercise = (i: number, exerciseId: string) => commit(rows.map((r, k) => (k === i ? { ...r, exerciseId } : r)));
  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };
  const remove = (i: number) => {
    const name = exercises.find(ex => ex.id === rows[i].exerciseId)?.name ?? rows[i].exerciseId;
    if (!window.confirm(`Убрать «${name}» из программы? История подходов останется.`)) return;
    commit(rows.filter((_, k) => k !== i));
  };
  const add = () => {
    if (!adding) return;
    commit([...rows, { exerciseId: adding, sets: '3', repsLow: '8', repsHigh: '12', restSec: '90', startWeight: '' }]);
    setAdding('');
  };

  const field = (i: number, f: Field, label: string, mode: 'numeric' | 'decimal') => {
    const error = results[i].errors[f];
    return (
      <label className={`edit-field${error ? ' invalid' : ''}`}>
        <span>{label}</span>
        <input type="text" inputMode={mode} value={rows[i][f]} placeholder="—" aria-invalid={!!error} onChange={(e) => setField(i, f, e.target.value)} />
      </label>
    );
  };

  return (
    <div className="editor">
      <div className="editor-head">
        <h3>Программа</h3>
        {status && (
          <span className={`editor-status ${status.kind}`} role="status">
            {status.text}
          </span>
        )}
      </div>
      <div className="segments">
        {DAYS.map(d => (
          <button key={d} className={dayId === d ? 'active' : ''} onClick={() => setDayId(d)}>
            {DAY_LABEL[d]}
          </button>
        ))}
      </div>
      {day && <p className="lead">{day.title}</p>}
      <ol className="edit-list">
        {rows.map((row, i) => {
          const errors = Object.values(results[i].errors);
          return (
            <li key={`${i}-${row.exerciseId}`} className="edit-item">
              <div className="edit-top">
                <span className="num">{i + 1}</span>
                <ExerciseSelect value={row.exerciseId} exercises={exercises} label={`Упражнение ${i + 1}`} onChange={(id) => setExercise(i, id)} />
              </div>
              <div className="edit-grid">
                {field(i, 'sets', 'Подходы', 'numeric')}
                {field(i, 'repsLow', 'Повт. от', 'numeric')}
                {field(i, 'repsHigh', 'до', 'numeric')}
                {field(i, 'restSec', 'Отдых, с', 'numeric')}
                {field(i, 'startWeight', 'Старт, кг', 'decimal')}
              </div>
              {errors.length > 0 && <p className="edit-error">{errors.join(' · ')}</p>}
              <div className="edit-actions">
                <button className="edit-btn" aria-label={`Поднять упражнение ${i + 1}`} disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button className="edit-btn" aria-label={`Опустить упражнение ${i + 1}`} disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                  ↓
                </button>
                <button className="edit-btn danger" onClick={() => remove(i)}>
                  Удалить
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="edit-add">
        <ExerciseSelect value={adding} exercises={exercises} label="Упражнение из справочника" placeholder="Выбрать из справочника…" onChange={setAdding} />
        <button className="pri" disabled={!adding} onClick={add}>
          Добавить
        </button>
      </div>
    </div>
  );
};

export default ProgramEditor;
