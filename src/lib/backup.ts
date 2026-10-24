import { db } from '@/db';
import { markBackupDone } from '@/lib/pwaUtils';
import { localDate } from '@/lib/date';

const APP = 'zal';
const VERSION = 1;
const TABLES = ['exercises', 'program', 'sessions', 'sets', 'bodyweight', 'maxes', 'settings'] as const;
type TableName = (typeof TABLES)[number];

export interface Backup {
  app: typeof APP;
  version: number;
  exportedAt: string;
  tables: Record<TableName, Record<string, unknown>[]>;
}

export class BackupError extends Error {}

const allTables = () => TABLES.map(name => db.table(name));

export const exportBackup = async () => {
  const tables = {} as Backup['tables'];
  // One read transaction so the snapshot is consistent
  await db.transaction('r', allTables(), async () => {
    for (const name of TABLES) {
      tables[name] = await db.table(name).toArray();
    }
  });
  const backup: Backup = { app: APP, version: VERSION, exportedAt: new Date().toISOString(), tables };

  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zal-backup-${localDate()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  markBackupDone();
  return { sessions: tables.sessions.length, sets: tables.sets.length };
};

// Validates the whole file before anything touches the database
export const parseBackup = (text: string): Backup => {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError('Файл не является JSON');
  }
  if (!data || typeof data !== 'object' || data.app !== APP) {
    throw new BackupError('Это не резервная копия «Зала»');
  }
  if (data.version !== VERSION) {
    throw new BackupError(`Неподдерживаемая версия копии: ${data.version}`);
  }
  if (!data.tables || typeof data.tables !== 'object') {
    throw new BackupError('В копии нет данных');
  }
  for (const name of TABLES) {
    const rows = data.tables[name];
    if (!Array.isArray(rows)) {
      throw new BackupError(`В копии нет таблицы «${name}»`);
    }
    for (const row of rows) {
      if (!row || typeof row !== 'object' || row.id == null) {
        throw new BackupError(`Повреждена запись в таблице «${name}»`);
      }
    }
  }
  if (data.tables.exercises.length === 0 || data.tables.program.length === 0) {
    throw new BackupError('В копии нет программы тренировок');
  }
  return data as Backup;
};

// Replaces every table in one transaction: on any failure Dexie rolls back and the old data stays
export const importBackup = async (backup: Backup) => {
  await db.transaction('rw', allTables(), async () => {
    for (const name of TABLES) {
      const table = db.table(name);
      await table.clear();
      await table.bulkPut(backup.tables[name]);
    }
  });
};

export const summarizeBackup = (backup: Backup) => ({
  exportedAt: backup.exportedAt,
  sessions: backup.tables.sessions.length,
  sets: backup.tables.sets.length,
});
