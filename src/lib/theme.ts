import type { Settings } from '@/db';

type Theme = Settings['theme'];

// Mirror of settings.theme so the theme applies before Dexie is ready (no flash on load)
const STORAGE_KEY = 'zal-theme';
const THEME_COLOR = { dark: '#0E1216', light: '#EDF0F3' };
const lightQuery = window.matchMedia('(prefers-color-scheme: light)');

let current: Theme = 'auto';

const syncThemeColor = () => {
  const resolved = current === 'auto' ? (lightQuery.matches ? 'light' : 'dark') : current;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved]);
};

export const applyTheme = (theme: Theme) => {
  current = theme;
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  syncThemeColor();
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable (private mode) — settings in Dexie remain the source of truth
  }
};

export const initTheme = () => {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  applyTheme(stored === 'light' || stored === 'dark' ? stored : 'auto');
  lightQuery.addEventListener('change', syncThemeColor);
};
