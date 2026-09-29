import React, { useState } from 'react';
import './App.css';

const tabs = [
  { id: 'plan', label: 'План' },
  { id: 'session', label: 'Тренировка' },
  { id: 'history', label: 'График' },
  { id: 'nutrition', label: 'Еда' },
  { id: 'more', label: 'Ещё' },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('session');

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
        {activeTab === 'session' && <section>Тренировка</section>}
        {activeTab === 'history' && <section>График прогресса</section>}
        {activeTab === 'nutrition' && <section>Еда и норма калорий</section>}
        {activeTab === 'more' && <section>Настройки и другое</section>}
      </main>
    </div>
  );
};

export default App;
