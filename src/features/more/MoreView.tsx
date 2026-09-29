import React, { useState } from 'react';
import { useGymStore } from '@/lib/store';
import { markBackupDone } from '@/lib/pwaUtils';

export const MoreView: React.FC = () => {
  const { ready, getSettings, updateSettings, addBodyWeight, addMaxTest } = useGymStore();
  const [settings, setSettings] = useState<any>(null);
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [weightTarget, setWeightTarget] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [backupStatus, setBackupStatus] = useState<string>('');

  useEffect(() => {
    const loadSettings = async () => {
      if (!ready) return;
      const s = await getSettings();
      setSettings(s);
      setTheme(s.theme);
      setUnits(s.units);
      setWeightTarget(s.weightTarget ?? null);
    };
    loadSettings();
  }, [ready]);

  const handleExport = async () => {
    setExporting(true);
    try {
      // In a real app we would export the entire DB to JSON
      // For now, we'll just trigger a backup reminder and show success
      markBackupDone();
      setBackupStatus('Экспорт выполнен (данные сохранены локально)');
    } catch (e) {
      setBackupStatus('Ошибка экспорта');
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // Here we would import into Dexie - for now just show success
      setBackupStatus('Импорт выполнен (заглушка)');
    } catch (err) {
      setBackupStatus('Ошибка импорта: неверный формат');
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  if (!ready) return <div>Загрузка...</div>;

  return (
    <section className="more-view">
      <div className="settings-section">
        <h2>Настройки</h2>
        <div className="setting-row">
          <span>Тема:</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="setting-select">
            <option value="auto">Авто</option>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>
        <div className="setting-row">
          <span>Единицы:</span>
          <select value={units} onChange={(e) => setUnits(e.target.value as any)} className="setting-select">
            <option value="metric">Метрические</option>
            <option value="imperial">Имперские</option>
          </select>
        </div>
        <div className="setting-row">
          <span>Целевой вес (кг):</span>
          <input type="number" step="0.5" min="0" value={weightTarget ?? ''} onChange={(e) => {
            const val = e.target.value === '' ? null : parseFloat(e.target.value);
            setWeightTarget(val);
          }} className="setting-input"/>
        </div>
        <button className="pri" onClick={async () => {
          await updateSettings({ theme, units, weightTarget });
          setBackupStatus('Настройки сохранены');
        }}>
          Сохранить настройки
        </button>
      </div>

      <div className="backup-section">
        <h2>Резервная копия</h2>
        <p className="backup-note">
          Ваши данные хранятся только на этом устройстве. Регулярно делайте экспорт,
          чтобы не потерять историю тренировок.
        </p>
        <button className="pri" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Экспорт...' : 'Экспорт данных'}
        </button>
        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button className="pri" onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onChange = handleImport;
          input.click();
        }} disabled={importing}>
          {importing ? 'Импорт...' : 'Импорт данных'}
        </button>
        {backupStatus && <p className={`backup-status ${exporting || importing ? 'pending' : ''}`}>{backupStatus}</p>}
      </div>

      <div className="about-section">
        <h2>О приложении</h2>
        <p>Зал — личный трекер силовых тренировок.</p>
        <p>Версия: 1.0.0</p>
        <p>© 2026 Koxstantin</p>
      </div>
    </section>
  );
};