// All app dates are YYYY-MM-DD in the device's time zone.
// toISOString() is UTC and gives yesterday after midnight in UTC+N; new Date('YYYY-MM-DD') parses as UTC midnight.

export const localDate = (d = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Local midnight of a YYYY-MM-DD string
export const parseLocalDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: string, days: number) => {
  const d = parseLocalDate(s);
  d.setDate(d.getDate() + days);
  return localDate(d);
};

// Monday of the week containing the date
export const weekStart = (s: string) => {
  const d = parseLocalDate(s);
  return addDays(s, -((d.getDay() + 6) % 7));
};
