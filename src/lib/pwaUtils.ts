export const triggerBackupReminder = () => {
  // Could use localStorage to track last backup time
  const lastBackup = localStorage.getItem('zal-last-backup');
  const now = Date.now();
  const month = 30 * 24 * 60 * 60 * 1000;
  if (!lastBackup || now - parseInt(lastBackup, 10) > month) {
    // Show a notification or toast
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification('Резервная копия', {
          body: 'Давно не делали бэкап. Сохраните данные.',
          icon: '/icon-192.png',
          tag: 'backup-reminder'
        });
      });
    }
    // Also store that we showed reminder (maybe not show again for a week)
    localStorage.setItem('zal-backup-reminder-shown', Date.now().toString());
  }
};

export const markBackupDone = () => {
  localStorage.setItem('zal-last-backup', Date.now().toString());
};