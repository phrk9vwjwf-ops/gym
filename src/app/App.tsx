import React, { useEffect, useState } from 'react';
import { useGymStore } from '@/lib/store';
import SessionView from '@/features/session/SessionView';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
  const [activeTab, setActiveTab] = useState<string>('session');

  useEffect(() => {
    // Initialize store on mount
    useGymStore.getState().init();
  }, []);

  if (!ready) {
    if (error) {
      return (
        <div className="app">
          <h2>Ошибка инициализации</h2>
          <p>{error}</p>
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
        <ErrorBoundary fallback={<div><h2>Что-то пошло не так</h2><p>Смотрите консоль для деталей.</p></div>}>
          {activeTab === 'plan' && <section>План тренировок</section>}
          {activeTab === 'session' && <SessionView />}
          {activeTab === 'history' && <section>График прогресса</section>}
          {activeTab === 'nutrition' && <section>Еда и норма калорий</section>}
          {activeTab === 'more' && <section>Настройки и другое</section>}
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default App;
