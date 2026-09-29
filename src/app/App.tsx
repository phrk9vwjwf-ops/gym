import React, { useEffect, useState } from 'react';
import { useGymStore } from '@/lib/store';
import SessionView from '@/features/session/SessionView';
import ChartsView from '@/features/charts/ChartsView';
import MoreView from '@/features/more/MoreView';
import NutritionView from '@/features/nutrition/NutritionView';
import './App.css';

const tabs = [
  { id: 'plan', label: 'План' },
  { id: 'session', label: 'Тренировка' },
  { id: 'history', label: 'График' },
  { id: 'nutrition', label: 'Еда' },
  { id: 'more', label: 'Ещё' },
];

export const App: React.FC = () => {
  const ready = useGymStore((s) => s.ready);
  const error = useGymStore((s) => s.error);
  const [localReady, setLocalReady] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('session');

  useEffect(() => {
    const initStore = async () => {
      try {
        await useGymStore.getState().init();
        setLocalReady(true);
        setLocalError(null);
      } catch (e: any) {
        setLocalError(e.message ?? String(e));
        setLocalReady(false);
      }
    };
    initStore();
  }, []);

  if (!localReady) {
    if (localError) {
      return (
        <div className="app">
          <h2>Ошибка инициализации</h2>
          <p>{localError}</p>
        </div>
      );
    }
    return <div className="app">Загрузка...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Зал</h1>
        <div className="sync-status" id="sync">сохранено на устройстве</div>
      </header>

      <nav className="app-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-content">
        {activeTab === 'plan' && <section>План тренировок</section>}
        {activeTab === 'session' && <SessionView />}
        {activeTab === 'history' && <ChartsView />}
        {activeTab === 'nutrition' && <NutritionView />}
        {activeTab === 'more' && <MoreView />}
      </main>
    </div>
  );
};

export default App;