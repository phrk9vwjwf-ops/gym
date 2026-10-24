import React, { useEffect, useRef, useState } from 'react';
import { useGymStore } from '@/lib/store';
import { BackupError, exportBackup, importBackup, parseBackup, summarizeBackup } from '@/lib/backup';
import { applyTheme } from '@/lib/theme';

export const MoreView: React.FC = () => {
  const { ready, getSettings, updateSettings, addBodyWeight, addMaxTest } = useGymStore();
  const [settings, setSettings] = useState<any>(null);
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [weightTarget, setWeightTarget] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ kind: 'ok' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const { sessions, sets } = await exportBackup();
      setBackupStatus({ kind: 'ok', text: `Файл сохранён: тренировок ${sessions}, подходов ${sets}` });
    } catch (e) {
      console.error(e);
      setBackupStatus({ kind: 'error', text: 'Не удалось сохранить файл' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    // Allow picking the same file again
    input.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const backup = parseBackup(await file.text());
      const { exportedAt, sessions, sets } = summarizeBackup(backup);
      const when = new Date(exportedAt).toLocaleString('ru-RU');
      if (!window.confirm(`Заменить все данные копией от ${when}?\nВ копии тренировок: ${sessions}, подходов: ${sets}.\nТекущие данные на устройстве будут удалены.`)) {
        setBackupStatus({ kind: 'info', text: 'Восстановление отменено, данные не изменены' });
        return;
      }
      await importBackup(backup);
      const s = await getSettings();
      setTheme(s.theme);
      setUnits(s.units);
      setWeightTarget(s.weightTarget ?? null);
      applyTheme(s.theme);
      setBackupStatus({ kind: 'ok', text: `Восстановлено: тренировок ${sessions}, подходов ${sets}` });
    } catch (err) {
      console.error(err);
      setBackupStatus({
        kind: 'error',
        text: err instanceof BackupError ? `${err.message}. Данные не изменены` : 'Не удалось восстановить копию. Данные не изменены',
      });
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
          <select value={theme} onChange={(e) => {
            const next = e.target.value as 'auto' | 'light' | 'dark';
            setTheme(next);
            applyTheme(next);
            updateSettings({ theme: next });
          }} className="setting-select">
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
          setBackupStatus({ kind: 'ok', text: 'Настройки сохранены' });
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
          {exporting ? 'Сохранение...' : 'Сохранить копию в файл'}
        </button>
        <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
        <button className="pri" onClick={() => fileInputRef.current?.click()} disabled={importing}>
          {importing ? 'Восстановление...' : 'Восстановить из файла'}
        </button>
        {backupStatus && <p className={`backup-status ${backupStatus.kind}`} role="status">{backupStatus.text}</p>}
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

export default MoreView;
