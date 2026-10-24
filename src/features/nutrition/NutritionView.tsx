import React, { useEffect, useState } from 'react';
import { useGymStore } from '@/lib/store';
import { localDate, parseLocalDate } from '@/lib/date';

// Mifflin-St Jeor (male), moderate activity, ±500 kcal/day for ~0.5 kg/week toward the target
const calcNorm = (weight: number | null, weightTarget: number | null, heightCm: number, age: number) => {
  if (weight === null || !(weight > 0)) return { calories: 0, protein: 0, weeksToTarget: null };
  const bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
  const maintenance = bmr * 1.55;
  const target = weightTarget ?? weight;
  const diff = target - weight;
  const kcal = diff === 0 ? maintenance : maintenance + 500 * (diff > 0 ? 1 : -1);
  return {
    calories: Math.round(kcal),
    // 2.2 g per kg of target weight
    protein: Math.round(2.2 * target),
    weeksToTarget: weightTarget !== null ? Math.max(0, Math.round(Math.abs(weightTarget - weight) / 0.5)) : null,
  };
};

export const NutritionView: React.FC = () => {
  const { ready, getSettings, updateSettings, getBodyWeight, addBodyWeight } = useGymStore();
  const [weight, setWeight] = useState<number | null>(null);
  const [weightDate, setWeightDate] = useState<string | null>(null);
  const [weightTarget, setWeightTarget] = useState<number | null>(null);
  const [profile, setProfile] = useState<{ heightCm: number; age: number } | null>(null);
  const today = localDate();

  useEffect(() => {
    const load = async () => {
      if (!ready) return;
      const s = await getSettings();
      setWeightTarget(s.weightTarget ?? null);
      setProfile({ heightCm: s.heightCm, age: s.age });
      const bw = await getBodyWeight(localDate());
      if (bw) {
        setWeight(bw.kg);
        setWeightDate(bw.date);
      }
    };
    load();
  }, [ready]);

  // Derived on render, so it always matches the inputs
  const { calories, protein, weeksToTarget } = profile
    ? calcNorm(weight, weightTarget, profile.heightCm, profile.age)
    : { calories: 0, protein: 0, weeksToTarget: null };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? null : parseFloat(e.target.value);
    setWeight(val);
    // Today's entry is overwritten on every change, so only the final value stays
    if (val !== null && val > 0) {
      setWeightDate(today);
      addBodyWeight({ date: today, kg: val }).catch(console.error);
    }
  };

  if (!ready) return <div>Загрузка...</div>;

  return (
    <section className="nutrition-view">
      <div className="nutrition-card">
        <h2>Норма калорий и белка</h2>
        {profile && (
          <p className="nutrition-hint">Рост {profile.heightCm} см, возраст {profile.age} — меняются во вкладке «Ещё»</p>
        )}
        <div className="nutrition-fields">
          <div>
            <label>Текущий вес, кг:</label>
            <input type="number" inputMode="decimal" step="0.1" min="0" value={weight ?? ''} onChange={handleWeightChange} className="nutrition-input"/>
          </div>
          {weightDate && weightDate !== today && (
            <p className="nutrition-hint">Последнее взвешивание {parseLocalDate(weightDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
          )}
          <div>
            <label>Целевой вес, кг:</label>
            <input type="number" step="0.1" min="0" value={weightTarget ?? ''} onChange={(e) => {
              const val = e.target.value === '' ? null : parseFloat(e.target.value);
              setWeightTarget(val);
              updateSettings({ weightTarget: val });
            }} className="nutrition-input"/>
          </div>
        </div>
        <div className="nutrition-results">
          <div className="result-item">
            <span>Калорий в день:</span>
            <strong>{calories} ккал</strong>
          </div>
          <div className="result-item">
            <span>Белка в день:</span>
            <strong>{protein} г</strong>
          </div>
          {weeksToTarget !== null && (
            <div className="result-item">
              <span>До цели недель:</span>
              <strong>{weeksToTarget} недель</strong>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NutritionView;
