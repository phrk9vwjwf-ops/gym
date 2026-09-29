import React from 'react';
import { useGymStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export const NutritionView: React.FC = () => {
  const { ready, getSettings, updateSettings, getBodyWeight, addBodyWeight } = useGymStore();
  const [settings, setSettings] = useState<any>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [date, setDate] = useState<string>('');
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [weeksToTarget, setWeeksToTarget] = useState<number | null>(null);
  const [weightTarget, setWeightTarget] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!ready) return;
      const s = await getSettings();
      setSettings(s);
      setWeightTarget(s.weightTarget ?? null);
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      const bw = await getBodyWeight(today);
      if (bw) {
        setWeight(bw.kg);
      }
      calculate();
    };
    load();
  }, [ready]);

  const calculate = () => {
    if (weight === null) {
      setCalories(0);
      setProtein(0);
      setWeeksToTarget(null);
      return;
    }
    // Basal metabolic rate (Mifflin-St Jeor) for male (assuming male, could be setting)
    const bmr = 10 * weight + 6.25 * 180 - 5 * 26 + 5; // placeholder height 180cm, age 26
    const maintenance = bmr * 1.55; // moderate activity
    const target = weightTarget ?? weight;
    const diff = target - weight; // kg to gain/lose
    // 0.5 kg per week ~ 500 kcal deficit/surplus per day
    let kcal = maintenance;
    if (diff !== 0) {
      kcal = maintenance + 500 * (diff > 0 ? 1 : -1); // surplus for gain, deficit for loss
    }
    setCalories(Math.round(kcal));
    // Protein: 2.2g per kg target weight
    setProtein(Math.round(2.2 * (target)));
    // Weeks to target: assuming 0.5 kg per week change
    if (weightTarget !== null && weight !== null) {
      const weeks = Math.abs(weightTarget - weight) / 0.5;
      setWeeksToTarget(Math.max(0, Math.round(weeks)));
    } else {
      setWeeksToTarget(null);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? null : parseFloat(e.target.value);
    setWeight(val);
    // Optionally save to bodyweight store
    if (val !== null) {
      addBodyWeight({ date, kg: val }).catch(console.error);
    }
    calculate();
  };

  if (!ready) return <div>Загрузка...</div>;

  return (
    <section className="nutrition-view">
      <div className="nutrition-card">
        <h2>Норма калорий и белка</h2>
        <div className="nutrition-fields">
          <div>
            <label>Текущий вес, кг:</label>
            <input type="number" step="0.1" min="0" value={weight ?? ''} onChange={handleWeightChange} className="nutrition-input"/>
          </div>
          <div>
            <label>Целевой вес, кг:</label>
            <input type="number" step="0.1" min="0" value={weightTarget ?? ''} onChange={(e) => {
              const val = e.target.value === '' ? null : parseFloat(e.target.value);
              setWeightTarget(val);
              // update settings
              updateSettings({ weightTarget: val });
              calculate();
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